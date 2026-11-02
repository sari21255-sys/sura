(function(){
'use strict';

/* ============================================================
   سُرى للإعلام — الموقع والأكاديمية
   البيانات من Firebase عبر window.__SURA (يجهّزها src/components/SiteClient.jsx)
   ============================================================ */

const SIZE_LIMIT=15.5e6;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ss={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}},del(k){try{sessionStorage.removeItem(k)}catch(e){}}};
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

/* ---------- data from Firebase (bridge set by SiteClient) ---------- */
const S=window.__SURA||{};
const FB=S.fb||null;
const SET=S.settings||{};
const WA=(SET.whatsapp||'966549342775').replace(/\D/g,'');
const MEDIA=Object.assign({},S.media||{},S.mediaOverrides||{});
let ARTICLES=Array.isArray(S.articles)?S.articles:[];
const TEXT_TAGS={EM:1,B:1,STRONG:1,BR:1,SPAN:1,I:1};
function cleanText(html){const d=new DOMParser().parseFromString('<div>'+(html||'')+'</div>','text/html').body.firstChild;
  (function walk(n){[...n.childNodes].forEach(c=>{if(c.nodeType===1){if(!TEXT_TAGS[c.tagName]){c.replaceWith(document.createTextNode(c.textContent))}else{[...c.attributes].forEach(a=>{if(a.name!=='class')c.removeAttribute(a.name)});walk(c)}}})})(d);
  return d.innerHTML}

/* ---------- mount ---------- */
const root=$('#root');
if(!root.querySelector('.site'))root.innerHTML=S.tpl||'';
if(S.texts)$$('[data-k]',root).forEach(el=>{const v=S.texts[el.dataset.k];if(typeof v==='string'&&v.trim())el.innerHTML=cleanText(v)});
document.documentElement.style.setProperty('--logo','url("'+MEDIA.logo+'")');
$$('[data-m]',root).forEach(im=>{if(MEDIA[im.dataset.m])im.src=MEDIA[im.dataset.m]});
const img=c=>!c?'':(c.startsWith('m:')?(MEDIA[c.slice(2)]||''):c);

/* ---------- icons ---------- */
const I={
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
  tool:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20 14 10m2-6 4 4-3 3-4-4 3-3Z"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>',
};

/* ============================================================
   CONTENT: شروحات، دورات، ملحقات وأدوات
   ============================================================ */
const TUTORIALS=[
 {id:'color-match',title:'مطابقة ألوان كاميرتين في DaVinci Resolve',cat:'مونتاج وألوان',tool:'DaVinci Resolve',level:'متوسط',mins:12,img:'s022',
  sum:'عندما تختلف الألوان بين الكاميرا الرئيسية والثانوية في المقابلة نفسها، توحّدها هذه الخطوات في دقائق.',
  steps:[['اختر اللقطة المرجعية','افتح لقطة من الكاميرا الرئيسية وصحّح تعريضها وتوازنها أولًا. كل اللقطات الأخرى ستُطابق عليها.'],
   ['احفظها صورةً ثابتة','في صفحة Color انقر بزر الفأرة الأيمن على العارض واختر Grab Still، فتظهر في المعرض.'],
   ['شغّل المقارنة','اختر لقطة الكاميرا الثانية وفعّل Split Screen أو Wipe مع الصورة المحفوظة لتراهما جنبًا إلى جنب.'],
   ['طابق التعريض على مقياس الموجة','افتح Waveform واضبط Lift وGain حتى يتطابق أسود اللقطتين وأبيضهما.'],
   ['طابق التوازن على Parade','اعرض المقياس بنمط RGB Parade، وحرّك عجلة Offset حتى تتقارب القنوات الثلاث في المناطق المحايدة.'],
   ['اضبط البشرة','اعزل البشرة بنافذة أو بأداة Qualifier، وتأكد أن لونها يقع على خط البشرة في Vectorscope.'],
   ['انسخ التصحيح','طبّق النتيجة على بقية لقطات الكاميرا الثانية بالنقر بالزر الأوسط على العقدة المصححة.']],
  tip:'إذا صوّرت لوحة ألوان ColorChecker في بداية التصوير، استخدم أداة Color Match لتختصر الخطوات الأولى.'},
 {id:'audio-cleanup',title:'تنظيف صوت مقابلة سُجّلت في قاعة مزدحمة',cat:'صوت',tool:'Adobe Audition',level:'مبتدئ',mins:10,img:'s079',
  sum:'تسجيل فيه صوت مكيف وصدى قاعة؟ هذه السلسلة تنظّف الصوت دون أن تجعله معدنيًا.',
  steps:[['التقط بصمة الضوضاء','حدد ثانيتين من الصمت، ثم من قائمة Effects اختر Noise Reduction / Restoration ثم Capture Noise Print.'],
   ['خفّف الضوضاء بقيمة معتدلة','حدد الملف كاملًا وافتح Noise Reduction (process)، وابدأ بخفض بين 6 و10 ديسيبل. القيم العالية تشوّه الحروف.'],
   ['اقطع الترددات المنخفضة','أضف Parametric Equalizer وفعّل High Pass عند 80 هرتز لإزالة الهدير والاهتزازات.'],
   ['خفّف الكتمة','اخفض منطقة 200 إلى 400 هرتز بمقدار 2 إلى 3 ديسيبل إن بدا الصوت مكتومًا.'],
   ['اضغط الصوت','أضف Single-band Compressor بنسبة 3:1 لتتقارب مستويات الكلام المرتفع والمنخفض.'],
   ['هذّب السينات','استخدم DeEsser إن كانت حروف السين والشين حادة على الأذن.'],
   ['اضبط الجهارية','من Match Loudness اضبط الملف على ‎-16 LUFS للمنصات الرقمية، أو ‎-23 LUFS للبث التلفزيوني.']],
  tip:'استمع بسماعات مغلقة وبمستوى صوت ثابت، وقارن النتيجة بالتسجيل الأصلي كل فترة.'},
 {id:'multicam',title:'مونتاج لقاء بكاميرتين بخاصية Multi-Camera',cat:'مونتاج وألوان',tool:'Premiere Pro',level:'متوسط',mins:8,img:'s108',
  sum:'مقابلة صُوّرت بكاميرتين وتسجيل صوت منفصل؟ اقطعها كأنك في غرفة بث.',
  steps:[['حدد المواد','حدد لقطات الكاميرتين وملف الصوت في نافذة Project.'],
   ['أنشئ المصدر المتعدد','انقر بزر الفأرة الأيمن واختر Create Multi-Camera Source Sequence، واختر المزامنة بالصوت Audio.'],
   ['حدد الصوت الرئيسي','في الإعدادات نفسها اختر الصوت من المايك الخارجي ليبقى صوت المقابلة مصدرًا واحدًا.'],
   ['ضعه في تسلسل','اسحب المصدر إلى تسلسل جديد، ثم فعّل عرض Multi-Camera في نافذة Program.'],
   ['اقطع أثناء التشغيل','شغّل التسلسل واضغط رقمي الكاميرتين 1 و2 للتبديل بينهما مباشرة.'],
   ['حسّن القطعات','استخدم أداة Rolling Edit لتقديم أي قطع أو تأخيره بإطار أو اثنين.']],
  tip:'اقطع عند نهاية الجملة أو على رد فعل المستمع، فالقطع في منتصف الكلمة يلاحظه المشاهد فورًا.'},
 {id:'conference-photo',title:'خطة تصوير مؤتمر من التجهيز إلى التسليم',cat:'تصوير',tool:'كاميرا وعدستان',level:'متوسط',mins:9,img:'p24',
  sum:'من زيارة القاعة إلى تسليم مختارات النشر في اليوم نفسه.',
  steps:[['زر القاعة قبل يوم','حدد أماكن الوقوف عند المنصة وفي الممرات، ولاحظ اتجاه الإضاءة وألوانها.'],
   ['استلم قائمة الشخصيات','اطلب من المنظم صور المتحدثين وكبار الضيوف وقائمة اللقطات الإلزامية.'],
   ['جهّز العدستين','عدسة 70-200 للمنصة من آخر القاعة، و24-70 للقاعة والجلسات الجانبية.'],
   ['اضبط الكاميرا','تصوير دون فلاش، وأيزو مرتفع مقبول، وسرعة غالق لا تقل عن 1/200 للمتحدثين.'],
   ['صوّر بالتسلسل','الافتتاح، ثم المتحدثون، ثم ردود الفعل في القاعة، ثم الأجنحة وحوارات الضيوف.'],
   ['انسخ البطاقة مرتين','نسخة على القرص ونسخة على مساحة سحابية قبل تفريغ البطاقة.'],
   ['سلّم المختارات','اختر 20 إلى 30 صورة، وعالجها بإعداد موحد، وأرسلها لفريق التواصل خلال ساعة.']],
  tip:'خصص بطاقة لكل يوم، واكتب على غلافها التاريخ واسم القاعة.'},
 {id:'phone-video',title:'إعدادات تصوير الجوال قبل أي لقطة',cat:'تصوير',tool:'الجوال',level:'مبتدئ',mins:6,img:'p49',
  sum:'إعدادات تستغرق دقيقتين وترفع جودة أي مقطع تصوره بالجوال.',
  steps:[['نظّف العدسة','بصمات الأصابع على العدسة تُفقد الصورة حدتها وتنشر الضوء.'],
   ['اختر الدقة ومعدل الإطارات','4K بمعدل 30 إطارًا لأغلب المحتوى، و60 إطارًا إن كنت ستبطئ الحركة.'],
   ['ثبّت التعريض والتركيز','اضغط مطولًا على وجه المتحدث حتى يظهر قفل AE/AF، فلا تتغير الإضاءة أثناء التصوير.'],
   ['فعّل الشبكة','تساعدك الشبكة على استقامة الأفق ووضع العينين في الثلث العلوي من الكادر.'],
   ['استخدم مايكًا خارجيًا','مايك لاسلكي صغير يغيّر جودة المقطع أكثر من أي إعداد آخر.'],
   ['شغّل وضع الطيران','حتى لا تقطع مكالمة أو إشعار تسجيلًا طويلًا.']],
  tip:'للتحكم اليدوي الكامل في الغالق والأيزو والتوازن الأبيض جرّب تطبيق Blackmagic Camera المجاني.'},
 {id:'drone-progress',title:'تصوير نسب الإنجاز بالدرون لمشروع إنشائي',cat:'تصوير جوي',tool:'درون',level:'متوسط',mins:8,img:'s124',
  sum:'تصوير شهري بزوايا ثابتة يجعل المقارنة بين الأشهر واضحة للإدارة.',
  steps:[['حدد نقاط التصوير','اختر من أربع إلى ست نقاط حول المشروع تغطي كل واجهاته، وسجّل إحداثياتها.'],
   ['ثبّت الارتفاع والزاوية','دوّن الارتفاع وزاوية الكاميرا لكل نقطة، والتزم بها في كل زيارة.'],
   ['احفظ المهمة','استخدم خاصية Waypoints أو المهام المحفوظة في تطبيق الطائرة لتعيد المسار نفسه.'],
   ['صوّر في الساعة نفسها','ضوء التاسعة صباحًا يختلف عن ضوء الرابعة عصرًا، وتغيّره يربك المقارنة.'],
   ['أضف لقطة دائرية','دورة كاملة حول المشروع تعطي الإدارة صورة شاملة في مقطع واحد.'],
   ['سمِّ الملفات بالتاريخ','مثل 2026-10_North.jpg، ورتّب المجلدات بالشهر.']],
  tip:'تأكد قبل كل زيارة من تصاريح الطيران في الموقع، فبعض المشاريع تقع قرب مطارات أو مناطق محظورة.'}
];

