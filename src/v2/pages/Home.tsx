import { useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import TalentsSection from '../components/TalentsSection';
import { ClientsMarquee, Services, Ticker } from '../components/Sections';
import ContactSection from '../components/ContactSection';
import { useA11y } from '../a11y';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle();
  const ref = useRef<HTMLDivElement>(null);
  const { motionOK, finePointer } = useA11y();

  // Buttons marked .magnet lean toward the pointer.
  useEffect(() => {
    if (!finePointer || !motionOK || !ref.current) return;
    const els = [...ref.current.querySelectorAll<HTMLElement>('.magnet')];
    const offs = els.map((b) => {
      const move = (e: PointerEvent) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      };
      const leave = () => (b.style.transform = '');
      b.addEventListener('pointermove', move);
      b.addEventListener('pointerleave', leave);
      return () => {
        b.removeEventListener('pointermove', move);
        b.removeEventListener('pointerleave', leave);
        b.style.transform = '';
      };
    });
    return () => offs.forEach((off) => off());
  }, [finePointer, motionOK]);

  return (
    <div ref={ref}>
      <Hero />
      <Ticker />
      <TalentsSection />
      <ClientsMarquee />
      <Services />
      <ContactSection />
    </div>
  );
}
