// api/stream.js — Vercel Serverless Function
// Proxie le stream vidéo depuis Google Drive
// Les clés API ne sont JAMAIS exposées au client

export const config = { api: { responseLimit: false } };

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Dans .env.local + Vercel Dashboard

export default async function handler(req, res) {
  // CORS
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN || '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { fileId } = req.query;
  if (!fileId) return res.status(400).json({ error: 'fileId manquant' });

  try {
    // 1. Récupère les métadonnées du fichier
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=size,mimeType,name&key=${GOOGLE_API_KEY}`
    );
    if (!metaRes.ok) throw new Error('Fichier introuvable');
    const meta = await metaRes.json();

    const fileSize = parseInt(meta.size);
    const mimeType = meta.mimeType || 'video/mp4';

    // 2. Gestion du Range (seek dans la vidéo)
    const rangeHeader = req.headers.range;
    let start = 0;
    let end = fileSize - 1;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    const chunkSize = end - start + 1;

    // 3. Proxy le stream depuis Google Drive
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`,
      { headers: { Range: `bytes=${start}-${end}` } }
    );

    // 4. Headers de streaming vidéo
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', chunkSize);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');

    if (rangeHeader) {
      res
        .status(206)
        .setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    } else {
      res.status(200);
    }

    // 5. Pipe le stream
    const reader = driveRes.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
      await pump();
    };
    await pump();
  } catch (err) {
    console.error('Stream error:', err);
    if (!res.headersSent)
      res.status(500).json({ error: 'Erreur de streaming' });
  }
}
