import type {
  StationResponse,
  DrawResultResponse,
  CheckTicketRequest,
  CheckTicketResponse,
  BatchCheckRequest,
  BatchCheckResponse,
  AppConfigResponse,
} from '../index';

describe('Generated API Types', () => {
  it('validates StationResponse structure', () => {
    const station: StationResponse = {
      code: 'TPHCM',
      name: 'TP. Hồ Chí Minh',
      region: 'SOUTH',
      drawDays: ['SATURDAY', 'MONDAY'],
      liveStreamUrl: null,
    };
    expect(station.code).toBe('TPHCM');
  });

  it('validates DrawResultResponse structure', () => {
    const draw: DrawResultResponse = {
      drawDate: '2026-11-14',
      stationCode: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      prizes: {
        SPECIAL: ['123456'],
      },
      status: 'COMPLETED',
      updatedAt: '2026-11-14T16:45:00Z',
    };
    expect(draw.stationCode).toBe('TPHCM');
    expect(draw.prizes.SPECIAL).toContain('123456');
  });

  it('validates CheckTicketRequest and CheckTicketResponse structure', () => {
    const req: CheckTicketRequest = {
      ticket: '123456',
      station: 'TPHCM',
      drawDate: '2026-11-14',
    };
    expect(req.ticket).toBe('123456');

    const res: CheckTicketResponse = {
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Giải Đặc biệt',
          prizeAmount: 2000000000,
          matchedDigits: '123456',
        },
      ],
      totalPrize: 2000000000,
      message: null,
    };
    expect(res.won).toBe(true);
    expect(res.wins.length).toBe(1);
  });

  it('validates BatchCheck structures', () => {
    const batchReq: BatchCheckRequest = {
      station: 'TPHCM',
      drawDate: '2026-11-14',
      tickets: ['123456', '654321'],
    };
    expect(batchReq.tickets.length).toBe(2);

    const batchRes: BatchCheckResponse = {
      station: 'TPHCM',
      drawDate: '2026-11-14',
      results: [],
      totalPrize: 0,
      totalWonTickets: 0,
    };
    expect(batchRes.totalPrize).toBe(0);
  });

  it('validates AppConfigResponse structure', () => {
    const config: AppConfigResponse = {
      minSupportedVersion: '1.0.0',
      currentVersion: '1.0.0',
      maintenance: false,
      message: null,
    };
    expect(config.maintenance).toBe(false);
  });
});
