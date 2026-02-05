import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth.js';
import { getJsonFile, updateJsonFile } from './_utils/github.js';

interface PlatformFollowers {
  youtube?: number;
  instagram?: number;
  tiktok?: number;
}

interface SocialMedia {
  youtube?: string;
  youtube2?: string;
  instagram?: string;
  tiktok?: string;
}

interface Audience {
  age: string;
  gender: string;
}

interface Talent {
  id: string;
  name: string;
  category: string;
  bio: string;
  imageUrl: string;
  totalFollowers: number;
  platformFollowers: PlatformFollowers;
  audience: Audience;
  socialMedia: SocialMedia;
  previousCollaborations: string[];
  strengths: string[];
  engagement?: string;
}

const DATA_PATH = 'src/data/talents.json';

function validateTalent(talent: unknown): { valid: boolean; error?: string; data?: Omit<Talent, 'id' | 'totalFollowers'> } {
  if (!talent || typeof talent !== 'object') {
    return { valid: false, error: 'Talent data is required' };
  }
  
  const t = talent as Record<string, unknown>;
  
  // Required string fields
  if (!t.name || typeof t.name !== 'string' || t.name.trim().length === 0) {
    return { valid: false, error: 'Talent name is required' };
  }
  
  if (!t.category || typeof t.category !== 'string' || t.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }
  
  if (!t.bio || typeof t.bio !== 'string' || t.bio.trim().length === 0) {
    return { valid: false, error: 'Bio is required' };
  }
  
  if (!t.imageUrl || typeof t.imageUrl !== 'string' || t.imageUrl.trim().length === 0) {
    return { valid: false, error: 'Image URL is required' };
  }
  
  // Validate platformFollowers
  if (!t.platformFollowers || typeof t.platformFollowers !== 'object') {
    return { valid: false, error: 'Platform followers data is required' };
  }
  
  const pf = t.platformFollowers as Record<string, unknown>;
  const platformFollowers: PlatformFollowers = {};
  
  if (pf.youtube !== undefined) {
    if (typeof pf.youtube !== 'number' || pf.youtube < 0) {
      return { valid: false, error: 'YouTube followers must be a non-negative number' };
    }
    platformFollowers.youtube = pf.youtube;
  }
  
  if (pf.instagram !== undefined) {
    if (typeof pf.instagram !== 'number' || pf.instagram < 0) {
      return { valid: false, error: 'Instagram followers must be a non-negative number' };
    }
    platformFollowers.instagram = pf.instagram;
  }
  
  if (pf.tiktok !== undefined) {
    if (typeof pf.tiktok !== 'number' || pf.tiktok < 0) {
      return { valid: false, error: 'TikTok followers must be a non-negative number' };
    }
    platformFollowers.tiktok = pf.tiktok;
  }
  
  // Validate audience
  if (!t.audience || typeof t.audience !== 'object') {
    return { valid: false, error: 'Audience data is required' };
  }
  
  const aud = t.audience as Record<string, unknown>;
  if (!aud.age || typeof aud.age !== 'string') {
    return { valid: false, error: 'Audience age range is required' };
  }
  if (!aud.gender || typeof aud.gender !== 'string') {
    return { valid: false, error: 'Audience gender distribution is required' };
  }
  
  // Validate socialMedia
  if (!t.socialMedia || typeof t.socialMedia !== 'object') {
    return { valid: false, error: 'Social media links are required' };
  }
  
  const sm = t.socialMedia as Record<string, unknown>;
  const socialMedia: SocialMedia = {};
  
  const urlFields = ['youtube', 'youtube2', 'instagram', 'tiktok'] as const;
  for (const field of urlFields) {
    if (sm[field] !== undefined && sm[field] !== '') {
      if (typeof sm[field] !== 'string') {
        return { valid: false, error: `${field} URL must be a string` };
      }
      try {
        new URL(sm[field] as string);
        socialMedia[field] = sm[field] as string;
      } catch {
        return { valid: false, error: `Invalid ${field} URL format` };
      }
    }
  }
  
  // Validate arrays
  let previousCollaborations: string[] = [];
  if (t.previousCollaborations !== undefined) {
    if (!Array.isArray(t.previousCollaborations)) {
      return { valid: false, error: 'Previous collaborations must be an array' };
    }
    previousCollaborations = t.previousCollaborations.filter(c => typeof c === 'string' && c.trim().length > 0);
  }
  
  let strengths: string[] = [];
  if (t.strengths !== undefined) {
    if (!Array.isArray(t.strengths)) {
      return { valid: false, error: 'Strengths must be an array' };
    }
    strengths = t.strengths.filter(s => typeof s === 'string' && s.trim().length > 0);
  }
  
  return {
    valid: true,
    data: {
      name: t.name as string,
      category: t.category as string,
      bio: t.bio as string,
      imageUrl: t.imageUrl as string,
      platformFollowers,
      audience: {
        age: aud.age as string,
        gender: aud.gender as string
      },
      socialMedia,
      previousCollaborations,
      strengths,
      ...(t.engagement && typeof t.engagement === 'string' ? { engagement: t.engagement } : {})
    }
  };
}

function generateTalentId(existingTalents: Talent[]): string {
  // Find the highest numeric ID
  const numericIds = existingTalents
    .map(t => parseInt(t.id, 10))
    .filter(id => !isNaN(id));
  
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  return String(maxId + 1);
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
    // Get all talents
    const result = await getJsonFile<Talent[]>(DATA_PATH);
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch talents data' });
    }
    return res.status(200).json({ talents: result.data });
  }
  
  if (req.method === 'POST') {
    // Add new talent
    const validation = validateTalent(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Get current data
    const result = await getJsonFile<Talent[]>(DATA_PATH);
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch talents data' });
    }
    
    // Check for duplicate name
    if (result.data.some(t => t.name.toLowerCase() === validation.data!.name.toLowerCase())) {
      return res.status(400).json({ error: 'A talent with this name already exists' });
    }
    
    // Calculate total followers
    const pf = validation.data.platformFollowers;
    const totalFollowers = (pf.youtube || 0) + (pf.instagram || 0) + (pf.tiktok || 0);
    
    const newTalent: Talent = {
      id: generateTalentId(result.data),
      totalFollowers,
      ...validation.data
    };
    
    // Add new talent
    result.data.push(newTalent);
    
    // Save to GitHub
    const success = await updateJsonFile(
      DATA_PATH,
      result.data,
      `Add talent: ${newTalent.name} (via admin panel by ${auth.email})`,
      result.sha
    );
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to save talent data' });
    }
    
    return res.status(201).json({ success: true, talent: newTalent });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
