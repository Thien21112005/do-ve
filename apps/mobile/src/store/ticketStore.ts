import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { STATION_NAMES } from '@/api/mappers';
import type { SavedTicket, SavedTicketStatus } from '@/types';

export const TICKETS_STORAGE_KEY = 'dove.tickets.v1';
export const CURRENT_SCHEMA_VERSION = 2;

export interface TicketStorageEnvelope {
  version: number;
  tickets: SavedTicket[];
}

// In-memory cache for fast synchronous reads & reactivity
let cachedTickets: SavedTicket[] = [];
let isInitialized = false;
const listeners = new Set<(tickets: SavedTicket[]) => void>();

export function subscribeTickets(
  listener: (tickets: SavedTicket[]) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Promise queue to serialize all mutating operations and prevent race conditions (T09.35)
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const resultPromise = writeQueue.then(task, task);
  writeQueue = resultPromise.then(
    () => {},
    () => {},
  );
  return resultPromise;
}

function notifyListeners() {
  listeners.forEach((listener) => listener(cachedTickets));
}

const STATION_SLUG_ALIASES: Record<string, string> = {
  tphcm: 'tp-hcm',
  hcm: 'tp-hcm',
  'ho-chi-minh': 'tp-hcm',
  'tp-ho-chi-minh': 'tp-hcm',
  dongthap: 'dong-thap',
  dt: 'dong-thap',
  camau: 'ca-mau',
  cm: 'ca-mau',
  bentre: 'ben-tre',
  bt: 'ben-tre',
  vungtau: 'vung-tau',
  vt: 'vung-tau',
  'ba-ria-vung-tau': 'vung-tau',
  baclieu: 'bac-lieu',
  bl: 'bac-lieu',
  dongnai: 'dong-nai',
  dn: 'dong-nai',
  cantho: 'can-tho',
  ct: 'can-tho',
  soctrang: 'soc-trang',
  st: 'soc-trang',
  tayninh: 'tay-ninh',
  tn: 'tay-ninh',
  angiang: 'an-giang',
  ag: 'an-giang',
  binhthuan: 'binh-thuan',
  bth: 'binh-thuan',
  vinhlong: 'vinh-long',
  vl: 'vinh-long',
  binhduong: 'binh-duong',
  bd: 'binh-duong',
  travinh: 'tra-vinh',
  tv: 'tra-vinh',
  longan: 'long-an',
  la: 'long-an',
  haugiang: 'hau-giang',
  hg: 'hau-giang',
  binhphuoc: 'binh-phuoc',
  bp: 'binh-phuoc',
  tiengiang: 'tien-giang',
  tg: 'tien-giang',
  kiengiang: 'kien-giang',
  kg: 'kien-giang',
  dalat: 'da-lat',
  dl: 'da-lat',
  'lam-dong': 'da-lat',
  lamdong: 'da-lat',
};

/**
 * Normalize any station code variant (TPHCM, tphcm, TP.HCM, DONG_THAP, BD...)
 * to the canonical backend slug (tp-hcm, dong-thap, binh-duong...) (T11.17).
 */
