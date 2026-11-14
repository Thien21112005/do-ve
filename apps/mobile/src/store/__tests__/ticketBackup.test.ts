import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportTicketsToJson } from '../ticketBackup';
import { saveTicket, clearAllTickets } from '../ticketStore';

describe('ticketBackup (Export Tickets JSON - T07.10)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearAllTickets();
  });

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
