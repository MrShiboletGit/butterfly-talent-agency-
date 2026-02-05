// Admin API client for making authenticated requests

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function makeRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Client types
export interface Client {
  id: string;
  name: string;
  logoUrl: string;
}

export interface NewClient {
  name: string;
  logoUrl: string;
}

// Talent types
export interface PlatformFollowers {
  youtube?: number;
  instagram?: number;
  tiktok?: number;
}

export interface SocialMedia {
  youtube?: string;
  youtube2?: string;
  instagram?: string;
  tiktok?: string;
}

export interface Audience {
  age: string;
  gender: string;
}

export interface Talent {
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

export interface NewTalent {
  name: string;
  category: string;
  bio: string;
  imageUrl: string;
  platformFollowers: PlatformFollowers;
  audience: Audience;
  socialMedia: SocialMedia;
  previousCollaborations: string[];
  strengths: string[];
  engagement?: string;
}

// Campaign types
export interface ContentItem {
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

export interface CampaignDetails {
  objective: string;
  strategy: string;
  results: string;
}

export interface Campaign {
  id: string;
  title: string;
  clientId: string;
  description: string;
  imageUrl: string;
  category: string;
  kpis: {
    views: number;
    engagement: number;
    shares: number;
    reach: number;
    impressions: number;
  };
  talents: string[];
  platforms: string[];
  startDate: string;
  endDate: string;
  content: ContentItem[];
  details: CampaignDetails;
}

export interface NewCampaign {
  title: string;
  clientId: string;
  description: string;
  imageUrl: string;
  category: string;
  talents: string[];
  platforms: string[];
  startDate: string;
  endDate: string;
  content: ContentItem[];
  details: CampaignDetails;
}

// API functions
export const adminApi = {
  // Clients
  async getClients(token: string): Promise<ApiResponse<{ clients: Client[] }>> {
    return makeRequest('/clients', token);
  },

  async addClient(token: string, client: NewClient): Promise<ApiResponse<{ client: Client }>> {
    return makeRequest('/clients', token, {
      method: 'POST',
      body: JSON.stringify(client),
    });
  },

  // Talents
  async getTalents(token: string): Promise<ApiResponse<{ talents: Talent[] }>> {
    return makeRequest('/talents', token);
  },

  async addTalent(token: string, talent: NewTalent): Promise<ApiResponse<{ talent: Talent }>> {
    return makeRequest('/talents', token, {
      method: 'POST',
      body: JSON.stringify(talent),
    });
  },

  // Campaigns
  async getCampaigns(token: string): Promise<ApiResponse<{ campaigns: Campaign[] }>> {
    return makeRequest('/campaigns', token);
  },

  async addCampaign(token: string, campaign: NewCampaign): Promise<ApiResponse<{ campaign: Campaign }>> {
    return makeRequest('/campaigns', token, {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  },

  // Rebuild
  async triggerRebuild(token: string, action: 'rebuild' | 'metrics' | 'all' = 'all'): Promise<ApiResponse<{
    results: {
      rebuild?: { success: boolean; error?: string };
      metrics?: { success: boolean; error?: string };
    };
  }>> {
    return makeRequest('/rebuild', token, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },
};
