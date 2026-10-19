/**
 * The redesign reads the same JSON as v1, which the admin panel and the nightly
 * metrics job keep current, and reshapes it for the new components. Nothing here
 * is a snapshot: a talent added in the panel shows up in both versions.
 */
import talentsJson from '@/data/talents.json';
import clientsJson from '@/data/clients.json';
import campaignsJson from '@/data/campaigns.json';

export type Platform = 'youtube' | 'instagram' | 'tiktok';
export const PLATFORMS: Platform[] = ['youtube', 'instagram', 'tiktok'];

export const PLATFORM_META: Record<Platform, { label: string; short: string; cls: 'y' | 'g' | 'k'; color: string }> = {
  youtube: { label: 'YouTube', short: 'YT', cls: 'y', color: 'var(--yt)' },
  instagram: { label: 'Instagram', short: 'IG', cls: 'g', color: 'var(--ig)' },
  tiktok: { label: 'TikTok', short: 'TT', cls: 'k', color: 'var(--tt)' },
};

export type PlatformCounts = Record<Platform, number>;

export interface Talent {
  id: string;
  /** Display name, without the bracketed alias v1 keeps in the same field. */
  name: string;
  /** The bracketed part of v1's name: a real name or channel name. */
  sub: string;
  fullName: string;
  cat: string;
  bio: string;
  img: string;
  total: number;
  pf: PlatformCounts;
  age: string;
  gender: string;
  tags: string[];
  social: Partial<Record<Platform, string>>;
  main: boolean;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
}

export interface ContentItem {
  url: string;
  type: string;
  description: string;
  platform: Platform;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  talent?: string;
}

export interface Campaign {
  id: string;
  title: string;
  clientId: string;
  description: string;
  category: string;
  kpis: { views: number; engagement?: number; shares?: number; reach?: number; impressions?: number };
  talents: string[];
  platforms: Platform[];
  startDate: string;
  endDate: string;
  content: ContentItem[];
  details?: { objective?: string; strategy?: string; results?: string };
}

type RawTalent = (typeof talentsJson)[number] & {
  platformFollowers?: Partial<PlatformCounts>;
  socialMedia?: Partial<Record<Platform, string>>;
  audience?: { age?: string; gender?: string };
  strengths?: string[];
};

// The JSON is edited by hand on GitHub as well as by the admin panel, so every
// field is read defensively: a malformed value should cost one detail, never the
// page. Numbers may arrive as strings, possibly with thousands separators.
const num = (v: unknown) => Number(String(v ?? '').replace(/,/g, '')) || 0;
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

const splitName = (full: string) => {
  const m = full.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1].trim(), sub: m[2].trim() } : { name: full.trim(), sub: '' };
};

const toTalent = (raw: RawTalent): Talent => {
  const pf: PlatformCounts = {
    youtube: num(raw.platformFollowers?.youtube),
    instagram: num(raw.platformFollowers?.instagram),
    tiktok: num(raw.platformFollowers?.tiktok),
  };
  const fullName = str(raw.name);
  const { name, sub } = splitName(fullName);
  return {
    id: str(raw.id),
    name,
    sub,
    fullName,
    cat: str(raw.category).trim(),
    bio: str(raw.bio),
    img: str(raw.imageUrl),
    total: num(raw.totalFollowers) || pf.youtube + pf.instagram + pf.tiktok,
    pf,
    age: str(raw.audience?.age),
    gender: str(raw.audience?.gender),
    tags: strList(raw.strengths),
    social: raw.socialMedia && typeof raw.socialMedia === 'object' ? raw.socialMedia : {},
    // Strictly true: a string "false" must not put someone on the roster.
    main: raw.main === true,
  };
};

/** Every talent, including ones only referenced by past campaigns. */
export const ALL_TALENTS: Talent[] = (talentsJson as RawTalent[]).map(toTalent);
/** The roster shown on the site: v1's "main" talents, biggest first like v1's carousel. */
export const ROSTER: Talent[] = ALL_TALENTS.filter((t) => t.main).sort((a, b) => b.total - a.total);
export const talentById = (id: string) => ALL_TALENTS.find((t) => t.id === id);

export const CLIENTS: Client[] = clientsJson.map((c) => ({ id: str(c.id), name: str(c.name), logo: str(c.logoUrl) }));
export const clientById = (id: string) => CLIENTS.find((c) => c.id === id);

type RawCampaign = Partial<Omit<Campaign, 'kpis'>> & { kpis?: Partial<Record<keyof Campaign['kpis'], unknown>> };

