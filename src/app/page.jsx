import TEMPLATE from '@/legacy/template';
import MEDIA from '@/legacy/media.json';
import SiteClient from '@/components/SiteClient';

// Server-render the original markup with image paths filled in, so the page
// shows instantly and is readable by search engines. The script then takes over.
function withMedia(html) {
  return html.replace(/<img([^>]*?)data-m="([^"]+)"([^>]*)>/g, (m, a, key, b) => {
    const src = MEDIA[key];
    return src ? `<img${a}data-m="${key}"${b.replace(/\s*\/$/, '')} src="${src}">` : m;
  });
}

// Structured data so Google understands who Sura is (name, logo, contact, area served).
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://sura-media.com/#org',
      name: 'سُرى للإعلام',
      alternateName: ['سرى للإعلام', 'Sura Media', 'سرى ميديا'],
      url: 'https://sura-media.com',
      logo: 'https://sura-media.com/media/logo.png',
      image: 'https://sura-media.com/og.jpg',
      description: 'شركة سعودية للإنتاج المرئي والصوتي والتغطيات الإعلامية منذ 2022.',
      foundingDate: '2022',
      email: 'sura.mediahub@gmail.com',
      telephone: '+966549342775',
      areaServed: { '@type': 'Country', name: 'المملكة العربية السعودية' },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+966549342775',
        email: 'sura.mediahub@gmail.com',
        contactType: 'customer service',
        areaServed: 'SA',
        availableLanguage: ['ar', 'en'],
      },
      knowsAbout: ['إنتاج الأفلام الوثائقية', 'الأفلام الدعائية', 'تغطية المؤتمرات', 'البث المباشر', 'التصوير الفوتوغرافي', 'التصوير الجوي'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://sura-media.com/#website',
      url: 'https://sura-media.com',
      name: 'سُرى للإعلام',
      inLanguage: 'ar',
      publisher: { '@id': 'https://sura-media.com/#org' },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <style>{`:root{--logo:url("${MEDIA.logo}")}`}</style>
      <div id="root" dir="rtl" lang="ar" dangerouslySetInnerHTML={{ __html: withMedia(TEMPLATE) }} />
      <SiteClient />
    </>
  );
}
