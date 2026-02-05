import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_EMAILS = [
  'mr.shibolet@gmail.com',
  'natilevi46@gmail.com'
];

interface GoogleTokenPayload {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  sub: string;
}

export async function verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
  try {
    // Verify the token with Google's tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    
    if (!response.ok) {
      console.error('Token verification failed:', response.status);
      return null;
    }
    
    const payload = await response.json() as GoogleTokenPayload;
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

export async function verifyAuth(req: VercelRequest): Promise<{ valid: boolean; email?: string; error?: string }> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyGoogleToken(token);
  
  if (!payload) {
    return { valid: false, error: 'Invalid token' };
  }
  
  if (!payload.email_verified) {
    return { valid: false, error: 'Email not verified' };
  }
  
  if (!isEmailAllowed(payload.email)) {
    return { valid: false, error: 'Unauthorized email address' };
  }
  
  return { valid: true, email: payload.email };
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
  
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  const payload = await verifyGoogleToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (!payload.email_verified) {
    return res.status(401).json({ error: 'Email not verified' });
  }
  
  if (!isEmailAllowed(payload.email)) {
    return res.status(403).json({ error: 'Unauthorized email address. Access restricted.' });
  }
  
  return res.status(200).json({
    success: true,
    user: {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    }
  });
}
