import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendContactEmail } from '@/lib/web3forms';
import { CONTACT, fmtK, sumPF, whatsappUrl } from '../data';
import { usePicked } from '../picked';
import { gsap, useGsap } from '../a11y';
import { ChatIcon, MailIcon } from './icons';
import { TalentPhoto } from './chrome';

type Field = 'name' | 'company' | 'phone' | 'email' | 'message' | 'consent';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copy"
      type="button"
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
      <span aria-live="polite">{done ? 'הועתק' : 'העתקה'}</span>
      <span className="sr-only"> {label}</span>
    </button>
  );
}

/**
 * "Let's talk". WhatsApp is the main way in: the form fills a ready message and
 * the visitor sends it from their own app. Email is sent from the page itself
 * through Web3Forms to the agency's inbox, without the visitor leaving the site.
 *
 * (v1 sent email through the Superdev integration it was generated with; the
 * build has only carried placeholder Superdev settings since the site moved off
 * that platform, so those sends fail.)
 */
export default function ContactSection({ heading = true }: { heading?: boolean }) {
  const { talents, toggle, clear } = usePicked();
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', message: '', consent: false });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const botRef = useRef<HTMLInputElement>(null);
  // A ref, not the status state: a double-click fires both submits before React
  // re-renders, and each would send the lead.
  const sending = useRef(false);
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
  const names = talents.map((t) => t.name).join(', ');
  const lineup = talents.length ? `${names} (טווח חשיפה ${fmtK(reach.total)})` : '';
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

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) e.name = 'נא למלא שם';
    if (!form.email.trim()) e.email = 'נא למלא אימייל כדי שנוכל לחזור אליכם';
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'כתובת האימייל לא תקינה';
    if (!form.message.trim() && !talents.length) e.message = 'ספרו לנו בקצרה על הקמפיין, או בחרו טאלנטים';
    if (!form.consent) e.consent = 'יש לאשר את מדיניות הפרטיות כדי לשלוח';
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending.current) return;
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0] as Field | undefined;
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    sending.current = true;
    setStatus('sending');
    try {
      await sendContactEmail({
        subject: talents.length ? `התעניינות בטאלנטים: ${names}` : `פנייה חדשה מהאתר - ${form.name.trim()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        replyto: form.email.trim(),
        טלפון: form.phone.trim() || '-',
        'חברה / מותג': form.company.trim() || '-',
        'טאלנטים שמעניינים אותם': lineup || '-',
        'על הקמפיין': form.message.trim() || '-',
        // Web3Forms drops anything that ticked the hidden box: bots fill every field.
        botcheck: botRef.current?.checked ?? false,
      });
      setStatus('sent');
      setForm({ name: '', company: '', phone: '', email: '', message: '', consent: false });
      clear();
    } catch (err) {
      console.error('Contact form failed to send:', err);
      setStatus('error');
    } finally {
      sending.current = false;
    }
  };

  const fieldProps = (k: Exclude<Field, 'consent'>) => ({
    name: k,
    id: `f-${k}`,
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
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
              <span lang="en">Let's talk</span>
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
              <input {...fieldProps('name')} autoComplete="name" />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor="f-company">חברה / מותג</label>
              <input {...fieldProps('company')} autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="f-phone">טלפון</label>
              <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" style={{ textAlign: 'right' }} />
            </div>
            <div className="field">
              <label htmlFor="f-email">
                אימייל <span className="req" aria-hidden="true">*</span>
              </label>
              <input {...fieldProps('email')} type="email" autoComplete="email" dir="ltr" style={{ textAlign: 'right' }} />
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
                      <TalentPhoto t={t} alt="" />
                      {t.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          // The button removes itself; keep keyboard focus in the list.
                          const pill = e.currentTarget.closest('.pill');
                          const next = (pill?.nextElementSibling ?? pill?.previousElementSibling)?.querySelector('button');
                          toggle(t.id, false);
                          requestAnimationFrame(() =>
                            (next ?? document.querySelector<HTMLElement>('.picked .none a'))?.focus(),
                          );
                        }}
                        aria-label={`הסרת ${t.name}`}
                      >
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
              <textarea {...fieldProps('message')} placeholder="מוצר, קהל יעד, תאריכים, תקציב משוער" />
              {err('message')}
            </div>
            <div className="field full">
              <label className="consent" htmlFor="f-consent">
                <input
                  id="f-consent"
                  name="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? 'f-consent-err' : undefined}
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
            {/* Invisible to people (and skipped by keyboard and screen readers); bots tick it. */}
            <input ref={botRef} type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="status" role="status" aria-live="polite">
              {status === 'sent' && <p className="ok">ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.</p>}
              {status === 'error' && (
                <p className="bad">
                  השליחה לא הצליחה. אפשר לנסות שוב, לשלוח בוואטסאפ או לכתוב לנו ל־
                  <a href={`mailto:${CONTACT.email}`} dir="ltr">
                    {CONTACT.email}
                  </a>
                  .
                </p>
              )}
            </div>
            <div className="form-foot">
              <a className="btn btn-wa" href={whatsappUrl(waText)} target="_blank" rel="noopener noreferrer">
                <ChatIcon />
                שליחה בוואטסאפ
              </a>
              <button className="btn btn-ghost" type="submit" aria-disabled={status === 'sending'}>
                <MailIcon />
                {status === 'sending' ? 'שולח...' : 'שליחה במייל'}
              </button>
              <small>
                בוואטסאפ הפרטים נכנסים להודעה מוכנה, ונשאר רק ללחוץ שלח. שליחה במייל יוצאת ישירות מהאתר, ודורשת שם, אימייל
                ואישור <Link to="/privacy">מדיניות הפרטיות</Link>.
              </small>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
