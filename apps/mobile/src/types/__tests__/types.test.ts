import type {
  StationResponse,
  DrawResultResponse,
  CheckTicketRequest,
  CheckTicketResponse,
  BatchCheckRequest,
  BatchCheckResponse,
  AppConfigResponse,
} from '../index';
import type { UiCheckResult, UiBatchResult, UiDrawView } from '@/api/mappers';

describe('Generated API Types and UI Models', () => {
  it('validates StationResponse structure matching real backend contract', () => {
    const station: StationResponse = {
      code: 'tp-hcm',
      name: 'TP. Hồ Chí Minh',
      region: 'SOUTH',
    };
    expect(station.code).toBe('tp-hcm');
    expect(station.name).toBe('TP. Hồ Chí Minh');
    expect(station.region).toBe('SOUTH');
  });

  it('validates DrawResultResponse structure matching real backend contract', () => {
    const draw: DrawResultResponse = {
      drawDate: '2026-11-14',
      stationCode: 'tp-hcm',
      numbers: {
        SPECIAL: ['123456'],
      },
    };
    expect(draw.stationCode).toBe('tp-hcm');
    expect(draw.numbers?.SPECIAL).toContain('123456');
  });

  it('validates CheckTicketRequest and CheckTicketResponse structure', () => {
    const req: CheckTicketRequest = {
      ticket: '123456',
      stationCode: 'tp-hcm',
      drawDate: '2026-11-14',
    };
    expect(req.ticket).toBe('123456');
    expect(req.stationCode).toBe('tp-hcm');

    const res: CheckTicketResponse = {
      ticket: '123456',
      stationCode: 'tp-hcm',
      drawDate: '2026-11-14',
      status: 'WIN',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          prizeAmount: 2000000000,
          matchedNumber: '123456',
        },
      ],
      totalAmount: 2000000000,
    };
    expect(res.won).toBe(true);
    expect(res.wins?.length).toBe(1);
    expect(res.totalAmount).toBe(2000000000);
  });

  it('validates BatchCheck structures matching backend contract', () => {
    const batchReq: BatchCheckRequest = {
      stationCode: 'tp-hcm',
      drawDate: '2026-11-14',
      tickets: ['123456', '654321'],
    };
    expect(batchReq.tickets.length).toBe(2);
    expect(batchReq.stationCode).toBe('tp-hcm');

    const batchRes: BatchCheckResponse = {
      stationCode: 'tp-hcm',
      drawDate: '2026-11-14',
      results: [],
      totalAmount: 0,
    };
    expect(batchRes.totalAmount).toBe(0);
  });

  it('validates AppConfigResponse structure', () => {
    const config: AppConfigResponse = {
      minSupportedVersion: '1.0.0',
      maintenance: false,
      message: '',
    };
    expect(config.maintenance).toBe(false);
  });

  it('validates UiCheckResult, UiBatchResult, and UiDrawView mapper contracts', () => {
    const uiCheck: UiCheckResult = {
      ticket: '123456',
      stationCode: 'tp-hcm',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WIN',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Giải Đặc biệt',
          matchedNumber: '123456',
          matchedDigits: '123456',
          prizeAmount: 2000000000,
        },
      ],
      totalAmount: 2000000000,
      totalPrize: 2000000000,
    };

    const uiBatch: UiBatchResult = {
      stationCode: 'tp-hcm',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      results: [uiCheck],
      totalAmount: 2000000000,
      totalPrize: 2000000000,
      totalWonTickets: 1,
      totalTickets: 1,
    };

    const uiDraw: UiDrawView = {
      stationCode: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      numbers: { SPECIAL: ['123456'] },
      prizes: { SPECIAL: ['123456'] },
      isComplete: true,
      status: 'FINAL',
    };

    expect(uiCheck.totalPrize).toBe(2000000000);
    expect(uiBatch.totalWonTickets).toBe(1);
    expect(uiDraw.isComplete).toBe(true);
  });
});
