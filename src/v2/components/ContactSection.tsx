import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendEmail } from '@/integrations/core';
import { CONTACT, fmtK, sumPF, whatsappUrl } from '../data';
import { usePicked } from '../picked';
import { gsap, useGsap } from '../a11y';
import { ChatIcon, MailIcon } from './icons';

type Field = 'name' | 'company' | 'phone' | 'email' | 'message' | 'consent';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copy"
      type="button"
      aria-label={`העתקת ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard blocked: the value is still right there to select */
        }
      }}
    >
      {done ? 'הועתק' : 'העתקה'}
    </button>
  );
}

/**
 * "Let's talk". WhatsApp is the main way in: the form fills a ready message and
 * the visitor just hits send. Email remains for anyone who prefers it, sent the
 * same way v1's contact page sends it and with the same privacy consent.
 */
export default function ContactSection({ heading = true }: { heading?: boolean }) {
  const { talents, toggle, clear } = usePicked();
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', message: '', consent: false });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGsap(
    sectionRef,
    () => {
      gsap.from('.contact', {
        y: 80, opacity: 0, scale: 0.96, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: '.contact', start: 'top 88%', once: true },
      });
    },
    [],
  );

  const set = (k: Field, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (status === 'sent' || status === 'error') setStatus('idle');
  };

  const reach = sumPF(talents);
  const lineup = talents.length ? `${talents.map((t) => t.name).join(', ')} (טווח חשיפה ${fmtK(reach.total)})` : '';

  const waText = [
    'היי, הגעתי מהאתר של Butterfly.',
    form.name.trim() && `שם: ${form.name.trim()}`,
    form.company.trim() && `חברה: ${form.company.trim()}`,
    form.phone.trim() && `טלפון: ${form.phone.trim()}`,
    form.email.trim() && `אימייל: ${form.email.trim()}`,
    lineup && `טאלנטים שמעניינים אותנו: ${lineup}`,
    form.message.trim() && `על הקמפיין: ${form.message.trim()}`,
  ]
    .filter(Boolean)
    .join('\n');

  const validateForEmail = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) e.name = 'נא למלא שם';
    if (!form.email.trim()) e.email = 'נא למלא אימייל כדי שנוכל לחזור אליכם';
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'כתובת האימייל לא תקינה';
    if (!form.message.trim() && !talents.length) e.message = 'ספרו לנו בקצרה על הקמפיין';
    if (!form.consent) e.consent = 'יש לאשר את מדיניות הפרטיות כדי לשלוח במייל';
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateForEmail();
    setErrors(e);
    const first = Object.keys(e)[0] as Field | undefined;
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await sendEmail({
        to: CONTACT.email,
        subject: talents.length
          ? `התעניינות בטאלנטים: ${talents.map((t) => t.name).join(', ')}`
          : `פנייה חדשה מהאתר - ${form.name.trim()}`,
        body: `
          פנייה חדשה מהאתר:

          שם: ${form.name.trim()}
          אימייל: ${form.email.trim()}
          טלפון: ${form.phone.trim()}
          חברה: ${form.company.trim()}
          ${lineup ? `טאלנטים שמעניינים אותם: ${lineup}` : ''}

          הודעה:
          ${form.message.trim()}
        `,
      });
      setStatus('sent');
      setForm({ name: '', company: '', phone: '', email: '', message: '', consent: false });
      clear();
    } catch (err) {
      console.error('Error sending email:', err);
      setStatus('error');
    }
  };

  const fieldProps = (k: Field) => ({
    name: k,
    id: `f-${k}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `f-${k}-err` : undefined,
  });
  const err = (k: Field) =>
    errors[k] ? (
      <span className="err" id={`f-${k}-err`}>
        {errors[k]}
      </span>
    ) : null;

  return (
    <section id="contact" ref={sectionRef} style={{ paddingTop: heading ? 20 : 0 }}>
      <div className="wrap">
        <div className="contact">
          <div>
            <span className="eyebrow">
              <i />
              Let's talk
            </span>
            {heading ? <h2>מוכנים<br />להתחיל?</h2> : <h2>בואו נתחיל לעבוד יחד</h2>}
            <p className="lede">בואו ניצור יחד את הקמפיין הבא שלכם עם המשפיענים הטובים ביותר בישראל</p>
            <div className="lines">
              <div className="line-item">
                <ChatIcon />
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" dir="ltr" aria-label={`וואטסאפ ${CONTACT.phoneDisplay}`}>
                  {CONTACT.phoneDisplay}
                </a>
                <CopyButton value={`+${CONTACT.phoneIntl}`} label="מספר הטלפון" />
              </div>
              <div className="line-item">
                <MailIcon />
                <a href={`mailto:${CONTACT.email}`} dir="ltr">
                  {CONTACT.email}
                </a>
                <CopyButton value={CONTACT.email} label="כתובת האימייל" />
              </div>
            </div>
          </div>

          <form className="lead" ref={formRef} onSubmit={onSubmit} noValidate aria-label="פנייה ל-Butterfly">
            <div className="field">
              <label htmlFor="f-name">
                שם מלא <span className="req" aria-hidden="true">*</span>
              </label>
              <input {...fieldProps('name')} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor="f-company">חברה / מותג</label>
              <input {...fieldProps('company')} autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-phone">טלפון</label>
              <input
                {...fieldProps('phone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                style={{ textAlign: 'right' }}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="f-email">אימייל</label>
              <input
                {...fieldProps('email')}
                type="email"
                autoComplete="email"
                dir="ltr"
                style={{ textAlign: 'right' }}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
              {err('email')}
            </div>
            <div className="field full" role="group" aria-labelledby="f-picked-l">
              <span className="label" id="f-picked-l">
                הטאלנטים שמעניינים אתכם
              </span>
              <div className="picked">
                {talents.length ? (
                  talents.map((t) => (
                    <span className="pill" key={t.id}>
                      <img src={t.img} alt="" />
                      {t.name}
                      <button type="button" onClick={() => toggle(t.id, false)} aria-label={`הסרת ${t.name}`}>
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="none">
                    עוד לא נבחרו טאלנטים. אפשר לבחור ב<Link to="/#talents">רשימת הטאלנטים</Link> עם +
                  </span>
                )}
              </div>
            </div>
            <div className="field full">
              <label htmlFor="f-message">על מה הקמפיין?</label>
              <textarea
                {...fieldProps('message')}
                placeholder="מוצר, קהל יעד, תאריכים, תקציב משוער"
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
              />
              {err('message')}
            </div>
            <div className="field full">
              <label className="consent" htmlFor="f-consent">
                <input
                  {...fieldProps('consent')}
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                />
                <span>
                  אני מאשר/ת שהפרטים שמסרתי בטופס ישמשו לצורך יצירת קשר בלבד, בהתאם ל
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                    מדיניות הפרטיות
                  </Link>{' '}
                  של האתר.
                </span>
              </label>
              {err('consent')}
            </div>
            <div className="status" aria-live="polite" role="status">
              {status === 'sent' && <p className="ok">ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.</p>}
              {status === 'error' && <p className="bad">אירעה שגיאה בשליחת ההודעה. אפשר לנסות שוב או לשלוח בוואטסאפ.</p>}
            </div>
            <div className="form-foot">
              <a className="btn btn-wa" href={whatsappUrl(waText)} target="_blank" rel="noopener noreferrer">
                <ChatIcon />
                שליחה בוואטסאפ
              </a>
              <button className="btn btn-ghost" type="submit" disabled={status === 'sending'}>
                <MailIcon />
                {status === 'sending' ? 'שולח...' : 'שליחה במייל'}
              </button>
              <small>בוואטסאפ הפרטים נכנסים להודעה מוכנה, ונשאר רק ללחוץ שלח. שליחה במייל דורשת שם, אימייל ואישור מדיניות הפרטיות.</small>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
