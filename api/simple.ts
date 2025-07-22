import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({ 
    status: "working", 
    time: new Date().toISOString(),
    path: req.url,
    method: req.method 
  });
}