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

/**
 * Load all tickets from AsyncStorage.
 * In case of corrupted JSON or read error, gracefully returns empty array [].
 */
export async function getTickets(): Promise<SavedTicket[]> {
  try {
    const raw = await AsyncStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      cachedTickets = [];
      isInitialized = true;
      notifyListeners();
      return [];
    }

    const parsed: TicketStorageEnvelope = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.tickets)) {
      cachedTickets = [...parsed.tickets];
      isInitialized = true;
      notifyListeners();
      return cachedTickets;
    }

    cachedTickets = [];
    isInitialized = true;
    notifyListeners();
    return [];
  } catch {
    // Graceful fallback on corrupt data or storage error
    cachedTickets = [];
    isInitialized = true;
    notifyListeners();
    return [];
  }
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

    const currentList = await getTickets();
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
 * Remove a ticket by ID.
 */
export async function removeTicket(id: string): Promise<boolean> {
  return enqueueWrite(async () => {
    try {
      const currentList = await getTickets();
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
      const currentList = await getTickets();
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
        getTickets().catch(() => {});
      }
      return () => {
        listeners.delete(callback);
      };
    },
    () => cachedTickets,
    () => [],
  );

  return [
    tickets,
    {
      save: saveTicket,
      remove: removeTicket,
      clearAll: clearAllTickets,
      refresh: getTickets,
    },
  ];
}

