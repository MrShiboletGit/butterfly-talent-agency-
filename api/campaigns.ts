import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth.js';
import { getJsonFile, updateJsonFile } from './_utils/github.js';

interface ContentItem {
  url: string;
  type: string;
  description: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  talent: string;
  saves?: number;
  shares?: number;
}

interface CampaignKPIs {
  views: number;
  engagement: number;
  shares: number;
  reach: number;
  impressions: number;
}

interface CampaignDetails {
  objective: string;
  strategy: string;
  results: string;
}

interface Campaign {
  id: string;
  title: string;
  clientId: string;
  description: string;
  category: string;
  kpis: CampaignKPIs;
  talents: string[];
  platforms: string[];
  startDate: string;
  endDate: string;
  content: ContentItem[];
  details?: CampaignDetails;
}

const DATA_PATH = 'src/data/campaigns.json';
const VALID_PLATFORMS = ['youtube', 'instagram', 'tiktok'];
const VALID_CONTENT_TYPES = ['short-form-video', 'reel', 'post', 'story'];

function validateCampaign(campaign: unknown): { valid: boolean; error?: string; data?: Omit<Campaign, 'id' | 'kpis'> } {
  if (!campaign || typeof campaign !== 'object') {
    return { valid: false, error: 'Campaign data is required' };
  }
  
  const c = campaign as Record<string, unknown>;
  
  // Required string fields
  if (!c.title || typeof c.title !== 'string' || c.title.trim().length === 0) {
    return { valid: false, error: 'Campaign title is required' };
  }
  
  if (!c.clientId || typeof c.clientId !== 'string' || c.clientId.trim().length === 0) {
    return { valid: false, error: 'Client ID is required' };
  }
  
  if (!c.description || typeof c.description !== 'string' || c.description.trim().length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  
  if (!c.category || typeof c.category !== 'string' || c.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }
  
  // Dates are optional: they are never displayed on the site and only serve
  // as the ordering index. Default to today when omitted.
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const today = new Date().toISOString().slice(0, 10);

  if (c.startDate !== undefined && c.startDate !== '' && (typeof c.startDate !== 'string' || !dateRegex.test(c.startDate))) {
    return { valid: false, error: 'Start date must be in YYYY-MM-DD format' };
  }
  if (c.endDate !== undefined && c.endDate !== '' && (typeof c.endDate !== 'string' || !dateRegex.test(c.endDate))) {
    return { valid: false, error: 'End date must be in YYYY-MM-DD format' };
  }

  const startDate = (c.startDate as string) || today;
  const endDate = (c.endDate as string) || startDate;
  
  // Validate talents array
  if (!c.talents || !Array.isArray(c.talents) || c.talents.length === 0) {
    return { valid: false, error: 'At least one talent is required' };
  }
  const talents = c.talents.filter(t => typeof t === 'string' && t.trim().length > 0);
  if (talents.length === 0) {
    return { valid: false, error: 'At least one valid talent ID is required' };
  }
  
  // Validate platforms array
  if (!c.platforms || !Array.isArray(c.platforms) || c.platforms.length === 0) {
    return { valid: false, error: 'At least one platform is required' };
  }
  const platforms = c.platforms.filter(p => typeof p === 'string' && VALID_PLATFORMS.includes(p.toLowerCase()));
  if (platforms.length === 0) {
    return { valid: false, error: `Platforms must be one of: ${VALID_PLATFORMS.join(', ')}` };
  }
  
  // Validate content array
  if (!c.content || !Array.isArray(c.content)) {
    return { valid: false, error: 'Content array is required' };
  }
  
  const validatedContent: ContentItem[] = [];
  for (let i = 0; i < c.content.length; i++) {
    const item = c.content[i] as Record<string, unknown>;
    
    if (!item.url || typeof item.url !== 'string') {
      return { valid: false, error: `Content item ${i + 1}: URL is required` };
    }
    
    try {
      new URL(item.url as string);
    } catch {
      return { valid: false, error: `Content item ${i + 1}: Invalid URL format` };
    }
    
    if (!item.type || typeof item.type !== 'string' || !VALID_CONTENT_TYPES.includes(item.type)) {
      return { valid: false, error: `Content item ${i + 1}: Type must be one of: ${VALID_CONTENT_TYPES.join(', ')}` };
    }
    
    if (!item.description || typeof item.description !== 'string') {
      return { valid: false, error: `Content item ${i + 1}: Description is required` };
    }
    
    if (!item.platform || typeof item.platform !== 'string' || !VALID_PLATFORMS.includes(item.platform)) {
      return { valid: false, error: `Content item ${i + 1}: Platform must be one of: ${VALID_PLATFORMS.join(', ')}` };
    }
    
    if (!item.talent || typeof item.talent !== 'string') {
      return { valid: false, error: `Content item ${i + 1}: Talent ID is required` };
    }
    
    validatedContent.push({
      url: item.url as string,
      type: item.type as string,
      description: item.description as string,
      platform: item.platform as string,
      views: typeof item.views === 'number' ? item.views : 0,
      likes: typeof item.likes === 'number' ? item.likes : 0,
      comments: typeof item.comments === 'number' ? item.comments : 0,
      talent: item.talent as string,
      ...(typeof item.saves === 'number' ? { saves: item.saves } : {}),
      ...(typeof item.shares === 'number' ? { shares: item.shares } : {})
    });
  }
  
  // Validate details (optional)
  let parsedDetails: CampaignDetails | undefined;
  if (c.details && typeof c.details === 'object') {
    const details = c.details as Record<string, unknown>;
    const objective = typeof details.objective === 'string' ? details.objective.trim() : '';
    const strategy = typeof details.strategy === 'string' ? details.strategy.trim() : '';
    const results = typeof details.results === 'string' ? details.results.trim() : '';
    if (objective || strategy || results) {
      parsedDetails = { objective, strategy, results };
    }
  }
  
  return {
    valid: true,
    data: {
      title: c.title as string,
      clientId: c.clientId as string,
      description: c.description as string,
      category: c.category as string,
      talents,
      platforms,
      startDate,
      endDate,
      content: validatedContent,
      ...(parsedDetails ? { details: parsedDetails } : {})
    }
  };
}

function generateCampaignId(title: string, clientId: string, existingIds: Set<string>): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const year = new Date().getFullYear();
  let baseId: string;

  if (titleSlug) {
    baseId = `${clientId}-${titleSlug}-${year}`;
  } else {
    const uniqueSuffix = Date.now().toString(36).slice(-5);
    baseId = `${clientId}-${uniqueSuffix}-${year}`;
  }

  baseId = baseId.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  let id = baseId;
  let counter = 1;
  while (existingIds.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }

  return id;
}