export const CAMPAIGNS: Campaign[] = (campaignsJson as unknown as RawCampaign[]).map((c) => ({
  ...c,
  id: str(c.id),
  title: str(c.title),
  clientId: str(c.clientId),
  description: str(c.description),
  category: str(c.category),
  kpis: {
    views: num(c.kpis?.views),
    engagement: num(c.kpis?.engagement),
    shares: num(c.kpis?.shares),
    reach: num(c.kpis?.reach),
    impressions: num(c.kpis?.impressions),
  },
  talents: strList(c.talents),
  platforms: strList(c.platforms) as Platform[],
  startDate: str(c.startDate),
  endDate: str(c.endDate),
  content: Array.isArray(c.content) ? c.content.filter((x) => x && typeof x.url === 'string') : [],
}));
export const campaignById = (id: string) => CAMPAIGNS.find((c) => c.id === id);

/**
 * The 640px copy of a talent photo that scripts/card-images.mjs writes at build
 * time (keep the two paths in step). The original extension stays in the name,
 * so a.png and a.jpg can't overwrite each other's copy. Only built sites have
 * them, so the dev server keeps using the original; callers fall back to it if
 * a copy is missing.
 */
export const cardImage = (src: string) => (import.meta.env.PROD && src.startsWith('/') ? `/card${src}.webp` : src);

export const sumPF = (list: Talent[]) =>
  list.reduce(
    (acc, t) => {
      for (const p of PLATFORMS) acc[p] += t.pf[p];
      acc.total += t.total;
      return acc;
    },
    { youtube: 0, instagram: 0, tiktok: 0, total: 0 },
  );

export const ROSTER_REACH = sumPF(ROSTER);

/** 3,156,388 → "3.16M", 444,100 → "444K". From 999,500 up it's "1M", never "1000K". */
export const fmtK = (n: number) =>
  n >= 999_500
    ? `${(n / 1e6).toFixed(2).replace(/\.?0+$/, '')}M`
    : n >= 1e3
      ? `${Math.round(n / 1e3)}K`
      : String(Math.round(n));

export const fmtFull = (n: number) => Math.round(n).toLocaleString('en-US');

/** A round-down figure for copy: "3 מיליון" from 3,156,388, so the claim "more than" stays true. */
export const roundedDownHe = (n: number) =>
  n >= 1e6 ? `${Math.floor(n / 1e6)} מיליון` : `${Math.floor(n / 1e3)} אלף`;

export function parseAge(age: string): [number, number] | null {
  const m = age.match(/(\d+)\D+(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export function parseGender(gender: string) {
  const male = Number(gender.match(/(\d+)%\s*גברים/)?.[1] || 0);
  const female = Number(gender.match(/(\d+)%\s*נשים/)?.[1] || 0);
  return male || female ? { male, female } : null;
}

/** The roster filter chips. Matching on category text keeps them working as talents are added. */
export const GROUPS: { key: string; label: string; test: (t: Talent) => boolean }[] = [
  { key: 'all', label: 'הכל', test: () => true },
  { key: 'gaming', label: 'גיימינג', test: (t) => /גיימינג|מיינקראפט/.test(t.cat) },
  { key: 'fun', label: 'בידור ותרבות', test: (t) => /קומדיה|הומור|ויראלי|פופ|תעלומות|בידור|לייף/.test(t.cat) },
  { key: 'tech', label: 'מדע וטכנולוגיה', test: (t) => /טכנולוגיה|מדע/.test(t.cat) },
];

export const CONTACT = {
  email: 'contact@butterfly-talent.com',
  phoneDisplay: '+972-50-914-5461',
  phoneIntl: '972509145461',
  instagram: 'https://www.instagram.com/butterfly___agency',
};

export const whatsappUrl = (text?: string) =>
  `https://api.whatsapp.com/send/?phone=${CONTACT.phoneIntl}${text ? `&text=${encodeURIComponent(text)}` : ''}`;

export const CONTENT_TYPE_LABEL: Record<string, string> = {
  'long-form-video': 'סרטון ארוך',
  'short-form-video': 'סרטון קצר',
  post: 'פוסט',
  story: 'סטורי',
  reel: 'ריל',
  image: 'תמונה',
};

/** The embeddable player for a post, or null when the URL isn't one we know how to embed. */
export function embedUrl(url: string, platform: Platform): string | null {
  if (platform === 'youtube') {
    const id =
      url.match(/\/shorts\/([^?/]+)/)?.[1] || url.match(/[?&]v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
  }
  if (platform === 'instagram') {
    const id = url.match(/\/(?:p|reel)\/([^/?]+)/)?.[1];
    return id ? `https://www.instagram.com/p/${id}/embed/` : null;
  }
  if (platform === 'tiktok') {
    const id = url.match(/video\/(\d+)/)?.[1];
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
  }
  return null;
}
