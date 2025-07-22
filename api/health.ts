import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: "vercel",
    message: "MusicReward API Health Check"
  });
}