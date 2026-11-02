'use client';
import { useEffect } from 'react';
import TEMPLATE from '@/legacy/template';
import MEDIA from '@/legacy/media.json';
import SEED from '../../scripts/seed-data/articles.json';
import { firebaseReady } from '@/lib/firebase';
import {
  onUser, isAdmin, getSiteDoc, loadArticles, saveArticles, saveRequest,
} from '@/lib/data';

const strip = ({ updatedAt, createdAt, ...a }) => a;

/**
 * Loads content from Firebase, exposes a small bridge on window.__SURA,
 * then starts the original site script (public/sura-app.js).
 */
export default function SiteClient() {
  useEffect(() => {
    if (window.__SURA_STARTED) return;
    window.__SURA_STARTED = true;
    let fallback = false;

    async function boot() {
      let texts = {}, mediaOverrides = {}, settings = {}, articles = [];
      if (firebaseReady) {
        const [t, m, s] = await Promise.all([getSiteDoc('texts'), getSiteDoc('media'), getSiteDoc('settings')]);
        texts = t.texts || {};
        mediaOverrides = m.media || {};
        settings = s;
        try { articles = (await loadArticles(false)).map(strip); } catch { articles = []; }
      }
      if (!articles.length) {
        fallback = true;
        articles = SEED.filter((a) => a.status === 'published');
      }

      const listeners = [];
      let user = null;
      if (firebaseReady) {
        onUser(async (u) => {
          user = u;
          listeners.forEach((fn) => fn(u));
        });
      }

      window.__SURA = {
        tpl: TEMPLATE,
        media: MEDIA,
        mediaOverrides,
        texts,
        settings,
        articles,
        fb: firebaseReady ? {
          onAuth: (fn) => { listeners.push(fn); if (user) fn(user); },
          isAdmin: async () => {
            const ok = await isAdmin(user);
            if (ok && fallback) {
              // Admins see drafts too once articles live in Firestore.
              try {
                const all = (await loadArticles(true)).map(strip);
                if (all.length) { window.__SURA.articles = all; fallback = false; }
              } catch { /* keep public list */ }
            }
            return ok;
          },
          saveArticles: (prev, next) => saveArticles(fallback ? [] : prev, next),
          saveRequest,
        } : null,
      };

      const s = document.createElement('script');
      s.src = '/sura-app.js?v=2';
      s.defer = true;
      document.body.appendChild(s);
    }

    boot();
  }, []);

  return null;
}
