import {
  sanitizeText,
  recordCrash,
  setCrashSink,
  type SanitizedErrorPayload,
} from '../crashReporting';

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
});
