// GitHub API utilities for updating JSON files in the repository

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubFileResponse {
  content: string;
  sha: string;
  path: string;
}

export async function getFileFromGitHub(path: string): Promise<{ content: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  
  if (!token || !repo) {
    console.error('Missing GITHUB_TOKEN or GITHUB_REPO environment variables');
    return null;
  }
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to get file ${path}:`, response.status);
      return null;
    }
    
    const data = await response.json() as GitHubFileResponse;
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    
    return { content, sha: data.sha };
  } catch (error) {
    console.error('Error getting file from GitHub:', error);
    return null;
  }
}

export async function updateFileOnGitHub(
  path: string,
  content: string,
  message: string,
  sha: string
): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  
  if (!token || !repo) {
    console.error('Missing GITHUB_TOKEN or GITHUB_REPO environment variables');
    return false;
  }
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        sha
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to update file ${path}:`, response.status, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating file on GitHub:', error);
    return false;
  }
}

export async function getJsonFile<T>(path: string): Promise<{ data: T; sha: string } | null> {
  const result = await getFileFromGitHub(path);
  if (!result) return null;
  
  try {
    const data = JSON.parse(result.content) as T;
    return { data, sha: result.sha };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

export async function updateJsonFile<T>(
  path: string,
  data: T,
  message: string,
  sha: string
): Promise<boolean> {
  const content = JSON.stringify(data, null, 2);
  return updateFileOnGitHub(path, content, message, sha);
}
