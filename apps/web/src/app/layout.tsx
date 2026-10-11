import type { Metadata } from 'next';
import { Outfit, Cormorant_Garamond } from 'next/font/google';
import './tw-animate.css';
import './globals.css';
import { Footer } from '@/components/ui/Footer';


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

export const metadata: Metadata = {
  title: 'MP Productions | Cinematic Media & Digital Management',
  description:
    'Enterprise-grade Media & Digital Management System combining a premium cinematic public website, talent marketplace, client portal, and editor workspace.',
  openGraph: {
    title: 'MP Productions',
    description: 'Enterprise Media & Digital Management System',
    url: 'https://mpproductions.com',
    siteName: 'MP Productions',
    locale: 'en_US',
    type: 'website',
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
    <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-[#eb3d26] selection:text-white" suppressHydrationWarning>
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