export function normalizeStationCode(raw: string): string {
  const slug = (raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return STATION_SLUG_ALIASES[slug] ?? slug;
}

function resolveStationName(stationSlug: string, rawName?: string): string {
  if (rawName && normalizeStationCode(rawName) !== stationSlug) {
    return rawName;
  }
  return STATION_NAMES[stationSlug] || rawName || stationSlug;
}

function statusRank(status: SavedTicketStatus | undefined): number {
  if (status === 'WON') return 3;
  if (status === 'LOST') return 2;
  if (status === 'INVALID') return 1;
  return 0; // PENDING
}

function mergeDuplicateTickets(existing: SavedTicket, incoming: SavedTicket): SavedTicket {
  const rExisting = statusRank(existing.status);
  const rIncoming = statusRank(incoming.status);
  const winner =
    rIncoming > rExisting
      ? incoming
      : rIncoming < rExisting
        ? existing
        : (incoming.totalPrize ?? 0) >= (existing.totalPrize ?? 0)
          ? incoming
          : existing;
  const other = winner === incoming ? existing : incoming;
  return {
    ...other,
    ...winner,
    stationName: resolveStationName(winner.station, winner.stationName || other.stationName),
    note: winner.note || other.note,
  };
}

function normalizeTicketItem(raw: SavedTicket): SavedTicket {
  const station = normalizeStationCode(raw.station);
  const id = generateTicketId(station, raw.drawDate, raw.ticket);
  return {
    ...raw,
    id,
    station,
    stationName: resolveStationName(station, raw.stationName),
  };
}

function migrateTicketsToV2(tickets: SavedTicket[]): SavedTicket[] {
  const byId = new Map<string, SavedTicket>();
  const order: string[] = [];
  for (const raw of tickets) {
    const normalized = normalizeTicketItem(raw);
    const prev = byId.get(normalized.id);
    if (prev) {
      byId.set(normalized.id, mergeDuplicateTickets(prev, normalized));
    } else {
      byId.set(normalized.id, normalized);
      order.push(normalized.id);
    }
  }
  return order.map((id) => byId.get(id)!);
}

function normalizeLookupId(id: string): string {
  const match = /^(.+)_(\d{4}-\d{2}-\d{2})_(\d{6})$/.exec(id);
  return match ? generateTicketId(match[1], match[2], match[3]) : id;
}

/**
 * Generate a consistent unique ID for a ticket if not provided
 */
export function generateTicketId(
  station: string,
  drawDate: string,
  ticket: string,
): string {
  return `${normalizeStationCode(station)}_${drawDate}_${ticket}`;
}

// ---------------------------------------------------------------------------
// Storage health (T11.07): a failed or corrupt read must never lead to a write
// that replaces the user's tickets with a shorter list.
// ---------------------------------------------------------------------------

export const CORRUPT_BACKUP_KEY_PREFIX = 'dove.tickets.corrupt.';

export type TicketStoreHealth =
  | { state: 'ok' }
  | { state: 'unreadable' }
  | { state: 'corrupt'; backupKey: string };

/** Stored data exists but cannot be parsed. Writes are blocked. */
export class TicketStoreCorruptError extends Error {
  constructor(public readonly backupKey: string) {
    super('Dữ liệu vé trên máy bị hỏng, đã giữ bản sao và tạm khoá ghi.');
    this.name = 'TicketStoreCorruptError';
  }
}

/** Storage could not be read even after a retry. Writes are blocked. */
export class TicketStoreReadError extends Error {
  constructor(cause?: unknown) {
    super('Không đọc được dữ liệu vé trên máy.');
    this.name = 'TicketStoreReadError';
    (this as any).cause = cause;
  }
}

let health: TicketStoreHealth = { state: 'ok' };
let lastCorruptRaw: string | null = null;
const healthListeners = new Set<() => void>();

function setHealth(next: TicketStoreHealth) {
  health = next;
  healthListeners.forEach((l) => l());
}

export function getTicketStoreHealth(): TicketStoreHealth {
  return health;
}

export function useTicketStoreHealth(): TicketStoreHealth {
  return useSyncExternalStore(
    (cb) => {
      healthListeners.add(cb);
      return () => {
        healthListeners.delete(cb);
      };
    },
    () => health,
    () => health,
  );
}

async function readRawWithRetry(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TICKETS_STORAGE_KEY);
  } catch {
    // One retry for transient errors; a second failure propagates.
    return await AsyncStorage.getItem(TICKETS_STORAGE_KEY);
  }
}

async function markCorrupt(raw: string): Promise<string> {
  if (health.state === 'corrupt' && lastCorruptRaw === raw) {
    return health.backupKey;
  }
  const backupKey = `${CORRUPT_BACKUP_KEY_PREFIX}${Date.now()}`;
  try {
    await AsyncStorage.setItem(backupKey, raw);
  } catch {
    // The original key is never overwritten, so the data is still there.
  }
  lastCorruptRaw = raw;
  setHealth({ state: 'corrupt', backupKey });
  return backupKey;
}

/**
 * Strict load used before every write. Throws instead of returning [] when
 * the stored data cannot be read or parsed.
 */
