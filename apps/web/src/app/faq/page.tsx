'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [faqs, setFaqs] = useState<Record<string, { q: string; a: string }[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/faq').catch(() => null),
      fetchAPI('/cms/hero?page=faq').catch(() => null)
    ])
      .then(([faqRes, heroRes]) => {
        if (faqRes && faqRes.success && faqRes.data) {
          // Handle grouped FAQ data: { "Category": [{ q, a }], ... }
          if (typeof faqRes.data === 'object' && !Array.isArray(faqRes.data) && Object.keys(faqRes.data).length > 0) {
            setFaqs(faqRes.data);
            const cats = Object.keys(faqRes.data);
            setCategories(cats);
            setActiveCategory(cats[0] || '');
          }
          // Handle flat FAQ array: [{ question, answer, category }]
          else if (Array.isArray(faqRes.data) && faqRes.data.length > 0) {
            const grouped: Record<string, { q: string; a: string }[]> = {};
            faqRes.data.forEach((item: any) => {
              const cat = item.category || 'General';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push({ q: item.question || item.q, a: item.answer || item.a });
            });
            setFaqs(grouped);
            const cats = Object.keys(grouped);
            setCategories(cats);
            setActiveCategory(cats[0] || '');
          }
        }
        // Also try CMS categories list
        if (faqRes?.categories && Array.isArray(faqRes.categories)) {
          setCategories(faqRes.categories);
          if (!activeCategory && faqRes.categories.length > 0) {
            setActiveCategory(faqRes.categories[0]);
          }
        }
        if (heroRes && heroRes.success && heroRes.data) {
          setHero(heroRes.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load FAQ items');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-content">
        <Container size="md">

          {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] lg:w-[calc(100%+6rem)] rounded-none">
          <Image 
            src="/images/bg-luxury.webp" 
            alt="FAQ & Support" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                {hero?.tagline || "Support"}
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg whitespace-pre-line">
                {hero?.heading || "FAQ."}
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                {hero?.subheading || "Find answers to the most common questions about our services, booking process, and deliverables."}
              </p>
            </Reveal>
          </Container>
        </section>

          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border border-border rounded-xl p-6 bg-muted/20 animate-pulse space-y-2">
                  <div className="h-6 bg-muted/40 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            /* Empty state — no FAQs configured */
            <div className="text-center py-20">
              <Reveal direction="up">
                <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="text-3xl font-serif text-foreground mb-4">FAQs Coming Soon</h2>
                <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8">
                  Our FAQ section is being prepared. In the meantime, feel free to contact us directly.
                </p>
                <Button href="/contact" variant="primary" size="lg">
                  Contact Us
                </Button>
              </Reveal>
            </div>
          ) : (
            <>
              {/* Category Filters */}
              <Reveal direction="up" delay={0.1}>
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                  {categories.map((catName) => (
                    <button
                      key={catName}
                      onClick={() => setActiveCategory(catName)}
                      className={`pill-btn flex items-center gap-2 ${
                        activeCategory === catName
                          ? 'pill-btn-active'
                          : 'text-muted-foreground bg-surface'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      {catName}
                    </button>
                  ))}
                </div>
              </Reveal>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                {(faqs[activeCategory] || []).map((faq, idx) => (
                  <Reveal key={`${activeCategory}-${idx}`} direction="up" delay={idx * 0.05}>
                    <details className="group accordion-item">
                      <summary className="flex items-center justify-between px-8 py-6 cursor-pointer text-foreground font-medium hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
                        <span>{faq.q}</span>
                        <svg className="w-5 h-5 text-muted-foreground/70 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-8 pb-6 text-muted-foreground font-light leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </div>
                    </details>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          {/* WhatsApp Support CTA */}
          <Reveal direction="up">
            <div className="cta-section mt-20">
              <h2 className="text-2xl font-serif text-white mb-4">Still have questions?</h2>
              <p className="text-white/80 font-light mb-8 max-w-md mx-auto">
                Chat with us directly on WhatsApp for instant support, or send us an email.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="px-8 py-3 bg-[#25D366] text-white uppercase tracking-widest text-sm hover:brightness-110 transition-all rounded-full shadow-sm inline-flex items-center justify-center gap-2 font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp Support
                </a>
                <Button href="/contact" size="lg" variant="accent" className="!rounded-full">
                  Contact Form
                </Button>
              </div>
            </div>
          </Reveal>

        </Container>
      </main>
    </>
  );
}
