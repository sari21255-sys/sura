'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { db, fs, uploadImage, resizeImage } from '@/lib/data';
import { SERVICES } from '@/lib/services';


export default function BookPage() {
  return (
    <Shell active="book">
      {({ user }) => (user ? <BookForm user={user} /> : <NeedLogin />)}
    </Shell>
  );
}

function NeedLogin() {
  return (
    <div className="auth-box" style={{ textAlign: 'center' }}>
      <h1>احجز موعدًا</h1>
      <p className="muted">سجّل الدخول أو أنشئ حسابًا لتحجز وتتابع حالة حجزك.</p>
      <a className="btn dark" href="/login?next=/book">تسجيل الدخول</a>
    </div>
  );
}

function BookForm({ user }) {
  const [f, setF] = useState({
    name: user.displayName || '', phone: '', service: SERVICES[0], date: '', time: '',
    city: '', address: '', notes: '',
  });
  const [loc, setLoc] = useState(null);
  const [locMsg, setLocMsg] = useState('');
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const camRef = useRef(null);
  const picRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const svc = new URLSearchParams(location.search).get('service');
    if (svc && SERVICES.includes(svc)) setF((p) => ({ ...p, service: svc }));
    fs.getDoc(fs.doc(db, 'users', user.uid)).then((s) => {
      if (s.exists()) setF((p) => ({ ...p, name: p.name || s.data().name || '', phone: p.phone || s.data().phone || '' }));
    }).catch(() => {});
  }, [user.uid]);

  function locate() {
    if (!('geolocation' in navigator)) { setLocMsg('المتصفح لا يدعم تحديد الموقع.'); return; }
    setLocMsg('جارٍ تحديد موقعك…');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoc({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6), accuracy: Math.round(p.coords.accuracy) });
        setLocMsg('');
      },
      (e) => setLocMsg(e.code === 1 ? 'رفضت مشاركة الموقع. فعّلها من إعدادات المتصفح أو اكتب العنوان يدويًا.' : 'تعذّر تحديد الموقع. اكتب العنوان يدويًا.'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function addFiles(e) {
    const picked = [...e.target.files].filter((x) => x.type.startsWith('image/'));
    e.target.value = '';
    setFiles((prev) => [...prev, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, 6));
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!f.name.trim() || !f.phone.trim()) { setErr('الاسم ورقم الجوال مطلوبان.'); return; }
    if (!f.date) { setErr('اختر تاريخ الموعد.'); return; }
    setBusy(true);
    try {
      const attachments = [];
      for (const { file } of files) {
        const small = await resizeImage(file, 1800, 0.82);
        attachments.push(await uploadImage(`bookings/${user.uid}/${Date.now().toString(36)}-${attachments.length}.webp`, small));
      }
      await fs.addDoc(fs.collection(db, 'bookings'), {
        uid: user.uid,
        email: user.email || '',
        name: f.name.trim().slice(0, 120),
        phone: f.phone.trim().slice(0, 40),
        service: f.service,
        date: f.date,
        time: f.time,
        city: f.city.trim().slice(0, 80),
        address: f.address.trim().slice(0, 300),
        notes: f.notes.trim().slice(0, 4000),
        location: loc,
        attachments,
        status: 'new',
        createdAt: fs.serverTimestamp(),
      });
      await fs.setDoc(fs.doc(db, 'users', user.uid), { name: f.name.trim(), phone: f.phone.trim(), email: user.email || '' }, { merge: true });
      setDone(true);
    } catch (x) {
      setErr('تعذّر إرسال الحجز. تحقق من الاتصال وحاول مرة أخرى.');
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth-box">
        <h1>وصلنا حجزك</h1>
        <p className="muted">نراجع التفاصيل ونتواصل معك لتأكيد الموعد. تقدر تتابع حالة الحجز من حسابك.</p>
        <div className="inline"><a className="btn dark" href="/account">حجوزاتي</a><a className="btn" href="/">العودة للموقع</a></div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="app-title">
        <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>booking</span>
        <h1>احجز موعدًا</h1>
        <p>اختر الخدمة والموعد والمكان، وأرفق صورًا للموقع إن وجدت. نرجع لك بالتأكيد وعرض السعر.</p>
      </div>
      <form className="pform two-col" onSubmit={submit} noValidate>
        <div className="card-p">
          <div className="row2">
            <label>الاسم<input value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <label>رقم الجوال<input value={f.phone} onChange={set('phone')} type="tel" dir="ltr" autoComplete="tel" /></label>
          </div>
          <label>الخدمة
            <select value={f.service} onChange={set('service')}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <div className="row2">
            <label>التاريخ<input type="date" min={today} value={f.date} onChange={set('date')} /></label>
            <label>الوقت<input type="time" value={f.time} onChange={set('time')} /></label>
          </div>
          <div className="row2">
            <label>المدينة<input value={f.city} onChange={set('city')} /></label>
            <label>العنوان أو اسم المكان<input value={f.address} onChange={set('address')} /></label>
          </div>
          <label>تفاصيل المشروع<textarea value={f.notes} onChange={set('notes')} placeholder="نوع الفعالية، عدد الأيام، التسليمات المطلوبة…" /></label>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card-p">
            <h2>موقع التصوير</h2>
            <p className="muted">شارك موقعك الحالي إذا كنت في مكان التصوير.</p>
            <button className="btn sm" type="button" onClick={locate}>استخدم موقعي الحالي</button>
            {locMsg && <p className="muted">{locMsg}</p>}
            {loc && (
              <div className="loc">
                <span>تم تحديد الموقع بدقة تقارب {loc.accuracy} م</span>
                <a className="more" href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`} target="_blank" rel="noopener">عرض على الخريطة</a>
                <button type="button" className="more" style={{ justifySelf: 'start' }} onClick={() => setLoc(null)}>إزالة</button>
              </div>
            )}
          </div>

          <div className="card-p">
            <h2>صور المكان</h2>
            <p className="muted">حتى ٦ صور، تساعدنا على تجهيز الإضاءة والمعدات.</p>
            <div className="inline">
              <button className="btn sm" type="button" onClick={() => camRef.current.click()}>التقط صورة</button>
              <button className="btn sm" type="button" onClick={() => picRef.current.click()}>اختر من الجهاز</button>
            </div>
            <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={addFiles} />
            <input ref={picRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
            {files.length > 0 && (
              <div className="thumbs">
                {files.map((x, i) => (
                  <button type="button" key={x.url} title="إزالة" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <img src={x.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {err && <p className="err">{err}</p>}
          <button className="btn dark" type="submit" disabled={busy}>{busy ? 'جارٍ الإرسال…' : 'إرسال الحجز'}</button>
        </div>
      </form>
    </>
  );
}
