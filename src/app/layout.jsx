import './sura.css';
import './app.css';

const SITE_URL = 'https://sura-media.com';
const DESCRIPTION = 'سُرى للإعلام شركة سعودية للإنتاج المرئي والصوتي: أفلام وثائقية ودعائية، تغطية مؤتمرات وفعاليات وبث مباشر، تصوير فوتوغرافي وجوي، في جميع مناطق المملكة.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'سُرى للإعلام | Sura Media — إنتاج مرئي وتغطيات إعلامية',
    template: '%s | سُرى للإعلام',
  },
  description: DESCRIPTION,
  applicationName: 'سُرى للإعلام',
  keywords: [
    'سرى للإعلام', 'سُرى للإعلام', 'سرى ميديا', 'Sura Media', 'شركة إنتاج إعلامي', 'إنتاج أفلام وثائقية',
    'تغطية مؤتمرات', 'تغطية فعاليات', 'بث مباشر', 'تصوير فوتوغرافي', 'تصوير جوي', 'تصوير درون',
    'تصوير أعراس', 'شركة تصوير في السعودية', 'إنتاج فيديو', 'أكاديمية سرى',
  ],
  alternates: { canonical: '/' },
  icons: { icon: '/media/logo.png', apple: '/media/logo.png' },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: SITE_URL,
    siteName: 'سُرى للإعلام',
    title: 'سُرى للإعلام | Sura Media',
    description: DESCRIPTION,
    images: [{ url: '/og-sura.jpg', width: 1200, height: 630, alt: 'سُرى للإعلام', type: 'image/jpeg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سُرى للإعلام | Sura Media',
    description: DESCRIPTION,
    images: ['/og-sura.jpg'],
  },
  robots: { index: true, follow: true },
  // Paste the Google Search Console HTML-tag code here if you verify that way:
  // verification: { google: '...' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#04201F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
