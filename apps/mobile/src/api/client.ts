/**
 * Typed API Client for DoVe Mobile
 * Handles RFC 7807 Problem Details error parsing, timeouts, and JSON serialization.
 */

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export const API_ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.',
  TIMEOUT_ERROR: 'Yêu cầu máy chủ vượt quá thời gian cho phép. Vui lòng thử lại.',
  STATION_NOT_FOUND: 'Không tìm thấy thông tin đài quay thưởng.',
  STATION_NOT_DRAWING: 'Đài này không mở thưởng vào ngày đã chọn.',
  INVALID_DATE: 'Ngày mở thưởng không hợp lệ.',
  INVALID_TICKET: 'Số vé không hợp lệ (cần đủ 6 chữ số).',
  RATE_LIMITED: 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng chờ ít phút.',
  INTERNAL_ERROR: 'Máy chủ gặp sự cố nội bộ. Vui lòng thử lại sau.',
};

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
): string {
  if (error instanceof ApiError) {
    if (error.code && API_ERROR_MESSAGES[error.code]) {
      return API_ERROR_MESSAGES[error.code];
    }
    return error.detail || error.title || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly title?: string;
  readonly detail?: string;
  readonly instance?: string;
  readonly raw?: unknown;

  constructor(problem: ProblemDetail) {
    super(
      problem.detail ||
        problem.title ||
        `API error with status ${problem.status}`,
    );
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.title = problem.title;
    this.detail = problem.detail;
    this.instance = problem.instance;
    this.raw = problem;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

const DEFAULT_TIMEOUT_MS = 10000;

export function getApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_APP_ENV || 'development';
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'http://localhost:8080';
  const cleaned = raw.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');

  if (
    env !== 'development' &&
    (cleaned.startsWith('http://localhost') || cleaned.startsWith('http://127.0.0.1'))
  ) {
    console.warn(
      `[SECURITY WARNING] Non-development build is using cleartext local API URL: ${cleaned}. Requests from physical devices will fail.`,
    );
  }

  return cleaned;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions & { body?: unknown } = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(
    endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
    baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`,
  );

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
      body,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson =
      contentType.includes('application/json') ||
      contentType.includes('problem+json');

    if (!response.ok) {
      if (isJson) {
        const errorJson = (await response.json()) as ProblemDetail;
        throw new ApiError({
          ...errorJson,
          status: response.status,
          code: errorJson.code,
          title: errorJson.title,
          detail: errorJson.detail,
          instance: errorJson.instance,
        });
      } else {
        const text = await response.text();
        throw new ApiError({
          status: response.status,
          code: `HTTP_${response.status}`,
          title: response.statusText,
          detail: text || response.statusText,
        });
      }
    }

    if (response.status === 204) {
      return null as T;
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError({
        status: 408,
        code: 'TIMEOUT_ERROR',
        title: 'Request Timeout',
        detail: API_ERROR_MESSAGES.TIMEOUT_ERROR,
      });
    }

    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      title: 'Lỗi kết nối',
      detail: API_ERROR_MESSAGES.NETWORK_ERROR,
    });
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
