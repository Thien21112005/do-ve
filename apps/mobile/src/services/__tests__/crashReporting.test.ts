import {
  sanitizeText,
  recordCrash,
  setCrashSink,
  initCrashReporting,
  getStoredCrashReports,
  clearStoredCrashReports,
  _resetCrashReportingForTesting,
  CRASH_STORAGE_KEY,
  MAX_STORED_CRASH_REPORTS,
  type SanitizedErrorPayload,
} from '../crashReporting';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('crashReporting Service', () => {
  beforeEach(() => {
    setCrashSink(null);
  });

  describe('sanitizeText', () => {
    it('scrubs 6-digit ticket numbers with [REDACTED_TICKET]', () => {
      const input = 'Error processing ticket 123456 for station TPHCM, secondary 098765';
      const output = sanitizeText(input);

      expect(output).not.toContain('123456');
      expect(output).not.toContain('098765');
      expect(output).toContain('[REDACTED_TICKET]');
    });

    it('scrubs query parameters containing numbers array', () => {
      const input =
        'GET /api/v1/draws/check?station=TPHCM&numbers=123456,654321 failed with 500';
      const output = sanitizeText(input);

      expect(output).not.toContain('numbers=123456,654321');
      expect(output).toContain('numbers=[REDACTED_TICKETS]');
    });

    it('preserves non-ticket numbers like HTTP status codes or years', () => {
      const input = 'Server returned 500 in year 2026';
      const output = sanitizeText(input);

      expect(output).toBe('Server returned 500 in year 2026');
    });
  });

  describe('recordCrash', () => {
    it('scrubs message and context before passing to sink', () => {
      let captured: SanitizedErrorPayload | null = null;
      setCrashSink((payload) => {
        captured = payload;
      });

      const err = new Error('Failed to render ticket 999888 on draw screen');
      recordCrash(err, {
        rawInput: 'User typed 999888',
        attempts: 3,
      });

      expect(captured).not.toBeNull();
      expect(captured!.message).toBe(
        'Failed to render ticket [REDACTED_TICKET] on draw screen',
      );
      expect(captured!.message).not.toContain('999888');
      expect((captured!.context as Record<string, unknown>).rawInput).toBe(
        'User typed [REDACTED_TICKET]',
      );
      expect((captured!.context as Record<string, unknown>).attempts).toBe(3);
    });
  });

  describe('AsyncStorage Crash Persistence (T09.54)', () => {
    beforeEach(async () => {
      await AsyncStorage.clear();
      _resetCrashReportingForTesting();
    });

    it('persists sanitized crash reports up to limit of 20', async () => {
      initCrashReporting();

      // Record 25 crashes
      for (let i = 1; i <= 25; i++) {
        recordCrash(new Error(`Test crash ${i} with secret ticket 123456`));
      }

      // Allow async write queue to settle
      await new Promise((r) => setTimeout(r, 100));

      const reports = await getStoredCrashReports();
      expect(reports.length).toBe(MAX_STORED_CRASH_REPORTS);
      expect(reports.length).toBe(20);

      // Latest crash is at the top
      expect(reports[0].message).toContain('Test crash 25');
      // Secret ticket numbers are sanitized
      expect(reports[0].message).toContain('[REDACTED_TICKET]');
      expect(reports[0].message).not.toContain('123456');

      // Oldest retained crash should be #6 (1-5 evicted)
      expect(reports[19].message).toContain('Test crash 6');
    });

    it('clears stored crash reports', async () => {
      initCrashReporting();
      recordCrash(new Error('Crash to be deleted'));
      await new Promise((r) => setTimeout(r, 50));

      let reports = await getStoredCrashReports();
      expect(reports.length).toBeGreaterThan(0);

      await clearStoredCrashReports();
      reports = await getStoredCrashReports();
      expect(reports).toEqual([]);
    });
  });
});
