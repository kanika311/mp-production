import { Navbar } from '@/components/ui/Navbar';

export const dynamic = 'force-dynamic';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { serverFetchAPI } from '@/lib/server-api-client';
import Image from 'next/image';



async function getTestimonials() {
  try {
    const res = await serverFetchAPI('/cms/testimonials', { cache: 'no-store' });
    if (!res.success || !res.data || res.data.length === 0) return [];
    return res.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-32">
        {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center">
          <Image 
            src="/images/bg-minimal.webp" 
            alt="Client Stories" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                Client Stories
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg">
                WHAT THEY SAY
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                Hear from the brands, agencies, and creators who trusted MP Productions with their vision.
              </p>
            </Reveal>
          </Container>
        </section>

        <Container>

          {/* Testimonials Grid */}
          {testimonials.length === 0 ? (
            <div className="text-center py-20 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-muted-foreground italic">No testimonials yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t: any, idx: number) => {
                const rating = t.rating || 5;
                const companyInfo = [t.clientTitle, t.clientCompany].filter(Boolean).join(', ');

                return (
                  <Reveal key={t.id || idx} direction="up" delay={(idx % 3) * 0.1}>
                    <Card hover className="flex flex-col h-full group">
                      {/* Stars */}
                      <div className="flex gap-1 mb-6">
                        {Array.from({ length: rating }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-foreground leading-relaxed mb-8 flex-grow font-light italic">
                        "{t.content}"
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-4 pt-6 border-t border-border">
                        {t.clientPhoto ? (
                          <img src={t.clientPhoto} alt={t.clientName} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-sm font-serif text-muted-foreground">
                            {t.clientName?.[0] || 'C'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground text-sm">{t.clientName}</p>
                          {companyInfo && <p className="text-muted-foreground/70 text-xs">{companyInfo}</p>}
                        </div>
                        {t.videoUrl && (
                          <div className="ml-auto">
                            <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <Reveal direction="up">
            <Card className="mt-24 text-center p-16 border-border items-center">
              <h2 className="text-3xl font-serif text-foreground mb-6">Ready to create your success story?</h2>
              <Button href="/contact" size="lg" variant="primary" className="self-center">
                Start Your Project
              </Button>
            </Card>
          </Reveal>

        </Container>
      </main>
      
    </>
  );
}
