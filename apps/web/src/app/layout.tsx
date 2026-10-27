import type { Metadata } from 'next';
import { Outfit, Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './tw-animate.css';
import './globals.css';
import { Footer } from '@/components/ui/Footer';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display-serif',
  display: 'swap',
});

import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://shivaste.com'),
  title: {
    default: 'MP Production | Cinematic Film & Brand Production Mumbai',
    template: '%s | MP Production',
  },
  description:
    'Mumbai-based cinematic production house for brand films, TVCs, product launch videos, fashion lookbooks and talent casting. Get a free quote.',
  alternates: {
    canonical: '/',
    languages: {
      'en': 'https://shivaste.com',
      'en-IN': 'https://shivaste.com',
      'x-default': 'https://shivaste.com',
    },
  },
  openGraph: {
    title: 'MP Production | Cinematic Film & Brand Production Mumbai',
    description:
      'Mumbai-based cinematic production house for brand films, TVCs, product launch videos, fashion lookbooks and talent casting. Get a free quote.',
    url: 'https://shivaste.com',
    siteName: 'MP Production',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/assets/cinematic-16-9.webp',
        width: 1200,
        height: 630,
        alt: 'MP Production - Cinematic Film and Brand Production House Mumbai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MP Production | Cinematic Film & Brand Production Mumbai',
    description:
      'Mumbai-based cinematic production house for brand films, TVCs, product launch videos, fashion lookbooks and talent casting. Get a free quote.',
    images: ['/assets/cinematic-16-9.webp'],
  },
};

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { LenisProvider } from '@/components/motion/LenisProvider';
import { CinematicAtmosphere } from '@/components/motion/CinematicAtmosphere';
import { PageTransitionWrapper } from '@/components/motion/PageTransitionWrapper';
import { LayoutPreloader } from '@/components/ui/layout-preloader';

import { AuthProvider } from '@/components/AuthProvider';
import { WhatsAppWidget } from '@/components/ui/WhatsAppWidget';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-[#eb3d26] selection:text-white" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <LenisProvider>
              <CinematicAtmosphere />
              <Toaster position="top-right" richColors />
              <div className="min-h-screen flex flex-col bg-background text-foreground relative z-10">
                <PageTransitionWrapper>
                  {children}
                </PageTransitionWrapper>
                <Footer />
                <WhatsAppWidget />
              </div>
            </LenisProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

