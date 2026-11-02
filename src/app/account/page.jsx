'use client';
import { useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import Shell from '@/components/Shell';
import { db, fs, listCollection } from '@/lib/data';
import { STATUS } from '@/lib/services';

export default function AccountPage() {
  return (
    <Shell active="account">
      {({ user, admin }) => (user ? <Account user={user} admin={admin} /> : <Redirect />)}
    </Shell>
  );
}

function Redirect() {
  useEffect(() => { location.replace('/login?next=/account'); }, []);
  return <p className="muted">جارٍ التحويل لتسجيل الدخول…</p>;
}

function fmt(ts) {
  const d = ts && ts.toDate ? ts.toDate() : null;
  return d ? d.toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

function Account({ user, admin }) {
  const [profile, setProfile] = useState({ name: user.displayName || '', phone: '' });
  const [saved, setSaved] = useState('');
  const [bookings, setBookings] = useState(null);

  async function load() {
    try {
      setBookings(await listCollection('bookings', fs.where('uid', '==', user.uid), fs.orderBy('createdAt', 'desc')));
    } catch {
      setBookings([]);
    }
  }

  useEffect(() => {
    fs.getDoc(fs.doc(db, 'users', user.uid)).then((s) => {
      if (s.exists()) setProfile((p) => ({ name: s.data().name || p.name, phone: s.data().phone || '' }));
    }).catch(() => {});
    load();
  }, [user.uid]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaved('');
    await fs.setDoc(fs.doc(db, 'users', user.uid), { name: profile.name.trim(), phone: profile.phone.trim(), email: user.email || '' }, { merge: true });
    if (profile.name.trim() !== user.displayName) await updateProfile(user, { displayName: profile.name.trim() });
    setSaved('تم الحفظ');
  }

  async function cancel(b) {
    if (!confirm('إلغاء هذا الحجز؟')) return;
    await fs.updateDoc(fs.doc(db, 'bookings', b.id), { status: 'cancelled', updatedAt: fs.serverTimestamp() });
    load();
  }

  return (
    <>
      <div className="app-title">
        <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>my account</span>
        <h1>أهلًا {profile.name || ''}</h1>
        <p>حجوزاتك وبيانات التواصل معك.</p>
        {admin && <a className="btn dark sm" href="/admin" style={{ justifySelf: 'start' }}>لوحة التحكم</a>}
      </div>
      <div className="two-col">
        <div className="card-p">
          <div className="inline" style={{ justifyContent: 'space-between' }}>
            <h2>حجوزاتي</h2>
            <a className="btn sm dark" href="/book">حجز جديد</a>
          </div>
          {bookings === null ? <p className="muted">جارٍ التحميل…</p> : bookings.length === 0 ? (
            <div className="empty">لا توجد حجوزات بعد.</div>
          ) : (
            <div className="tw">
              <table className="mtable">
                <thead><tr><th>الخدمة</th><th>الموعد</th><th>المكان</th><th>الحالة</th><th></th></tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="t">{b.service}<div className="muted" style={{ fontWeight: 400, fontSize: '.8rem' }}>أُرسل {fmt(b.createdAt)}</div></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{b.date} {b.time}</td>
                      <td>{[b.city, b.address].filter(Boolean).join('، ')}</td>
                      <td><span className={`pill ${b.status}`}>{STATUS[b.status] || b.status}</span></td>
                      <td>{['new', 'confirmed'].includes(b.status) && <button className="btn sm danger" type="button" onClick={() => cancel(b)}>إلغاء</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <form className="pform card-p" onSubmit={saveProfile}>
          <h2>بياناتي</h2>
          <label>الاسم<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label>رقم الجوال<input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} type="tel" dir="ltr" /></label>
          <label>البريد<input value={user.email || ''} disabled dir="ltr" /></label>
          <button className="btn dark sm" type="submit" style={{ justifySelf: 'start' }}>حفظ</button>
          {saved && <p className="ok">{saved}</p>}
        </form>
      </div>
    </>
  );
}
