import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pathname = req.query.pathname as string;
    if (!pathname) {
      return res.status(400).json({ error: 'pathname query parameter required' });
    }

    const contentType = req.headers['content-type'] || 'image/webp';

    // Collect body chunks
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks);

    const blob = await put(pathname, body, {
      access: 'public',
      contentType,
      allowOverwrite: true,
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ url: blob.url, pathname: blob.pathname });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
