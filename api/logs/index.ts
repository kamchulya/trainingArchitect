// Vercel serverless — logs are stored in Supabase, not in-memory.
// This endpoint proxies to Supabase so the frontend doesn't need the service key.
// For now: returns empty array (logs panel is optional; real logs come from Railway bot).
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // Real implementation: fetch from Supabase terminal_logs table
    // For now returns empty — logs panel shows "No logs yet"
    return res.status(200).json([]);
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ status: 'cleared' });
  }

  return res.status(405).end();
}
