'use client';
import {
  collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, deleteDoc,
  addDoc, updateDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';

/* ---------- auth ---------- */
export function onUser(cb) {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, cb);
}

export async function isAdmin(user = auth && auth.currentUser) {
  if (!db || !user) return false;
  try {
    const s = await getDoc(doc(db, 'admins', user.uid));
    return s.exists();
  } catch {
    return false;
  }
}

/* ---------- site content ---------- */
export async function getSiteDoc(name) {
  if (!db) return {};
  try {
    const s = await getDoc(doc(db, 'site', name));
    return s.exists() ? s.data() : {};
  } catch {
    return {};
  }
}

export function saveSiteDoc(name, data) {
  return setDoc(doc(db, 'site', name), { ...data, updatedAt: serverTimestamp() });
}

/* ---------- images ----------
   On the free plan there is no Cloud Storage, so images are compressed in the
   browser and saved as data URLs inside Firestore documents (1 MB per doc). */
export const MAX_IMAGE_BYTES = 700 * 1024;

/** Resize an image file and return a compressed data URL (WebP, JPEG fallback). */
export function imageToDataUrl(file, max = 1600, q = 0.8, limit = MAX_IMAGE_BYTES) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) { rej(new Error('type')); return; }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
    im.onload = () => {
      URL.revokeObjectURL(url);
      let size = max, quality = q, out = '';
      for (let i = 0; i < 6; i++) {
        const s = Math.min(1, size / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        const x = c.getContext('2d');
        if (file.type !== 'image/png') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
        x.drawImage(im, 0, 0, c.width, c.height);
        out = c.toDataURL('image/webp', quality);
        if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', quality);
        if (out.length * 0.75 <= limit) break;
        size = Math.round(size * 0.8); quality = Math.max(0.5, quality - 0.08);
      }
      out.length * 0.75 <= limit ? res(out) : rej(new Error('too-large'));
    };
    im.src = url;
  });
}

/** Approximate stored size of an object in bytes. */
export const docBytes = (o) => new Blob([JSON.stringify(o)]).size;

/* ---------- site images (one doc per image) ---------- */
export async function loadSiteMedia() {
  if (!db) return {};
  try {
    const snap = await getDocs(collection(db, 'siteMedia'));
    const out = {};
    snap.docs.forEach((d) => { if (d.data().url) out[d.id] = d.data().url; });
    return out;
  } catch {
    return {};
  }
}
export const saveSiteMedia = (key, url) => setDoc(doc(db, 'siteMedia', key), { url, updatedAt: serverTimestamp() });
export const removeSiteMedia = (key) => deleteDoc(doc(db, 'siteMedia', key));

/* ---------- articles ---------- */
export async function loadArticles(admin) {
  if (!db) return [];
  const q = admin ? collection(db, 'articles') : query(collection(db, 'articles'), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

/** Writes only what changed between the previous and next article lists. */
export async function saveArticles(prev, next) {
  const before = new Map(prev.map((a) => [a.id, JSON.stringify(a)]));
  const after = new Set(next.map((a) => a.id));
  const batch = writeBatch(db);
  for (const a of next) {
    if (before.get(a.id) === JSON.stringify(a)) continue;
    const { id, ...rest } = a;
    if (docBytes(rest) > 950 * 1024) {
      const e = new Error('too-large'); e.code = 'too-large'; throw e;
    }
    batch.set(doc(db, 'articles', id), { ...rest, updatedAt: serverTimestamp() });
  }
  for (const a of prev) if (!after.has(a.id)) batch.delete(doc(db, 'articles', a.id));
  await batch.commit();
}

export async function importArticles(list) {
  const batch = writeBatch(db);
  for (const { id, ...rest } of list) batch.set(doc(db, 'articles', id), rest);
  await batch.commit();
}

/* ---------- requests & bookings ---------- */
export function saveRequest(r) {
  return addDoc(collection(db, 'requests'), {
    name: String(r.name || '').slice(0, 120),
    phone: String(r.phone || '').slice(0, 40),
    email: String(r.email || '').slice(0, 120),
    role: String(r.role || '').slice(0, 120),
    org: String(r.org || '').slice(0, 160),
    service: String(r.service || '').slice(0, 120),
    message: String(r.message || '').slice(0, 4000),
    status: 'new',
    createdAt: serverTimestamp(),
  });
}

export async function listCollection(name, ...constraints) {
  const snap = await getDocs(query(collection(db, name), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const fs = { doc, collection, query, where, orderBy, getDoc, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp };
export { db, auth };
