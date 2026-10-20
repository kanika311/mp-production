'use client';

import { Navbar } from '@/components/ui/Navbar';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import TalentDiscoveryFeed from '@/components/talent/TalentDiscoveryFeed';

export default function TalentPage() {
  const [allTalents, setAllTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/talent', { cache: 'no-store' })
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setAllTalents(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load talents:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-x-clip">
        {/* Subtle Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-gradient-to-b from-brand/5 via-brand/1 to-transparent blur-[140px] pointer-events-none z-0" />
        
        {/* ── TALENT DISCOVERY SECTION (Search Bar + Sticky Filters + Yogsathi-style Cards) ── */}
        <section id="discovery-feed" className="relative z-10">
          {loading ? (
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-[170px] py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-card border border-border rounded-3xl p-6 h-96 animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <TalentDiscoveryFeed initialTalents={allTalents} />
          )}
        </section>
      </main>
    </>
  );
}
