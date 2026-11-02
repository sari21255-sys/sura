/**
 * Firebase App Hosting injects FIREBASE_WEBAPP_CONFIG at build time.
 * We copy it into NEXT_PUBLIC_* variables so the browser SDK can read it.
 * Values already set (apphosting.yaml or .env.local) take priority.
 */
let webapp = {};
try {
  webapp = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || '{}');
} catch {
  webapp = {};
}

const pick = (name, key) => process.env[name] || webapp[key] || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: pick('NEXT_PUBLIC_FIREBASE_API_KEY', 'apiKey'),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: pick('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'authDomain'),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: pick('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'projectId'),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: pick('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'storageBucket'),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: pick('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'),
    NEXT_PUBLIC_FIREBASE_APP_ID: pick('NEXT_PUBLIC_FIREBASE_APP_ID', 'appId'),
  },
};

export default nextConfig;
