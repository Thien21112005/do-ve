import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  getTickets,
  saveTicket,
  saveManyTickets,
  generateTicketId,
} from './ticketStore';
import type { SavedTicket } from '@/types';

export const BACKUP_FILE_NAME = 'dove-tickets.json';
export const BACKUP_SCHEMA_VERSION = 1;

export interface TicketBackupFile {
  version: number;
  appName: string;
  exportedAt: string;
  tickets: SavedTicket[];
}

export interface ExportResult {
  success: boolean;
  exportedCount: number;
  filePath?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  newCount?: number;
  skippedCount?: number;
  updatedCount?: number;
  canceled?: boolean;
  error?: string;
  message?: string;
}

const VALID_TICKET_NUMBER_REGEX = /^\d{6}$/;
const VALID_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES = new Set(['WON', 'LOST', 'PENDING']);

/**
 * Strict validator for imported ticket structure (T09.39).
 */
export function isValidSavedTicket(raw: any): boolean {
  if (!raw || typeof raw !== 'object') return false;

  // 1. ticket: exactly 6 digits
  if (
    typeof raw.ticket !== 'string' ||
    !VALID_TICKET_NUMBER_REGEX.test(raw.ticket)
  ) {
    return false;
  }

  // 2. station: non-empty string
  if (typeof raw.station !== 'string' || raw.station.trim().length === 0) {
    return false;
  }

  // 3. drawDate: valid YYYY-MM-DD
  if (typeof raw.drawDate !== 'string' || !VALID_DATE_REGEX.test(raw.drawDate)) {
    return false;
  }
  const [year, month, day] = raw.drawDate.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // 4. status: must be WON, LOST, or PENDING (if provided)
  if (raw.status !== undefined && !VALID_STATUSES.has(raw.status)) {
    return false;
  }

  // 5. totalPrize: must be non-negative integer/number
  if (raw.totalPrize !== undefined) {
    if (
      typeof raw.totalPrize !== 'number' ||
      isNaN(raw.totalPrize) ||
      raw.totalPrize < 0
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Determine if a candidate ticket should replace an existing local ticket.
 * Enforces rule: never downgrade terminal status (WON/LOST) to PENDING (T09.38).
 */
export function shouldReplaceExistingTicket(
  existing: SavedTicket,
  candidate: SavedTicket,
): boolean {
  // Never downgrade WON to non-WON
  if (existing.status === 'WON' && candidate.status !== 'WON') {
    return false;
  }

  // Upgrade PENDING to terminal status
  if (
    existing.status === 'PENDING' &&
    (candidate.status === 'WON' || candidate.status === 'LOST')
  ) {
    return true;
  }

  // Upgrade LOST to WON
  if (existing.status === 'LOST' && candidate.status === 'WON') {
    return true;
  }

  // Never downgrade LOST to PENDING
  if (existing.status === 'LOST' && candidate.status === 'PENDING') {
    return false;
  }

  // Same status category: prefer candidate if its createdAt is newer
  if (candidate.createdAt && existing.createdAt) {
    return candidate.createdAt > existing.createdAt;
  }

  return false;
}

/**
 * Export all saved tickets to a JSON file and trigger system share sheet.
 * Preserves 6-digit ticket formatting, station, date, and prize data.
 */
export async function exportTicketsToJson(): Promise<ExportResult> {
  try {
    const tickets = await getTickets();
    if (!tickets || tickets.length === 0) {
      return {
        success: false,
        exportedCount: 0,
        error: 'Danh sách trống, không có vé nào để xuất sao lưu.',
      };
    }

    const payload: TicketBackupFile = {
      version: BACKUP_SCHEMA_VERSION,
      appName: 'DoVe',
      exportedAt: new Date().toISOString(),
      tickets,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const targetDir =
      FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    const filePath = `${targetDir}${BACKUP_FILE_NAME}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        exportedCount: 0,
        error: 'Thiết bị không hỗ trợ chia sẻ file sao lưu.',
      };
    }

    await Sharing.shareAsync(filePath, {
      mimeType: 'application/json',
      dialogTitle: 'Lưu hoặc chia sẻ vé đã lưu',
      UTI: 'public.json',
    });

    return {
      success: true,
      exportedCount: tickets.length,
      filePath,
    };
  } catch (err: any) {
    return {
      success: false,
      exportedCount: 0,
      error: err?.message || 'Có lỗi xảy ra khi xuất file sao lưu vé.',
    };
  }
}

/**
 * Pick a JSON file from device storage, validate its schema, deduplicate,
 * and merge tickets safely into local storage without corrupting existing data.
 */
export async function importTicketsFromJson(): Promise<ImportResult> {
  try {
    const pickResult = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/json', '*/*'],
      copyToCacheDirectory: true,
    });

    if (
      pickResult.canceled ||
      !pickResult.assets ||
      pickResult.assets.length === 0
    ) {
      return {
        success: false,
        canceled: true,
        importedCount: 0,
      };
    }

    const asset = pickResult.assets[0];
    const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let parsed: any;
    try {
      parsed = JSON.parse(fileContent);
    } catch {
      return {
        success: false,
        importedCount: 0,
        error: 'File không đúng định dạng JSON hợp lệ.',
      };
    }

    const candidateTickets = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.tickets)
        ? parsed.tickets
        : null;

    if (!candidateTickets || candidateTickets.length === 0) {
      return {
        success: false,
        importedCount: 0,
        error: 'File sao lưu không chứa danh sách vé hợp lệ.',
      };
    }

    const currentList = await getTickets();
    const existingMap = new Map(currentList.map((t) => [t.id, t]));
    const toSaveList: SavedTicket[] = [];

    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const raw of candidateTickets) {
      // Validate ticket schema strictly (T09.39)
      if (!isValidSavedTicket(raw)) {
        continue;
      }

      const id =
        raw.id || generateTicketId(raw.station, raw.drawDate, raw.ticket);
      const existing = existingMap.get(id);

      const candidate: SavedTicket = {
        id,
        ticket: raw.ticket,
        station: raw.station,
        stationName: raw.stationName || raw.station,
        drawDate: raw.drawDate,
        status: raw.status || 'PENDING',
        totalPrize: typeof raw.totalPrize === 'number' ? raw.totalPrize : 0,
        wins: Array.isArray(raw.wins) ? raw.wins : [],
        note: raw.note,
        createdAt: raw.createdAt || existing?.createdAt || new Date().toISOString(),
      };

      if (existing) {
        if (shouldReplaceExistingTicket(existing, candidate)) {
          toSaveList.push(candidate);
          existingMap.set(id, candidate);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        toSaveList.push(candidate);
        existingMap.set(id, candidate);
        newCount++;
      }
    }

    // Save all valid tickets in a single batch write (T09.40)
    if (toSaveList.length > 0) {
      await saveManyTickets(toSaveList);
    }

    const totalProcessed = newCount + updatedCount + skippedCount;
    if (totalProcessed === 0) {
      return {
        success: false,
        importedCount: 0,
        error: 'Không tìm thấy vé số hợp lệ trong file.',
      };
    }

    const importedCount = newCount + updatedCount;
    return {
      success: true,
      importedCount,
      newCount,
      updatedCount,
      skippedCount,
      message: `Đã khôi phục ${newCount} vé mới${skippedCount > 0 ? ` (bỏ qua ${skippedCount} vé đã có)` : ''}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      importedCount: 0,
      error: err?.message || 'Có lỗi xảy ra khi nhập dữ liệu sao lưu.',
    };
  }
}
