import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  // Allow cron via Vercel Cron header or manual trigger with ?secret (optional)
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Optional simple protection: if CRON_SECRET set, require it (but allow Vercel Cron without it)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = req.headers['x-cron-secret'] || req.query.secret;
    const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['x-vercel-cron'] === 'true';
    if (!isVercelCron && provided !== cronSecret) {
      // allow manual trigger without secret in dev, but in prod require either cron header or secret
      if (process.env.VERCEL_ENV === 'production') return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const { blobs } = await list({ prefix: 'invites/', limit: 1000 });
    let deleted = 0;
    const now = new Date();
    const toDelete = [];

    for (const b of blobs) {
      if (!b.pathname.endsWith('.json')) continue;
      try {
        const r = await fetch(b.url, { cache: 'no-store' });
        if (!r.ok) continue;
        const bundle = await r.json();
        const exp = bundle.expiresAt ? new Date(bundle.expiresAt) : null;
        if (exp && now > exp) {
          toDelete.push(b.pathname);
          if (bundle.fotoPath) toDelete.push(bundle.fotoPath);
        }
      } catch (_) {}
    }

    if (toDelete.length) {
      // batch dalam grup kecil
      for (let i = 0; i < toDelete.length; i += 50) {
        const chunk = toDelete.slice(i, i + 50);
        try { await del(chunk); deleted += chunk.length; } catch (_) {}
      }
    }

    return res.status(200).json({ ok: true, scanned: blobs.length, deleted, at: now.toISOString() });
  } catch (e) {
    console.error('cleanup error', e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
