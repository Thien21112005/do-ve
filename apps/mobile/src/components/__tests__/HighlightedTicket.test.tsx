import React from 'react';
import { render } from '@testing-library/react-native';
import {
  HighlightedTicket,
  computeMatchedSegments,
  computePositionAwareSegments,
  getLongestMatchedSuffix,
} from '../HighlightedTicket';

describe('HighlightedTicket Component and helpers', () => {
  describe('computeMatchedSegments', () => {
    it('returns entire ticket as unmatched when no matchedDigits', () => {
      const segments = computeMatchedSegments('123456', '');
      expect(segments).toEqual([{ text: '123456', isMatched: false }]);
    });

    it('splits ticket into unmatched prefix and matched suffix', () => {
      const segments = computeMatchedSegments('123456', '456');
      expect(segments).toEqual([
        { text: '123', isMatched: false },
        { text: '456', isMatched: true },
      ]);
    });

    it('marks entire ticket as matched when all digits match (Special prize)', () => {
      const segments = computeMatchedSegments('123456', '123456');
      expect(segments).toEqual([{ text: '123456', isMatched: true }]);
    });

    it('handles 2-digit suffix (Giải tám)', () => {
      const segments = computeMatchedSegments('123456', '56');
      expect(segments).toEqual([
        { text: '1234', isMatched: false },
        { text: '56', isMatched: true },
      ]);
    });
  });

  describe('computePositionAwareSegments (T10.32)', () => {
    it('handles Special Consolation (Giải phụ Đặc biệt: khớp 5 số cuối, sai số đầu)', () => {
      const result = computePositionAwareSegments('154321', {
        tier: 'SPECIAL_CONSOLATION',
        specialNumber: '654321',
      });

      expect(result.segments).toEqual([
        { text: '1', isMatched: false, isMismatched: true },
        { text: '54321', isMatched: true },
      ]);
      expect(result.matchDescription).toBe('khớp 5 số cuối với giải Đặc biệt');
    });

    it('handles Encouragement (Giải Khuyến khích: khớp số đầu, sai 1 chữ số ở giữa)', () => {
      const result = computePositionAwareSegments('604321', {
        tier: 'ENCOURAGEMENT',
        specialNumber: '654321',
      });

      expect(result.segments).toEqual([
        { text: '6', isMatched: true },
        { text: '0', isMatched: false, isMismatched: true },
        { text: '4321', isMatched: true },
      ]);
      expect(result.matchDescription).toContain('khớp');
      expect(result.matchDescription).toContain('giải Đặc biệt');
    });

    it('handles Encouragement (Giải Khuyến khích: khớp số đầu, sai chữ số cuối cùng)', () => {
      const result = computePositionAwareSegments('654320', {
        wins: [{ tier: 'ENCOURAGEMENT', matchedNumber: '654321' }],
      });

      expect(result.segments).toEqual([
        { text: '65432', isMatched: true },
        { text: '0', isMatched: false, isMismatched: true },
      ]);
    });

    it('falls back to suffix matching for standard prizes', () => {
      const result = computePositionAwareSegments('123456', {
        matchedDigits: '456',
      });

      expect(result.segments).toEqual([
        { text: '123', isMatched: false },
        { text: '456', isMatched: true },
      ]);
      expect(result.matchDescription).toBe('khớp 3 số cuối 456');
    });
  });

  describe('getLongestMatchedSuffix', () => {
    it('returns empty string if no wins or empty', () => {
      expect(getLongestMatchedSuffix('123456', [])).toBe('');
      expect(getLongestMatchedSuffix('123456', undefined)).toBe('');
    });

    it('finds longest suffix among multiple wins', () => {
      const wins = [
        { matchedDigits: '56' },
        { matchedDigits: '456' },
        { matchedDigits: '6' },
      ];
      expect(getLongestMatchedSuffix('123456', wins)).toBe('456');
    });

    it('ignores matchedDigits that are not suffixes of the ticket', () => {
      const wins = [{ matchedDigits: '999' }];
      expect(getLongestMatchedSuffix('123456', wins)).toBe('');
    });
  });

  describe('HighlightedTicket rendering', () => {
    it('renders unmatched and matched segments with appropriate testIDs', async () => {
      const { getByText } = await render(
        <HighlightedTicket ticket="123456" matchedDigits="321" />,
      );

      // 321 is not a suffix of 123456, so whole ticket is unmatched
      expect(getByText('123456')).toBeTruthy();
    });

    it('highlights the last 3 digits when matchedDigits is 456 on ticket 123456', async () => {
      const { getByTestId, getByText } = await render(
        <HighlightedTicket ticket="123456" matchedDigits="456" />,
      );

      expect(getByTestId('highlighted-ticket')).toBeTruthy();
      expect(getByTestId('ticket-segment-unmatched')).toBeTruthy();
      expect(getByTestId('ticket-segment-matched')).toBeTruthy();

      expect(getByText('123')).toBeTruthy();
      expect(getByText('456')).toBeTruthy();
    });

    it('renders entire ticket highlighted when full match', async () => {
      const { getByTestId, queryByTestId } = await render(
        <HighlightedTicket ticket="123456" matchedDigits="123456" />,
      );

      expect(queryByTestId('ticket-segment-unmatched')).toBeNull();
      expect(getByTestId('ticket-segment-matched')).toBeTruthy();
    });

    it('renders position-aware highlighting for Special Consolation prize (T10.32)', async () => {
      const { getByTestId, getByText, getByLabelText } = await render(
        <HighlightedTicket
          ticket="154321"
          tier="SPECIAL_CONSOLATION"
          specialNumber="654321"
        />,
      );

      expect(getByTestId('ticket-segment-mismatched')).toBeTruthy();
      expect(getByTestId('ticket-segment-matched')).toBeTruthy();

      expect(getByText('1')).toBeTruthy();
      expect(getByText('54321')).toBeTruthy();

      expect(
        getByLabelText(/Số vé 154321, khớp 5 số cuối với giải Đặc biệt/i),
      ).toBeTruthy();
    });

    it('renders position-aware highlighting for Encouragement prize (T10.32)', async () => {
      const { getAllByTestId, getByTestId, getByText, getByLabelText } = await render(
        <HighlightedTicket
          ticket="604321"
          wins={[{ tier: 'ENCOURAGEMENT', matchedNumber: '654321' }]}
        />,
      );

      const matchedSegments = getAllByTestId('ticket-segment-matched');
      expect(matchedSegments.length).toBe(2); // '6' and '4321'
      expect(getByTestId('ticket-segment-mismatched')).toBeTruthy(); // '0'

      expect(getByText('6')).toBeTruthy();
      expect(getByText('0')).toBeTruthy();
      expect(getByText('4321')).toBeTruthy();

      expect(
        getByLabelText(/khớp.*giải Đặc biệt/i),
      ).toBeTruthy();
    });
  });
});
