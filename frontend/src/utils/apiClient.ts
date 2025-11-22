import type { Instrument } from '../types/instrument';
import type { SymbolSpec } from '../types/spec';
import type {
  ApiSettings,
  SettingsAuthorizeResponse,
  SettingsStatus,
  SettingsUpdateRequest,
} from '../types/settings';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000/api';
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_BASE_URL;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 300;

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return null as T;
    }
    return response.json() as Promise<T>;
  }

  let message = 'Произошла ошибка при выполнении запроса';

  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      message = data.detail[0].msg;
    }
  } catch {
    if (response.status >= 500) {
      message = 'Сервер временно недоступен. Попробуйте позже.';
    }
  }

  throw new Error(message);
}

const request = async <T>(path: string, init: RequestInit, attempt = 0): Promise<T> => {
  try {
    const response = await fetch(buildUrl(path), init);
    return handleResponse<T>(response);
  } catch (error) {
    const isNetworkError = error instanceof TypeError || (error instanceof Error && error.message === 'Failed to fetch');
    if (isNetworkError && attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS);
      return request<T>(path, init, attempt + 1);
    }
    const message = isNetworkError
      ? 'Не удалось подключиться к серверу. Проверьте соединение и попробуйте снова.'
      : (error instanceof Error ? error.message : 'Неизвестная ошибка. Попробуйте снова.');
    throw new Error(message);
  }
};

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const get = async <T>(path: string): Promise<T> => {
  return request<T>(path, {
    method: 'GET',
    headers: defaultHeaders,
  });
};

const post = async <T>(path: string, body: unknown): Promise<T> => {
  return request<T>(path, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
};

const put = async <T>(path: string, body: unknown): Promise<T> => {
  return request<T>(path, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
};

const patch = async <T>(path: string, body: unknown): Promise<T> => {
  return request<T>(path, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
};

const remove = async (path: string): Promise<void> => {
  await request<void>(path, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
};

export const apiClient = {
  getSpecs: (): Promise<SymbolSpec[]> => get<SymbolSpec[]>('/specs/'),
  getInstruments: (): Promise<Instrument[]> => get<Instrument[]>('/instruments/'),
  createInstrument: (symbol: string): Promise<Instrument> =>
    post<Instrument>('/instruments/', { symbol }),
  updateInstrument: (symbol: string, updates: Partial<Instrument>): Promise<Instrument> =>
    patch<Instrument>(`/instruments/${encodeURIComponent(symbol)}`, updates),
  deleteInstrument: (symbol: string): Promise<void> =>
    remove(`/instruments/${encodeURIComponent(symbol)}`),
  getSettingsStatus: (): Promise<SettingsStatus> => get<SettingsStatus>('/settings/status'),
  authorizeSettings: (password: string): Promise<SettingsAuthorizeResponse> =>
    post<ApiSettings>('/settings/authorize', { password }),
  updateSettings: (payload: SettingsUpdateRequest): Promise<ApiSettings> =>
    put<ApiSettings>('/settings/', payload),
};

