'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Camera, Film, Smartphone, Music, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import TalentDiscoveryFeed from '@/components/talent/TalentDiscoveryFeed';

const talentTypes = [
  { id: '01', name: "High-Fashion & Runway", desc: "Global cover models and editorial muses for luxury lookbooks.", icon: <Camera className="w-5 h-5 text-brand" />, count: "18k+" },
  { id: '02', name: "A-List Actors & Drama", desc: "Trained performers for feature films and premium brand cinema.", icon: <Film className="w-5 h-5 text-brand" />, count: "7k+" },
  { id: '03', name: "Digital Influencers", desc: "High-engagement cultural tastemakers for viral campaigns.", icon: <Smartphone className="w-5 h-5 text-brand" />, count: "14k+" },
  { id: '04', name: "Movement & Dancers", desc: "Conceptual movement artists for music films and choreography.", icon: <Music className="w-5 h-5 text-brand" />, count: "6k+" },
];

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
      
      <main className="min-h-screen bg-background text-foreground pt-16 pb-32 relative overflow-x-clip">
        {/* Subtle Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-gradient-to-b from-brand/5 via-brand/1 to-transparent blur-[140px] pointer-events-none z-0" />
        
        {/* ── TALENT DISCOVERY SECTION (Search Bar + Sticky Filters + Yogsathi-style Cards) ── */}
        <section id="discovery-feed" className="relative z-10">
          {loading ? (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Taxonomy Divisions Section */}
        <section className="py-20 bg-muted/10 border-y border-border relative z-10 mt-16">
          <Container>
            <Reveal direction="up">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-brand font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
                  ● Talent Taxonomy
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">Core Creative Divisions</h2>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Carefully vetted across operational domains to ensure absolute alignment for luxury brand shoots and commercial cinema.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {talentTypes.map((type, idx) => (
                <Reveal key={type.id} direction="up" delay={idx * 0.05}>
                  <div className="group h-full p-6 rounded-3xl bg-card border border-border hover:border-brand hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground/50 group-hover:text-brand transition-colors">
                        / {type.id}
                      </span>
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border group-hover:border-brand/40 transition-colors">
                        {type.icon}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-brand transition-colors">
                        {type.name}
                      </h3>
                      <p className="text-muted-foreground font-light text-xs leading-relaxed mb-4">
                        {type.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono tracking-wider">
                      <span className="text-brand font-bold">{type.count}</span>
                      <span className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex items-center gap-1">
                        Verified
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* Talent Protections & Standard */}
        <section className="py-20 relative z-10">
          <Container>
            <Reveal direction="up">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-brand font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
                  ● Vetting Protections
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">Why Brands & Creators Choose MP.</h2>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  We eliminate agency friction by implementing standardized contracts, transparent rates, and secure transaction escrows.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Verified Global Agency Access', desc: 'Direct mapping to leading visual producers, modeling coordinators, and global luxury ateliers.' },
                { title: 'Secure Escrow Architecture', desc: 'Standardized rate agreements with secure 48-hour escrow protection on all authorized campaigns.' },
                { title: 'Custom 4K Lookbook Kits', desc: 'We build immersive media portfolios for top-tier talents, complete with real-time casting metrics.' }
              ].map((b, idx) => (
                <Reveal key={idx} direction="up" delay={idx * 0.08}>
                  <div className="p-8 rounded-3xl bg-card border border-border hover:border-brand/40 transition-all duration-300 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-serif font-bold text-foreground mb-2">{b.title}</h3>
                      <p className="text-muted-foreground font-light text-xs leading-relaxed">{b.desc}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-[10px] font-mono text-brand tracking-widest uppercase font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Studio Certified</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
