import {
  mapCheckResponseToUi,
  mapBatchResponseToUi,
  mapDrawResponseToUi,
  getStationName,
  getTierName,
  getMatchedDigits,
} from '../mappers';
import {
  REAL_CHECK_SINGLE_PAYLOAD,
  REAL_CHECK_BATCH_PAYLOAD,
  REAL_DRAW_PAYLOAD,
  REAL_STATIONS_PAYLOAD,
} from '../__fixtures__/realBackendPayloads';

describe('API to UI Mappers (T09.04)', () => {
  it('maps station code to Vietnamese name correctly', () => {
    expect(getStationName('tp-hcm')).toBe('TP. Hồ Chí Minh');
    expect(getStationName('dong-thap')).toBe('Đồng Tháp');
    expect(getStationName('ca-mau')).toBe('Cà Mau');
    expect(getStationName('unknown-station')).toBe('unknown-station');
    // Using custom stations list
    expect(
      getStationName('tp-hcm', [{ code: 'tp-hcm', name: 'TP Hồ Chí Minh Custom' }]),
    ).toBe('TP Hồ Chí Minh Custom');
  });

  it('maps prize tier to Vietnamese name and matched digits', () => {
    expect(getTierName('SPECIAL')).toBe('Giải Đặc biệt');
    expect(getTierName('FIRST')).toBe('Giải Nhất');
    expect(getTierName('EIGHTH')).toBe('Giải Tám');
    expect(getTierName('SPECIAL_CONSOLATION')).toBe('Giải Phụ Đặc biệt');
    expect(getTierName('ENCOURAGEMENT')).toBe('Giải Khuyến khích'); // backend key (T11.53)

    expect(getMatchedDigits('SPECIAL', '654321')).toBe('654321');
    expect(getMatchedDigits('SEVENTH', '321')).toBe('321');
    expect(getMatchedDigits('EIGHTH', '21')).toBe('21');
    // If backend returns full 6 digits for lower prize:
    expect(getMatchedDigits('EIGHTH', '654321')).toBe('21');
    expect(getMatchedDigits('SEVENTH', '654321')).toBe('321');
  });

  it('maps CheckTicketResponse DTO to UiCheckResult model', () => {
    const ui = mapCheckResponseToUi(REAL_CHECK_SINGLE_PAYLOAD, REAL_STATIONS_PAYLOAD);

    expect(ui.ticket).toBe('654321');
    expect(ui.stationCode).toBe('tp-hcm');
    expect(ui.stationName).toBe('TP. Hồ Chí Minh');
    expect(ui.station).toBe('tp-hcm');
    expect(ui.status).toBe('CHECKED');
    expect(ui.won).toBe(true);
    expect(ui.totalAmount).toBe(2000300000);
    expect(ui.totalPrize).toBe(2000300000);

    expect(ui.wins).toHaveLength(3);
    expect(ui.wins[0]).toEqual({
      tier: 'SPECIAL',
      tierName: 'Giải Đặc biệt',
      matchedNumber: '654321',
      matchedDigits: '654321',
      prizeAmount: 2000000000,
    });
    expect(ui.wins[1]).toEqual({
      tier: 'SEVENTH',
      tierName: 'Giải Bảy',
      matchedNumber: '321',
      matchedDigits: '321',
      prizeAmount: 200000,
    });
    expect(ui.wins[2]).toEqual({
      tier: 'EIGHTH',
      tierName: 'Giải Tám',
      matchedNumber: '21',
      matchedDigits: '21',
      prizeAmount: 100000,
    });
  });

  it('maps BatchCheckResponse DTO to UiBatchResult model', () => {
    const ui = mapBatchResponseToUi(REAL_CHECK_BATCH_PAYLOAD, REAL_STATIONS_PAYLOAD);

    expect(ui.stationCode).toBe('tp-hcm');
    expect(ui.stationName).toBe('TP. Hồ Chí Minh');
    expect(ui.drawDate).toBe('2026-11-09');
    expect(ui.totalAmount).toBe(2000000000);
    expect(ui.totalPrize).toBe(2000000000);
    expect(ui.totalTickets).toBe(2);
    expect(ui.totalWonTickets).toBe(1);

    expect(ui.results).toHaveLength(2);
    expect(ui.results[0].won).toBe(true);
    expect(ui.results[0].totalPrize).toBe(2000000000);
    expect(ui.results[1].won).toBe(false);
    expect(ui.results[1].totalPrize).toBe(0);
  });

  it('maps DrawResponse DTO to UiDrawView model', () => {
    const ui = mapDrawResponseToUi(REAL_DRAW_PAYLOAD, REAL_STATIONS_PAYLOAD);

    expect(ui.stationCode).toBe('tp-hcm');
    expect(ui.stationName).toBe('TP. Hồ Chí Minh');
    expect(ui.drawDate).toBe('2026-11-02');
    expect(ui.numbers).toBeDefined();
    expect(ui.prizes).toEqual(ui.numbers);
    expect(ui.isComplete).toBe(true);
    expect(ui.status).toBe('FINAL');
  });

  it('marks incomplete draws correctly as PENDING', () => {
    const partialDraw = {
      stationCode: 'tp-hcm',
      drawDate: '2026-11-02',
      numbers: {
        EIGHTH: ['15'],
      },
    };
    const ui = mapDrawResponseToUi(partialDraw);
    expect(ui.isComplete).toBe(false);
    expect(ui.status).toBe('PENDING');
  });
});
