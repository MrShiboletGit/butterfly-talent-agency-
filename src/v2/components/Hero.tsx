import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MARK } from '../mark';
import { PLATFORM_META, PLATFORMS, ROSTER, ROSTER_REACH, fmtFull, fmtK, roundedDownHe } from '../data';
import { countTo, gsap, useA11y, useGsap } from '../a11y';
import { SplitBar } from './chrome';
import { ArrowForward } from './icons';

// Particle colours, precomputed: a peach→lilac gradient across the wings ×
// fading opacity away from the body.
const NC = 8;
const NA = 3;
const BUCKETS: string[] = [];
for (let i = 0; i < NC; i++)
  for (let j = 0; j < NA; j++) {
    const t = i / (NC - 1);
    const a = 0.9 - j * 0.22;
    BUCKETS.push(
      `rgba(${Math.round(244 + (169 - 244) * t)},${Math.round(174 + (139 - 174) * t)},${Math.round(146 + (255 - 146) * t)},${a})`,
    );
  }

interface Particle {
  hx: number; hy: number; dist: number;
  x: number; y: number; vx: number; vy: number;
  s: number; n: number; b: number;
}

function sampleMark(narrow: boolean) {
  const off = document.createElement('canvas');
  const ow = 420;
  const oh = Math.round((ow * MARK.h) / MARK.w);
  off.width = ow;
  off.height = oh;
  const o = off.getContext('2d')!;
  o.scale(ow / MARK.w, oh / MARK.h);
  MARK.d.forEach((d) => o.fill(new Path2D(d)));
  const px = o.getImageData(0, 0, ow, oh).data;
  const pts: [number, number][] = [];
  const step = narrow ? 4 : 3;
  for (let y = 0; y < oh; y += step)
    for (let x = 0; x < ow; x += step) if (px[(y * ow + x) * 4 + 3] > 128) pts.push([x - ow / 2, y - oh / 2]);
  return { pts, ow, oh };
}

