// Called by the WhatsApp bot on Railway to push logs to the dashboard.
// Stores in Supabase terminal_logs table using the service key (server-side only).
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { level = 'INFO', message = '', chat_id = '' } = req.body as {
    level: string;
    message: string;
    chat_id: string;
  };

  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_KEY;

  // If Supabase not configured — just acknowledge (logs are optional)
  if (!supabaseUrl || !serviceKey) {
    return res.status(200).json({ status: 'received', stored: false });
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/terminal_logs`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        command: `[${level}] ${message}`,
        output: '',
        // user_id can be looked up by chat_id if needed
      }),
    });
    return res.status(200).json({ status: 'received', stored: true });
  } catch {
    return res.status(200).json({ status: 'received', stored: false });
  }
}
