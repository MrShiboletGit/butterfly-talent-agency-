import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth.js';

interface DeploymentResponse {
  id: string;
  url: string;
  state: string;
}

async function triggerVercelRebuild(): Promise<{ success: boolean; deployment?: DeploymentResponse; error?: string }> {
  // Use Deploy Hook - the simplest and most reliable way to trigger rebuilds
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  
  if (!hookUrl) {
    return { 
      success: false, 
      error: 'VERCEL_DEPLOY_HOOK not configured. Create a Deploy Hook in Vercel Project Settings → Git → Deploy Hooks' 
    };
  }
  
  try {
    const response = await fetch(hookUrl, { method: 'POST' });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to trigger deploy hook:', error);
      return { success: false, error: 'Failed to trigger rebuild via deploy hook' };
    }
    
    // Deploy hooks return a job object
    const data = await response.json();
    
    return { 
      success: true, 
      deployment: { 
        id: data.job?.id || 'triggered', 
        url: '', 
        state: 'BUILDING' 
      } 
    };
  } catch (error) {
    console.error('Error triggering rebuild:', error);
    return { success: false, error: 'Failed to trigger rebuild' };
  }
}

async function triggerGitHubAction(): Promise<{ success: boolean; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  
  if (!token || !repo) {
    return { success: false, error: 'Missing GitHub configuration' };
  }
  
  try {
    // Trigger a repository dispatch event that can run the metrics scripts
    const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        event_type: 'update-metrics',
        client_payload: {
          triggered_by: 'admin-panel',
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok && response.status !== 204) {
      const error = await response.text();
      console.error('Failed to trigger GitHub action:', error);
      return { success: false, error: 'Failed to trigger metrics update. Ensure a workflow listens for repository_dispatch events.' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error triggering GitHub action:', error);
    return { success: false, error: 'Failed to trigger metrics update' };
  }
}

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
  
  const { action } = req.body || {};
  const results: {
    rebuild?: { success: boolean; deployment?: DeploymentResponse; error?: string };
    metrics?: { success: boolean; error?: string };
  } = {};
  
  // Handle different actions
  if (action === 'rebuild' || action === 'all') {
    results.rebuild = await triggerVercelRebuild();
  }
  
  if (action === 'metrics' || action === 'all') {
    results.metrics = await triggerGitHubAction();
  }
  
  // Default to rebuilding if no action specified
  if (!action) {
    results.rebuild = await triggerVercelRebuild();
  }
  
  const hasErrors = (results.rebuild && !results.rebuild.success) || 
                    (results.metrics && !results.metrics.success);
  
  return res.status(hasErrors ? 500 : 200).json({
    success: !hasErrors,
    results,
    triggeredBy: auth.email,
    timestamp: new Date().toISOString()
  });
}