async function loadForWrite(): Promise<SavedTicket[]> {
  let raw: string | null;
  try {
    raw = await readRawWithRetry();
  } catch (err) {
    setHealth({ state: 'unreadable' });
    throw new TicketStoreReadError(err);
  }

  if (!raw) {
    if (health.state !== 'ok') setHealth({ state: 'ok' });
    cachedTickets = [];
    isInitialized = true;
    return [];
  }

  let parsed: TicketStorageEnvelope | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!parsed || !Array.isArray(parsed.tickets)) {
    throw new TicketStoreCorruptError(await markCorrupt(raw));
  }

  if (health.state !== 'ok') setHealth({ state: 'ok' });
  lastCorruptRaw = null;

  let tickets = [...parsed.tickets];
  if ((parsed.version ?? 1) < CURRENT_SCHEMA_VERSION) {
    tickets = migrateTicketsToV2(tickets);
    try {
      await AsyncStorage.setItem(
        TICKETS_STORAGE_KEY,
        JSON.stringify({ version: CURRENT_SCHEMA_VERSION, tickets }),
      );
    } catch {
      // Transient persistence failure: keep migrated list in memory for this session
    }
  }

  cachedTickets = tickets;
  isInitialized = true;
  return cachedTickets;
}

/**
 * Load all tickets from AsyncStorage for display.
 * Corrupt data shows as [] (the UI explains via getTicketStoreHealth());
 * a transient read error keeps the last known list. It never writes.
 */
export async function loadTickets(): Promise<SavedTicket[]> {
  try {
    return await loadForWrite();
  } catch (err) {
    if (err instanceof TicketStoreCorruptError) {
      cachedTickets = [];
      isInitialized = true;
      return [];
    }
    return isInitialized ? cachedTickets : [];
  }
}

/** Kept for existing callers: same as loadTickets(). */
export const getTickets = loadTickets;

/** Synchronous read of the in-memory cache; never touches storage (T11.24). */
export function readTickets(): SavedTicket[] {
  return cachedTickets;
}

const EMPTY_TICKETS: SavedTicket[] = Object.freeze([]) as unknown as SavedTicket[];

/** Stable server snapshot for useSyncExternalStore (a new [] each call loops). */
export function getTicketsServerSnapshot(): SavedTicket[] {
  return EMPTY_TICKETS;
}

/** Test helper: forget in-memory state between tests. */
export function resetTicketStoreForTests(): void {
  cachedTickets = [];
  isInitialized = false;
  lastCorruptRaw = null;
  health = { state: 'ok' };
  writeQueue = Promise.resolve();
}

/**
 * Save or update a ticket in AsyncStorage.
 * Prevents duplicates by composite ID.
 */
export async function saveTicket(
  ticketInput: Omit<SavedTicket, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
): Promise<SavedTicket> {
  return enqueueWrite(async () => {
    const station = normalizeStationCode(ticketInput.station);
    const id = generateTicketId(station, ticketInput.drawDate, ticketInput.ticket);
    const createdAt = ticketInput.createdAt || new Date().toISOString();

    const newTicket: SavedTicket = {
      ...ticketInput,
      station,
      stationName: resolveStationName(station, ticketInput.stationName),
      id,
      createdAt,
    };

    const currentList = await loadForWrite();
    const existingIndex = currentList.findIndex((t) => t.id === id);

    let updatedList: SavedTicket[];
    let savedItem: SavedTicket;
    if (existingIndex >= 0) {
      savedItem = mergeDuplicateTickets(currentList[existingIndex], newTicket);
      updatedList = [...currentList];
      updatedList[existingIndex] = savedItem;
    } else {
      savedItem = newTicket;
      updatedList = [newTicket, ...currentList];
    }

    const payload: TicketStorageEnvelope = {
      version: CURRENT_SCHEMA_VERSION,
      tickets: updatedList,
    };

    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(payload));
    cachedTickets = updatedList;
    notifyListeners();
    return savedItem;
  });
}

/**
 * Save or update multiple tickets in a single storage write (T09.40).
 */