const COURSES=[
 {id:'photo-basics',title:'أساسيات التصوير الفوتوغرافي',cat:'تصوير',level:'مبتدئ',hours:12,sessions:4,mode:'حضوري',img:'s012',
  sum:'من ضبط الكاميرا يدويًا إلى تكوين الكادر وقراءة الضوء، مع تطبيق ميداني في كل جلسة.',
  who:'لمن يملك كاميرا ويصور على الوضع التلقائي، ولموظفي التواصل الذين يصورون فعاليات جهاتهم.',
  req:'كاميرا بعدسة قابلة للتبديل، أو جوال يدعم التصوير اليدوي.',
  learn:['التحكم في فتحة العدسة وسرعة الغالق والأيزو معًا','قراءة الضوء الطبيعي واختيار وقت التصوير','قواعد التكوين ومتى نخرج عنها','تصوير الأشخاص في الفعاليات دون فلاش','تنظيم الصور ومعالجتها الأولية في Lightroom'],
  outline:[['مثلث التعريض','تجربة عملية لكل إعداد على حدة، ثم الجمع بينها في مواقف مختلفة.'],['الضوء','الضوء الجانبي والخلفي، والتصوير في الظل وتحت الشمس المباشرة.'],['التكوين والقصة','بناء الكادر، والعمق، واختيار اللحظة المناسبة في الحدث.'],['التطبيق والمعالجة','جولة تصوير ميدانية، ثم اختيار الصور ومعالجتها ومراجعتها مع المدرب.']]},
 {id:'mobile-content',title:'صناعة المحتوى بالجوال',cat:'محتوى',level:'مبتدئ',hours:6,sessions:3,mode:'عن بُعد',img:'p48',
  sum:'تصوير مقاطع قصيرة للمنصات ومونتاجها من الجوال وحده، بإعدادات وتطبيقات مجانية.',
  who:'لأصحاب المشاريع الصغيرة ومديري الحسابات وصنّاع المحتوى في بداياتهم.',
  req:'جوال حديث، ويُفضّل مايك لاسلكي صغير.',
  learn:['إعدادات الكاميرا قبل التصوير','تصوير مقطع بلقطات متنوعة في عشر دقائق','تسجيل صوت واضح بالجوال','المونتاج على CapCut أو VN','كتابة الثواني الأولى التي توقف المتابع'],
  outline:[['التصوير','الإعدادات والثبات والإضاءة المتاحة في المكان.'],['الصوت والحديث أمام الكاميرا','المايك والنص والإلقاء.'],['المونتاج والنشر','الإيقاع والنصوص على الشاشة وأحجام كل منصة.']]},
 {id:'premiere-edit',title:'المونتاج الاحترافي على Premiere Pro',cat:'فيديو',level:'متوسط',hours:15,sessions:5,mode:'حضوري',img:'s090',
  sum:'سير عمل كامل من تنظيم المواد إلى التصدير، على مشروع مقابلة وفيلم تعريفي قصير.',
  who:'لمن يعرف أساسيات المونتاج ويريد العمل بسرعة ونظام على مشاريع حقيقية.',
  req:'حاسب محمول عليه Premiere Pro.',
  learn:['تنظيم المشروع والملفات قبل القص','المونتاج متعدد الكاميرات','بناء الإيقاع بالقطع والموسيقى','الترجمة والعناوين','التصدير لكل منصة'],
  outline:[['التنظيم','الهيكل، والبروكسي، وتسمية المواد.'],['القص','المقابلة، واللقطات المساندة، والإيقاع.'],['تعدد الكاميرات','المزامنة بالصوت والقطع المباشر.'],['الصوت والنصوص','مستويات الصوت، والترجمة، والعناوين البسيطة.'],['التسليم','التصدير ونسخ المنصات ومراجعة العميل.']]},
 {id:'color-grading',title:'تصحيح الألوان على DaVinci Resolve',cat:'فيديو',level:'متقدم',hours:10,sessions:4,mode:'حضوري',img:'s091',
  sum:'قراءة المقاييس، ومطابقة الكاميرات، وبناء طابع لوني ثابت للمشاريع المؤسسية والوثائقية.',
  who:'للمونتيرين والمصورين الذين يصورون بملفات Log أو RAW.',
  req:'حاسب عليه DaVinci Resolve، والنسخة المجانية تكفي.',
  learn:['قراءة مقياس الموجة والفيكتورسكوب','تحويل ملفات Log بإدارة ألوان صحيحة','مطابقة لقطات كاميرتين مختلفتين','ضبط البشرة','حفظ الطابع وإعادة استخدامه'],
  outline:[['الأدوات والمقاييس','الصفحة اللونية والعُقد والمقاييس.'],['التصحيح','التعريض والتوازن ومطابقة اللقطات.'],['الطابع','بناء الطابع على مستوى المجموعة.'],['التسليم','المراجعة والتصدير بمساحات الألوان الصحيحة.']]},
 {id:'audio-voice',title:'هندسة الصوت للبودكاست والتعليق الصوتي',cat:'صوت',level:'متوسط',hours:8,sessions:4,mode:'عن بُعد',img:'s023',
  sum:'من اختيار المايك وتجهيز الغرفة إلى المعالجة والوصول لمستوى الصوت المطلوب للمنصات.',
  who:'لمقدمي البودكاست ومونتيري الفيديو ومن يسجّل تعليقًا صوتيًا.',
  req:'مايك وسماعة رأس وأي برنامج صوت مثل Audition أو Audacity أو Reaper.',
  learn:['اختيار المايك المناسب للمكان','تجهيز غرفة التسجيل بأقل تكلفة','تنظيف الضوضاء دون تشويه الصوت','الضغط والمعادلة للصوت البشري','قياس الجهارية LUFS للمنصات'],
  outline:[['التسجيل','المايك والمسافة والمستويات.'],['التنظيف','الضوضاء والصدى والأصوات الحادة.'],['المعالجة','المعادل والضاغط.'],['الماسترينغ','الجهارية والتصدير.']]},
 {id:'short-doc',title:'كتابة وإخراج الفيلم الوثائقي القصير',cat:'فيديو',level:'متوسط',hours:16,sessions:6,mode:'حضوري',img:'s077',
  sum:'من الفكرة والبحث إلى نسخة نهائية مدتها خمس دقائق، ينفّذها كل متدرب خلال الدورة.',
  who:'لصناع الأفلام والصحفيين وفرق المحتوى في الجهات الثقافية.',
  req:'كاميرا أو جوال، وحاسب للمونتاج.',
  learn:['تحويل الفكرة إلى سؤال يقود الفيلم','البحث وإعداد الضيوف','إدارة المقابلة','قائمة اللقطات المساندة','البناء الدرامي في المونتاج'],
  outline:[['الفكرة والسؤال','اختيار الموضوع وصياغة السؤال الكبير.'],['البحث والضيوف','المصادر والتواصل والأسئلة.'],['التصوير','المقابلة واللقطات المساندة.'],['المونتاج الورقي','ترتيب الفيلم قبل فتح البرنامج.'],['المونتاج','النسخة الأولى والمراجعة.'],['العرض','عرض أفلام المتدربين ومناقشتها.']]},
 {id:'live-coverage',title:'تغطية المؤتمرات والبث المباشر',cat:'فيديو',level:'متقدم',hours:10,sessions:3,mode:'حضوري',img:'s065',
  sum:'تشغيل مكسر البث وتوزيع الكاميرات ودمج العروض والتسليم اليومي في الفعاليات الكبيرة.',
  who:'لفرق الإنتاج والتواصل التي تغطي فعاليات جهاتها بنفسها.',
  req:'خبرة سابقة في التصوير.',
  learn:['تخطيط مواقع الكاميرات','تشغيل المكسر والتبديل بين المصادر','دمج العروض التقديمية والصوت','البث للمنصات والشاشات','جدول التسليم اليومي'],
  outline:[['التخطيط','زيارة الموقع والمخطط وقائمة المعدات.'],['التشغيل','المكسر والصوت والعروض.'],['التسليم','الملخصات اليومية والأرشيف.']]},
 {id:'drone-pro',title:'التصوير الجوي بالدرون',cat:'تصوير',level:'مبتدئ',hours:8,sessions:3,mode:'حضوري',img:'s126',
  sum:'الطيران الآمن، واللقطات الأساسية، وتخطيط مهام التصوير المتكررة للمشاريع.',
  who:'لمن يملك درون أو ينوي شراءه للعمل التجاري.',
  req:'درون مسجّل، ويمكن الحضور دونه لمتابعة الجانب النظري.',
  learn:['اشتراطات الطيران المحلية وتسجيل الطائرة','فحص ما قبل الإقلاع','حركات الكاميرا الأساسية','تصوير العقارات ونسب الإنجاز','معالجة اللقطات الجوية'],
  outline:[['الأنظمة والسلامة','التسجيل والمناطق المحظورة والطقس.'],['الطيران والحركة','تمارين ميدانية على الحركات الأساسية.'],['المشاريع','مهام التصوير المتكررة والتسليم.']]}
];

const TOOLS=[
 {id:'storage',fx:'GB',title:'حاسبة مساحة التخزين',desc:'كم تحتاج من البطاقات والأقراص لساعات التصوير، بحسب الترميز وعدد الكاميرات.'},
 {id:'aspect',fx:'16:9',title:'حاسبة الأبعاد والمقاسات',desc:'احسب الارتفاع من العرض لأي نسبة، واعرف مقاسات كل منصة.'},
 {id:'voiceover',fx:'0:30',title:'مدة التعليق الصوتي',desc:'الصق النص واعرف مدته المتوقعة عند القراءة، أو عدد الكلمات المناسب لمدة محددة.'},
 {id:'checklist',fx:'✓',title:'قائمة تجهيز يوم التصوير',desc:'قائمة نراجعها قبل الخروج إلى أي موقع، وتحفظ تقدّمك على جهازك.'}
];
const RESOURCES=[
 {id:'luts',fx:'.cube',title:'حزمة LUTs للتصوير المؤسسي',desc:'تحويلات لونية نستخدمها نقطة بداية لمشاريع المقابلات والأفلام التعريفية.',items:['تحويل من S-Log3 وV-Log إلى Rec.709','طابع طبيعي بدفء خفيف في البشرة','طابع وثائقي بتشبع أقل'],fmt:'ملفات ‎.cube تعمل على Premiere وResolve وFinal Cut'},
 {id:'lr-arch',fx:'.xmp',title:'إعدادات Lightroom للتصوير المعماري',desc:'إعدادات للمباني من الداخل والخارج، تصحح الخطوط وتوازن النوافذ المضيئة مع الداخل.',items:['داخلي بإضاءة مختلطة','واجهات في ضوء النهار','غرف فندقية'],fmt:'ملفات ‎.xmp لـ Lightroom Classic وLightroom'},
 {id:'shotlist',fx:'.xlsx',title:'قالب قائمة اللقطات',desc:'القالب الذي نجهّز به كل يوم تصوير: اللقطة والموقع والعدسة والحالة.',items:['ترقيم تلقائي للمشاهد','أعمدة للمعدات والأشخاص','عمود حالة يتلوّن عند الإنجاز'],fmt:'Excel وGoogle Sheets'},
 {id:'quote',fx:'.docx',title:'نموذج عرض سعر تغطية فعالية',desc:'هيكل عرض السعر الذي نرسله للجهات: الأيام والطاقم والتسليمات والشروط.',items:['جدول أيام الفعالية والطاقم','بنود التسليم اليومي والنهائي','شروط الدفع والتعديلات'],fmt:'Word'},
 {id:'doc-script',fx:'.docx',title:'قالب سيناريو بعمودين للوثائقي',desc:'عمود للصورة وعمود للصوت، مع خانات التوقيت ومصدر كل لقطة.',items:['صفحة الفكرة والسؤال الكبير','جدول الصورة والصوت','قائمة الضيوف والأسئلة'],fmt:'Word وPDF'},
 {id:'sfx',fx:'.wav',title:'مؤثرات انتقالية للمونتاج',desc:'أصوات قصيرة للانتقالات والعناوين، مسجلة ومعالجة في استوديو سُرى.',items:['انتقالات Whoosh وRiser','نقرات وواجهات للعناوين','أجواء خلفية لمكاتب وقاعات'],fmt:'WAV بدقة 48kHz / 24bit'}
];
const CHECK={
 'الكاميرات والعدسات':['بطاريات مشحونة ومعها احتياطي','بطاقات ذاكرة فارغة ومهيأة','تنظيف العدسات والحساس','حامل ثلاثي ورأس فيديو'],
 'الصوت':['مايكات لابل ببطاريات جديدة','مايك بوم وحامله','سماعات رأس مغلقة','مسجل صوت خارجي'],
 'الإضاءة والطاقة':['إضاءات وناشرات','حوامل وأكياس رمل','وصلات كهرباء وتوصيلات','شواحن البطاريات'],
 'الموقع والأوراق':['تصريح التصوير أو خطاب الجهة','قائمة اللقطات والأسئلة','رقم منسق الموقع','نماذج موافقة الظهور']
};

