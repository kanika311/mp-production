/**
 * Server-only client for talking to the NestJS API from the web BFF routes.
 *
 * The public site uses NextAuth mock sessions, but the API is hardened with a
 * real JWT + RBAC. To let the CMS admin persist changes without weakening the
 * API, the BFF authenticates with a dedicated service account (defaults to the
 * seeded super admin) and caches the short-lived access token, refreshing it on
 * expiry or a 401. This module must never be imported into client components.
 */

const API_URL =
  process.env.CMS_API_URL ||
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://mp-backend-api.onrender.com/api/v1';




interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let cache: TokenCache | null = null;
let inflight: Promise<string> | null = null;

async function login(): Promise<string> {
  const email = process.env.CMS_SERVICE_EMAIL || 'superadmin@mpproduction.com';
  const password = process.env.CMS_SERVICE_PASSWORD || 'MpDx5Vs8kW13bk!7';

  if (!email || !password) {
    throw new Error("CMS_SERVICE_EMAIL and CMS_SERVICE_PASSWORD environment variables must be defined");
  }
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`CMS service login failed (${res.status})`);
  }

  const json = await res.json().catch(() => null);
  // API responses are wrapped by the ResponseInterceptor: { success, data }
  const payload = json?.data ?? json;
  const token: string | undefined = payload?.accessToken;
  const expiresIn: number = Number(payload?.expiresIn) || 900; // seconds

  if (!token) {
    if (payload?.mfaRequired) {
      throw new Error('CMS service account requires MFA; configure a non-MFA service user.');
    }
    throw new Error('CMS service login did not return an access token');
  }

  cache = { token, expiresAt: Date.now() + (expiresIn - 30) * 1000 };
  return token;
}

async function getToken(force = false): Promise<string> {
  if (!force && cache && cache.expiresAt > Date.now()) {
    return cache.token;
  }
  if (inflight) return inflight;
  inflight = login().finally(() => {
    inflight = null;
  });
  return inflight;
}

export interface BackendResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Perform an authenticated request against the API. Retries once with a fresh
 * token if the first attempt is rejected as unauthorized.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<BackendResult<T>> {
  const isFormData = init.body instanceof FormData;
  const doFetch = async (token: string) => {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    };
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  };

  try {
    let token = await getToken();
    let res = await doFetch(token);

    if (res.status === 401 || res.status === 403) {
      // token may be stale — refresh once and retry
      token = await getToken(true);
      res = await doFetch(token);
    }

    const json = await res.json().catch(() => null);
    const data = (json && typeof json === 'object' && 'data' in json ? json.data : json) as T | null;

    if (!res.ok) {
      const error =
        (json && (json.message || json.error)) || `Request failed (${res.status})`;
      return { ok: false, status: res.status, data: null, error: String(error) };
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    console.warn('Backend fetch warning:', err);
    return {
      ok: false,
      status: 503,
      data: null,
      error: err instanceof Error ? err.message : 'Backend unreachable',
    };
  }
}
