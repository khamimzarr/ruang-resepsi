# Ruang Resepsi — Undangan Digital Pernikahan

Undangan digital elegan — HTML + Tailwind CDN + Vanilla JS + **Vercel Functions & Blob**. Satu link pendek per tamu (`/u/:id`) via WhatsApp, **1 foto prewed auto-hapus 7 hari**.

**Live:** https://ruang-resepsi.vercel.app → `https://ruang-resepsi.vercel.app/u/<id>?tamu=<b64>` (7 hari, lewat `410 expired`)  
**Desain:** Sequence editorial — violet `#a565ff`, serif display, border `ash #e5e7eb`  
**Alur superpowers:** lihat `../khamim-portfolio/ALUR-KERJA-SUPERPOWERS.md` (8 fase: brainstorming → auto-update)

---

## Struktur File

```
index.html       # FE: landing + setup + sender + invitation (cover + foto hero 220px/360px)
api/
  create.js      # POST /api/create → gen 6-char id, Blob prewed/<id>.jpg + invites/<id>.json (expiresAt +7 hari)
  invite.js      # GET /api/invite?id= → 200 sebelum 7 hari, 410 expired setelahnya + best-effort del
  cleanup.js     # GET /api/cleanup → cron 03:00 WIB (0 20 * * * UTC), sapu invites yang lewat expiresAt
vercel.json      # cleanUrls + rewrites /u/:id → / + crons
package.json     # @vercel/blob
og-image.png     # 1200×630 thumbnail WA
```

Tanpa bundler. BE hanya 3 file serverless.

---

## 3 State + Route `/u/:id` (prioritas tertinggi dulu)

| State | Kapan muncul | Penanda |
|-------|--------------|---------|
| **Expired** | `GET /api/invite?id=<id>` → `404/410` (lewat 7 hari) | `#expired-wrap` — "Link Kadaluarsa" |
| **3 — Undangan Tamu** | Ada `/u/<id>?tamu=...` atau `?tamu=&p=&w=` | `hasGuestParams = has('tamu')\|\|has('p')\|\|has('w')\|\|!!shortId` |
| **1 — Setup Mempelai** | Tanpa URL params & `localStorage["ruang_resepsi_data"]` kosong | Form pria/wanita/tanggal/jam/**lokasi (nama)** / **link GMaps** / **foto prewed** |
| **2 — Dashboard WA** | Tanpa URL params tapi `localStorage` ada data `{id, shortUrl, ...}` | Kirim loop WA short link + rekap + export CSV |

> `/u/<id>` via `vercel.json` `rewrites: [{ source:"/u/:id", destination:"/" }]` — bukan `/index.html` (hindari 308 dengan `cleanUrls`). Foto & data undangan fetch `GET /api/invite?id=<id>` (sebelum 7 hari `200`, lewat `410`).

### URL params

- **Short (dipakai sekarang):** `/u/<6-char>?tamu=<b64 nama tamu>` — data mempelai & foto diambil dari `invites/<id>.json` + `prewed/<id>.jpg` di Blob.
- **Legacy panjang (masih support tanpa foto):** `?tamu=<b64>&p=<b64 pria>&w=<b64 wanita>&t=<b64 tgl>&j=<b64 jam>&l=<b64 lokasi>&maps=<b64 GMaps>&acara=<b64>` — `btoa(unescape(encodeURIComponent(str)))`.

### localStorage

- `ruang_resepsi_data` — `{ id, shortUrl, pria, wanita, tanggal, jam, lokasi, maps, acara, fotoUrl, fotoPath, createdAt, expiresAt }`
- `ruang_resepsi_recent` — `[{ nama, wa, link }]` (link sudah `/u/<id>?tamu=...`)
- `ruang_resepsi_rsvp` — `{ "rsvp-[namaTamu]": "Hadir"|"Tidak Hadir"|"Ragu" }`
- `ruang_resepsi_opened_[tamu]` — flag cover sekali per tamu

---

## Fitur Undangan Tamu (State 3)

- **Cover gate** personal + **foto hero** `220px` (`#cover-foto`) — hanya jika ada `fotoUrl` dari Blob, else hidden
- **Foto hero** `360px` (`#inv-foto`) di atas judul — hanya jika ada foto
- Info + **countdown live** ke `tanggal jam`
- **Peta SATU SUMBER:** `inv-maps` + `inv-maps2` + `inv-qrlink` + `inv-mapframe` + `QRCode` semua pakai 1 `mapsLink` dari pengirim (`field maps`) — `embedFromMapsLink()` handle `?q`/`?query`, `/place/`, `@lat,lng`, `goo.gl`
- **Susunan Acara** — hanya jika `acara` diisi
- **Musik latar** — `soundhelix` `preload="auto"` `playsinline`, play on `bukaUndangan()` (user gesture), toggle `#btn-msc`
- **WA:** `sender-wa` input `pattern ^8[0-9]{7,12}$` + prefix fixed `+62` (ketik `8xxx` saja), `wa='62'+raw` → `https://wa.me/<wa>?text=...` dengan `buildGuestShortUrl()` (`/u/<id>?tamu=...`)

Tanpa amplop digital (dihapus — kurang etis, commit `06343da`).

---

## Foto Prewed 7-Hari (A)

- **Setup:** `<input id="setup-foto" type="file" accept="image/*">` + preview `72px` → `compressImage(900, 0.6)` ~40KB (fallback `700/0.55` jika >70KB, tolak >140KB), max asli `10MB`
- **BE:** `POST /api/create { pria,wanita,tanggal,jam,lokasi,maps,acara, fotoDataUrl }` → `put(prewed/<id>.jpg)` + `put(invites/<id>.json { expiresAt: +7 hari })` → `{ id, shortUrl, expiresAt, fotoUrl }`
- **Expire:** `GET /api/invite?id=` cek `expiresAt` — sebelum `200` + foto, lewat `410 {expired:true}` + `#expired-wrap`, `cleanup.js` cron `0 20 * * *` (UTC → 03:00 WIB)

---

## Tech

- Tailwind via CDN, `qrcodejs@1.0.0`, Inter + Cormorant Garamond
- Vanilla JS, `api/*` Vercel Blob (`store_zpZgtVgOvpE5px4A`, `public`)
- Deploy: `vercel --prod --yes` (team `voiddarkfire/ruang-resepsi`, alias `ruang-resepsi.vercel.app`) — **create new, jangan timpa** (cek `.vercel/project.json`)

---

## Ubah Cepat

Lihat **PANDUAN-EDIT.md** (foto, warna, hero, peta SATU SUMBER, WA +62).

## Lisensi

Bebas dipakai & dimodifikasi.