function calculateKPIs(content: ContentItem[]): CampaignKPIs {
  const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalEngagement = content.reduce((sum, c) => 
    sum + (c.likes || 0) + (c.comments || 0) + (c.saves || 0), 0);
  const totalShares = content.reduce((sum, c) => sum + (c.shares || 0), 0);
  
  return {
    views: totalViews,
    engagement: totalEngagement,
    shares: totalShares,
    reach: totalViews,
    impressions: totalViews
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verify authentication for all requests
  const auth = await verifyAuth(req);
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error });
  }
  
  if (req.method === 'GET') {
    // Get all campaigns
    const result = await getJsonFile<Campaign[]>(DATA_PATH);
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch campaigns data' });
    }
    return res.status(200).json({ campaigns: result.data });
  }
  
  if (req.method === 'POST') {
    // Add new campaign
    const validation = validateCampaign(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Get current data
    const result = await getJsonFile<Campaign[]>(DATA_PATH);
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch campaigns data' });
    }
    
    const existingIds = new Set(result.data.map(c => c.id));
    
    const newCampaign: Campaign = {
      id: generateCampaignId(validation.data.title, validation.data.clientId, existingIds),
      kpis: calculateKPIs(validation.data.content),
      ...validation.data
    };
    
    // Add new campaign
    result.data.push(newCampaign);
    
    // Save to GitHub
    const success = await updateJsonFile(
      DATA_PATH,
      result.data,
      `Add campaign: ${newCampaign.title} (via admin panel by ${auth.email})`,
      result.sha
    );
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to save campaign data' });
    }
    
    return res.status(201).json({ success: true, campaign: newCampaign });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
