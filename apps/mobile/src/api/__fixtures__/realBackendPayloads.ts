/**
 * Fixture payloads matching real backend responses (SRS 6.2 and Spring Boot DTOs).
 */

export const REAL_CHECK_SINGLE_PAYLOAD = {
  ticket: '654321',
  stationCode: 'tp-hcm',
  drawDate: '2026-11-09',
  status: 'CHECKED',
  won: true,
  wins: [
    { tier: 'SPECIAL', matchedNumber: '654321', prizeAmount: 2000000000 },
    { tier: 'SEVENTH', matchedNumber: '321', prizeAmount: 200000 },
    { tier: 'EIGHTH', matchedNumber: '21', prizeAmount: 100000 },
  ],
  totalAmount: 2000300000,
};

export const REAL_CHECK_BATCH_PAYLOAD = {
  stationCode: 'tp-hcm',
  drawDate: '2026-11-09',
  results: [
    {
      ticket: '654321',
      stationCode: 'tp-hcm',
      drawDate: '2026-11-09',
      status: 'CHECKED',
      won: true,
      wins: [{ tier: 'SPECIAL', matchedNumber: '654321', prizeAmount: 2000000000 }],
      totalAmount: 2000000000,
    },
    {
      ticket: '000000',
      stationCode: 'tp-hcm',
      drawDate: '2026-11-09',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalAmount: 0,
    },
  ],
  totalAmount: 2000000000,
};

export const REAL_DRAW_PAYLOAD = {
  stationCode: 'tp-hcm',
  drawDate: '2026-11-02',
  numbers: {
    SPECIAL: ['482915'],
    FIRST: ['73924'],
    SECOND: ['81057'],
    THIRD: ['62481', '90135'],
    FOURTH: ['17523', '49182', '30819', '65471', '82934', '10283', '74659'],
    FIFTH: ['5928'],
    SIXTH: ['8192', '3048', '6721'],
    SEVENTH: ['395'],
    EIGHTH: ['15'],
  },
};

export const REAL_LATEST_DRAW_PAYLOAD = {
  stationCode: 'tp-hcm',
  drawDate: '2026-11-02',
  numbers: {
    SPECIAL: ['482915'],
    FIRST: ['73924'],
    SECOND: ['81057'],
    THIRD: ['62481', '90135'],
    FOURTH: ['17523', '49182', '30819', '65471', '82934', '10283', '74659'],
    FIFTH: ['5928'],
    SIXTH: ['8192', '3048', '6721'],
    SEVENTH: ['395'],
    EIGHTH: ['15'],
  },
};

export const REAL_STATIONS_PAYLOAD = [
  { code: 'tp-hcm', name: 'TP. Hồ Chí Minh', region: 'SOUTH' },
  { code: 'dong-thap', name: 'Đồng Tháp', region: 'SOUTH' },
  { code: 'ca-mau', name: 'Cà Mau', region: 'SOUTH' },
];

export const REAL_APP_CONFIG_PAYLOAD = {
  minSupportedVersion: '1.0.0',
  maintenance: false,
  message: '',
};
