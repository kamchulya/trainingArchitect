import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Simulate webhook check with a small delay
  setTimeout(() => {
    res.status(200).json({ status: 200, message: 'Connection established' });
  }, 1500);
}
