import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { SavedTicket } from '@/types';

export const TICKETS_STORAGE_KEY = 'dove.tickets.v1';
export const CURRENT_SCHEMA_VERSION = 1;

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

/**
 * Generate a consistent unique ID for a ticket if not provided
 */
export function generateTicketId(
  station: string,
  drawDate: string,
  ticket: string,
): string {
  return `${station}_${drawDate}_${ticket}`;
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
  cachedTickets = [...parsed.tickets];
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
    const id =
      ticketInput.id ||
      generateTicketId(
        ticketInput.station,
        ticketInput.drawDate,
        ticketInput.ticket,
      );
    const createdAt = ticketInput.createdAt || new Date().toISOString();

    const newTicket: SavedTicket = {
      ...ticketInput,
      id,
      createdAt,
    };

    const currentList = await loadForWrite();
    const existingIndex = currentList.findIndex((t) => t.id === id);

    let updatedList: SavedTicket[];
    if (existingIndex >= 0) {
      // Update existing ticket
      updatedList = [...currentList];
      updatedList[existingIndex] = {
        ...currentList[existingIndex],
        ...newTicket,
      };
    } else {
      // Prepend newest ticket
      updatedList = [newTicket, ...currentList];
    }

    const payload: TicketStorageEnvelope = {
      version: CURRENT_SCHEMA_VERSION,
      tickets: updatedList,
    };

    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(payload));
    cachedTickets = updatedList;
    notifyListeners();
    return newTicket;
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
      const id =
        input.id ||
        generateTicketId(input.station, input.drawDate, input.ticket);
      const createdAt = input.createdAt || new Date().toISOString();
      const ticketItem: SavedTicket = {
        ...input,
        id,
        createdAt,
      };

      updatedMap.set(id, ticketItem);
      resultList.push(ticketItem);
    }

    const updatedList: SavedTicket[] = [];
    // Prepend newly added tickets not in currentList
    for (const item of resultList) {
      if (!currentList.some((t) => t.id === item.id)) {
        updatedList.push(item);
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
      const currentList = await loadForWrite();
      const updatedList = currentList.filter((t) => t.id !== id);

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
      const currentList = await loadForWrite();
      const index = currentList.findIndex((t) => t.id === id);
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
  const tickets = await getTickets();
  return tickets.find((t) => t.id === id) || null;
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