/** The butterfly, drawn in particles that flap, scatter on scroll and dodge the pointer. */
function Wings({ heroRef }: { heroRef: React.RefObject<HTMLElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionOK } = useA11y();

  useEffect(() => {
    const cv = canvasRef.current;
    const hero = heroRef.current;
    if (!cv || !hero) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, cx = 0, cy = 0, scale = 1;
    let P: Particle[] = [];
    let raf = 0;
    let visible = true;
    let scrollP = 0;
    const mouse = { x: -9999, y: -9999 };
    const t0 = performance.now() - (motionOK ? 0 : 9000);
    const sample = sampleMark(window.innerWidth < 700);
    // A weak machine spends most of each frame here, so "lite" draws half the
    // particles at a capped resolution and half the frame rate. It starts on for
    // low-core or low-memory devices and switches on by itself if frames run long.
    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8;
    let lite = cores <= 4 || memory <= 4;

    const layout = () => {
      const DPR = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const mob = W < 900;
      const targetW = mob ? Math.min(W * 0.86, 440) : Math.min(W * 0.44, 620);
      scale = targetW / sample.ow;
      const tH = sample.oh * scale;
      cx = mob ? W / 2 : W * 0.27;
      cy = mob ? 84 + tH / 2 : H * 0.5;
      // On phones the copy sits under the butterfly; this pads it clear.
      hero.style.setProperty('--top', `${Math.round(84 + tH + 28)}px`);
      const max = (mob ? 1100 : 2200) / (lite ? 2 : 1);
      const pts = sample.pts.length > max ? sample.pts.filter((_, i) => i % Math.ceil(sample.pts.length / max) === 0) : sample.pts;
      const old = P;
      const half = (sample.ow * scale) / 2;
      P = pts.map(([x, y], i) => {
        const p = old[i];
        const dist = Math.abs(x * scale) / half;
        return {
          hx: x * scale,
          hy: y * scale,
          dist,
          x: p ? p.x : motionOK ? Math.random() * W : cx + x * scale,
          y: p ? p.y : motionOK ? Math.random() * H : cy + y * scale,
          vx: 0,
          vy: 0,
          s: Math.random() * 1.4 + 0.7,
          n: Math.random() * Math.PI * 2,
          b:
            Math.min(NC - 1, Math.floor(((x / (sample.ow / 2) + 1) / 2) * NC)) * NA +
            Math.min(NA - 1, Math.floor(dist * NA)),
        };
      });
    };

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      const flap = motionOK ? Math.cos(t * 1.9) : 0.6;
      const wob = motionOK ? Math.sin(t * 1.9) : 0;
      const intro = Math.min(1, t / 2.2);
      const disperse = motionOK ? scrollP : 0;
      const k = 0.018 + 0.05 * intro;
      const paths = BUCKETS.map(() => new Path2D());
      for (const p of P) {
        const dist = p.dist; // 0 at the body, 1 at the wing tip
        const ph = flap * (0.18 + 0.1 * dist) * Math.min(1, dist * 3); // wings fold toward the body
        let tx = cx + p.hx * (1 - ph - 0.02 * wob);
        let ty = cy + p.hy - ph * dist * 26;
        if (motionOK) {
          tx += Math.cos(p.n + t * 0.7) * (2 + disperse * 260) * (0.4 + dist);
          ty += Math.sin(p.n * 1.3 + t * 0.6) * (2 + disperse * 200);
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            const f = ((12000 - d2) / 12000) * 3.2, d = Math.sqrt(d2) || 1;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx += (tx - p.x) * k;
          p.vy += (ty - p.y) * k;
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          p.x = tx;
          p.y = ty;
        }
        paths[p.b].rect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1 - disperse * 0.85;
      for (let i = 0; i < paths.length; i++) {
        ctx.fillStyle = BUCKETS[i];
        ctx.fill(paths[i]);
      }
      ctx.globalAlpha = 1;
    };

    // Only animate while the hero is on screen; a still frame needs no loop at all.
    let frame = 0;
    let slow = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      frame++;
      // Frames 30-150 (after the page settles): if a third of them miss 60fps by
      // a margin, this device can't afford the full butterfly.
      if (!lite && frame > 30 && frame <= 150 && last && now - last > 24 && ++slow > 40) {
        lite = true;
        layout();
      }
      last = now;
      if (!lite || frame % 2 === 0) draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (motionOK && visible && !raf) raf = requestAnimationFrame(loop);
    };

    layout();
    if (motionOK) start();
    else draw(performance.now());

    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        layout();
        if (!motionOK) draw(performance.now());
      }, 150);
    };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onScroll = () => {
      scrollP = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.9)));
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(hero);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rz);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, [motionOK, heroRef]);

  return <canvas ref={canvasRef} className="wings" aria-hidden="true" />;
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reachNRef = useRef<HTMLDivElement>(null);
  const { motionOK } = useA11y();
  const zero = { youtube: 0, instagram: 0, tiktok: 0 };
  const splitRef = useRef<HTMLDivElement>(null);

  // The reach board counts up as it lands; with motion off it simply shows the totals.
  const fillReach = () => {
    countTo(reachNRef.current, ROSTER_REACH.total, { from: 0, duration: 2.4, format: fmtFull, motionOK });
    splitRef.current?.querySelectorAll<HTMLElement>('i').forEach((el, i) => {
      el.style.flexGrow = String(ROSTER_REACH[PLATFORMS[i]] / ROSTER_REACH.total);
    });
  };

  useEffect(() => {
    if (!motionOK) fillReach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOK]);

  useGsap(
    heroRef,
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      const navWrap = document.querySelector('.v2 .nav .wrap');
      if (navWrap) tl.from(navWrap, { y: -20, opacity: 0, duration: 0.8, clearProps: 'all' });
      tl.from('h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: 0.1 }, '-=.5')
        .from('.hero-copy .eyebrow', { opacity: 0, x: 20, duration: 0.8 }, '<')
        .from('.lede, .cta-row', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, '-=.8')
        .from('.reach', { y: 40, opacity: 0, duration: 1.1, onStart: fillReach }, '-=.8');
      gsap.to('.hero-copy', {
        yPercent: -18,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    [],
  );

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <Wings heroRef={heroRef} />
      <div className="grid-floor" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <i />
            Butterfly Talent Agency
          </span>
          <h1>
            <span className="ln"><span>סוכנות</span></span>
            <span className="ln"><span className="shine">המשפיענים</span></span>
            <span className="ln"><span>המובילה בישראל</span></span>
          </h1>
          <p className="lede">
            <b><bdi dir="ltr">{ROSTER.length}</bdi> יוצרים</b>, יותר מ-<b>{roundedDownHe(ROSTER_REACH.total)} עוקבים</b> ביוטיוב, טיקטוק
            ואינסטגרם, וצוות שמחבר אותם למותג הנכון.
          </p>
          <div className="cta-row">
            <Link className="btn btn-hot magnet" to="/#talents">
              פגשו את הטאלנטים
              <ArrowForward />
            </Link>
            <Link className="btn btn-ghost magnet" to="/#build">
              בנו הרכב לקמפיין
            </Link>
          </div>
        </div>
      </div>
      <aside className="reach" aria-label="טווח החשיפה של כל הטאלנטים">
        <div className="reach-h">
          <span>Total reach</span>
          <span>Updated daily</span>
        </div>
        <div className="reach-n" ref={reachNRef} dir="ltr">
          {motionOK ? '0' : fmtFull(ROSTER_REACH.total)}
        </div>
        <div ref={splitRef}>
          <SplitBar pf={zero} />
        </div>
        <div className="legend">
          {PLATFORMS.map((p) => (
            <span key={p} className={PLATFORM_META[p].cls}>
              {PLATFORM_META[p].short} <b>{fmtK(ROSTER_REACH[p])}</b>
            </span>
          ))}
        </div>
      </aside>
      <div className="scroll-cue" aria-hidden="true" />
    </section>
  );
}
