"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
}

interface PricingFaq {
  q: string;
  a: string;
}

export default function Pricing() {
  const [packages, setPackages] = useState<PricingTier[]>([]);
  const [faqs, setFaqs] = useState<PricingFaq[]>([]);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/pricing').catch(() => null),
      fetchAPI('/cms/hero?page=pricing').catch(() => null),
      fetchAPI('/cms/config/pricing-faqs').catch(() => null),
    ])
      .then(([pricingRes, heroRes, faqRes]) => {
        // ── Parse pricing tiers ──
        if (pricingRes && pricingRes.success && pricingRes.data) {
          const d = pricingRes.data;
          // Support both { tiers: [...] } and direct array formats
          const fetchedTiers: PricingTier[] | null = Array.isArray(d)
            ? d
            : (d.tiers && Array.isArray(d.tiers))
              ? d.tiers
              : null;
          if (fetchedTiers && fetchedTiers.length > 0) {
            setPackages(fetchedTiers);
          }
        }

        // ── Parse hero ──
        if (heroRes && heroRes.success && heroRes.data) {
          setHero(heroRes.data);
        }

        // ── Parse FAQs ──
        if (faqRes && faqRes.success && faqRes.data) {
          const faqData = Array.isArray(faqRes.data)
            ? faqRes.data
            : (faqRes.data.faqs && Array.isArray(faqRes.data.faqs))
              ? faqRes.data.faqs
              : null;
          if (faqData && faqData.length > 0) {
            setFaqs(faqData);
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load pricing packages');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
        {/* Header Section — Full Bleed Merged With Navbar */}
        <section className="relative w-full h-[75vh] sm:h-[85vh] flex items-center justify-center overflow-hidden mb-20 text-center pt-28 sm:pt-36">
          <Image 
            src="/images/pricing-hero.webp" 
            alt="Investment" 
            fill 
            className="object-cover object-center" 
            priority sizes="100vw" />
          
          {/* Top Vignette Overlay for Navbar Integration */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-1 pointer-events-none" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40 z-1" />
          <div className="absolute bottom-0 left-0 right-0 h-40 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent z-2" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                {hero?.tagline || "Investment"}
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg whitespace-pre-line">
                {hero?.heading || "TRANSPARENT PRICING."}
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                {hero?.subheading || "Choose a package that fits your project, or request a custom quote for bespoke productions. All prices are exclusive of 18% GST."}
              </p>
            </Reveal>
          </Container>
        </section>

        <Container>

          {/* Pricing Cards */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-border rounded-2xl p-8 bg-muted/20 animate-pulse h-[550px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-5 bg-muted/40 rounded w-1/3" />
                    <div className="h-10 bg-muted/40 rounded w-1/2" />
                    <div className="h-16 bg-muted/40 rounded w-full" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-4 bg-muted/40 rounded w-full" />
                    ))}
                  </div>
                  <div className="h-12 bg-muted/40 rounded w-full" />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            /* Empty state — no pricing configured in CMS yet */
            <div className="text-center py-20 mb-32">
              <Reveal direction="up">
                <h2 className="text-3xl font-serif text-foreground mb-4">Pricing Coming Soon</h2>
                <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8">
                  Our pricing packages are being finalized. Contact us for a custom quote.
                </p>
                <Button href="/contact" variant="primary" size="lg">
                  Request a Quote
                </Button>
              </Reveal>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${packages.length === 2 ? 'lg:grid-cols-2 max-w-4xl mx-auto' : packages.length >= 3 ? 'lg:grid-cols-3' : 'max-w-lg mx-auto'} gap-8 mb-32`}>
              {packages.map((pkg, idx) => (
                <Reveal key={idx} direction="up" delay={idx * 0.1}>
                  <Card padding="none" hover className={`flex flex-col h-full overflow-hidden ${
                    pkg.highlighted 
                      ? 'border-2 border-primary shadow-xl relative' 
                      : ''
                  }`}>
                    {pkg.highlighted && (
                      <div className="bg-primary text-white text-center py-2 text-xs uppercase tracking-widest font-semibold">
                        Recommended
                      </div>
                    )}
                    <div className="p-8 md:p-10 flex flex-col flex-grow">
                      <h3 className="text-lg uppercase tracking-widest text-muted-foreground font-medium mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-serif text-foreground">{pkg.price}</span>
                        {pkg.period && (
                          <span className="text-sm text-muted-foreground/70">{pkg.period}</span>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-muted-foreground font-light text-sm mb-8">{pkg.description}</p>
                      )}

                      <ul className="space-y-4 mb-10 flex-grow">
                        {(pkg.features || []).map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <svg className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        href={pkg.cta?.toLowerCase().includes('contact') ? "/contact" : "/login"} 
                        variant={pkg.highlighted ? "primary" : "outline"}
                        size="lg"
                        className="w-full justify-center"
                      >
                        {pkg.cta || "Get Started"}
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}

          {/* FAQ Section — only show if FAQs exist in CMS */}
          {faqs.length > 0 && (
            <Reveal direction="up">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-serif text-foreground text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <details key={idx} className="group accordion-item">
                      <summary className="flex items-center justify-between px-8 py-6 cursor-pointer text-foreground font-medium hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
                        <span>{faq.q}</span>
                        <svg className="w-5 h-5 text-muted-foreground/70 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-8 pb-6 text-muted-foreground font-light leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Custom Quote CTA */}
          <Reveal direction="up">
            <div className="cta-section mt-20">
              <h2 className="text-3xl font-serif text-white mb-4">Need a Custom Quote?</h2>
              <p className="text-white/80 font-light max-w-lg mx-auto mb-8">
                For bespoke productions, multi-day shoots, or enterprise partnerships, our team will craft a tailored proposal.
              </p>
              <Button href="/contact" size="lg" variant="accent">
                Request Custom Quote
              </Button>
            </div>
          </Reveal>

        </Container>
      </main>
    </>
  );
}