/* ============================================================
   helpers
   ============================================================ */
const MONTHS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function fmtDate(d){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(d||'');return m?(+m[3])+' '+MONTHS[+m[2]-1]+' '+m[1]:''}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function textOf(html){const d=document.createElement('div');d.innerHTML=html||'';return d.textContent||''}
function words(t){return (t.trim().match(/\S+/g)||[]).length}
function readMins(html){return Math.max(1,Math.ceil(words(textOf(html))/180))}
function waLink(text){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(text)}
function shareURL(hash){return location.href.split('#')[0]+'#'+hash}

let toastT;
function toast(msg,err){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.className='toast'+(err?' err':'');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},4200)}

async function copyText(text,btn){
  try{await navigator.clipboard.writeText(text);if(btn)btn.textContent='تم النسخ'}
  catch(_){const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');if(btn)btn.textContent='تم النسخ'}catch(e){if(btn)btn.textContent='النص محدد، انسخه'}setTimeout(()=>ta.remove(),400)}
}

/* sanitize article HTML: keep only the tags the editor produces */
const ALLOW={P:[],H2:[],H3:[],STRONG:[],B:[],EM:[],I:[],U:[],BLOCKQUOTE:[],UL:[],OL:[],LI:[],A:['href'],IMG:['src','alt'],FIGURE:[],FIGCAPTION:[],BR:[],HR:[]};
const DROP=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','META','LINK','TITLE','SVG','NOSCRIPT','TEMPLATE','FORM','INPUT','BUTTON','TEXTAREA','SELECT','VIDEO','AUDIO','CANVAS','HEAD']);
function clean(html){
  const doc=new DOMParser().parseFromString('<div>'+(html||'')+'</div>','text/html');
  const out=document.createElement('div');
  (function walk(from,to){
    for(const n of [...from.childNodes]){
      if(n.nodeType===3){to.appendChild(document.createTextNode(n.nodeValue));continue}
      if(n.nodeType!==1)continue;
      let tag=n.tagName.toUpperCase();
      if(DROP.has(tag))continue;
      if(tag==='H1')tag='H2';
      if(tag==='H4'||tag==='H5'||tag==='H6')tag='H3';
      if(tag==='DIV'||tag==='SECTION'||tag==='ARTICLE')tag='P';
      if(!ALLOW[tag]){walk(n,to);continue}
      const el=document.createElement(tag);
      for(const a of ALLOW[tag]){const v=n.getAttribute(a);if(v==null)continue;const vv=v.trim();
        if(a==='href'&&!/^(https?:|mailto:|#)/i.test(vv))continue;
        if(a==='src'&&!/^(data:image\/(png|jpe?g|webp|gif);base64,|https:)/i.test(vv))continue;
        el.setAttribute(a,vv)}
      if(tag==='IMG'&&!el.getAttribute('src'))continue;
      walk(n,el);to.appendChild(el);
    }
  })(doc.body.firstChild||doc.body,out);
  $$('p',out).forEach(p=>{if(p.querySelector('p,h2,h3,ul,ol,blockquote,figure,hr'))p.replaceWith(...p.childNodes)});
  $$('p,h2,h3,li,blockquote',out).forEach(e=>{if(!e.textContent.trim()&&!e.querySelector('img,br'))e.remove()});
  return out.innerHTML;
}
function renderBody(html){
  const d=document.createElement('div');d.innerHTML=clean(html);
  $$('a[href^="http"]',d).forEach(a=>{a.target='_blank';a.rel='noopener'});
  return d.innerHTML;
}

/* ============================================================
   owner detection & saving
   ============================================================ */
let CAN_EDIT=false,DL=null;
async function detectOwner(){
  if(!FB)return;
  try{CAN_EDIT=!!(await FB.isAdmin())}catch(e){CAN_EDIT=false}
  if(CAN_EDIT&&Array.isArray(S.articles))ARTICLES=S.articles;
  if(CAN_EDIT){document.body.classList.add('owner');const r=parseRoute(curHash());if(r)renderAcad(r,true)}
}
if(FB&&FB.onAuth)FB.onAuth(()=>detectOwner());

function setSaving(on,label){
  let o=$('#saving');
  if(!o){o=document.createElement('div');o.id='saving';o.className='toast';o.setAttribute('role','status');document.body.appendChild(o)}
  o.textContent=label||'جارٍ الحفظ والنشر…';o.hidden=!on;
}
async function commit(next,gotoHash,okMsg,draftKey){
  if(!FB||!CAN_EDIT){toast('الحفظ متاح لحساب المشرف فقط. سجّل الدخول من صفحة الحساب.',true);return false}
  setSaving(true,'جارٍ الحفظ…');
  try{
    await FB.saveArticles(ARTICLES,next);
    ss.set('sura-goto',gotoHash||'');
    ss.set('sura-toast',okMsg||'تم الحفظ');
    if(draftKey)ss.set('sura-clear',draftKey);
    setSaving(true,'تم الحفظ، يُعاد تحميل الصفحة…');
    location.reload();
    return true;
  }catch(e){
    setSaving(false);
    const code=e&&e.code||'';
    toast(code==='permission-denied'?'هذا الحساب لا يملك صلاحية تعديل الموقع.':code==='too-large'?'المقال كبير بسبب الصور. احذف صورة أو اثنتين ثم احفظ.':'تعذّر الحفظ. تحقق من الاتصال وحاول مرة أخرى.',true);
    return false;
  }
}

/* ============================================================
   MAIN SITE behaviour
   ============================================================ */
const hdr=$('#hdr'),nav=$('#nav'),burger=$('#burger');
const viewMain=$('#view-main'),viewAcad=$('#view-acad');
const onScroll=()=>hdr.classList.toggle('solid',scrollY>40);
addEventListener('scroll',onScroll,{passive:true});onScroll();
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');burger.setAttribute('aria-expanded','false')}});

const spyIds=['top','story','services','films','photos','partners','contact'];
addEventListener('scroll',()=>{
  if(viewMain.hidden)return;let cur='top';
  spyIds.forEach(id=>{const s=document.getElementById(id);if(s&&s.getBoundingClientRect().top<140)cur=id});
  $$('#nav > a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur));
},{passive:true});

/* hero */
const hs=$$('#slides img'),hd=$('#heroDots');let hi=0,ht;
hs.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','صورة '+(i+1));b.onclick=()=>{showHero(i);restartHero()};hd.appendChild(b)});
function showHero(i){hs[hi].classList.remove('on');hd.children[hi].classList.remove('on');hi=i;hs[hi].classList.add('on');hd.children[hi].classList.add('on')}
function restartHero(){clearInterval(ht);ht=setInterval(()=>{if(!viewMain.hidden)showHero((hi+1)%hs.length)},6000)}
showHero(0);restartHero();

/* services slider */
const track=$('#track'),slides=$$('.slide'),bars=$('#bars');let si=0;
$('#pgAll').textContent=String(slides.length).padStart(2,'0');
slides.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','الخدمة '+(i+1));b.onclick=()=>go(i);bars.appendChild(b)});
function go(i){si=(i+slides.length)%slides.length;track.style.transform='translateX('+(si*100)+'%)';
  $('#pgNow').textContent=String(si+1).padStart(2,'0');[...bars.children].forEach((b,k)=>b.classList.toggle('on',k===si));
  slides.forEach((s,k)=>s.setAttribute('aria-hidden',k!==si))}
$('#next').onclick=()=>go(si+1);$('#prev').onclick=()=>go(si-1);go(0);
let sx=null;const sl=$('#slider');
sl.addEventListener('pointerdown',e=>{sx=e.clientX});
sl.addEventListener('pointerup',e=>{if(sx==null)return;const d=e.clientX-sx;if(Math.abs(d)>50)go(si+(d>0?1:-1));sx=null});

/* preselect service on any [data-svc] link */
document.addEventListener('click',e=>{const b=e.target.closest('[data-svc]');if(b){const s=$('#f-svc');if(s)s.value=b.dataset.svc}});
$$('#joinLink,.joinA').forEach(b=>b.addEventListener('click',()=>{$('#f-svc').value='الانضمام للفريق'}));

/* lightbox */
const lb=$('#lb'),lbImg=$('#lbImg');let list=[],li=0;
function openLB(items,i,isVid){list=items;li=i;lb.hidden=false;document.body.style.overflow='hidden';
  $('#lbNav').hidden=items.length<2;$('#lbNote').hidden=!isVid;renderLB();$('#lbClose').focus()}
function renderLB(){const it=list[li];lbImg.src=it.src;lbImg.alt=it.alt||'';$('#lbTitle').textContent=it.title;$('#lbSub').textContent=it.sub||''}
function closeLB(){lb.hidden=true;document.body.style.overflow=''}
$('#lbClose').onclick=closeLB;
$('#lbNext').onclick=()=>{li=(li+1)%list.length;renderLB()};
$('#lbPrev').onclick=()=>{li=(li-1+list.length)%list.length;renderLB()};
lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')closeLB()});
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')closeLB();
  if(e.key==='ArrowLeft')$('#lbNext').click();if(e.key==='ArrowRight')$('#lbPrev').click()});
$$('.cat[data-gal]').forEach(cat=>{const btns=$$('.ph',cat);
  const items=btns.map(b=>{const im=$('img',b);return{src:im.src,alt:im.alt,title:cat.dataset.gal,sub:im.alt}});
  btns.forEach((b,i)=>b.addEventListener('click',()=>openLB(items,i,false)))});

/* films: put a YouTube / Vimeo / Drive link for each film */
const VIDEO_LINKS=Object.assign({thakira:'',ain:'',athar:'',iu:'',nahdi:'',dur:'',teacher:'',pmu:'',icf:'',mif:'',bball:'',alula:''},SET.videoLinks||{});
$$('.vid').forEach(v=>{const link=VIDEO_LINKS[v.dataset.key];
  if(link){v.href=link;v.target='_blank';v.rel='noopener';return}
  v.addEventListener('click',e=>{e.preventDefault();const im=$('img',v);
    openLB([{src:im.src,title:$('h4',v).textContent,sub:$('span:last-child',v).textContent}],0,true)})});

/* contact form → WhatsApp */
let msgText='';
$('#form').addEventListener('submit',e=>{e.preventDefault();const f=e.target;
  if(!f.name.value.trim()){f.name.focus();f.name.style.borderColor='#C9806B';return}
  const rows=[['الاسم',f.name.value],['الجوال',f.phone.value],['البريد',f.mail.value],['المنصب',f.role.value],['الجهة',f.org.value],['الخدمة',f.svc.value],['الرسالة',f.msg.value]].filter(r=>r[1].trim());
  msgText='مرحبًا سُرى،\n'+rows.map(r=>r[0]+': '+r[1].trim()).join('\n');
  $('#waLink').href=waLink(msgText);
  if(FB&&FB.saveRequest)FB.saveRequest({name:f.name.value.trim(),phone:f.phone.value.trim(),email:f.mail.value.trim(),role:f.role.value.trim(),org:f.org.value.trim(),service:f.svc.value,message:f.msg.value.trim()}).catch(()=>{});
  $('#sent').hidden=false;$('#sent').scrollIntoView({block:'nearest'})});
$('#copyBtn').addEventListener('click',()=>copyText(msgText,$('#copyBtn')));

/* ============================================================
   ROUTER
   ============================================================ */
const ACAD_PAGES=['academy','articles','translated','tutorials','courses','tools','write','manage'];
function curHash(){try{return decodeURIComponent(location.hash.slice(1))}catch(e){return location.hash.slice(1)}}
function parseRoute(h){
  if(ACAD_PAGES.includes(h))return{v:h};
  const m=/^(art|tut|crs|tool|res|edit)-([A-Za-z0-9._~-]+)$/.exec(h);
  return m?{v:m[1],id:m[2]}:null;
}
function route(){
  const h=curHash(),r=parseRoute(h);
  if(r){renderAcad(r);return}
  const wasAcad=!viewAcad.hidden;
  viewMain.hidden=false;viewAcad.hidden=true;viewAcad.innerHTML='';document.body.classList.remove('in-acad');
  $('.dd-top').classList.remove('on');
  const el=h&&document.getElementById(h);
  if(el)requestAnimationFrame(()=>el.scrollIntoView({behavior:wasAcad?'auto':'smooth'}));
  else if(wasAcad)scrollTo({top:0,behavior:'auto'});
}
addEventListener('hashchange',route);

/* ============================================================
   ACADEMY RENDERING
   ============================================================ */
const visArticles=()=>ARTICLES.filter(a=>CAN_EDIT||a.status!=='draft').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
const catsOf=()=>[...new Set(ARTICLES.map(a=>a.cat).filter(Boolean))];

function subnav(v){
  const tabs=[['academy','الرئيسية'],['articles','مقالات'],['tutorials','شروحات'],['courses','دورات'],['tools','ملحقات وأدوات']];
  const map={translated:'articles',art:'articles',edit:'articles',write:'articles',manage:'articles',tut:'tutorials',crs:'courses',tool:'tools',res:'tools'};
  const on=map[v]||v;
  return '<nav class="subnav" aria-label="أقسام الأكاديمية"><div class="wrap">'+tabs.map(t=>'<a href="#'+t[0]+'"'+(t[0]===on?' class="on" aria-current="page"':'')+'>'+t[1]+'</a>').join('')
   +(CAN_EDIT?'<div class="own"><a class="pri" href="#write">اكتب مقالًا</a><a href="#manage">إدارة المقالات</a></div>':'')+'</div></nav>';
}
function banner(o){
  return '<header class="banner'+(o.slim?' slim':'')+'"><span class="logo mark" aria-hidden="true"></span><div class="wrap">'
   +'<nav class="crumbs" aria-label="مسار التصفح"><a href="#top">سُرى</a>'+(o.crumbs||[]).map(c=>c[1]?'<span><a href="#'+c[1]+'">'+esc(c[0])+'</a></span>':'<span>'+esc(c[0])+'</span>').join('')+'</nav>'
   +(o.eyebrow?'<span class="eyebrow">'+o.eyebrow+'</span>':'')+'<h1>'+esc(o.title)+'</h1>'+(o.text?'<p>'+esc(o.text)+'</p>':'')+(o.extra||'')+'</div></header>';
}
const head=(t,p,link)=>'<div class="a-head"><div><h2>'+t+'</h2></div>'+(p?'<p>'+p+'</p>':'')+(link?'<a class="more" href="#'+link[1]+'">'+link[0]+I.arrow+'</a>':'')+'</div>';

const isTr=a=>a&&a.kind==='translated'&&a.src;
function artCard(a){
  return '<a class="card" href="#art-'+esc(a.id)+'"><div class="im"><img src="'+esc(img(a.cover))+'" alt="" loading="lazy"><span class="tag">'+esc(a.cat)+'</span></div>'
   +'<div class="bd">'+(a.status==='draft'?'<span class="draft-pill">مسودة، لا يراها الزوار</span>':'')+(isTr(a)?'<span class="tr-pill">مترجم عن '+esc(a.src.site)+'</span>':'')+'<h3>'+esc(a.title)+'</h3><p>'+esc(a.excerpt)+'</p>'
   +'<div class="meta"><span>'+I.cal+fmtDate(a.date)+'</span><span>'+I.clock+readMins(a.body)+' د قراءة</span></div></div></a>';
}
function tutCard(t){
  return '<a class="card" href="#tut-'+t.id+'"><div class="im"><img src="'+MEDIA[t.img]+'" alt="" loading="lazy"><span class="tag">'+esc(t.tool)+'</span></div>'
   +'<div class="bd"><h3>'+esc(t.title)+'</h3><p>'+esc(t.sum)+'</p><div class="meta"><span class="lvl">'+t.level+'</span><span>'+I.clock+t.mins+' دقائق</span><span>'+t.steps.length+' خطوات</span></div></div></a>';
}
function crsCard(c){
  return '<a class="card" href="#crs-'+c.id+'"><div class="im"><img src="'+MEDIA[c.img]+'" alt="" loading="lazy"><span class="tag">'+c.mode+'</span></div>'
   +'<div class="bd"><span class="tag">'+c.cat+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.sum)+'</p><div class="meta"><span>'+I.clock+c.hours+' ساعة</span><span>'+I.cal+c.sessions+' جلسات</span><span class="lvl">'+c.level+'</span></div></div>'
   +'<div class="foot"><span>التسجيل مفتوح</span><b>التفاصيل والتسجيل</b></div></a>';
}

function renderAcad(r,keepScroll){
  viewMain.hidden=true;viewAcad.hidden=false;document.body.classList.add('in-acad');
  $$('#nav > a').forEach(a=>a.classList.remove('on'));$('.dd-top').classList.add('on');
  const y=scrollY;
  let html='';
  switch(r.v){
    case 'academy':html=pAcademy();break;
    case 'articles':html=pArticles('');break;
    case 'translated':html=pArticles('translated');break;
    case 'art':html=pArticle(r.id);break;
    case 'tutorials':html=pTutorials();break;
    case 'tut':html=pTutorial(r.id);break;
    case 'courses':html=pCourses();break;
    case 'crs':html=pCourse(r.id);break;
    case 'tools':html=pTools();break;
    case 'tool':html=pTool(r.id);break;
    case 'res':html=pRes(r.id);break;
    case 'write':html=pEditor(null);break;
    case 'edit':html=pEditor(r.id);break;
    case 'manage':html=pManage();break;
  }
  viewAcad.innerHTML=subnav(r.v)+html+'<div style="height:24px"></div>';
  $$('.logo.mark',viewAcad);
  const bind=BIND[r.v];if(bind)bind(r);
  scrollTo({top:keepScroll?y:0,behavior:'auto'});
}
const BIND={};

/* ---------- academy home ---------- */
function pAcademy(){
  const arts=visArticles().filter(a=>a.status!=='draft');
  const plats=[['articles','Journal','مقالات',arts.length,'تجارب الفريق في الإنتاج والتغطية والصوت.','p15'],
    ['tutorials','Tutorials','شروحات',TUTORIALS.length,'خطوات عملية على البرامج والمعدات.','s022'],
    ['courses','Courses','دورات',COURSES.length,'تدريب حضوري وعن بُعد يقدمه فريق الإنتاج.','s077'],
    ['tools','Toolkit','ملحقات وأدوات',TOOLS.length+RESOURCES.length,'حاسبات وقوالب ومؤثرات نستخدمها في عملنا.','s111']];
  return banner({crumbs:[['أكاديمية سُرى']],eyebrow:'Sura Media Academy',title:'أكاديمية سُرى الإعلامية',
     text:'ما نتعلمه في مواقع التصوير وغرف المونتاج نضعه هنا: مقالات من تجارب الفريق، وشروحات خطوة بخطوة، ودورات حضورية وعن بُعد، وأدوات يحتاجها المصور والمونتير في يومه.',
     extra:'<div class="row"><a class="btn solid" href="#courses">تصفّح الدورات</a><a class="btn" href="#articles">اقرأ المقالات</a></div>'})
   +'<section class="a-sec"><div class="wrap">'+head('أقسام الأكاديمية')
   +'<div class="plats">'+plats.map(p=>'<a class="plat" href="#'+p[0]+'"><img src="'+MEDIA[p[5]]+'" alt=""><span class="cnt">'+p[3]+'</span><small>'+p[1]+'</small><b>'+p[2]+'</b><p>'+p[4]+'</p></a>').join('')+'</div></div></section>'
   +'<section class="a-sec"><div class="wrap">'+head('دورات مفتوحة للتسجيل','',['كل الدورات','courses'])+'<div class="grid g4">'+COURSES.slice(0,4).map(crsCard).join('')+'</div></div></section>'
   +(arts.length?'<section class="a-sec"><div class="wrap">'+head('أحدث المقالات','',['كل المقالات','articles'])+'<div class="grid">'+arts.slice(0,3).map(artCard).join('')+'</div></div></section>':'')
   +'<section class="a-sec"><div class="wrap">'+head('شروحات مختارة','',['كل الشروحات','tutorials'])+'<div class="grid">'+TUTORIALS.slice(0,3).map(tutCard).join('')+'</div></div></section>'
   +'<section class="a-sec"><div class="wrap"><div class="cta-band"><div><h3>تدريب مخصص لفريق جهتك</h3><p>نصمم برنامجًا تدريبيًا لفريق التواصل أو الإعلام في جهتك، يُقدَّم في مقركم وعلى معداتكم، ويُبنى على نوع المحتوى الذي تنشرونه فعلًا.</p></div><a class="btn solid" href="#contact" data-svc="تدريب وأكاديمية">اطلب عرضًا تدريبيًا</a></div></div></section>';
}

/* ---------- articles listing ---------- */
let artCat='الكل',artShown=6,artKind='';
function pArticles(kind){
  if(kind!==artKind){artKind=kind;artCat='الكل';artShown=6}
  const every=visArticles();
  const all=every.filter(a=>kind==='translated'?isTr(a):(kind==='own'?!isTr(a):true));
  const feat=kind==='translated'?null:(all.find(a=>a.featured&&a.status!=='draft'&&!isTr(a))||all.find(a=>!isTr(a))||all[0]);
  const cats=['الكل',...new Set(all.map(a=>a.cat).filter(Boolean))];
  if(!cats.includes(artCat))artCat='الكل';
  const rest=all.filter(a=>artCat==='الكل'||a.cat===artCat);
  const trN=every.filter(isTr).length,ownN=every.length-trN;
  const kinds='<div class="kinds" role="tablist" aria-label="نوع المقالات"><a href="#articles"'+(kind!=='translated'?' class="on" aria-current="page"':'')+'>كل المقالات <small>'+every.length+'</small></a><a href="#translated"'+(kind==='translated'?' class="on" aria-current="page"':'')+'>مقالات مترجمة <small>'+trN+'</small></a></div>';
  let top='';
  if(feat){
    const latest=all.filter(a=>a!==feat).slice(0,4);
    top='<section class="a-sec"><div class="wrap"><div class="today">'
     +'<a class="feat" href="#art-'+esc(feat.id)+'"><img src="'+esc(img(feat.cover))+'" alt=""><span class="badge">اقرأها اليوم</span><span class="tag" style="background:transparent;color:var(--gold-hi);border-color:var(--gold)">'+esc(feat.cat)+'</span><h2>'+esc(feat.title)+'</h2><p>'+esc(feat.excerpt)+'</p><div class="meta"><span>'+I.cal+fmtDate(feat.date)+'</span><span>'+I.clock+readMins(feat.body)+' د قراءة</span><span>'+esc(feat.author)+'</span></div></a>'
     +'<div class="latest"><h3>الأحدث<small>latest</small></h3>'+latest.map((a,i)=>'<a href="#art-'+esc(a.id)+'"><span class="n">'+(i+1)+'</span><h4>'+esc(a.title)+'</h4><time>'+esc(isTr(a)?'مترجم · '+a.src.site:a.cat)+' · '+fmtDate(a.date)+'</time></a>').join('')+'</div>'
     +'</div></div></section>';
  }
  const bn=kind==='translated'
    ?banner({slim:true,crumbs:[['أكاديمية سُرى','academy'],['مقالات','articles'],['مقالات مترجمة']],eyebrow:'Translated',title:'مقالات مترجمة',
       text:'ملخصات عربية بتصرف لمقالات مختارة من مواقع متخصصة في صناعة الأفلام، مع اسم المصدر والكاتب ورابط المقال الأصلي في كل صفحة.',extra:kinds})
    :banner({slim:true,crumbs:[['أكاديمية سُرى','academy'],['مقالات']],eyebrow:'Sura Journal',title:'مقالات سُرى',
       text:'ما نتعلمه من كل مشروع نكتبه هنا: كيف نخطط، وما الذي ينجح في الموقع، وما الذي نغيّره في المرة التالية.',extra:kinds});
  return bn
   +(all.length?top
     +'<section class="a-sec"><div class="wrap">'+head(kind==='translated'?'كل المقالات المترجمة':'كل المقالات')
     +'<div class="filters" id="artF">'+cats.map(c=>'<button type="button" data-c="'+esc(c)+'"'+(c===artCat?' class="on"':'')+'>'+esc(c)+'</button>').join('')+'</div>'
     +(rest.length?'<div class="grid">'+rest.slice(0,artShown).map(artCard).join('')+'</div>':'<div class="empty">لا توجد مقالات في هذا التصنيف بعد.</div>')
     +(rest.length>artShown?'<div class="loadmore"><button class="btn" id="artMore" type="button">المزيد</button></div>':'')
     +'</div></section>'
    :'<section class="a-sec"><div class="wrap"><div class="empty">لم تُنشر مقالات بعد.'+(CAN_EDIT?' <a class="more" href="#write">اكتب أول مقال</a>':'')+'</div></div></section>');
}
BIND.articles=BIND.translated=r=>{
  $$('#artF button').forEach(b=>b.onclick=()=>{artCat=b.dataset.c;artShown=6;renderAcad({v:r.v},true)});
  const m=$('#artMore');if(m)m.onclick=()=>{artShown+=6;renderAcad({v:r.v},true)};
};

/* ---------- single article ---------- */
function srcBox(a,top){
  const s=a.src||{};const u=/^https?:\/\//i.test(s.url||'')?s.url:'';
  return '<aside class="src'+(top?' top':'')+'"><b>'+(top?'ملخص عربي بتصرف عن مقال منشور في '+esc(s.site):'المصدر')+'</b>'
   +'<dl><div><dt>الموقع</dt><dd>'+esc(s.site||'')+'</dd></div><div><dt>الكاتب</dt><dd>'+esc(s.author||s.site||'')+'</dd></div>'
   +(s.title?'<div><dt>العنوان الأصلي</dt><dd dir="ltr">'+esc(s.title)+'</dd></div>':'')+'</dl>'
   +(u?'<a class="more" href="'+esc(u)+'" target="_blank" rel="noopener">اقرأ المقال الأصلي كاملًا بالإنجليزية'+I.arrow+'</a>':'')+'</aside>';
}
function pArticle(id){
  const a=ARTICLES.find(x=>x.id===id);
  if(!a||(a.status==='draft'&&!CAN_EDIT))return banner({slim:true,crumbs:[['مقالات','articles']],title:'المقال غير موجود',text:'ربما حُذف المقال أو تغيّر رابطه.',extra:'<div class="row"><a class="btn solid" href="#articles">كل المقالات</a></div>'});
  const rel=visArticles().filter(x=>x.id!==a.id&&x.status!=='draft').sort((x,y)=>(y.cat===a.cat)-(x.cat===a.cat)).slice(0,3);
  return '<header class="art-top"><div class="wrap">'
   +'<nav class="crumbs" aria-label="مسار التصفح"><a href="#academy">الأكاديمية</a><span><a href="#articles">مقالات</a></span>'+(isTr(a)?'<span><a href="#translated">مقالات مترجمة</a></span>':'')+'<span>'+esc(a.cat)+'</span></nav>'
   +(a.status==='draft'?'<span class="draft-pill" style="justify-self:start">مسودة، لا يراها الزوار</span>':'<span class="tag">'+esc(a.cat)+'</span>')
   +'<h1>'+esc(a.title)+'</h1>'+(a.excerpt?'<p class="lead">'+esc(a.excerpt)+'</p>':'')
   +'<div class="byline"><span class="who"><span class="av"><span class="logo" aria-hidden="true"></span></span>'+(isTr(a)?'الكاتب: '+esc(a.src.author||a.src.site)+' · ترجمة وتلخيص: فريق سُرى':esc(a.author||'فريق سُرى'))+'</span><span>'+fmtDate(a.date)+'</span><span>'+readMins(a.body)+' دقائق قراءة</span>'
   +(CAN_EDIT?'<span class="owner-row"><a class="btn sm" href="#edit-'+esc(a.id)+'">تعديل</a></span>':'')+'</div>'
   +(isTr(a)?srcBox(a,true):'')
   +'</div></header>'
   +(a.cover?'<div class="art-cover"><img src="'+esc(img(a.cover))+'" alt=""></div>':'')
   +'<article class="prose">'+renderBody(a.body)+'</article>'
   +(isTr(a)?'<div class="prose" style="padding-top:0">'+srcBox(a,false)+'</div>':'')
   +'<div class="art-foot"><div class="tags">'+(a.tags||[]).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><button class="btn sm" type="button" id="copyArt">نسخ رابط المقال</button></div>'
   +(rel.length?'<section class="a-sec" style="padding-top:24px"><div class="wrap">'+head('اقرأ أيضًا')+'<div class="grid">'+rel.map(artCard).join('')+'</div></div></section>':'');
}
BIND.art=r=>{const b=$('#copyArt');if(b)b.onclick=()=>copyText(shareURL('art-'+r.id),b)};

/* ---------- tutorials ---------- */
let tutCat='الكل';
function pTutorials(){
  const cats=['الكل',...new Set(TUTORIALS.map(t=>t.cat))];
  const list=TUTORIALS.filter(t=>tutCat==='الكل'||t.cat===tutCat);
  return banner({slim:true,crumbs:[['أكاديمية سُرى','academy'],['شروحات']],eyebrow:'Tutorials',title:'شروحات',
     text:'خطوات عملية على البرامج والمعدات التي نستخدمها يوميًا. كل شرح مكتوب ليُطبَّق أثناء القراءة.'})
   +'<section class="a-sec"><div class="wrap"><div class="filters" id="tutF">'+cats.map(c=>'<button type="button" data-c="'+c+'"'+(c===tutCat?' class="on"':'')+'>'+c+'</button>').join('')+'</div>'
   +'<div class="grid">'+list.map(tutCard).join('')+'</div></div></section>';
}
BIND.tutorials=()=>{$$('#tutF button').forEach(b=>b.onclick=()=>{tutCat=b.dataset.c;renderAcad({v:'tutorials'},true)})};
function pTutorial(id){
  const t=TUTORIALS.find(x=>x.id===id);if(!t)return notFound('tutorials','الشرح');
  const more=TUTORIALS.filter(x=>x.id!==id).slice(0,3);
  return banner({slim:true,crumbs:[['الأكاديمية','academy'],['شروحات','tutorials'],[t.cat]],eyebrow:esc(t.tool),title:t.title,text:t.sum})
   +'<section class="a-sec"><div class="wrap detail"><div style="min-width:0"><img class="d-hero" src="'+MEDIA[t.img]+'" alt="">'
   +'<div class="d-sec" style="margin-top:28px"><h2>الخطوات</h2><ol class="steps">'+t.steps.map(s=>'<li><div><h4>'+esc(s[0])+'</h4><p>'+esc(s[1])+'</p></div></li>').join('')+'</ol>'
   +'<div class="note"><b>نصيحة من الفريق</b>'+esc(t.tip)+'</div></div></div>'
   +'<aside class="box"><h3>عن هذا الشرح</h3><dl class="facts"><div><dt>الأداة</dt><dd>'+esc(t.tool)+'</dd></div><div><dt>المستوى</dt><dd>'+t.level+'</dd></div><div><dt>وقت التطبيق</dt><dd>'+t.mins+' دقائق</dd></div><div><dt>عدد الخطوات</dt><dd>'+t.steps.length+'</dd></div></dl>'
   +'<p style="font-size:.9rem;color:var(--ink-2)">تريد التعمق في الموضوع مع مدرب؟</p><a class="btn dark" href="#courses">تصفّح الدورات</a></aside></div></section>'
   +'<section class="a-sec"><div class="wrap">'+head('شروحات أخرى','',['كل الشروحات','tutorials'])+'<div class="grid">'+more.map(tutCard).join('')+'</div></div></section>';
}

/* ---------- courses ---------- */
let crsCat='الكل',crsMode='الكل';
function pCourses(){
  const cats=['الكل',...new Set(COURSES.map(c=>c.cat))],modes=['الكل','حضوري','عن بُعد'];
  const list=COURSES.filter(c=>(crsCat==='الكل'||c.cat===crsCat)&&(crsMode==='الكل'||c.mode===crsMode));
  return banner({slim:true,crumbs:[['أكاديمية سُرى','academy'],['دورات']],eyebrow:'Courses',title:'دورات أكاديمية سُرى',
     text:'دورات قصيرة يقدمها فريق الإنتاج في سُرى، تُبنى على مشاريع حقيقية ويخرج منها المتدرب بعمل منجز. التسجيل مفتوح، ويُحدَّد موعد كل دورة عند اكتمال مجموعتها.'})
   +'<section class="a-sec"><div class="wrap"><div class="filters" id="crsF">'+cats.map(c=>'<button type="button" data-k="cat" data-c="'+c+'"'+(c===crsCat?' class="on"':'')+'>'+c+'</button>').join('')
   +'<span class="sep"></span>'+modes.slice(1).map(m=>'<button type="button" data-k="mode" data-c="'+m+'"'+(m===crsMode?' class="on"':'')+'>'+m+'</button>').join('')+'</div>'
   +(list.length?'<div class="grid g4">'+list.map(crsCard).join('')+'</div>':'<div class="empty">لا توجد دورات بهذا الاختيار حاليًا.</div>')
   +'<div class="cta-band" style="margin-top:44px"><div><h3>تدريب مخصص لفريق جهتك</h3><p>أي دورة هنا يمكن تقديمها لفريق جهة كاملة في مقرها، مع تعديل المحتوى على مشاريع الجهة نفسها.</p></div><a class="btn solid" href="#contact" data-svc="تدريب وأكاديمية">اطلب عرضًا تدريبيًا</a></div>'
   +'</div></section>';
}
BIND.courses=()=>{$$('#crsF button').forEach(b=>b.onclick=()=>{if(b.dataset.k==='cat')crsCat=b.dataset.c;else crsMode=(crsMode===b.dataset.c?'الكل':b.dataset.c);renderAcad({v:'courses'},true)})};
function pCourse(id){
  const c=COURSES.find(x=>x.id===id);if(!c)return notFound('courses','الدورة');
  return banner({slim:true,crumbs:[['الأكاديمية','academy'],['دورات','courses'],[c.cat]],eyebrow:c.mode+' · '+c.level,title:c.title,text:c.sum})
   +'<section class="a-sec"><div class="wrap detail"><div style="min-width:0"><img class="d-hero" src="'+MEDIA[c.img]+'" alt="">'
   +'<div class="d-sec" style="margin-top:28px"><h2>ماذا ستتعلم</h2><ul class="checks">'+c.learn.map(l=>'<li>'+esc(l)+'</li>').join('')+'</ul></div>'
   +'<div class="d-sec"><h2>محاور الدورة</h2><div class="outline">'+c.outline.map((o,i)=>'<details'+(i===0?' open':'')+'><summary><i>'+(i+1)+'</i>'+esc(o[0])+'</summary><p>'+esc(o[1])+'</p></details>').join('')+'</div></div>'
   +'<div class="d-sec"><h2>لمن هذه الدورة</h2><p style="color:var(--ink-2)">'+esc(c.who)+'</p><div class="note"><b>المتطلبات</b>'+esc(c.req)+'</div></div></div>'
   +'<aside class="box" id="reg"><h3>بيانات الدورة</h3><dl class="facts"><div><dt>المدة</dt><dd>'+c.hours+' ساعة</dd></div><div><dt>الجلسات</dt><dd>'+c.sessions+'</dd></div><div><dt>المستوى</dt><dd>'+c.level+'</dd></div><div><dt>الحضور</dt><dd>'+c.mode+'</dd></div><div><dt>اللغة</dt><dd>العربية</dd></div><div><dt>الشهادة</dt><dd>شهادة حضور من سُرى</dd></div></dl>'
   +'<form class="pform" id="regF" novalidate><h3>سجّل اهتمامك</h3><label for="r-name">الاسم<input id="r-name" required autocomplete="name"></label><label for="r-phone">الجوال<input id="r-phone" type="tel" dir="ltr" autocomplete="tel"></label><label for="r-city">المدينة<input id="r-city"></label>'
   +'<label for="r-type">نوع التسجيل<select id="r-type"><option>فردي</option><option>فريق جهة</option></select></label><button class="btn dark" type="submit">إرسال عبر واتساب</button><p id="regOut" style="font-size:.85rem;color:var(--ink-2)" hidden></p></form></aside></div></section>';
}
BIND.crs=r=>{const c=COURSES.find(x=>x.id===r.id);const f=$('#regF');if(!f)return;
  f.onsubmit=e=>{e.preventDefault();const n=$('#r-name');if(!n.value.trim()){n.focus();n.style.borderColor='#B65C43';return}
    const t='مرحبًا أكاديمية سُرى،\nأرغب في التسجيل في دورة: '+c.title+'\nالاسم: '+n.value.trim()+($('#r-phone').value.trim()?'\nالجوال: '+$('#r-phone').value.trim():'')+($('#r-city').value.trim()?'\nالمدينة: '+$('#r-city').value.trim():'')+'\nنوع التسجيل: '+$('#r-type').value;
    const out=$('#regOut');out.hidden=false;out.innerHTML='رسالتك جاهزة. <a class="more" href="'+waLink(t)+'" target="_blank" rel="noopener">افتح واتساب لإرسالها'+I.arrow+'</a>'}};

/* ---------- tools & resources ---------- */
function pTools(){
  return banner({slim:true,crumbs:[['أكاديمية سُرى','academy'],['ملحقات وأدوات']],eyebrow:'Toolkit',title:'ملحقات وأدوات',
     text:'حاسبات تعمل من المتصفح مباشرة، وقوالب وملفات نستخدمها في مشاريعنا ونرسلها عند الطلب.'})
   +'<section class="a-sec"><div class="wrap">'+head('أدوات تعمل الآن','تفتح في الصفحة نفسها ولا تحتاج تسجيلًا.')
   +'<div class="grid g4">'+TOOLS.map(t=>'<a class="card" href="#tool-'+t.id+'"><div class="im" style="aspect-ratio:16/9;background:var(--night);display:grid;place-items:center"><span class="latin" style="font-size:2.6rem;color:var(--gold-hi)">'+t.fx+'</span></div><div class="bd"><h3>'+t.title+'</h3><p>'+t.desc+'</p></div><div class="foot"><span>أداة تفاعلية</span><b>افتح الأداة</b></div></a>').join('')+'</div></div></section>'
   +'<section class="a-sec"><div class="wrap">'+head('ملحقات للتحميل','نرسل الملف على واتساب عند الطلب.')
   +'<div class="res-list">'+RESOURCES.map(r=>'<a class="res" href="#res-'+r.id+'"><span class="fx">'+r.fx+'</span><div><h4>'+r.title+'</h4><p>'+r.desc+'</p></div><span class="more">التفاصيل'+I.arrow+'</span></a>').join('')+'</div></div></section>';
}
function pRes(id){
  const r=RESOURCES.find(x=>x.id===id);if(!r)return notFound('tools','الملف');
  const msg='مرحبًا سُرى،\nأرغب في الحصول على: '+r.title;
  return banner({slim:true,crumbs:[['الأكاديمية','academy'],['ملحقات وأدوات','tools'],[r.title]],eyebrow:r.fx,title:r.title,text:r.desc})
   +'<section class="a-sec"><div class="wrap detail"><div class="d-sec" style="min-width:0"><h2>محتوى الملف</h2><ul class="checks">'+r.items.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul>'
   +'<div class="note"><b>الصيغة</b>'+esc(r.fmt)+'</div></div>'
   +'<aside class="box"><h3>اطلب الملف</h3><p style="font-size:.92rem;color:var(--ink-2)">نرسل الملف على واتساب مع طريقة تثبيته واستخدامه.</p><a class="btn dark" href="'+waLink(msg)+'" target="_blank" rel="noopener">اطلب عبر واتساب</a><a class="more" href="#tools">كل الملحقات'+I.arrow+'</a></aside></div></section>';
}

const CODECS=[['H.264 ‏1080p ‏(50 Mb/s)',50],['H.264 ‏4K ‏(100 Mb/s)',100],['H.265 ‏4K 10-bit ‏(150 Mb/s)',150],['ProRes 422 ‏1080p',147],['ProRes 422 HQ ‏1080p',220],['ProRes 422 ‏4K UHD',471],['ProRes 422 HQ ‏4K UHD',707]];
const SIZES=[['يوتيوب أفقي','1920 × 1080','16:9'],['ريلز وتيك توك وسناب','1080 × 1920','9:16'],['منشور إنستقرام عمودي','1080 × 1350','4:5'],['منشور مربع','1080 × 1080','1:1'],['شاشات العرض 4K','3840 × 2160','16:9'],['سينمائي عريض','3840 × 1608','2.39:1']];
function pTool(id){
  const t=TOOLS.find(x=>x.id===id);if(!t)return notFound('tools','الأداة');
  let ui='';
  if(id==='storage')ui='<div class="tool-ui pform"><div class="two"><label for="st-c">الترميز ومعدل البيانات<select id="st-c">'+CODECS.map((c,i)=>'<option value="'+c[1]+'"'+(i===1?' selected':'')+'>'+c[0]+'</option>').join('')+'<option value="custom">إدخال يدوي</option></select></label>'
     +'<label for="st-m">معدل البيانات (Mb/s)<input id="st-m" type="number" min="1" value="100" dir="ltr"></label>'
     +'<label for="st-h">مدة التصوير (ساعات)<input id="st-h" type="number" min="0" step="0.5" value="4" dir="ltr"></label>'
     +'<label for="st-n">عدد الكاميرات<input id="st-n" type="number" min="1" value="2" dir="ltr"></label></div>'
     +'<div class="result"><small>المساحة المتوقعة</small><b id="st-r"></b><span id="st-s"></span></div>'
     +'<div class="tw"><table class="mini-table"><thead><tr><th>الترميز</th><th>ساعة واحدة لكل كاميرا</th></tr></thead><tbody>'+CODECS.map(c=>'<tr><td>'+c[0]+'</td><td dir="ltr" style="text-align:end">'+(c[1]*3600/8/1000).toFixed(0)+' GB</td></tr>').join('')+'</tbody></table></div>'
     +'<p style="font-size:.85rem;color:var(--ink-2)">الأرقام تقريبية بمعدل 30 إطارًا في الثانية، وتختلف بحسب الكاميرا وإعداداتها.</p></div>';
  if(id==='aspect')ui='<div class="tool-ui pform"><div class="two"><label for="as-w">العرض بالبكسل<input id="as-w" type="number" min="1" value="1920" dir="ltr"></label>'
     +'<label for="as-r">النسبة<select id="as-r"><option value="16/9">16:9</option><option value="9/16">9:16</option><option value="4/5">4:5</option><option value="1/1">1:1</option><option value="4/3">4:3</option><option value="2.39/1">2.39:1</option><option value="1.85/1">1.85:1</option></select></label></div>'
     +'<div class="result"><small>الارتفاع المناسب</small><b id="as-out"></b><span>يُقرَّب إلى رقم زوجي ليتوافق مع أغلب برامج الترميز.</span></div>'
     +'<div class="two"><label for="as-a">عرض لقطة لديك<input id="as-a" type="number" min="1" value="3840" dir="ltr"></label><label for="as-b">ارتفاعها<input id="as-b" type="number" min="1" value="2160" dir="ltr"></label></div>'
     +'<p id="as-ratio" style="font-size:.95rem"></p>'
     +'<div class="tw"><table class="mini-table"><thead><tr><th>المنصة</th><th>المقاس</th><th>النسبة</th></tr></thead><tbody>'+SIZES.map(s=>'<tr><td>'+s[0]+'</td><td dir="ltr" style="text-align:end">'+s[1]+'</td><td dir="ltr" style="text-align:end">'+s[2]+'</td></tr>').join('')+'</tbody></table></div></div>';
  if(id==='voiceover')ui='<div class="tool-ui pform"><label for="vo-t">نص التعليق<textarea id="vo-t" rows="7">في كل مشروع نبدأ بسؤال واحد: ماذا يجب أن يعرف المشاهد عندما ينتهي الفيلم؟ ومن هذا السؤال نكتب النص ونختار اللقطات ونرتب المقابلات.</textarea></label>'
     +'<div class="two"><label for="vo-p">سرعة القراءة<select id="vo-p"><option value="100">هادئة، 100 كلمة في الدقيقة</option><option value="120" selected>متوسطة، 120 كلمة في الدقيقة</option><option value="140">سريعة، 140 كلمة في الدقيقة</option></select></label>'
     +'<label for="vo-s">أو حدد مدة مستهدفة (ثانية)<input id="vo-s" type="number" min="5" value="60" dir="ltr"></label></div>'
     +'<div class="result"><small>المدة المتوقعة للنص</small><b id="vo-r"></b><span id="vo-x"></span></div>'
     +'<p style="font-size:.85rem;color:var(--ink-2)">تقدير تقريبي للقراءة بالعربية الفصحى، ويتغير مع الوقفات وأسلوب المعلق.</p></div>';
  if(id==='checklist'){
    let k=0;ui='<div class="tool-ui"><div class="stat-row"><span>التقدم</span><b id="cl-c"></b></div><div class="prog"><i id="cl-p"></i></div><ul class="cl">'
     +Object.entries(CHECK).map(([g,items])=>'<li style="border:0"><h4>'+g+'</h4></li>'+items.map(it=>{const id='cl-'+(k++);return '<li><label for="'+id+'"><input type="checkbox" id="'+id+'"><span>'+esc(it)+'</span></label></li>'}).join('')).join('')
     +'</ul><div><button class="btn sm" type="button" id="cl-reset">مسح العلامات</button></div><p style="font-size:.85rem;color:var(--ink-2)">تُحفظ علاماتك على هذا الجهاز فقط.</p></div>';
  }
  const others=TOOLS.filter(x=>x.id!==id);
  return banner({slim:true,crumbs:[['الأكاديمية','academy'],['ملحقات وأدوات','tools'],[t.title]],eyebrow:'Toolkit',title:t.title,text:t.desc})
   +'<section class="a-sec"><div class="wrap detail"><div style="min-width:0">'+ui+'</div><aside class="box"><h3>أدوات أخرى</h3>'
   +others.map(o=>'<a class="more" href="#tool-'+o.id+'">'+o.title+I.arrow+'</a>').join('')+'<a class="btn dark" href="#tools">كل الملحقات والأدوات</a></aside></div></section>';
}
BIND.tool=r=>{
  if(r.id==='storage'){const c=$('#st-c'),m=$('#st-m'),h=$('#st-h'),n=$('#st-n');
    const calc=()=>{if(c.value!=='custom')m.value=c.value;const gb=(+m.value||0)*(+h.value||0)*3600/8/1000*(+n.value||1);
      $('#st-r').textContent=gb>=1000?(gb/1000).toFixed(2)+' TB':gb.toFixed(0)+' GB';
      $('#st-s').textContent='مع نسخة احتياطية ثانية تحتاج '+(gb*2>=1000?(gb*2/1000).toFixed(2)+' TB':(gb*2).toFixed(0)+' GB')+' على الأقراص.'};
    c.onchange=calc;[m,h,n].forEach(x=>x.oninput=()=>{if(x===m)c.value='custom';calc()});calc()}
  if(r.id==='aspect'){const w=$('#as-w'),ra=$('#as-r'),a=$('#as-a'),b=$('#as-b');
    const gcd=(x,y)=>y?gcd(y,x%y):x;
    const calc=()=>{const [p,q]=ra.value.split('/').map(Number);let hh=Math.round((+w.value||0)*q/p);if(hh%2)hh+=1;$('#as-out').textContent=(+w.value||0)+' × '+hh;
      const A=Math.round(+a.value||0),B=Math.round(+b.value||0);if(A&&B){const g=gcd(A,B);$('#as-ratio').innerHTML='نسبة لقطتك: <b dir="ltr">'+(A/g)+':'+(B/g)+'</b> أي <b dir="ltr">'+(A/B).toFixed(2)+':1</b>'}};
    [w,ra,a,b].forEach(x=>x.oninput=calc);ra.onchange=calc;calc()}
  if(r.id==='voiceover'){const t=$('#vo-t'),p=$('#vo-p'),s=$('#vo-s');
    const calc=()=>{const n=words(t.value),wpm=+p.value,sec=Math.round(n/wpm*60);
      $('#vo-r').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
      $('#vo-x').textContent=n+' كلمة. لمدة '+(+s.value||0)+' ثانية اكتب نحو '+Math.round((+s.value||0)*wpm/60)+' كلمة.'};
    [t,s].forEach(x=>x.oninput=calc);p.onchange=calc;calc()}
  if(r.id==='checklist'){const boxes=$$('.cl input');let st={};try{st=JSON.parse(ls.get('sura-checklist')||'{}')}catch(e){}
    const upd=()=>{const d=boxes.filter(b=>b.checked).length;$('#cl-c').textContent=d+' من '+boxes.length;$('#cl-p').style.width=(d/boxes.length*100)+'%'};
    boxes.forEach(b=>{b.checked=!!st[b.id];b.onchange=()=>{st[b.id]=b.checked;ls.set('sura-checklist',JSON.stringify(st));upd()}});
    $('#cl-reset').onclick=()=>{st={};ls.del('sura-checklist');boxes.forEach(b=>b.checked=false);upd()};upd()}
};

function notFound(back,what){return banner({slim:true,crumbs:[['الأكاديمية','academy']],title:what+' غير موجود',text:'ربما تغيّر الرابط.',extra:'<div class="row"><a class="btn solid" href="#'+back+'">العودة</a></div>'})}

/* ============================================================
   EDITOR (owner only)
   ============================================================ */
function locked(){return banner({slim:true,crumbs:[['مقالات','articles']],title:'هذه الصفحة لمالك الموقع',text:'الكتابة والتعديل متاحان عند فتح الموقع من حساب المالك في Claude. الزوار يرون المقالات المنشورة فقط.',extra:'<div class="row"><a class="btn solid" href="#articles">العودة إلى المقالات</a></div>'})}
const PHOTO_KEYS=()=>Object.keys(MEDIA).filter(k=>k!=='logo'&&!k.startsWith('logos'));
let ED=null;

function pEditor(id){
  if(!CAN_EDIT)return locked();
  const src=id?ARTICLES.find(a=>a.id===id):null;
  if(id&&!src)return notFound('manage','المقال');
  ED=src?JSON.parse(JSON.stringify(src)):{id:'',title:'',excerpt:'',cat:catsOf()[0]||'تصوير',cover:'m:p27',author:'فريق سُرى',date:today(),tags:[],status:'published',featured:false,body:''};
  ED._key='sura-draft-'+(id||'new');
  const cats=catsOf();if(ED.cat&&!cats.includes(ED.cat))cats.push(ED.cat);
  const local=ls.get(ED._key);
  const tbtn=(cmd,label,title,arg)=>'<button type="button" data-cmd="'+cmd+'"'+(arg?' data-arg="'+arg+'"':'')+' title="'+title+'" aria-label="'+title+'">'+label+'</button>';
  return banner({slim:true,crumbs:[['مقالات','articles'],[id?'تعديل مقال':'مقال جديد']],title:id?'تعديل المقال':'مقال جديد',text:'اكتب المقال ونسّقه من شريط الأدوات، ثم انشره ليظهر لزوار الموقع.'})
   +'<section class="a-sec"><div class="wrap">'
   +(local?'<div class="note" id="restore" style="margin-bottom:18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between"><span><b style="display:inline">مسودة محفوظة على هذا الجهاز</b> من آخر تحرير لم يُنشر.</span><span style="display:flex;gap:8px"><button class="btn sm dark" type="button" id="rs-yes">استعادتها</button><button class="btn sm" type="button" id="rs-no">تجاهلها</button></span></div>':'')
   +'<div class="ed"><div class="ed-main">'
   +'<input class="ed-title" id="e-title" placeholder="عنوان المقال" value="'+esc(ED.title)+'" aria-label="عنوان المقال">'
   +'<textarea class="ed-ex" id="e-ex" rows="2" placeholder="مقدمة قصيرة تظهر في البطاقات وأعلى المقال" aria-label="المقدمة">'+esc(ED.excerpt)+'</textarea>'
   +'<div class="tb" id="tb" role="toolbar" aria-label="أدوات التنسيق">'
   +tbtn('formatBlock','<b>ع</b>','عنوان رئيسي','h2')+tbtn('formatBlock','<b style="font-size:.8em">ع</b>','عنوان فرعي','h3')+tbtn('formatBlock','¶','فقرة','p')+'<span class="sp"></span>'
   +tbtn('bold','<b>B</b>','عريض')+tbtn('italic','<i>I</i>','مائل')+tbtn('underline','<u>U</u>','تسطير')+'<span class="sp"></span>'
   +tbtn('formatBlock','<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3l-2 4Zm8 0h3l2-4V7h-6v6h3l-2 4Z"/></svg>','اقتباس','blockquote')
   +tbtn('insertUnorderedList','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 6h10M10 12h10M10 18h10"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="18" r="1" fill="currentColor"/></svg>','قائمة نقطية')
   +tbtn('insertOrderedList','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1V9M4 14h2.5L4 17h3"/></svg>','قائمة مرقمة')+'<span class="sp"></span>'
   +tbtn('link','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>','رابط')
   +tbtn('image','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>','صورة')
   +tbtn('insertHorizontalRule','—','فاصل')+'<span class="sp"></span>'
   +tbtn('removeFormat','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 5h12M12 5 9 19M4 20 20 4"/></svg>','مسح التنسيق')
   +tbtn('undo','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 7h-6a5 5 0 0 0 0 10h6M15 7l-3-3m3 3-3 3" transform="matrix(-1 0 0 1 24 0)"/></svg>','تراجع')
   +tbtn('redo','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 7h-6a5 5 0 0 0 0 10h6M15 7l-3-3m3 3-3 3"/></svg>','إعادة')
   +'</div>'
   +'<div class="linkpop" id="lpop" hidden><input id="lp-url" type="url" dir="ltr" placeholder="https://"><button class="btn sm dark" type="button" id="lp-ok">إضافة الرابط</button><button class="btn sm" type="button" id="lp-x">إلغاء</button></div>'
   +'<input type="file" id="e-imgfile" accept="image/*" hidden>'
   +'<div class="ed-body prose" id="e-body" contenteditable="true" data-ph="ابدأ الكتابة هنا…" role="textbox" aria-multiline="true" aria-label="نص المقال">'+clean(ED.body)+'</div>'
   +'<article class="prose ed-body" id="e-prev" hidden></article>'
   +'</div>'
   +'<aside class="ed-side">'
   +'<div class="panel"><h4>النشر</h4><div class="pform" style="gap:8px"><label class="chk"><input type="radio" name="e-st" value="published"'+(ED.status!=='draft'?' checked':'')+'> منشور للزوار</label><label class="chk"><input type="radio" name="e-st" value="draft"'+(ED.status==='draft'?' checked':'')+'> مسودة لا يراها الزوار</label><label class="chk"><input type="checkbox" id="e-feat"'+(ED.featured?' checked':'')+'> تثبيته في «اقرأها اليوم»</label></div>'
   +'<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn solid" type="button" id="e-save">حفظ ونشر</button><button class="btn" type="button" id="e-preview">معاينة</button></div>'
   +'<div class="stat-row"><span>الكلمات</span><b id="e-words">0</b></div><div class="stat-row"><span>وقت القراءة</span><b id="e-mins">1 د</b></div>'
   +(id?'<button class="btn danger sm" type="button" id="e-del" style="justify-self:start">حذف المقال</button><div class="confirm" id="e-conf" hidden><span>سيُحذف المقال من الموقع لكل الزوار. متابعة؟</span><div class="row"><button class="btn danger sm" type="button" id="e-del-yes">نعم، احذفه</button><button class="btn sm" type="button" id="e-del-no">إلغاء</button></div></div>':'')
   +'</div>'
   +'<div class="panel"><h4>صورة الغلاف</h4><div class="cover-pick" id="e-cov">'+(ED.cover?'<img src="'+esc(img(ED.cover))+'" alt="">':'بلا صورة')+'</div>'
   +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm dark" type="button" id="e-cov-up">رفع صورة</button><button class="btn sm" type="button" id="e-cov-gal">من صور سُرى</button><button class="btn sm" type="button" id="e-cov-x">إزالة</button></div>'
   +'<input type="file" id="e-covfile" accept="image/*" hidden><div class="gal" id="e-gal" hidden>'+PHOTO_KEYS().map(k=>'<button type="button" data-k="'+k+'"'+(ED.cover==='m:'+k?' class="on"':'')+' aria-label="اختيار صورة"><img src="'+MEDIA[k]+'" alt="" loading="lazy"></button>').join('')+'</div></div>'
   +'<div class="panel pform"><h4>مقال مترجم</h4><label class="chk"><input type="checkbox" id="e-tr"'+(ED.kind==='translated'?' checked':'')+'> هذا المقال مترجم أو ملخص عن مصدر آخر</label>'
   +'<div id="e-src" class="pform"'+(ED.kind==='translated'?'':' hidden')+'><label for="e-s-site">اسم الموقع المصدر<input id="e-s-site" value="'+esc((ED.src||{}).site||'')+'"></label><label for="e-s-author">كاتب المقال الأصلي<input id="e-s-author" value="'+esc((ED.src||{}).author||'')+'" placeholder="اتركه فارغًا ليظهر اسم الموقع"></label><label for="e-s-title">العنوان الأصلي<input id="e-s-title" dir="ltr" value="'+esc((ED.src||{}).title||'')+'"></label><label for="e-s-url">رابط المقال الأصلي<input id="e-s-url" type="url" dir="ltr" value="'+esc((ED.src||{}).url||'')+'"></label></div></div>'
   +'<div class="panel pform"><h4>التفاصيل</h4>'
   +'<label for="e-cat">التصنيف<select id="e-cat">'+cats.map(c=>'<option'+(c===ED.cat?' selected':'')+'>'+esc(c)+'</option>').join('')+'<option value="__new">تصنيف جديد…</option></select></label>'
   +'<label for="e-newcat" id="e-newcat-w" hidden>اسم التصنيف الجديد<input id="e-newcat"></label>'
   +'<label for="e-author">الكاتب<input id="e-author" value="'+esc(ED.author)+'"></label>'
   +'<label for="e-date">تاريخ النشر<input id="e-date" type="date" value="'+esc(ED.date)+'" dir="ltr"></label>'
   +'<label for="e-tags">وسوم، تفصل بينها فاصلة<input id="e-tags" value="'+esc((ED.tags||[]).join('، '))+'"></label></div>'
   +'</aside></div></div></section>';
}

function resizeImage(file,max,q){
  return new Promise((res,rej)=>{
    if(!file||!/^image\//.test(file.type)){rej(new Error('type'));return}
    const fr=new FileReader();fr.onerror=()=>rej(fr.error);
    fr.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('decode'));im.onload=()=>{
      const s=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
      let u=c.toDataURL('image/webp',q);if(!u.startsWith('data:image/webp'))u=c.toDataURL('image/jpeg',q);res(u)};im.src=fr.result};
    fr.readAsDataURL(file);
  });
}

