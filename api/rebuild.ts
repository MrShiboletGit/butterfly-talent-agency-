import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth.js';

// Simple and fast rebuild - only triggers Vercel deploy hook
// Metrics update runs automatically via daily GitHub Action (not on reload)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error });
  }
  
  // Use Deploy Hook - fast and reliable
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  
  if (!hookUrl) {
    return res.status(500).json({ 
      success: false, 
      error: 'VERCEL_DEPLOY_HOOK not configured. Create a Deploy Hook in Vercel Project Settings → Git → Deploy Hooks' 
    });
  }
  
  try {
    const response = await fetch(hookUrl, { method: 'POST' });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to trigger deploy hook:', error);
      return res.status(500).json({ success: false, error: 'Failed to trigger rebuild' });
    }
    
    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      message: 'Rebuild triggered successfully',
      jobId: data.job?.id || 'triggered',
      triggeredBy: auth.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering rebuild:', error);
    return res.status(500).json({ success: false, error: 'Failed to trigger rebuild' });
  }
}
