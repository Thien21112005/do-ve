import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getTickets } from './ticketStore';
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
