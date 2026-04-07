import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { key } = req.body as { key: string };

  if (key && key.startsWith('sk-')) {
    return res.status(200).json({ valid: true });
  }

  return res.status(200).json({ valid: false, error: 'Key must start with sk-' });
}
