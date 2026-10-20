'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Subscribe to Supabase Realtime Postgres changes and trigger a refresh.
 *
 * The pattern here is "subscribe → refresh via BFF": Realtime is used only as a
 * lightweight signal that *something* changed. When an event fires we call the
 * provided `onChange` (which re-runs the existing secure BFF loaders), so all
 * data still flows browser → BFF → API and never trusts the Realtime payload
 * for anything sensitive.
 *
 * AUTH: the channel authenticates with the logged-in user's Supabase session
 * access token (via realtime.setAuth), NOT the public anon key. This lets the
 * RLS policy on these tables be scoped to the admin role so only authenticated
 * admins receive change events.
 *
 * Table names are the raw Postgres table names. Prisma maps models 1:1 without
 * @@map, so they are PascalCase: 'Booking', 'Testimonial', 'PortfolioItem'.
 *
 * NOTE: Realtime must be enabled for these tables in the Supabase dashboard
 * (Database → Replication). The admin role needs a SELECT policy or change
 * events are silently dropped.
 */
export function useRealtimeRefresh(
  tables: string[],
  onChange: () => void,
  options: { debounceMs?: number; enabled?: boolean } = {},
): { connected: boolean } {
  const { debounceMs = 800, enabled = true } = options;
  const [connected, setConnected] = useState(false);

  // Keep the latest callback in a ref so re-renders don't re-subscribe.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable key so the effect only re-runs when the table set actually changes.
  const tablesKey = tables.join(',');

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const supabase = createClient();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onChangeRef.current();
      }, debounceMs);
    };

    const subscribe = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setConnected(false);
          return;
        }
        supabase.realtime.setAuth(session.access_token);

        if (cancelled) return;

        channel = supabase.channel(`realtime-refresh:${tablesKey}`);

        for (const table of tables) {
          channel.on(
            'postgres_changes' as never,
            { event: '*', schema: 'public', table } as never,
            scheduleRefresh as never,
          );
        }

        channel.subscribe((status: string) => {
          setConnected(status === 'SUBSCRIBED');
        });
      } catch (err) {
        console.warn('Realtime subscription degraded:', err);
        setConnected(false);
      }
    };

    let authListener: any = null;
    try {
      const listener = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          try {
            supabase.realtime.setAuth(session.access_token);
          } catch {}
        }
      });
      authListener = listener?.data;
    } catch {}

    subscribe();

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      authListener?.subscription?.unsubscribe();
      if (channel) supabase.removeChannel(channel);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey, enabled, debounceMs]);

  return { connected };
}
