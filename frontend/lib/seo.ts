import { Metadata } from 'next';

export const siteConfig = {
  name: 'ConectarPro',
  fullName: 'ConectarPro - Conecta con Profesionales de Élite',
  description:
    'Plataforma líder para conectar profesionales verificados con clientes. Encuentra expertos en desarrollo, diseño, marketing y más. Pago seguro y garantizado.',
  url: 'https://conectarprofesionales.com', // Cambiar por tu dominio real
  ogImage: 'https://conectarprofesionales.com/og-image.jpg',
  twitterHandle: '@conectarpro',
  keywords: [
    'profesionales freelance',
    'contratar profesionales',
    'servicios profesionales',
    'freelancers',
    'trabajo remoto',
    'marketplace profesionales',
    'desarrollo web',
    'diseño gráfico',
    'marketing digital',
    'programadores',
    'diseñadores',
    'consultores',
    'servicios online',
    'plataforma freelance',
    'trabajos independientes',
  ],
  authors: [
    {
      name: 'ConectarPro',
      url: 'https://conectarprofesionales.com',
    },
  ],
  creator: 'ConectarPro',
  publisher: 'ConectarPro',
  locale: 'es_AR',
  alternateLocales: ['es_ES', 'es_MX', 'es_CL', 'es_CO'],
};

export function generateSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors,
  section,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}): Metadata {
  const metaTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.fullName;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const metaKeywords = keywords
    ? [...siteConfig.keywords, ...keywords]
    : siteConfig.keywords;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: authors
      ? authors.map((author) => ({ name: author }))
      : siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: metaUrl,
      languages: {
        'es-AR': metaUrl,
        'es-ES': metaUrl,
        'es-MX': metaUrl,
        'es-CL': metaUrl,
        'es-CO': metaUrl,
      },
    },
    openGraph: {
      type,
      locale: siteConfig.locale,
      alternateLocale: siteConfig.alternateLocales,
      url: metaUrl,
      siteName: siteConfig.name,
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: authors || [siteConfig.creator],
        section,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'google-site-verification-code', // Agregar tu código de Google Search Console
      yandex: 'yandex-verification-code', // Opcional
    },
  };
}

// Funciones helper para JSON-LD (Structured Data)
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: [
      'https://twitter.com/conectarpro',
      'https://facebook.com/conectarpro',
      'https://linkedin.com/company/conectarpro',
      'https://instagram.com/conectarpro',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/browse?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Professional Marketplace',
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Argentina',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios Profesionales',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Desarrollo Web',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Diseño Gráfico',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Marketing Digital',
          },
        },
      ],
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
}: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };
}
