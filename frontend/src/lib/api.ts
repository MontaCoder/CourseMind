import { serverURL } from '@/constants';
import type { AuthSession } from '@/lib/api-types';

type ApiResponse<T> = { data: T; status: number };
type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null | undefined;
type AuthData = AuthSession;
let authHydration: Promise<AuthData | null> | null = null;
let authGeneration = 0;

const headers = (body?: RequestBody) => {
  const token = sessionStorage.getItem('token');
  const next: HeadersInit = {};
  if (!(body instanceof FormData)) next['Content-Type'] = 'application/json';
  if (token) next.Authorization = `Bearer ${token}`;
  return next;
};

const parseBody = (body?: RequestBody) => {
  if (!body || body instanceof FormData || typeof body === 'string') return body as BodyInit | undefined;
  return JSON.stringify(body);
};

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`${serverURL}${path}`, {
    credentials: 'include',
    ...init,
    headers: { ...headers(init.body as RequestBody), ...init.headers },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status === 401) {
    clearAuthData();
    window.location.href = '/login';
  }
  if (!response.ok) {
    const error = new Error(data?.message || response.statusText);
    (error as Error & { response?: ApiResponse<T> }).response = { data, status: response.status };
    throw error;
  }

  return { data, status: response.status };
}

const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: RequestBody) =>
    request<T>(path, { method: 'POST', body: parseBody(body) }),
};

export default api;

// Helper to store auth data
export const setAuthData = (data: AuthData) => {
  authGeneration += 1;
  sessionStorage.setItem('token', data.token);
  sessionStorage.setItem('email', data.userData.email);
  sessionStorage.setItem('mName', data.userData.mName);
  sessionStorage.setItem('auth', 'true');
  sessionStorage.setItem('uid', data.userData._id);
  sessionStorage.setItem('type', data.userData.type);
};

// Helper to clear auth data
export const clearAuthData = () => {
  authGeneration += 1;
  authHydration = null;
  sessionStorage.clear();
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return !!sessionStorage.getItem('token') && !!sessionStorage.getItem('auth');
};

export const hydrateAuth = async () => {
  if (isAuthenticated()) {
    return {
      token: sessionStorage.getItem('token') || '',
      userData: {
        _id: sessionStorage.getItem('uid') || '',
        email: sessionStorage.getItem('email') || '',
        mName: sessionStorage.getItem('mName') || '',
        type: sessionStorage.getItem('type') || '',
      },
    };
  }

  if (!authHydration) {
    const generation = authGeneration;
    authHydration = fetch(`${serverURL}/api/me`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json() as AuthData & { success?: boolean };
        if (!data?.token || !data?.userData) return null;
        if (generation !== authGeneration) return null;
        setAuthData(data);
        return { token: data.token, userData: data.userData };
      })
      .catch(() => null)
      .finally(() => {
        authHydration = null;
      });
  }

  return authHydration;
};

export const logout = async () => {
  try {
    await fetch(`${serverURL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearAuthData();
  }
};

// Helper to get current user info
export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  return {
    id: sessionStorage.getItem('uid'),
    email: sessionStorage.getItem('email'),
    name: sessionStorage.getItem('mName'),
    type: sessionStorage.getItem('type'),
  };
};
