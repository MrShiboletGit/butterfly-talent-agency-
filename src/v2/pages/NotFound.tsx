import { Link } from 'react-router-dom';
import { PageHeader } from '../components/chrome';
import ContactSection from '../components/ContactSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function NotFound({ title = 'הדף לא נמצא' }: { title?: string }) {
  usePageTitle(title);
  return (
    <PageHeader eyebrow="404" title={title}>
      <p>הקישור שהגעתם אליו שבור או שהדף הוסר. אפשר לחזור לדף הבית או לעבור לטאלנטים ולקמפיינים שלנו.</p>
      <div className="cta-row" style={{ marginTop: 28 }}>
        <Link className="btn btn-hot" to="/">
          חזרה לדף הבית
        </Link>
        <Link className="btn btn-ghost" to="/#talents">
          הטאלנטים שלנו
        </Link>
        <Link className="btn btn-ghost" to="/campaigns">
          הקמפיינים שלנו
        </Link>
      </div>
    </PageHeader>
  );
}

export function ContactPage() {
  usePageTitle('צור קשר');
  return (
    <>
      <PageHeader eyebrow="Contact" title="צור קשר">
        <p>נשמח לשמוע ממך ולעזור לך להגשים את הפרויקט הבא שלך</p>
      </PageHeader>
      <ContactSection heading={false} />
    </>
  );
}
