import type { SVGProps } from 'react';
import { MARK } from '../mark';
import type { Platform } from '../data';

type P = SVGProps<SVGSVGElement>;
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const ButterflyMark = (p: P) => (
  <svg viewBox={`0 0 ${MARK.w} ${MARK.h}`} aria-hidden="true" {...p}>
    {MARK.d.map((d, i) => (
      <path key={i} d={d} fill="currentColor" />
    ))}
  </svg>
);

export const YouTubeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
export const InstagramIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" />
  </svg>
);
export const TikTokIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5" />
  </svg>
);
export const PlatformIcon = ({ platform, ...p }: P & { platform: Platform }) =>
  platform === 'youtube' ? <YouTubeIcon {...p} /> : platform === 'instagram' ? <InstagramIcon {...p} /> : <TikTokIcon {...p} />;

export const PlusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
/** Points left: "forward" in a right-to-left page. */
export const ArrowForward = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);
/** Points right: "back" in a right-to-left page. */
export const ArrowBack = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const MailIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={1.8} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const ChatIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={1.8} {...p}>
    <path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12Z" />
  </svg>
);
export const PlayIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...p}>
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
  </svg>
);
export const EyeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const HeartIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
  </svg>
);
export const CommentIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const AccessibilityIcon = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...p}>
    <circle cx="12" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
    <path d="M4.5 8.5 12 10l7.5-1.5M12 10v4.5M12 14.5 8.5 21M12 14.5l3.5 6.5" />
  </svg>
);