BIND.write=BIND.edit=r=>{
  if(!CAN_EDIT||!ED)return;
  const body=$('#e-body'),title=$('#e-title'),ex=$('#e-ex');
  try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
  let savedRange=null;
  const saveSel=()=>{const s=getSelection();if(s.rangeCount&&body.contains(s.anchorNode))savedRange=s.getRangeAt(0).cloneRange()};
  const restoreSel=()=>{body.focus();if(savedRange){const s=getSelection();s.removeAllRanges();s.addRange(savedRange)}};
  const collect=()=>{
    ED.title=title.value.trim();ED.excerpt=ex.value.trim();ED.body=clean(body.innerHTML);
    const c=$('#e-cat').value;ED.cat=c==='__new'?($('#e-newcat').value.trim()||'عام'):c;
    ED.author=$('#e-author').value.trim()||'فريق سُرى';ED.date=$('#e-date').value||today();
    ED.tags=$('#e-tags').value.split(/[,،]/).map(s=>s.trim()).filter(Boolean);
    ED.status=($('input[name="e-st"]:checked')||{}).value||'published';ED.featured=$('#e-feat').checked;
    if($('#e-tr').checked){const site=$('#e-s-site').value.trim();ED.kind='translated';ED.src={site:site||'مصدر خارجي',author:$('#e-s-author').value.trim()||site||'مصدر خارجي',title:$('#e-s-title').value.trim(),url:$('#e-s-url').value.trim()}}else{delete ED.kind;delete ED.src}
  };
  const stats=()=>{const n=words(body.textContent||'');$('#e-words').textContent=n;$('#e-mins').textContent=Math.max(1,Math.ceil(n/180))+' د'};
  let saveT;const autosave=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{collect();const d=Object.assign({},ED);delete d._key;ls.set(ED._key,JSON.stringify(d))},1200)};
  [title,ex].forEach(x=>x.addEventListener('input',autosave));
  body.addEventListener('input',()=>{stats();autosave()});
  $$('.panel input,.panel select').forEach(x=>x.addEventListener('change',autosave));
  stats();

  /* restore local draft */
  const rs=$('#restore');
  if(rs){$('#rs-yes').onclick=()=>{try{const d=JSON.parse(ls.get(ED._key));const key=ED._key;ED=Object.assign(ED,d,{_key:key});
      title.value=ED.title||'';ex.value=ED.excerpt||'';body.innerHTML=clean(ED.body);setCover(ED.cover);$('#e-author').value=ED.author||'';$('#e-date').value=ED.date||today();$('#e-tags').value=(ED.tags||[]).join('، ');
      const cs=$('#e-cat');if(![...cs.options].some(o=>o.value===ED.cat)){const o=document.createElement('option');o.textContent=ED.cat;cs.insertBefore(o,cs.lastElementChild)}cs.value=ED.cat;
      $$('input[name="e-st"]').forEach(x=>x.checked=x.value===(ED.status||'published'));$('#e-feat').checked=!!ED.featured;stats()}catch(e){}rs.remove()};
    $('#rs-no').onclick=()=>{ls.del(ED._key);rs.remove()}}

  /* toolbar */
  const tb=$('#tb');
  tb.addEventListener('mousedown',e=>{if(e.target.closest('button'))e.preventDefault()});
  tb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const cmd=b.dataset.cmd,arg=b.dataset.arg;
    if(cmd==='link'){saveSel();$('#lpop').hidden=false;$('#lp-url').value='';$('#lp-url').focus();return}
    if(cmd==='image'){saveSel();$('#e-imgfile').click();return}
    body.focus();
    if(cmd==='formatBlock'){const cur=(document.queryCommandValue('formatBlock')||'').toLowerCase();document.execCommand('formatBlock',false,(cur===arg&&arg!=='p')?'<p>':'<'+arg+'>')}
    else document.execCommand(cmd,false,null);
    syncTb();stats();autosave()});
  const syncTb=()=>{$$('#tb button').forEach(b=>{const c=b.dataset.cmd;let on=false;
    try{if(['bold','italic','underline','insertUnorderedList','insertOrderedList'].includes(c))on=document.queryCommandState(c);
      else if(c==='formatBlock'&&b.dataset.arg!=='p')on=(document.queryCommandValue('formatBlock')||'').toLowerCase()===b.dataset.arg}catch(e){}
    b.classList.toggle('on',on)})};
  document.addEventListener('selectionchange',()=>{if(document.activeElement===body)syncTb()});

  $('#lp-ok').onclick=()=>{let u=$('#lp-url').value.trim();if(!u){$('#lpop').hidden=true;return}
    if(!/^(https?:|mailto:)/i.test(u))u='https://'+u;restoreSel();
    const s=getSelection();if(s.isCollapsed)document.execCommand('insertHTML',false,'<a href="'+esc(u)+'">'+esc(u)+'</a>');else document.execCommand('createLink',false,u);
    $('#lpop').hidden=true;autosave()};
  $('#lp-x').onclick=()=>{$('#lpop').hidden=true;restoreSel()};
  $('#lp-url').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#lp-ok').click()}});

  $('#e-imgfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
    try{const u=await resizeImage(f,1400,.8);restoreSel();document.execCommand('insertHTML',false,'<figure><img src="'+u+'" alt=""><figcaption>وصف الصورة</figcaption></figure><p><br></p>');autosave()}
    catch(err){toast('تعذّر قراءة الصورة. جرّب صورة بصيغة JPG أو PNG.',true)}};

  /* paste: keep structure, drop styling */
  body.addEventListener('paste',e=>{const cd=e.clipboardData;if(!cd)return;e.preventDefault();
    const h=cd.getData('text/html');
    if(h)document.execCommand('insertHTML',false,clean(h));
    else{const t=cd.getData('text/plain');document.execCommand('insertHTML',false,t.split(/\n{2,}/).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join(''))}
    stats();autosave()});

  /* cover */
  function setCover(c){ED.cover=c||'';const box=$('#e-cov');box.innerHTML=c?'<img src="'+esc(img(c))+'" alt="">':'بلا صورة';$$('#e-gal button').forEach(b=>b.classList.toggle('on','m:'+b.dataset.k===c))}
  $('#e-cov-up').onclick=()=>$('#e-covfile').click();
  $('#e-covfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{setCover(await resizeImage(f,1600,.8));autosave()}catch(err){toast('تعذّر قراءة الصورة.',true)}};
  $('#e-cov-gal').onclick=()=>{$('#e-gal').hidden=!$('#e-gal').hidden};
  $('#e-gal').onclick=e=>{const b=e.target.closest('button');if(b){setCover('m:'+b.dataset.k);autosave()}};
  $('#e-cov-x').onclick=()=>{setCover('');autosave()};
  $('#e-tr').onchange=()=>{$('#e-src').hidden=!$('#e-tr').checked;autosave()};
  $('#e-cat').onchange=()=>{$('#e-newcat-w').hidden=$('#e-cat').value!=='__new';if($('#e-cat').value==='__new')$('#e-newcat').focus()};

  /* preview */
  $('#e-preview').onclick=()=>{const p=$('#e-prev');const on=p.hidden;collect();
    if(on){p.innerHTML=(ED.cover?'<img src="'+esc(img(ED.cover))+'" alt="">':'')+'<h1 style="font-size:2rem">'+esc(ED.title||'بلا عنوان')+'</h1>'+renderBody(ED.body)}
    p.hidden=!on;body.hidden=on;tb.hidden=on;$('#e-preview').textContent=on?'عودة للتحرير':'معاينة'};

  /* save */
  $('#e-save').onclick=async()=>{collect();
    if(!ED.title){toast('أضف عنوانًا للمقال قبل الحفظ.',true);title.focus();return}
    if(!textOf(ED.body).trim()&&!/<img/i.test(ED.body)){toast('نص المقال فارغ.',true);body.focus();return}
    const isNew=!ED.id;if(isNew)ED.id='a'+Date.now().toString(36);
    const art=Object.assign({},ED);delete art._key;
    let next=ARTICLES.filter(a=>a.id!==art.id);
    if(art.featured)next=next.map(a=>Object.assign({},a,{featured:false}));
    next.unshift(art);
    const btn=$('#e-save');btn.disabled=true;
    const ok=await commit(next,'art-'+art.id,art.status==='draft'?'حُفظت المسودة':'نُشر المقال',ED._key);
    if(!ok){btn.disabled=false;if(isNew)ED.id=''}
  };
  const del=$('#e-del');
  if(del){del.onclick=()=>{$('#e-conf').hidden=false;del.hidden=true};$('#e-del-no').onclick=()=>{$('#e-conf').hidden=true;del.hidden=false};
    $('#e-del-yes').onclick=async()=>{$('#e-del-yes').disabled=true;const ok=await commit(ARTICLES.filter(a=>a.id!==ED.id),'manage','حُذف المقال',ED._key);if(!ok)$('#e-del-yes').disabled=false}}
};

