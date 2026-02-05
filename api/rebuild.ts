import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth';

interface DeploymentResponse {
  id: string;
  url: string;
  state: string;
}

async function triggerVercelRebuild(): Promise<{ success: boolean; deployment?: DeploymentResponse; error?: string }> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID; // Optional, for team projects
  
  if (!token || !projectId) {
    return { success: false, error: 'Missing Vercel configuration' };
  }
  
  try {
    // Create a new deployment by triggering a redeploy of the latest deployment
    const deploymentsUrl = teamId 
      ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=1`
      : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`;
    
    // First, get the latest deployment
    const listResponse = await fetch(deploymentsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!listResponse.ok) {
      const error = await listResponse.text();
      console.error('Failed to list deployments:', error);
      return { success: false, error: 'Failed to get current deployment' };
    }
    
    const listData = await listResponse.json();
    const latestDeployment = listData.deployments?.[0];
    
    if (!latestDeployment) {
      return { success: false, error: 'No deployments found' };
    }
    
    // Trigger a new deployment using the deploy hook or by creating a deployment
    // Using the project's production branch
    const createUrl = teamId
      ? `https://api.vercel.com/v13/deployments?teamId=${teamId}`
      : 'https://api.vercel.com/v13/deployments';
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: latestDeployment.name,
        project: projectId,
        target: 'production',
        gitSource: {
          type: 'github',
          ref: 'main', // or your default branch
          repoId: latestDeployment.gitSource?.repoId
        }
      })
    });
    
    if (!createResponse.ok) {
      // Try alternative: use deploy hook if available
      const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
      if (hookUrl) {
        const hookResponse = await fetch(hookUrl, { method: 'POST' });
        if (hookResponse.ok) {
          return { 
            success: true, 
            deployment: { 
              id: 'hook-triggered', 
              url: '', 
              state: 'BUILDING' 
            } 
          };
        }
      }
      
      const error = await createResponse.text();
      console.error('Failed to create deployment:', error);
      return { success: false, error: 'Failed to trigger rebuild. You may need to set up a deploy hook.' };
    }
    
    const deploymentData = await createResponse.json();
    
    return {
      success: true,
      deployment: {
        id: deploymentData.id,
        url: deploymentData.url,
        state: deploymentData.readyState || 'BUILDING'
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