export async function saveManyTickets(
  newTickets: (Omit<SavedTicket, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  })[],
): Promise<SavedTicket[]> {
  if (newTickets.length === 0) return [];

  return enqueueWrite(async () => {
    const currentList = await loadForWrite();
    const updatedMap = new Map(currentList.map((t) => [t.id, t]));
    const resultList: SavedTicket[] = [];

    for (const input of newTickets) {
      const station = normalizeStationCode(input.station);
      const id = generateTicketId(station, input.drawDate, input.ticket);
      const createdAt = input.createdAt || new Date().toISOString();
      const ticketItem: SavedTicket = {
        ...input,
        station,
        stationName: resolveStationName(station, input.stationName),
        id,
        createdAt,
      };

      const prev = updatedMap.get(id);
      const merged = prev ? mergeDuplicateTickets(prev, ticketItem) : ticketItem;
      updatedMap.set(id, merged);
      resultList.push(merged);
    }

    const updatedList: SavedTicket[] = [];
    const seenAdded = new Set<string>();
    // Prepend newly added tickets not in currentList (deduped across aliases)
    for (const item of resultList) {
      if (!currentList.some((t) => t.id === item.id) && !seenAdded.has(item.id)) {
        seenAdded.add(item.id);
        updatedList.push(updatedMap.get(item.id)!);
      }
    }

    // Retain existing tickets (updated in place)
    for (const existing of currentList) {
      const updated = updatedMap.get(existing.id);
      updatedList.push(updated || existing);
    }

    const payload: TicketStorageEnvelope = {
      version: CURRENT_SCHEMA_VERSION,
      tickets: updatedList,
    };

    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(payload));
    cachedTickets = updatedList;
    notifyListeners();
    return resultList;
  });
}

/**
 * Remove a ticket by ID.
 */
export async function removeTicket(id: string): Promise<boolean> {
  return enqueueWrite(async () => {
    try {
      const targetId = normalizeLookupId(id);
      const currentList = await loadForWrite();
      const updatedList = currentList.filter((t) => t.id !== targetId);

      const payload: TicketStorageEnvelope = {
        version: CURRENT_SCHEMA_VERSION,
        tickets: updatedList,
      };

      await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(payload));
      cachedTickets = updatedList;
      notifyListeners();
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Clear all tickets.
 */
export async function clearAllTickets(): Promise<boolean> {
  return enqueueWrite(async () => {
    try {
      const payload: TicketStorageEnvelope = {
        version: CURRENT_SCHEMA_VERSION,
        tickets: [],
      };
      await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(payload));
      cachedTickets = [];
      notifyListeners();
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Update a ticket's fields by ID.
 */
export async function updateTicket(
  id: string,
  updates: Partial<SavedTicket>,
): Promise<SavedTicket | null> {
  return enqueueWrite(async () => {
    try {
      const targetId = normalizeLookupId(id);
      const currentList = await loadForWrite();
      const index = currentList.findIndex((t) => t.id === targetId);
      if (index === -1) return null;

      const updatedItem: SavedTicket = {
        ...currentList[index],
        ...updates,
      };

      const updatedList = [...currentList];
      updatedList[index] = updatedItem;

      const payload: TicketStorageEnvelope = {
        version: CURRENT_SCHEMA_VERSION,
        tickets: updatedList,
      };

      await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(payload));
      cachedTickets = updatedList;
      notifyListeners();
      return updatedItem;
    } catch {
      return null;
    }
  });
}

/**
 * Get ticket by ID.
 */
export async function getTicketById(id: string): Promise<SavedTicket | null> {
  const targetId = normalizeLookupId(id);
  const tickets = await getTickets();
  return tickets.find((t) => t.id === targetId) || null;
}

/**
 * React hook to observe saved tickets reactively.
 */
export function useSavedTickets(): [
  SavedTicket[],
  {
    save: typeof saveTicket;
    saveMany: typeof saveManyTickets;
    remove: typeof removeTicket;
    clearAll: typeof clearAllTickets;
    refresh: typeof getTickets;
  },
] {
  const tickets = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      // Trigger initial load if not done
      if (!isInitialized) {
        getTickets()
          .then(() => {
            notifyListeners();
          })
          .catch(() => {});
      }
      return () => {
        listeners.delete(callback);
      };
    },
    readTickets,
    getTicketsServerSnapshot,
  );

  return [
    tickets,
    {
      save: saveTicket,
      saveMany: saveManyTickets,
      remove: removeTicket,
      clearAll: clearAllTickets,
      refresh: getTickets,
    },
  ];
}

