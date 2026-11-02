/**
 * Server-side integrations. Each new booking or contact request is queued
 * as an email in the `mail` collection. Install the "Trigger Email from
 * Firestore" extension in the Firebase console to actually send them.
 * More integrations (Google Calendar, WhatsApp, payments) go here.
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ region: 'me-central2', maxInstances: 5 });

const db = admin.firestore();

async function notifyEmail() {
  const snap = await db.doc('site/settings').get();
  return (snap.exists && snap.data().notifyEmail) || '';
}

function row(label, value) {
  return value ? `<tr><td style="padding:4px 12px;color:#4B5E5B">${label}</td><td style="padding:4px 12px">${String(value)}</td></tr>` : '';
}

exports.onNewBooking = onDocumentCreated('bookings/{id}', async (event) => {
  const b = event.data && event.data.data();
  const to = await notifyEmail();
  if (!b || !to) return;
  const map = b.location && b.location.lat ? `https://maps.google.com/?q=${b.location.lat},${b.location.lng}` : '';
  await db.collection('mail').add({
    to,
    message: {
      subject: `حجز جديد: ${b.service} — ${b.name || ''}`,
      html: `<div dir="rtl"><h3>حجز جديد في موقع سُرى</h3><table>${
        row('الخدمة', b.service) + row('الاسم', b.name) + row('الجوال', b.phone) +
        row('التاريخ', b.date) + row('الوقت', b.time) + row('المدينة', b.city) +
        row('العنوان', b.address) + row('الموقع على الخريطة', map) + row('ملاحظات', b.notes)
      }</table></div>`,
    },
  });
});

exports.onNewRequest = onDocumentCreated('requests/{id}', async (event) => {
  const r = event.data && event.data.data();
  const to = await notifyEmail();
  if (!r || !to) return;
  await db.collection('mail').add({
    to,
    message: {
      subject: `رسالة جديدة من ${r.name}`,
      html: `<div dir="rtl"><h3>رسالة من نموذج التواصل</h3><table>${
        row('الاسم', r.name) + row('الجوال', r.phone) + row('البريد', r.email) +
        row('الجهة', r.org) + row('الخدمة', r.service) + row('الرسالة', r.message)
      }</table></div>`,
    },
  });
});
