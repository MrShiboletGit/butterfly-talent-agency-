import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT, fmtK, sumPF, whatsappUrl } from '../data';
import { usePicked } from '../picked';
import { gsap, useGsap } from '../a11y';
import { ChatIcon, MailIcon } from './icons';
import { TalentPhoto } from './chrome';

type Field = 'name' | 'company' | 'phone' | 'email' | 'message';

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
 * "Let's talk". The form writes the message; the visitor sends it themselves,
 * from WhatsApp (the main way in) or from their own email app.
 *
 * v1 posted the form through the Superdev email integration, but the site's
 * build has carried placeholder Superdev settings since it moved off that
 * platform, so every submission failed. Handing off to the visitor's own app
 * needs no server or keys and cannot fail on our side.
 */
export default function ContactSection({ heading = true }: { heading?: boolean }) {
  const { talents, toggle } = usePicked();
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', message: '' });
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

  const set = (k: Field, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reach = sumPF(talents);
  const names = talents.map((t) => t.name).join(', ');
  const lines = [
    form.name.trim() && `שם: ${form.name.trim()}`,
    form.company.trim() && `חברה: ${form.company.trim()}`,
    form.phone.trim() && `טלפון: ${form.phone.trim()}`,
    form.email.trim() && `אימייל: ${form.email.trim()}`,
    talents.length && `טאלנטים שמעניינים אותנו: ${names} (טווח חשיפה ${fmtK(reach.total)})`,
    form.message.trim() && `על הקמפיין: ${form.message.trim()}`,
  ].filter(Boolean) as string[];

  const waText = ['היי, הגעתי מהאתר של Butterfly.', ...lines].join('\n');
  const mailSubject = talents.length
    ? `התעניינות בטאלנטים: ${names}`
    : `פנייה מהאתר${form.name.trim() ? ` - ${form.name.trim()}` : ''}`;
  const mailBody = ['היי, הגעתי מהאתר של Butterfly.', '', ...lines].join('\r\n');
  const mailHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  const input = (k: Field) => ({ name: k, id: `f-${k}`, value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value) });

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

          {/* Nothing is submitted from here; both actions are links carrying the message. */}
          <form className="lead" onSubmit={(e) => e.preventDefault()} aria-label="פנייה ל-Butterfly">
            <div className="field">
              <label htmlFor="f-name">שם מלא</label>
              <input {...input('name')} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="f-company">חברה / מותג</label>
              <input {...input('company')} autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="f-phone">טלפון</label>
              <input {...input('phone')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" style={{ textAlign: 'right' }} />
            </div>
            <div className="field">
              <label htmlFor="f-email">אימייל</label>
              <input {...input('email')} type="email" autoComplete="email" dir="ltr" style={{ textAlign: 'right' }} />
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
              <textarea {...input('message')} placeholder="מוצר, קהל יעד, תאריכים, תקציב משוער" />
            </div>
            <div className="form-foot">
              <a className="btn btn-wa" href={whatsappUrl(waText)} target="_blank" rel="noopener noreferrer">
                <ChatIcon />
                שליחה בוואטסאפ
              </a>
              <a className="btn btn-ghost" href={mailHref}>
                <MailIcon />
                שליחה במייל
              </a>
              <small>
                הפרטים נכנסים להודעה מוכנה בוואטסאפ או בתוכנת הדואר שלכם, ונשאר רק ללחוץ שלח. הפרטים ישמשו ליצירת קשר בלבד, בהתאם
                ל<Link to="/privacy">מדיניות הפרטיות</Link>.
              </small>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
