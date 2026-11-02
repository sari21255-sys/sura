'use client';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import MEDIA from '@/legacy/media.json';
import { firebaseReady } from '@/lib/firebase';
import { auth, onUser, isAdmin } from '@/lib/data';

/** Header + page frame for app pages. Passes the signed-in user down. */
export default function Shell({ active, children }) {
  const [user, setUser] = useState(undefined);
  const [admin, setAdmin] = useState(false);

  useEffect(() => onUser(async (u) => {
    const a = u ? await isAdmin(u) : false;
    setAdmin(a);
    setUser(u || null);
  }), []);

  const link = (href, label, key) => <a href={href} className={active === key ? 'on' : ''}>{label}</a>;

  return (
    <div className="app">
      <style>{`:root{--logo:url("${MEDIA.logo}")}`}</style>
      <header className="app-hdr">
        <div className="wrap">
          <a href="/" aria-label="سُرى للإعلام — الرئيسية"><span className="logo" role="img" aria-label="شعار سُرى" /></a>
          <nav aria-label="روابط الحساب">
            {link('/', 'الموقع', 'home')}
            {link('/book', 'احجز موعدًا', 'book')}
            {user ? link('/account', 'حسابي', 'account') : link('/login', 'تسجيل الدخول', 'login')}
            {admin && link('/admin', 'لوحة التحكم', 'admin')}
            {user && <button type="button" onClick={() => signOut(auth).then(() => { location.href = '/'; })}>خروج</button>}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <div className="wrap">
          {!firebaseReady ? (
            <div className="card-p"><h2>Firebase غير مربوط بعد</h2><p className="muted">بعد ربط المشروع بـ Firebase App Hosting تعمل هذه الصفحة تلقائيًا.</p></div>
          ) : user === undefined ? (
            <p className="muted">جارٍ التحميل…</p>
          ) : (
            typeof children === 'function' ? children({ user, admin }) : children
          )}
        </div>
      </main>
      <footer className="app-foot"><div className="wrap">© {new Date().getFullYear()} سُرى للإعلام · Sura Media</div></footer>
    </div>
  );
}
