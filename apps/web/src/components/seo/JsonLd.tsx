import React from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceItem {
  title: string;
  description: string;
  pricing?: string;
  slug?: string;
}

interface JsonLdProps {
  faqs?: FaqItem[];
  services?: ServiceItem[];
}

export function JsonLd({ faqs = [], services = [] }: JsonLdProps) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://shivaste.com/#website',
    url: 'https://shivaste.com',
    name: 'MP Production',
    description:
      'Mumbai-based cinematic production house for brand films, TVCs, product launch videos, fashion lookbooks and talent casting.',
    publisher: {
      '@id': 'https://shivaste.com/#organization',
    },
    inLanguage: 'en-IN',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://shivaste.com/#organization',
    name: 'MP Production',
    legalName: 'MP Production',
    url: 'https://shivaste.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://shivaste.com/logo.webp',
      caption: 'MP Production',
    },
    sameAs: [
      'https://instagram.com/mpproduction',
      'https://youtube.com/channel/UCm5WLm1415H0447EZMXCbQw',
      'https://linkedin.com/company/mpproduction', // TODO: Verify official LinkedIn URL
      'https://facebook.com/mpproduction', // TODO: Verify official Facebook URL
      'https://x.com/mpproduction', // TODO: Verify official X URL
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-831-053-1309',
      contactType: 'customer service',
      email: 'hello@mpproduction.com',
      areaServed: ['IN', 'AE', 'US', 'GB', 'EU'],
      availableLanguage: ['English', 'Hindi'],
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://shivaste.com/#localbusiness',
    name: 'MP Production',
    image: 'https://shivaste.com/assets/cinematic-16-9.webp',
    url: 'https://shivaste.com',
    telephone: '+91-831-053-1309',
    email: 'hello@mpproduction.com',
    priceRange: '₹₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mumbai Studio District', // TODO: Fill exact street address when provided
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400053', // TODO: Fill exact postal code when provided
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.1363, // Mumbai Studio District (Andheri West)
      longitude: 72.8277,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } : null;

  const servicesSchema = services && services.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, idx) => ({
      '@type': 'Service',
      position: idx + 1,
      name: s.title,
      description: s.description,
      provider: {
        '@id': 'https://shivaste.com/#organization',
      },
      url: `https://shivaste.com/services#${s.slug || idx}`,
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {servicesSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
        />
      )}
    </>
  );
}
export default JsonLd;
