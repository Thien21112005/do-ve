import React from 'react';
import { render } from '@testing-library/react-native';
import {
  HighlightedTicket,
  computeMatchedSegments,
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
  });
});
