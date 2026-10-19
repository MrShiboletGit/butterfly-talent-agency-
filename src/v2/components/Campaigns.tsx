import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CONTENT_TYPE_LABEL,
  PLATFORM_META,
  clientById,
  embedUrl,
  fmtK,
  talentById,
  type Campaign,
  type ContentItem,
} from '../data';
import { ClientLogo } from './chrome';
import { CommentIcon, EyeIcon, HeartIcon, PlatformIcon, PlayIcon } from './icons';

export function CampaignCard({ c }: { c: Campaign }) {
  const client = clientById(c.clientId);
  const names = c.talents.map((id) => talentById(id)?.name ?? id);
  return (
    <Link className="camp-card" to={`/campaign/${c.id}`}>
      <div className="camp-logo">
        {client ? <ClientLogo client={client} /> : <span className="logo-name">{c.clientId}</span>}
        {c.category && <span className="cat">{c.category}</span>}
      </div>
      <div className="camp-body">
        <h3>{c.title}</h3>
        {c.description && <p>{c.description}</p>}
        <div className="camp-who">
          {client && (
            <>
              לקוח: <b>{client.name}</b>
            </>
          )}
          {names.length > 0 && (
            <>
              {client && ' · '}
              טאלנטים: <b>{names.slice(0, 2).join(', ')}</b>
              {names.length > 2 && ` +${names.length - 2}`}
            </>
          )}
        </div>
        <div className="camp-meta">
          <span>
            <b dir="ltr">{fmtK(c.kpis.views)}</b> צפיות
          </span>
          <span className="plats" aria-label={`פלטפורמות: ${c.platforms.map((p) => PLATFORM_META[p]?.label ?? p).join(', ')}`}>
            {c.platforms.map((p) =>
              PLATFORM_META[p] ? (
                <span key={p} className="plat" style={{ color: PLATFORM_META[p].color }}>
                  <PlatformIcon platform={p} />
                </span>
              ) : null,
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

const youtubeThumb = (url: string) => {
  const id = url.match(/\/shorts\/([^?/]+)/)?.[1] || url.match(/[?&]v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

const PLATFORM_BG: Record<string, string> = {
  youtube: 'linear-gradient(160deg, #3a0d16, #FF4D5E)',
  instagram: 'linear-gradient(160deg, #3b0f4a, #F27BC4 60%, #F4AE92)',
  tiktok: 'linear-gradient(160deg, #06201f, #12122e 50%, #5CF2E6)',
};

/**
 * One piece of campaign content. The player only loads when asked for, so a
 * campaign with a dozen posts doesn't pull a dozen third-party embeds up front.
 */
export function ContentCard({ item }: { item: ContentItem }) {
  const [active, setActive] = useState(false);
  const src = embedUrl(item.url, item.platform);
  const meta = PLATFORM_META[item.platform];
  const talent = item.talent ? talentById(item.talent) : undefined;
  const thumb = item.platform === 'youtube' ? youtubeThumb(item.url) : null;
  const label = meta?.label ?? item.platform;

  return (
    <article className="embed">
      <div className="embed-media">
        {active && src ? (
          <iframe
            src={src}
            title={item.description || `${label} ${talent?.name ?? ''}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="embed-play"
            style={{ backgroundImage: thumb ? `url(${thumb})` : PLATFORM_BG[item.platform] }}
            onClick={() => (src ? setActive(true) : window.open(item.url, '_blank', 'noopener'))}
            aria-label={`צפייה בתוכן: ${item.description || label}`}
          >
            <span className="play-ring">
              <PlayIcon />
            </span>
            <small>{src ? `צפייה ב-${label}` : `פתיחה ב-${label}`}</small>
          </button>
        )}
      </div>
      <div className="embed-body">
        <div className="embed-top">
          <span style={{ color: meta?.color }}>{label}</span>
          <span>{CONTENT_TYPE_LABEL[item.type] ?? item.type}</span>
        </div>
        {talent && (
          <Link to={`/talent/${talent.id}`} className="camp-who">
            <b>{talent.name}</b>
          </Link>
        )}
        {item.description && <h3>{item.description}</h3>}
        <div className="stats">
          {item.views != null && (
            <span title="צפיות">
              <EyeIcon />
              <bdi dir="ltr">{fmtK(item.views)}</bdi>
              <span className="sr-only">צפיות</span>
            </span>
          )}
          {item.likes != null && (
            <span title="לייקים">
              <HeartIcon />
              <bdi dir="ltr">{fmtK(item.likes)}</bdi>
              <span className="sr-only">לייקים</span>
            </span>
          )}
          {item.comments != null && (
            <span title="תגובות">
              <CommentIcon />
              <bdi dir="ltr">{fmtK(item.comments)}</bdi>
              <span className="sr-only">תגובות</span>
            </span>
          )}
        </div>
        <a className="ext" href={item.url} target="_blank" rel="noopener noreferrer">
          לפוסט המקורי ב-{label} ↗
        </a>
      </div>
    </article>
  );
}