/* ---------- manage ---------- */
function pManage(){
  if(!CAN_EDIT)return locked();
  const all=visArticles();
  return banner({slim:true,crumbs:[['مقالات','articles'],['إدارة المقالات']],title:'إدارة المقالات',text:'كل المقالات المنشورة والمسودات. التعديل والحذف والتثبيت من هنا.',extra:'<div class="row"><a class="btn solid" href="#write">اكتب مقالًا جديدًا</a></div>'})
   +'<section class="a-sec"><div class="wrap" style="display:grid;gap:24px">'
   +'<div class="tw"><table class="mtable"><thead><tr><th>العنوان</th><th>التصنيف</th><th>التاريخ</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>'
   +(all.length?all.map(a=>'<tr><td class="t"><a href="#art-'+esc(a.id)+'">'+esc(a.title)+'</a>'+(a.featured?' <span class="tag">اقرأها اليوم</span>':'')+(isTr(a)?' <span class="tr-pill">مترجم</span>':'')+'</td><td>'+esc(a.cat)+'</td><td style="white-space:nowrap">'+fmtDate(a.date)+'</td><td>'+(a.status==='draft'?'<span class="draft-pill">مسودة</span>':'منشور')+'</td>'
     +'<td><div class="acts"><a class="btn sm" href="#edit-'+esc(a.id)+'">تعديل</a>'+(a.status!=='draft'&&!a.featured?'<button class="btn sm" type="button" data-feat="'+esc(a.id)+'">تثبيت</button>':'')+'<button class="btn sm danger" type="button" data-del="'+esc(a.id)+'">حذف</button></div><div class="confirm" data-conf="'+esc(a.id)+'" hidden><span>حذف المقال نهائيًا؟</span><div class="row"><button class="btn sm danger" type="button" data-yes="'+esc(a.id)+'">نعم</button><button class="btn sm" type="button" data-no="'+esc(a.id)+'">إلغاء</button></div></div></td></tr>').join('')
     :'<tr><td colspan="5">لا توجد مقالات.</td></tr>')
   +'</tbody></table></div>'
   +'<div class="panel" style="max-width:560px"><h4>لوحة التحكم</h4><p style="font-size:.9rem;color:var(--ink-2)">الحجوزات والطلبات والعملاء ونصوص الموقع وصوره تُدار من لوحة التحكم.</p><a class="btn dark sm" href="/admin" style="justify-self:start">فتح لوحة التحكم</a>'
   +'</div></div></section>';
}
BIND.manage=()=>{
  const v=$('#view-acad');
  v.onclick=async e=>{const t=e.target.closest('button');if(!t)return;
    if(t.dataset.del){$('[data-conf="'+t.dataset.del+'"]').hidden=false;return}
    if(t.dataset.no){$('[data-conf="'+t.dataset.no+'"]').hidden=true;return}
    if(t.dataset.yes){t.disabled=true;const ok=await commit(ARTICLES.filter(a=>a.id!==t.dataset.yes),'manage','حُذف المقال');if(!ok)t.disabled=false;return}
    if(t.dataset.feat){t.disabled=true;const ok=await commit(ARTICLES.map(a=>Object.assign({},a,{featured:a.id===t.dataset.feat})),'articles','ثُبّت المقال في «اقرأها اليوم»');if(!ok)t.disabled=false;return}
  };
};

/* ============================================================
   start
   ============================================================ */
const clearKey=ss.get('sura-clear');if(clearKey){ls.del(clearKey);ss.del('sura-clear')}
const goTo=ss.get('sura-goto');if(goTo!=null){ss.del('sura-goto');if(goTo&&curHash()!==goTo)history.replaceState(null,'','#'+goTo)}
const pending=ss.get('sura-toast');if(pending){ss.del('sura-toast');setTimeout(()=>toast(pending),300)}
route();
detectOwner();
})();
