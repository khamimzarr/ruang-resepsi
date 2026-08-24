import { put, list } from '@vercel/blob';

function genId(len = 6) {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  for (let i = 0; i < len; i++) s += c[a[i] % c.length];
  return s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { pria, wanita, tanggal, jam, lokasi, maps, acara, bank, rek, fotoDataUrl } = body || {};

    if (!pria || !wanita || !tanggal || !jam || !lokasi || !maps) {
      return res.status(400).json({ error: 'Field wajib belum lengkap' });
    }
    if (!/^https?:\/\//.test(maps)) return res.status(400).json({ error: 'Link Maps harus https://' });

    // validasi foto jika ada (dataURL jpeg)
    let fotoUrl = null;
    let fotoPath = null;
    let id = genId(6);

    // cek collision (sangat jarang) — loop max 3
    for (let k = 0; k < 3; k++) {
      const { blobs } = await list({ prefix: `invites/${id}.json`, limit: 1 });
      if (!blobs.length) break;
      id = genId(6);
    }

    if (fotoDataUrl) {
      if (typeof fotoDataUrl !== 'string' || !fotoDataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Format foto tidak valid' });
      }
      // batasi ~120KB base64 (~90KB file) biar aman
      if (fotoDataUrl.length > 140_000) return res.status(400).json({ error: 'Foto terlalu besar setelah kompres (max ~90KB). Coba foto lain.' });
      const m = fotoDataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!m) return res.status(400).json({ error: 'Foto base64 tidak valid' });
      const contentType = m[1];
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 120_000) return res.status(400).json({ error: 'File foto kebesaran' });
      fotoPath = `prewed/${id}.jpg`;
      const blob = await put(fotoPath, buf, { access: 'public', contentType: contentType || 'image/jpeg', addRandomSuffix: false });
      fotoUrl = blob.url;
    }

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const bundle = {
      id, pria, wanita, tanggal, jam, lokasi, maps,
      acara: acara || '', bank: bank || '', rek: rek || '',
      fotoUrl, fotoPath, createdAt, expiresAt
    };

    await put(`invites/${id}.json`, JSON.stringify(bundle), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false
    });

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const origin = `${proto}://${host}`;
    const shortUrl = `${origin}/u/${id}`;

    return res.status(200).json({ id, shortUrl, expiresAt, createdAt, fotoUrl });
  } catch (e) {
    console.error('create error', e);
    return res.status(500).json({ error: 'Gagal membuat undangan', detail: String(e?.message || e) });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };
