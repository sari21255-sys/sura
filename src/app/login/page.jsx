'use client';
import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail,
} from 'firebase/auth';
import Shell from '@/components/Shell';
import { auth, db, fs } from '@/lib/data';

const MSG = {
  'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة.',
  'auth/wrong-password': 'البريد أو كلمة المرور غير صحيحة.',
  'auth/user-not-found': 'لا يوجد حساب بهذا البريد.',
  'auth/email-already-in-use': 'هذا البريد مسجّل من قبل. سجّل الدخول بدلًا من ذلك.',
  'auth/weak-password': 'كلمة المرور قصيرة، استخدم ٦ أحرف على الأقل.',
  'auth/invalid-email': 'صيغة البريد غير صحيحة.',
  'auth/popup-closed-by-user': 'أُغلقت نافذة Google قبل إكمال الدخول.',
  'auth/too-many-requests': 'محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.',
};

function nextUrl() {
  const n = new URLSearchParams(location.search).get('next') || '/account';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/account';
}

async function ensureProfile(user, extra = {}) {
  const ref = fs.doc(db, 'users', user.uid);
  const snap = await fs.getDoc(ref);
  if (!snap.exists()) {
    await fs.setDoc(ref, {
      name: extra.name || user.displayName || '',
      phone: extra.phone || '',
      email: user.email || '',
      createdAt: fs.serverTimestamp(),
    });
  }
}

export default function LoginPage() {
  return (
    <Shell active="login">
      {({ user }) => (user ? <Signed /> : <AuthForm />)}
    </Shell>
  );
}

function Signed() {
  useEffect(() => { location.replace(nextUrl()); }, []);
  return <p className="muted">تم تسجيل الدخول، جارٍ التحويل…</p>;
}

function AuthForm() {
  const [mode, setMode] = useState('in');
  const [f, setF] = useState({ name: '', phone: '', email: '', pass: '' });
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'in') {
        await signInWithEmailAndPassword(auth, f.email.trim(), f.pass);
      } else {
        if (!f.name.trim()) throw { code: 'name' };
        const { user } = await createUserWithEmailAndPassword(auth, f.email.trim(), f.pass);
        await updateProfile(user, { displayName: f.name.trim() });
        await ensureProfile(user, { name: f.name.trim(), phone: f.phone.trim() });
      }
      location.replace(nextUrl());
    } catch (x) {
      setErr(x.code === 'name' ? 'اكتب اسمك.' : MSG[x.code] || 'تعذّر إكمال العملية. حاول مرة أخرى.');
      setBusy(false);
    }
  }

  async function google() {
    setErr(''); setBusy(true);
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureProfile(user);
      location.replace(nextUrl());
    } catch (x) {
      setErr(MSG[x.code] || 'تعذّر الدخول بحساب Google.');
      setBusy(false);
    }
  }

  async function reset() {
    setErr(''); setInfo('');
    if (!f.email.trim()) { setErr('اكتب بريدك أولًا ثم اضغط «نسيت كلمة المرور».'); return; }
    try {
      await sendPasswordResetEmail(auth, f.email.trim());
      setInfo('أرسلنا رابط تعيين كلمة المرور إلى بريدك.');
    } catch (x) {
      setErr(MSG[x.code] || 'تعذّر إرسال الرابط.');
    }
  }

  return (
    <div className="auth-box">
      <div>
        <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>Sura account</span>
        <h1>{mode === 'in' ? 'تسجيل الدخول' : 'حساب جديد'}</h1>
        <p className="muted">الحساب يتيح لك حجز المواعيد ومتابعة حالتها.</p>
      </div>
      <div className="auth-tabs" role="tablist">
        <button type="button" className={mode === 'in' ? 'on' : ''} onClick={() => setMode('in')}>دخول</button>
        <button type="button" className={mode === 'up' ? 'on' : ''} onClick={() => setMode('up')}>تسجيل جديد</button>
      </div>
      <form className="pform" onSubmit={submit} noValidate>
        {mode === 'up' && (
          <>
            <label>الاسم<input value={f.name} onChange={set('name')} autoComplete="name" required /></label>
            <label>رقم الجوال<input value={f.phone} onChange={set('phone')} type="tel" dir="ltr" autoComplete="tel" /></label>
          </>
        )}
        <label>البريد الإلكتروني<input value={f.email} onChange={set('email')} type="email" dir="ltr" autoComplete="email" required /></label>
        <label>كلمة المرور<input value={f.pass} onChange={set('pass')} type="password" dir="ltr" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required /></label>
        {err && <p className="err">{err}</p>}
        {info && <p className="ok">{info}</p>}
        <button className="btn dark" type="submit" disabled={busy}>{mode === 'in' ? 'دخول' : 'إنشاء الحساب'}</button>
        {mode === 'in' && <button type="button" className="more" onClick={reset} style={{ justifySelf: 'start' }}>نسيت كلمة المرور؟</button>}
      </form>
      <div className="or">أو</div>
      <button className="btn" type="button" onClick={google} disabled={busy}>المتابعة بحساب Google</button>
    </div>
  );
}
