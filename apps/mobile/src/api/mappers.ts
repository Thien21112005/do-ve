import type {
  CheckTicketResponse,
  BatchCheckResponse,
  DrawResponse,
  StationResponse,
} from '@/types';

export interface UiWin {
  tier: string;
  tierName: string;
  matchedNumber: string;
  matchedDigits: string;
  prizeAmount: number;
}

export interface UiCheckResult {
  ticket: string;
  stationCode: string;
  station: string; // compatibility alias
  stationName: string;
  drawDate: string;
  status: string;
  won: boolean | null;
  wins: UiWin[];
  totalAmount: number;
  totalPrize: number; // compatibility alias
}

export interface UiBatchResult {
  stationCode: string;
  station: string; // compatibility alias
  stationName: string;
  drawDate: string;
  results: UiCheckResult[];
  totalAmount: number;
  totalPrize: number; // compatibility alias
  totalWonTickets: number;
  totalTickets: number;
}

export interface UiDrawView {
  stationCode: string;
  stationName: string;
  drawDate: string;
  numbers: Record<string, string[]>;
  prizes: Record<string, string[]>; // compatibility alias
  isComplete: boolean;
  status: 'FINAL' | 'PENDING';
}

export const STATION_NAMES: Record<string, string> = {
  'tp-hcm': 'TP. Hồ Chí Minh',
  'tphcm': 'TP. Hồ Chí Minh',
  'dong-thap': 'Đồng Tháp',
  'ca-mau': 'Cà Mau',
  'ben-tre': 'Bến Tre',
  'vung-tau': 'Vũng Tàu',
  'bac-lieu': 'Bạc Liêu',
  'dong-nai': 'Đồng Nai',
  'can-tho': 'Cần Thơ',
  'soc-trang': 'Sóc Trăng',
  'tay-ninh': 'Tây Ninh',
  'an-giang': 'An Giang',
  'binh-thuan': 'Bình Thuận',
  'vinh-long': 'Vĩnh Long',
  'binh-duong': 'Bình Dương',
  'tra-vinh': 'Trà Vinh',
  'tien-giang': 'Tiền Giang',
  'kien-giang': 'Kiên Giang',
  'da-lat': 'Đà Lạt (Lâm Đồng)',
  'dalat': 'Đà Lạt (Lâm Đồng)',
  'binh-phuoc': 'Bình Phước',
  'hau-giang': 'Hậu Giang',
  'long-an': 'Long An',
};

export const TIER_NAMES: Record<string, string> = {
  SPECIAL: 'Giải Đặc biệt',
  FIRST: 'Giải Nhất',
  SECOND: 'Giải Nhì',
  THIRD: 'Giải Ba',
  FOURTH: 'Giải Tư',
  FIFTH: 'Giải Năm',
  SIXTH: 'Giải Sáu',
  SEVENTH: 'Giải Bảy',
  EIGHTH: 'Giải Tám',
  SPECIAL_CONSOLATION: 'Giải Phụ Đặc biệt',
  CONSOLATION: 'Giải Khuyến khích',
};

export const TIER_DIGITS: Record<string, number> = {
  SPECIAL: 6,
  FIRST: 5,
  SECOND: 5,
  THIRD: 5,
  FOURTH: 5,
  FIFTH: 4,
  SIXTH: 4,
  SEVENTH: 3,
  EIGHTH: 2,
  SPECIAL_CONSOLATION: 6,
  CONSOLATION: 6,
};

export function getStationName(
  code?: string,
  stationsList?: { code?: string; name?: string }[],
): string {
  if (!code) return '';
  const trimmed = code.trim();
  const normalized = trimmed.toLowerCase();
  const hyphenated = normalized.replace(/[_\s]/g, '-');
  if (stationsList && stationsList.length > 0) {
    const found = stationsList.find(
      (s) =>
        s.code?.toLowerCase().trim() === normalized ||
        s.code?.toLowerCase().trim().replace(/[_\s]/g, '-') === hyphenated,
    );
    if (found?.name) return found.name;
  }
  return (
    STATION_NAMES[hyphenated] ||
    STATION_NAMES[normalized] ||
    trimmed
  );
}

export function getTierName(tier?: string): string {
  if (!tier) return '';
  return TIER_NAMES[tier] || tier;
}

export function getMatchedDigits(tier: string, matchedNumber?: string): string {
  if (!matchedNumber) return '';
  const length = TIER_DIGITS[tier];
  if (!length || length >= matchedNumber.length) {
    return matchedNumber;
  }
  return matchedNumber.slice(-length);
}

export function mapCheckResponseToUi(
  dto: CheckTicketResponse,
  stationsList?: StationResponse[],
): UiCheckResult {
  const stationCode = dto.stationCode || '';
  const stationName = dto.stationName || getStationName(stationCode, stationsList);
  const total =
    typeof dto.totalAmount === 'number'
      ? dto.totalAmount
      : typeof (dto as any).totalPrize === 'number'
        ? (dto as any).totalPrize
        : 0;

  const wins: UiWin[] = (dto.wins || []).map((w) => {
    const tier = w.tier || '';
    const matchedNumber = w.matchedNumber || (w as any).matchedDigits || '';
    return {
      tier,
      tierName: (w as any).tierName || getTierName(tier),
      matchedNumber,
      matchedDigits:
        (w as any).matchedDigits || getMatchedDigits(tier, matchedNumber),
      prizeAmount: typeof w.prizeAmount === 'number' ? w.prizeAmount : 0,
    };
  });

  return {
    ticket: dto.ticket || '',
    stationCode,
    station: stationCode,
    stationName,
    drawDate: dto.drawDate || '',
    status: dto.status || '',
    won: dto.won ?? null,
    wins,
    totalAmount: total,
    totalPrize: total,
  };
}

export function mapBatchResponseToUi(
  dto: BatchCheckResponse,
  stationsList?: StationResponse[],
): UiBatchResult {
  const stationCode = dto.stationCode || (dto as any).station || '';
  const stationName = dto.stationName || getStationName(stationCode, stationsList);
  const total =
    typeof dto.totalAmount === 'number'
      ? dto.totalAmount
      : typeof (dto as any).totalPrize === 'number'
        ? (dto as any).totalPrize
        : 0;

  const results: UiCheckResult[] = (dto.results || []).map((r) =>
    mapCheckResponseToUi(r, stationsList),
  );

  const totalWonTickets = results.filter((r) => Boolean(r.won)).length;

  return {
    stationCode,
    station: stationCode,
    stationName,
    drawDate: dto.drawDate || '',
    results,
    totalAmount: total,
    totalPrize: total,
    totalTickets: results.length,
    totalWonTickets,
  };
}

export function mapDrawResponseToUi(
  dto?: DrawResponse | null,
  stationsList?: StationResponse[],
): UiDrawView {
  if (!dto) {
    return null as any;
  }
  const stationCode = dto.stationCode || '';
  const stationName = dto.stationName || getStationName(stationCode, stationsList);
  const numbers: Record<string, string[]> = dto.numbers || {};

  // Check if draw has all 18 numbers
  const totalNumbers = Object.values(numbers).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  const isComplete = totalNumbers >= 18;

  return {
    stationCode,
    stationName,
    drawDate: dto.drawDate || '',
    numbers,
    prizes: numbers,
    isComplete,
    status: isComplete ? 'FINAL' : 'PENDING',
  };
}
