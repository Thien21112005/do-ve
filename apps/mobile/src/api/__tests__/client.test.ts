import { apiClient, ApiError, getApiBaseUrl } from '../client';

describe('Typed API Client', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('uses default localhost url when env var is not set', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:8080');
  });

  it('reads EXPO_PUBLIC_API_URL and strips trailing slashes', () => {
    const originalUrl = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'https://api.dove.app/api/v1/';
    expect(getApiBaseUrl()).toBe('https://api.dove.app');
    if (originalUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalUrl;
    }
  });

  it('warns when non-development build uses localhost URL (T09.11)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const origEnv = process.env.EXPO_PUBLIC_APP_ENV;
    const origUrl = process.env.EXPO_PUBLIC_API_URL;

    process.env.EXPO_PUBLIC_APP_ENV = 'production';
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8080';

    expect(getApiBaseUrl()).toBe('http://localhost:8080');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SECURITY WARNING] Non-development build is using cleartext local API URL'),
    );

    warnSpy.mockRestore();
    if (origEnv === undefined) {
      delete process.env.EXPO_PUBLIC_APP_ENV;
    } else {
      process.env.EXPO_PUBLIC_APP_ENV = origEnv;
    }
    if (origUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = origUrl;
    }
  });

  it('performs successful GET request and parses JSON', async () => {
    const mockData = { id: 1, name: 'TPHCM' };
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (h: string) => (h === 'content-type' ? 'application/json' : null),
      },
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await apiClient.get('/api/v1/stations');
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/stations',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('attaches query parameters correctly', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: jest.fn().mockResolvedValue([]),
    });

    await apiClient.get('/api/v1/draws', {
      params: { date: '2026-11-14', station: 'TPHCM' },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/draws?date=2026-11-14&station=TPHCM',
      expect.anything(),
    );
  });

  it('performs POST request with JSON payload', async () => {
    const responsePayload = { won: true, totalPrize: 2000000000 };
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: jest.fn().mockResolvedValue(responsePayload),
    });

    const body = { ticket: '123456', station: 'TPHCM', drawDate: '2026-11-14' };
    const result = await apiClient.post('/api/v1/check', body);

    expect(result).toEqual(responsePayload);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/check',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('parses RFC 7807 problem details into ApiError with code', async () => {
    const problemDetail = {
      type: 'https://dove.vn/errors/invalid-ticket',
      title: 'Invalid Ticket',
      status: 400,
      detail: 'Số vé phải có đúng 6 chữ số',
      instance: '/api/v1/check',
      code: 'INVALID_TICKET',
    };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => 'application/problem+json',
      },
      json: jest.fn().mockResolvedValue(problemDetail),
    });

    await expect(
      apiClient.post('/api/v1/check', { ticket: '123' }),
    ).rejects.toThrow(ApiError);

    try {
      await apiClient.post('/api/v1/check', { ticket: '123' });
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const apiErr = e as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('INVALID_TICKET');
      expect(apiErr.detail).toBe('Số vé phải có đúng 6 chữ số');
    }
  });

  it('converts network failures into ApiError with NETWORK_ERROR code', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error('Failed to fetch'));

    try {
      await apiClient.get('/api/v1/stations');
      throw new Error('Should have failed');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const apiErr = e as ApiError;
      expect(apiErr.code).toBe('NETWORK_ERROR');
      expect(apiErr.status).toBe(0);
    }
  });

  it('converts AbortError into ApiError with TIMEOUT_ERROR code', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    try {
      await apiClient.get('/api/v1/stations', { timeoutMs: 100 });
      throw new Error('Should have timed out');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const apiErr = e as ApiError;
      expect(apiErr.code).toBe('TIMEOUT_ERROR');
      expect(apiErr.status).toBe(408);
    }
  });
});
