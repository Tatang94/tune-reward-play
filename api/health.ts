import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}