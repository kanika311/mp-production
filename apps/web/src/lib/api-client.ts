import { createClient } from '@/utils/supabase/client';

// Resolve the API URL for both client and server environments
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mp-backend-api.onrender.com/api/v1';

export function mapEndpointToEdgeFunction(endpoint: string, options: RequestInit = {}): { url: string; headers: Record<string, string>; useEdge: boolean } {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return { url: `${API_URL}${formattedEndpoint}`, headers: {}, useEdge: false };
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let token = '';

  // The app authenticates with Supabase Auth. Send the Supabase access token so
  // the NestJS API (which validates Supabase JWTs) authorizes the request.
  if (typeof window !== 'undefined') {
    try {
      // 1. Direct localStorage tokens (fastest & most reliable)
      token = localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') || localStorage.getItem('accessToken') || '';

      // 2. Parse Supabase session token directly from localStorage if key matches sb-*-auth-token
      if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('supabase')) && k.endsWith('-auth-token')) {
            try {
              const val = localStorage.getItem(k);
              if (val) {
                const parsed = JSON.parse(val);
                token = parsed?.access_token || parsed?.currentSession?.access_token || '';
                if (token) {
                  localStorage.setItem('token', token);
                  break;
                }
              }
            } catch {}
          }
        }
      }

      // 3. Fallback to document.cookie (for session cookies)
      if (!token && typeof document !== 'undefined') {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:mdms_auth_token|token|accessToken)=([^;]+)/);
        if (cookieMatch && cookieMatch[1]) {
          token = decodeURIComponent(cookieMatch[1]);
          localStorage.setItem('token', token);
        }
      }
    } catch {
      token = '';
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Map to Supabase Edge Functions if matching
  const mapped = mapEndpointToEdgeFunction(endpoint, config);

  const finalHeaders = {
    ...config.headers,
    ...mapped.headers,
  } as HeadersInit;

  let res: Response;
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    res = await fetch(mapped.url, {
      ...config,
      headers: finalHeaders,
    });

    // If external Render API returns server error (502/503/504), fallback to internal Next.js BFF
    if (!res.ok && res.status >= 500 && typeof window !== 'undefined') {
      const localUrl = `/api${formattedEndpoint}`;
      const localRes = await fetch(localUrl, { ...config, headers: finalHeaders }).catch(() => null);
      if (localRes && (localRes.ok || localRes.status < 500)) {
        res = localRes;
      }
    }
  } catch (netErr) {
    // If external Render API connection fails (CORS, cold sleep, offline), fallback to internal Next.js BFF
    if (typeof window !== 'undefined') {
      const localUrl = `/api${formattedEndpoint}`;
      try {
        res = await fetch(localUrl, {
          ...config,
          headers: finalHeaders,
        });
      } catch (localErr) {
        throw netErr;
      }
    } else {
      throw netErr;
    }
  }
  
  if (!res.ok) {
    let errorMessage = `API request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  
  return res.json();
}

