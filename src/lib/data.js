'use client';
import {
  collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, deleteDoc,
  addDoc, updateDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from './firebase';

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

/* ---------- images ---------- */
function extOf(type) {
  return type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp';
}

export async function uploadImage(path, file) {
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
  return getDownloadURL(r);
}

async function uploadDataUrl(folder, dataUrl) {
  const type = (/^data:([^;]+);/.exec(dataUrl) || [])[1] || 'image/webp';
  const r = ref(storage, `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${extOf(type)}`);
  await uploadString(r, dataUrl, 'data_url', { contentType: type, cacheControl: 'public,max-age=31536000' });
  return getDownloadURL(r);
}

/** Resize an image file in the browser before upload. */
export function resizeImage(file, max = 1600, q = 0.82) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) { rej(new Error('type')); return; }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? res(new File([b], 'image.webp', { type: b.type })) : rej(new Error('blob'))), 'image/webp', q);
    };
    im.src = url;
  });
}

/* ---------- articles ---------- */
export async function loadArticles(admin) {
  if (!db) return [];
  const q = admin ? collection(db, 'articles') : query(collection(db, 'articles'), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

async function uploadInlineImages(art) {
  const out = { ...art };
  if (out.cover && out.cover.startsWith('data:')) out.cover = await uploadDataUrl('articles', out.cover);
  if (out.body && out.body.includes('src="data:')) {
    const found = [...out.body.matchAll(/src="(data:image\/[^"]+)"/g)].map((m) => m[1]);
    for (const d of [...new Set(found)]) {
      const url = await uploadDataUrl('articles', d);
      out.body = out.body.split(d).join(url);
    }
  }
  return out;
}

/** Writes only what changed between the previous and next article lists. */
export async function saveArticles(prev, next) {
  const before = new Map(prev.map((a) => [a.id, JSON.stringify(a)]));
  const after = new Set(next.map((a) => a.id));
  const batch = writeBatch(db);
  for (const a of next) {
    if (before.get(a.id) === JSON.stringify(a)) continue;
    const clean = await uploadInlineImages(a);
    const { id, ...rest } = clean;
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
