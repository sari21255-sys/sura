import './sura.css';
import './app.css';

export const metadata = {
  title: 'سُرى للإعلام',
  description: 'شركة سعودية للإنتاج المرئي والصوتي والتغطيات الإعلامية: وثائقيات، أفلام دعائية، بث مباشر، وتصوير في كل مناطق المملكة.',
  icons: { icon: '/media/logo.png' },
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
