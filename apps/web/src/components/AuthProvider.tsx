'use client';

import React, { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient();

    // 1. Initial check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('mdms_auth_token', session.access_token);
        const role = (
          session.user?.user_metadata?.role ||
          session.user?.app_metadata?.role ||
          ''
        )
          .toString()
          .toLowerCase();
        if (role) localStorage.setItem('mdms_auth_role', role);
      }
    });

    // 2. React to auth state changes across the application
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('mdms_auth_token', session.access_token);
        const role = (
          session.user?.user_metadata?.role ||
          session.user?.app_metadata?.role ||
          ''
        )
          .toString()
          .toLowerCase();
        if (role) localStorage.setItem('mdms_auth_role', role);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('mdms_auth_token');
        localStorage.removeItem('mdms_auth_role');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
