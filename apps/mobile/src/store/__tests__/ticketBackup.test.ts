import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { exportTicketsToJson, importTicketsFromJson } from '../ticketBackup';
import { saveTicket, clearAllTickets, getTickets } from '../ticketStore';

describe('ticketBackup (Export & Import Tickets JSON - T07.10 & T07.11)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearAllTickets();
  });

  describe('exportTicketsToJson (T07.10)', () => {
    it('exports tickets to dove-tickets.json and shares the file', async () => {
      await saveTicket({
        ticket: '012345',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'WON',
        totalPrize: 2000000000,
      });

      const result = await exportTicketsToJson();

      expect(result.success).toBe(true);
      expect(result.exportedCount).toBe(1);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('dove-tickets.json'),
        expect.stringContaining('"ticket": "012345"'),
        expect.any(Object),
      );
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('returns error when there are no tickets to export', async () => {
      const result = await exportTicketsToJson();

      expect(result.success).toBe(false);
      expect(result.exportedCount).toBe(0);
      expect(result.error).toContain('không có vé');
    });
  });

  describe('importTicketsFromJson (T07.11)', () => {
    it('returns canceled when user cancels document picker', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
        assets: [],
      });

      const result = await importTicketsFromJson();
      expect(result.success).toBe(false);
      expect(result.canceled).toBe(true);
      expect(result.importedCount).toBe(0);
    });

    it('returns error when file content is invalid JSON without altering existing data', async () => {
      await saveTicket({
        ticket: '999999',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'WON',
        totalPrize: 100000,
      });

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file:///mock/corrupt.json' }],
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
        '{ bad-json }',
      );

      const result = await importTicketsFromJson();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      // Verify existing ticket was preserved
      const existing = await getTickets();
      expect(existing).toHaveLength(1);
      expect(existing[0].ticket).toBe('999999');
    });

    it('imports valid tickets, skips/updates duplicates and merges safely', async () => {
      await saveTicket({
        ticket: '111111',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'LOST',
        totalPrize: 0,
      });

      const importPayload = {
        version: 1,
        appName: 'DoVe',
        tickets: [
          {
            ticket: '012345',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'WON',
            totalPrize: 2000000000,
            wins: [],
          },
          {
            ticket: '111111', // Existing duplicate
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'LOST',
            totalPrize: 0,
            wins: [],
          },
        ],
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file:///mock/dove-tickets.json' }],
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(importPayload),
      );

      const result = await importTicketsFromJson();
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);

      const all = await getTickets();
      expect(all).toHaveLength(2);
      expect(all.some((t) => t.ticket === '012345')).toBe(true);
    });
  });
});
