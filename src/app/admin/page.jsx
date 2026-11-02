'use client';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import TEXTS from '@/legacy/text-defaults.json';
import MEDIA from '@/legacy/media.json';
import TEMPLATE from '@/legacy/template';
import SEED from '../../../scripts/seed-data/articles.json';
import {
  db, fs, listCollection, getSiteDoc, saveSiteDoc, uploadImage, resizeImage, importArticles, loadArticles,
} from '@/lib/data';
import { STATUS } from '@/lib/services';

const TABS = [
  ['overview', 'نظرة عامة'],
  ['bookings', 'الحجوزات'],
  ['requests', 'رسائل التواصل'],
  ['customers', 'العملاء'],
  ['texts', 'نصوص الموقع'],
  ['images', 'صور الموقع'],
  ['articles', 'المقالات'],
  ['settings', 'الإعدادات'],
];

function fmt(ts) {
  const d = ts && ts.toDate ? ts.toDate() : null;
  return d ? d.toLocaleString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
}
const wa = (phone, text) => {
  let p = String(phone || '').replace(/\D/g, '');
  if (p.startsWith('05')) p = '966' + p.slice(1);
  return p ? `https://wa.me/${p}${text ? '?text=' + encodeURIComponent(text) : ''}` : '';
};

export default function AdminPage() {
  return (
    <Shell active="admin">
      {({ user, admin }) => (!user ? <Redirect /> : !admin ? <NotAdmin user={user} /> : <Dashboard />)}
    </Shell>
  );
}

function Redirect() {
  useEffect(() => { location.replace('/login?next=/admin'); }, []);
  return <p className="muted">جارٍ التحويل لتسجيل الدخول…</p>;
}

function NotAdmin({ user }) {
  return (
    <div className="auth-box">
      <h1>هذه الصفحة للمشرفين</h1>
      <p className="muted">لتفعيل صلاحية المشرف لهذا الحساب، افتح Firebase Console ← Firestore، وأنشئ مجموعة اسمها <b>admins</b>، وأضف مستندًا معرّفه:</p>
      <code dir="ltr" style={{ background: 'var(--paper-2)', padding: '10px', border: '1px solid var(--line)', wordBreak: 'break-all' }}>{user.uid}</code>
      <p className="muted">ثم حدّث هذه الصفحة.</p>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const [b, r, c] = await Promise.all([
      listCollection('bookings', fs.orderBy('createdAt', 'desc')).catch(() => []),
      listCollection('requests', fs.orderBy('createdAt', 'desc')).catch(() => []),
      listCollection('users').catch(() => []),
    ]);
    setBookings(b); setRequests(r); setCustomers(c); setLoaded(true);
  }

  useEffect(() => {
    const h = location.hash.slice(1);
    if (TABS.some(([k]) => k === h)) setTab(h);
    refresh();
  }, []);

  const go = (k) => { setTab(k); history.replaceState(null, '', '#' + k); scrollTo({ top: 0 }); };
  const counts = {
    bookings: bookings.filter((b) => b.status === 'new').length,
    requests: requests.filter((r) => r.status === 'new').length,
  };

  return (
    <>
      <div className="app-title">
        <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>dashboard</span>
        <h1>لوحة تحكم سُرى</h1>
      </div>
      <div className="dash">
        <nav className="dash-nav" aria-label="أقسام لوحة التحكم">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => go(k)}>
              {label}{counts[k] ? <b>{counts[k]}</b> : null}
            </button>
          ))}
        </nav>
        <div style={{ minWidth: 0 }}>
          {!loaded && tab !== 'texts' && tab !== 'images' && tab !== 'settings' ? <p className="muted">جارٍ التحميل…</p> : (
            <>
              {tab === 'overview' && <Overview bookings={bookings} requests={requests} customers={customers} go={go} />}
              {tab === 'bookings' && <Bookings list={bookings} refresh={refresh} />}
              {tab === 'requests' && <Requests list={requests} refresh={refresh} />}
              {tab === 'customers' && <Customers list={customers} bookings={bookings} />}
            </>
          )}
          {tab === 'texts' && <Texts />}
          {tab === 'images' && <Images />}
          {tab === 'articles' && <Articles />}
          {tab === 'settings' && <Settings />}
        </div>
      </div>
    </>
  );
}

