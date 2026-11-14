/**
 * Contract Drift Tests (T09.01)
 *
 * Demonstrates the 6 contract discrepancies between mobile typed API and real backend responses.
 * These tests reproduce why the unmapped app fails against the real backend.
 */

import {
  REAL_CHECK_SINGLE_PAYLOAD,
  REAL_CHECK_BATCH_PAYLOAD,
  REAL_DRAW_PAYLOAD,
  REAL_LATEST_DRAW_PAYLOAD,
  REAL_STATIONS_PAYLOAD,
  REAL_APP_CONFIG_PAYLOAD,
} from '../__fixtures__/realBackendPayloads';

describe('T09.01 Contract Drift - Mobile vs Real Backend Payloads', () => {
  it('reproduces 1: POST /check returns stationCode & totalAmount instead of station & totalPrize', () => {
    const rawBackendData: any = REAL_CHECK_SINGLE_PAYLOAD;

    // Mobile UI expects .station and .totalPrize and .wins[].tierName
    const hasExpectedMobileFields =
      typeof rawBackendData.station === 'string' &&
      typeof rawBackendData.totalPrize === 'number' &&
      typeof rawBackendData.wins[0]?.tierName === 'string';

    expect(hasExpectedMobileFields).toBe(false);
    expect(rawBackendData.stationCode).toBe('tp-hcm');
    expect(rawBackendData.totalAmount).toBe(2000300000);
    expect(rawBackendData.wins[0].tier).toBe('SPECIAL');
    expect(rawBackendData.station).toBeUndefined();
    expect(rawBackendData.totalPrize).toBeUndefined();
    expect(rawBackendData.wins[0].tierName).toBeUndefined();
  });

  it('reproduces 2: POST /check/batch returns totalAmount and lacks totalWonTickets & station', () => {
    const rawBackendData: any = REAL_CHECK_BATCH_PAYLOAD;

    // Mobile UI expects .totalPrize and .totalWonTickets and .station
    const hasExpectedMobileBatchFields =
      typeof rawBackendData.totalPrize === 'number' &&
      typeof rawBackendData.totalWonTickets === 'number' &&
      typeof rawBackendData.station === 'string';

    expect(hasExpectedMobileBatchFields).toBe(false);
    expect(rawBackendData.totalAmount).toBe(2000000000);
    expect(rawBackendData.stationCode).toBe('tp-hcm');
    expect(rawBackendData.totalPrize).toBeUndefined();
    expect(rawBackendData.totalWonTickets).toBeUndefined();
    expect(rawBackendData.station).toBeUndefined();
  });

  it('reproduces 3: GET /draws returns numbers instead of prizes', () => {
    const rawBackendData: any = REAL_DRAW_PAYLOAD;

    // Mobile UI expects .prizes dictionary and .stationName
    const hasPrizesField =
      rawBackendData.prizes !== undefined &&
      typeof rawBackendData.stationName === 'string';

    expect(hasPrizesField).toBe(false);
    expect(rawBackendData.numbers).toBeDefined();
    expect(rawBackendData.numbers.SPECIAL).toEqual(['482915']);
    expect(rawBackendData.prizes).toBeUndefined();
    expect(rawBackendData.stationName).toBeUndefined();
  });

  it('reproduces 4: GET /draws/latest returns a single object instead of an array', () => {
    const rawBackendData: any = REAL_LATEST_DRAW_PAYLOAD;

    // Mobile hook useLatestDraws expects an array (calls .map)
    const isArrayResponse = Array.isArray(rawBackendData);

    expect(isArrayResponse).toBe(false);
    expect(typeof rawBackendData).toBe('object');
    expect(rawBackendData.stationCode).toBe('tp-hcm');
  });

  it('reproduces 5: GET /stations returns code/name/region without drawDays or liveStreamUrl', () => {
    const rawBackendStations: any = REAL_STATIONS_PAYLOAD;

    const firstStation = rawBackendStations[0];
    const hasDrawDays = Array.isArray(firstStation.drawDays);

    expect(hasDrawDays).toBe(false);
    expect(firstStation.code).toBe('tp-hcm');
    expect(firstStation.name).toBe('TP. Hồ Chí Minh');
    expect(firstStation.region).toBe('SOUTH');
    expect(firstStation.drawDays).toBeUndefined();
    expect(firstStation.liveStreamUrl).toBeUndefined();
  });

  it('reproduces 6: GET /app/config returns minSupportedVersion/maintenance/message without currentVersion', () => {
    const rawBackendConfig: any = REAL_APP_CONFIG_PAYLOAD;

    const hasCurrentVersion = typeof rawBackendConfig.currentVersion === 'string';

    expect(hasCurrentVersion).toBe(false);
    expect(rawBackendConfig.minSupportedVersion).toBe('1.0.0');
    expect(rawBackendConfig.maintenance).toBe(false);
    expect(rawBackendConfig.currentVersion).toBeUndefined();
  });
});
