import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getTickets, saveTicket } from './ticketStore';
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
  canceled?: boolean;
  error?: string;
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
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Lưu hoặc chia sẻ vé đã lưu',
        UTI: 'public.json',
      });
    }

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

    let validCount = 0;
    for (const raw of candidateTickets) {
      // Validate ticket schema (must have 6-digit ticket, station, drawDate)
      if (
        typeof raw?.ticket === 'string' &&
        raw.ticket.length === 6 &&
        typeof raw?.station === 'string' &&
        typeof raw?.drawDate === 'string'
      ) {
        await saveTicket({
          ticket: raw.ticket,
          station: raw.station,
          stationName: raw.stationName || raw.station,
          drawDate: raw.drawDate,
          status: raw.status || 'PENDING',
          totalPrize: typeof raw.totalPrize === 'number' ? raw.totalPrize : 0,
          wins: Array.isArray(raw.wins) ? raw.wins : [],
          note: raw.note,
        });
        validCount++;
      }
    }

    if (validCount === 0) {
      return {
        success: false,
        importedCount: 0,
        error: 'Không tìm thấy vé số hợp lệ trong file.',
      };
    }

    return {
      success: true,
      importedCount: validCount,
    };
  } catch (err: any) {
    return {
      success: false,
      importedCount: 0,
      error: err?.message || 'Có lỗi xảy ra khi nhập dữ liệu sao lưu.',
    };
  }
}
