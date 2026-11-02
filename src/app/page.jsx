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

export default function Home() {
  return (
    <>
      <style>{`:root{--logo:url("${MEDIA.logo}")}`}</style>
      <div id="root" dir="rtl" lang="ar" dangerouslySetInnerHTML={{ __html: withMedia(TEMPLATE) }} />
      <SiteClient />
    </>
  );
}
