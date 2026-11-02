/**
 * Static export: `npm run build` writes the whole site to ./out,
 * which Firebase Hosting serves on the free Spark plan.
 * All data (accounts, bookings, texts, images) is read from Firestore in the browser.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
