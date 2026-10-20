'use client';

import React, { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Initial check on mount from localStorage / document.cookie
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('mdms_auth_token');
      if (token && typeof document !== 'undefined') {
        // Ensure cookie is in sync
        if (!document.cookie.includes('token=')) {
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        }
      }
    } catch {
      // Ignore in SSR/restricted environments
    }
  }, []);

  return <>{children}</>;
}
