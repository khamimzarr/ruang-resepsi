import { head, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const id = (req.query.id || '').trim();
  if (!id || !/^[A-Za-z0-9]{4,16}$/.test(id)) return res.status(400).json({ error: 'ID tidak valid' });

  try {
    const pathname = `invites/${id}.json`;
    // fetch via head dulu untuk cek exists, lalu fetch body via public url
    // Verifikasi exist via list (lebih ringan)
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const blob = blobs.find(b => b.pathname === pathname);
    if (!blob) return res.status(404).json({ error: 'Undangan tidak ditemukan atau sudah kadaluarsa', expired: true });

    // cek expiresAt via blob properties — tapi lebih akurat fetch JSON
    const r = await fetch(blob.url, { cache: 'no-store' });
    if (!r.ok) return res.status(404).json({ error: 'Undangan tidak ditemukan', expired: true });
    const bundle = await r.json();

    // A2: lewat 7 hari = expired total → 410 + trigger delete best-effort
    const expiresAt = bundle.expiresAt ? new Date(bundle.expiresAt) : null;
    if (expiresAt && new Date() > expiresAt) {
      // best-effort delete — jangan block response
      try {
        const { del } = await import('@vercel/blob');
        const toDel = [pathname];
        if (bundle.fotoPath) toDel.push(bundle.fotoPath);
        // fire and forget
        del(toDel).catch(() => {});
      } catch (_) {}
      return res.status(410).json({ error: 'Link sudah kadaluarsa (7 hari). Minta link baru ke mempelai.', expired: true, expiresAt: bundle.expiresAt });
    }

    // sebelum 7 hari → tetap bisa dibuka (sesuai request A2)
    // jangan expose fotoPath internal terlalu detail tapi boleh
    return res.status(200).json(bundle);
  } catch (e) {
    console.error('invite error', e);
    return res.status(500).json({ error: 'Gagal memuat undangan' });
  }
}