/* ---------------- overview ---------------- */
function Overview({ bookings, requests, customers, go }) {
  const upcoming = bookings
    .filter((b) => ['new', 'confirmed'].includes(b.status) && b.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6);
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="kpis">
        <button type="button" className="kpi" onClick={() => go('bookings')}><b>{bookings.filter((b) => b.status === 'new').length}</b><span>حجوزات جديدة</span></button>
        <button type="button" className="kpi" onClick={() => go('bookings')}><b>{bookings.filter((b) => b.status === 'confirmed').length}</b><span>حجوزات مؤكدة</span></button>
        <button type="button" className="kpi" onClick={() => go('requests')}><b>{requests.filter((r) => r.status === 'new').length}</b><span>رسائل جديدة</span></button>
        <button type="button" className="kpi" onClick={() => go('customers')}><b>{customers.length}</b><span>عميل مسجّل</span></button>
      </div>
      <div className="card-p">
        <h2>المواعيد القادمة</h2>
        {upcoming.length === 0 ? <p className="muted">لا توجد مواعيد قادمة.</p> : (
          <div className="tw"><table className="mtable"><tbody>
            {upcoming.map((b) => (
              <tr key={b.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{b.date} {b.time}</td>
                <td className="t">{b.service}</td>
                <td>{b.name}</td>
                <td>{b.city}</td>
                <td><span className={`pill ${b.status}`}>{STATUS[b.status]}</span></td>
              </tr>
            ))}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}

/* ---------------- bookings ---------------- */
function Bookings({ list, refresh }) {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? list : list.filter((b) => b.status === filter);

  async function setStatus(b, status) {
    await fs.updateDoc(fs.doc(db, 'bookings', b.id), { status, updatedAt: fs.serverTimestamp() });
    refresh();
  }
  async function remove(b) {
    if (!confirm('حذف الحجز نهائيًا؟')) return;
    await fs.deleteDoc(fs.doc(db, 'bookings', b.id));
    refresh();
  }

  return (
    <div className="card-p">
      <div className="filters" style={{ marginBottom: 0 }}>
        {[['all', 'الكل'], ...Object.entries(STATUS)].map(([k, l]) => (
          <button key={k} type="button" className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {shown.length === 0 ? <div className="empty">لا توجد حجوزات.</div> : shown.map((b) => (
        <article key={b.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 8 }}>
          <div className="inline" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{b.service} · {b.name}</h3>
              <p className="muted">{b.date} {b.time} · {[b.city, b.address].filter(Boolean).join('، ')} · أُرسل {fmt(b.createdAt)}</p>
            </div>
            <select value={b.status} onChange={(e) => setStatus(b, e.target.value)} aria-label="حالة الحجز"
              style={{ border: '1px solid var(--line)', background: '#fff', padding: '6px 10px', color: 'var(--ink)' }}>
              {Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          {b.notes && <p style={{ whiteSpace: 'pre-wrap' }}>{b.notes}</p>}
          {b.attachments && b.attachments.length > 0 && (
            <div className="thumbs">{b.attachments.map((u) => <a key={u} href={u} target="_blank" rel="noopener"><img src={u} alt="" /></a>)}</div>
          )}
          <div className="inline">
            {b.phone && <a className="btn sm" href={wa(b.phone, `مرحبًا ${b.name}، بخصوص حجز ${b.service} في سُرى`)} target="_blank" rel="noopener">واتساب</a>}
            {b.phone && <a className="btn sm" href={`tel:${b.phone}`}>اتصال</a>}
            {b.email && <a className="btn sm" href={`mailto:${b.email}`}>بريد</a>}
            {b.location && b.location.lat && <a className="btn sm" href={`https://maps.google.com/?q=${b.location.lat},${b.location.lng}`} target="_blank" rel="noopener">الموقع على الخريطة</a>}
            <button className="btn sm danger" type="button" onClick={() => remove(b)}>حذف</button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------------- requests ---------------- */
function Requests({ list, refresh }) {
  async function mark(r, status) {
    await fs.updateDoc(fs.doc(db, 'requests', r.id), { status });
    refresh();
  }
  async function remove(r) {
    if (!confirm('حذف الرسالة؟')) return;
    await fs.deleteDoc(fs.doc(db, 'requests', r.id));
    refresh();
  }
  return (
    <div className="card-p">
      <h2>رسائل نموذج التواصل</h2>
      {list.length === 0 ? <div className="empty">لا توجد رسائل.</div> : list.map((r) => (
        <article key={r.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 6 }}>
          <div className="inline" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem' }}>{r.name}{r.org ? ` · ${r.org}` : ''}</h3>
            <span className={`pill ${r.status === 'new' ? 'new' : 'done'}`}>{r.status === 'new' ? 'جديدة' : 'تمت المتابعة'}</span>
          </div>
          <p className="muted">{[r.service, r.role, fmt(r.createdAt)].filter(Boolean).join(' · ')}</p>
          {r.message && <p style={{ whiteSpace: 'pre-wrap' }}>{r.message}</p>}
          <div className="inline">
            {r.phone && <a className="btn sm" href={wa(r.phone)} target="_blank" rel="noopener">واتساب</a>}
            {r.email && <a className="btn sm" href={`mailto:${r.email}`}>بريد</a>}
            {r.status === 'new'
              ? <button className="btn sm dark" type="button" onClick={() => mark(r, 'handled')}>تمت المتابعة</button>
              : <button className="btn sm" type="button" onClick={() => mark(r, 'new')}>إرجاعها جديدة</button>}
            <button className="btn sm danger" type="button" onClick={() => remove(r)}>حذف</button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------------- customers ---------------- */
function Customers({ list, bookings }) {
  const count = (uid) => bookings.filter((b) => b.uid === uid).length;
  return (
    <div className="card-p">
      <h2>العملاء المسجّلون</h2>
      {list.length === 0 ? <div className="empty">لا يوجد عملاء بعد.</div> : (
        <div className="tw"><table className="mtable">
          <thead><tr><th>الاسم</th><th>الجوال</th><th>البريد</th><th>الحجوزات</th><th>التسجيل</th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id}>
              <td className="t">{c.name || '—'}</td>
              <td dir="ltr" style={{ textAlign: 'end' }}>{c.phone ? <a href={wa(c.phone)} target="_blank" rel="noopener">{c.phone}</a> : '—'}</td>
              <td dir="ltr" style={{ textAlign: 'end' }}>{c.email}</td>
              <td>{count(c.id)}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmt(c.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

/* ---------------- texts ---------------- */
const plain = (html) => html.replace(/<br\s*\/?>/gi, '\n').replace(/\s+\n/g, '\n');
const toHtml = (text) => text.replace(/\n/g, '<br>');

function Texts() {
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState({});
  const [sec, setSec] = useState(TEXTS[0].sec);
  const [msg, setMsg] = useState('');
  const sections = useMemo(() => [...new Map(TEXTS.map((t) => [t.sec, t.secName])).entries()], []);

  useEffect(() => { getSiteDoc('texts').then((d) => { setSaved(d.texts || {}); setDraft(d.texts || {}); }); }, []);
  if (!saved) return <p className="muted">جارٍ التحميل…</p>;

  const current = (t) => (draft[t.k] != null ? draft[t.k] : t.html);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);

  async function save() {
    setMsg('');
    const clean = {};
    for (const t of TEXTS) {
      const v = draft[t.k];
      if (v != null && v.trim() && v !== t.html) clean[t.k] = v;
    }
    await saveSiteDoc('texts', { texts: clean });
    setSaved(clean); setDraft(clean); setMsg('حُفظت النصوص وظهرت على الموقع.');
  }

  return (
    <div className="card-p">
      <h2>نصوص الموقع</h2>
      <p className="muted">عدّل أي نص في الصفحة الرئيسية. سطر جديد يصير فاصل سطر، ويمكن استخدام &lt;em&gt; لتلوين كلمة بالذهبي في العنوان الرئيسي.</p>
      <div className="filters" style={{ marginBottom: 0 }}>
        {sections.map(([k, l]) => <button key={k} type="button" className={sec === k ? 'on' : ''} onClick={() => setSec(k)}>{l}</button>)}
      </div>
      <div className="text-grid pform">
        {TEXTS.filter((t) => t.sec === sec).map((t) => {
          const v = current(t);
          const changed = v !== t.html;
          return (
            <label key={t.k} className={`text-item${changed ? ' changed' : ''}`}>
              <small><span>{t.tag.toUpperCase()}</span>{changed && <button type="button" className="more" onClick={(e) => { e.preventDefault(); const d = { ...draft }; delete d[t.k]; setDraft(d); }}>استرجاع الأصل</button>}</small>
              <textarea rows={Math.min(8, Math.max(1, Math.ceil(plain(v).length / 70)))} value={plain(v)}
                onChange={(e) => setDraft({ ...draft, [t.k]: toHtml(e.target.value) })} style={{ minHeight: 0 }} />
            </label>
          );
        })}
      </div>
      <div className="sticky-save">
        <button className="btn dark" type="button" disabled={!dirty} onClick={save}>حفظ النصوص</button>
        {msg && <span className="ok">{msg}</span>}
        <a className="more" href="/" target="_blank" rel="noopener">معاينة الموقع</a>
      </div>
    </div>
  );
}

/* ---------------- images ---------------- */
function Images() {
  const [over, setOver] = useState(null);
  const [busy, setBusy] = useState('');
  const [group, setGroup] = useState('p');

  useEffect(() => { getSiteDoc('media').then((d) => setOver(d.media || {})); }, []);
  if (!over) return <p className="muted">جارٍ التحميل…</p>;

  const groups = [['p', 'صور الأعمال والواجهة'], ['s', 'صور الخدمات والأكاديمية'], ['h', 'صور الواجهة المتحركة'], ['logo', 'الشعار وشعارات الشركاء']];
  const keys = Object.keys(MEDIA).filter((k) => (group === 'logo' ? k.startsWith('logo') : k[0] === group && /^\w\d+$/.test(k)));

  async function replace(k, file) {
    if (!file) return;
    setBusy(k);
    try {
      const small = k.startsWith('logo') ? file : await resizeImage(file, 2000, 0.84);
      const ext = small.type === 'image/png' ? 'png' : small.type === 'image/svg+xml' ? 'svg' : 'webp';
      const url = await uploadImage(`site/media/${k}-${Date.now().toString(36)}.${ext}`, small);
      const next = { ...over, [k]: url };
      await saveSiteDoc('media', { media: next });
      setOver(next);
    } catch {
      alert('تعذّر رفع الصورة.');
    }
    setBusy('');
  }
  async function reset(k) {
    const next = { ...over }; delete next[k];
    await saveSiteDoc('media', { media: next });
    setOver(next);
  }

  return (
    <div className="card-p">
      <h2>صور الموقع</h2>
      <p className="muted">استبدل أي صورة وتتغير في كل مكان تظهر فيه على الموقع.</p>
      <div className="filters" style={{ marginBottom: 0 }}>
        {groups.map(([k, l]) => <button key={k} type="button" className={group === k ? 'on' : ''} onClick={() => setGroup(k)}>{l}</button>)}
      </div>
      <div className="img-grid">
        {keys.map((k) => (
          <div key={k} className={`img-cell${over[k] ? ' over' : ''}`}>
            <img src={over[k] || MEDIA[k]} alt="" loading="lazy" style={k.startsWith('logo') ? { objectFit: 'contain', padding: 12, background: k === 'logo' ? 'var(--night)' : '#fff' } : undefined} />
            <div>
              <span dir="ltr">{k}</span>
              {busy === k ? <span>جارٍ الرفع…</span> : (
                <span className="inline" style={{ gap: 8 }}>
                  {over[k] && <button type="button" className="more" onClick={() => reset(k)}>الأصل</button>}
                  <label>استبدال<input type="file" accept="image/*" hidden onChange={(e) => replace(k, e.target.files[0])} /></label>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- articles ---------------- */
function Articles() {
  const [count, setCount] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { loadArticles(true).then((a) => setCount(a.length)).catch(() => setCount(0)); }, []);

  async function doImport() {
    const list = SEED.map((a) => (a.title.replace(/ا/g, '').trim() === '' ? { ...a, status: 'draft' } : a));
    await importArticles(list);
    setCount(list.length);
    setMsg(`نُقلت ${list.length} مقالة إلى قاعدة البيانات.`);
  }

  return (
    <div className="card-p">
      <h2>مقالات الأكاديمية</h2>
      <p className="muted">كتابة المقالات وتعديلها وتثبيتها تتم من داخل الموقع نفسه بعد تسجيل دخولك كمشرف، من صفحة «إدارة المقالات».</p>
      <div className="inline">
        <a className="btn dark" href="/#manage">إدارة المقالات</a>
        <a className="btn" href="/#write">اكتب مقالًا جديدًا</a>
      </div>
      {count === 0 && (
        <div className="note">
          <b>المقالات الأصلية لم تُنقل بعد</b>
          الموقع يعرض حاليًا المقالات المضمّنة في الكود. انقلها إلى قاعدة البيانات لتصير قابلة للتعديل.
          <div style={{ marginTop: 10 }}><button className="btn dark sm" type="button" onClick={doImport}>نقل {SEED.length} مقالة</button></div>
        </div>
      )}
      {count > 0 && <p className="muted">في قاعدة البيانات {count} مقالة.</p>}
      {msg && <p className="ok">{msg}</p>}
    </div>
  );
}

/* ---------------- settings ---------------- */
const FILMS = [...TEMPLATE.matchAll(/data-key="([^"]+)"[\s\S]*?<h4[^>]*>([^<]+)<\/h4>/g)].map((m) => [m[1], m[2]]);

function Settings() {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { getSiteDoc('settings').then((d) => setS({ whatsapp: '966549342775', notifyEmail: '', videoLinks: {}, ...d })); }, []);
  if (!s) return <p className="muted">جارٍ التحميل…</p>;

  async function save(e) {
    e.preventDefault();
    const { updatedAt, ...rest } = s;
    await saveSiteDoc('settings', rest);
    setMsg('حُفظت الإعدادات.');
  }

  return (
    <form className="pform card-p" onSubmit={save}>
      <h2>الإعدادات</h2>
      <div className="row2">
        <label>رقم واتساب لاستقبال الرسائل (بالصيغة الدولية)<input dir="ltr" value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} /></label>
        <label>بريد تنبيهات الحجوزات والرسائل<input dir="ltr" type="email" value={s.notifyEmail} onChange={(e) => setS({ ...s, notifyEmail: e.target.value })} /></label>
      </div>
      <h2 style={{ marginTop: 10 }}>روابط الأفلام</h2>
      <p className="muted">ضع رابط يوتيوب أو فيميو لكل فيلم، فيفتح عند الضغط عليه في الموقع.</p>
      <div className="row2">
        {FILMS.map(([k, title]) => (
          <label key={k}>{title}<input dir="ltr" placeholder="https://" value={(s.videoLinks || {})[k] || ''}
            onChange={(e) => setS({ ...s, videoLinks: { ...(s.videoLinks || {}), [k]: e.target.value.trim() } })} /></label>
        ))}
      </div>
      <div className="sticky-save">
        <button className="btn dark" type="submit">حفظ الإعدادات</button>
        {msg && <span className="ok">{msg}</span>}
      </div>
    </form>
  );
}
