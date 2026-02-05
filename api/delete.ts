import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './auth.js';
import { getJsonFile, updateJsonFile } from './_utils/github.js';

type EntityType = 'client' | 'talent' | 'campaign';

interface DeleteRequest {
  type: EntityType;
  id: string;
}

const DATA_PATHS: Record<EntityType, string> = {
  client: 'src/data/clients.json',
  talent: 'src/data/talents.json',
  campaign: 'src/data/campaigns.json'
};

const ID_FIELDS: Record<EntityType, string> = {
  client: 'id',
  talent: 'id',
  campaign: 'id'
};

const NAME_FIELDS: Record<EntityType, string> = {
  client: 'name',
  talent: 'name',
  campaign: 'title'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error });
  }
  
  // Validate request body
  const { type, id } = req.body as DeleteRequest;
  
  if (!type || !id) {
    return res.status(400).json({ error: 'Missing required fields: type and id' });
  }
  
  if (!['client', 'talent', 'campaign'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be client, talent, or campaign' });
  }
  
  const dataPath = DATA_PATHS[type];
  const idField = ID_FIELDS[type];
  const nameField = NAME_FIELDS[type];
  
  try {
    // Get current data
    const result = await getJsonFile<Record<string, unknown>[]>(dataPath);
    
    if (!result) {
      return res.status(500).json({ error: `Failed to fetch ${type} data` });
    }
    
    // Find the item to delete
    const itemIndex = result.data.findIndex((item) => item[idField] === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: `${type} with id "${id}" not found` });
    }
    
    const deletedItem = result.data[itemIndex];
    const itemName = deletedItem[nameField] || id;
    
    // Remove the item
    result.data.splice(itemIndex, 1);
    
    // Save updated data with a very distinct commit message for easy recovery
    const commitMessage = `🗑️ DELETE ${type.toUpperCase()}: "${itemName}" (ID: ${id}) - by ${auth.email}`;
    
    const success = await updateJsonFile(
      dataPath,
      result.data,
      commitMessage,
      result.sha
    );
    
    if (!success) {
      return res.status(500).json({ error: `Failed to delete ${type}` });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Successfully deleted ${type}: ${itemName}`,
      deletedItem
    });
    
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return res.status(500).json({ error: `Failed to delete ${type}` });
  }
}
