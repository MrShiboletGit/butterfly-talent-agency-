import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth';
import { getJsonFile, updateJsonFile } from './_utils/github';

interface Client {
  id: string;
  name: string;
  logoUrl: string;
}

const DATA_PATH = 'src/data/clients.json';

function validateClient(client: unknown): { valid: boolean; error?: string; data?: Omit<Client, 'id'> } {
  if (!client || typeof client !== 'object') {
    return { valid: false, error: 'Client data is required' };
  }
  
  const c = client as Record<string, unknown>;
  
  if (!c.name || typeof c.name !== 'string' || c.name.trim().length === 0) {
    return { valid: false, error: 'Client name is required' };
  }
  
  if (!c.logoUrl || typeof c.logoUrl !== 'string' || c.logoUrl.trim().length === 0) {
    return { valid: false, error: 'Logo URL is required' };
  }
  
  // Validate URL format
  try {
    new URL(c.logoUrl as string);
  } catch {
    return { valid: false, error: 'Invalid logo URL format' };
  }
  
  return {
    valid: true,
    data: {
      name: c.name as string,
      logoUrl: c.logoUrl as string
    }
  };
}

function generateClientId(name: string, existingIds: Set<string>): string {
  // Create a slug from the name
  let baseId = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // If empty after sanitization, use a generic id
  if (!baseId) {
    baseId = 'client';
  }
  
  // Ensure uniqueness
  let id = baseId;
  let counter = 1;
  while (existingIds.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }
  
  return id;
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
    // Get all clients
    const result = await getJsonFile<Client[]>(DATA_PATH);
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch clients data' });
    }
    return res.status(200).json({ clients: result.data });
  }
  
  if (req.method === 'POST') {
    // Add new client
    const validation = validateClient(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Get current data
    const result = await getJsonFile<Client[]>(DATA_PATH);
    if (!result) {
      return res.status(500).json({ error: 'Failed to fetch clients data' });
    }
    
    const existingIds = new Set(result.data.map(c => c.id));
    const newClient: Client = {
      id: generateClientId(validation.data.name, existingIds),
      ...validation.data
    };
    
    // Check for duplicate name
    if (result.data.some(c => c.name.toLowerCase() === newClient.name.toLowerCase())) {
      return res.status(400).json({ error: 'A client with this name already exists' });
    }
    
    // Add new client
    result.data.push(newClient);
    
    // Save to GitHub
    const success = await updateJsonFile(
      DATA_PATH,
      result.data,
      `Add client: ${newClient.name} (via admin panel by ${auth.email})`,
      result.sha
    );
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to save client data' });
    }
    
    return res.status(201).json({ success: true, client: newClient });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
