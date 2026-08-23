# Ruang Resepsi — Undangan Digital Pernikahan

Undangan pernikahan digital elegan, frontend-only (HTML + Tailwind CDN + Vanilla JS). Satu tautan personal per tamu, dikirim via WhatsApp.

**Live:** https://ruang-resepsi.vercel.app
**Desain:** Sequence editorial (DESIGN.md) — violet `#a565ff`, serif display, border `ash #e5e7eb`

---

## Struktur File

```
index.html      # Satu file: semua state + logic + style (deploy ke Vercel)
og-image.png    # Thumbnail saat link di-share ke WhatsApp (1200x630)
vercel.json     # Config Vercel (cleanUrls)
```

Tanpa build, tanpa database, tanpa framework.

---

## 3 State (prioritas tertinggi dulu)

| State | Kapan muncul | Penanda |
|-------|--------------|---------|
| **3 — Undangan Tamu** | Ada param URL `?tamu=&p=&w=&t=&j=&l=&maps=&acara=&bank=&rek=` | `hasGuestParams = has('tamu') \|\| has('p') \|\| has('w')` |
| **1 — Setup Mempelai** | Tanpa URL params & `localStorage["ruang_resepsi_data"]` kosong | Form pria/wanita/tanggal/jam/**lokasi (nama)\*** / **link GMaps\*** |
| **2 — Dashboard WA** | Tanpa URL params tapi `localStorage` ada data | Kirim loop WA + rekap + export CSV |

> Lokasi = **nama tempat saja** (cth. "Gedung Melati"). Link Google Maps **wajib** diisi terpisah — lihat `PANDUAN-EDIT.md`.

### URL params (Base64)

```
?tamu=<b64 nama tamu>
&p=<b64 pria>&w=<b64 wanita>
&t=<b64 tanggal>&j=<b64 jam>&l=<b64 lokasi>
&maps=<b64 link GMaps>&acara=<b64 susunan acara>
&bank=<b64 bank>&rek=<b64 rekening>
```

Semua nilai di-encode `btoa(unescape(encodeURIComponent(str)))` agar URL tetap bersih, aman untuk spasi/aksen.

### localStorage

- `ruang_resepsi_data` — detail mempelai (pria, wanita, tanggal, jam, lokasi, maps, acara, bank, rek)
- `ruang_resepsi_recent` — array tamu terkirim `{nama, wa, link}`
- `ruang_resepsi_rsvp` — JSON `{ "rsvp-[namaTamu]": "Hadir"|"Tidak Hadir"|"Ragu" }`
- `ruang_resepsi_opened_[tamu]` — flag per tamu agar cover hanya sekali

---

## Fitur Undangan Tamu (State 3)

- **Cover gate** personal "Kepada Yth. [Tamu]" + tombol Buka Undangan (skip bila sudah pernah dibuka di device tsb)
- Info + **countdown live** ke `tanggal jam`
- **Peta:** iframe embed dari link GMaps pengirim + tombol "Buka Google Maps" (= link asli, bukan pencarian) + **QR code** navigasi
- **Susunan Acara** (hanya bila diisi di setup; kalau kosong tidak tampil)
- **Amplop Digital** — placeholder nonaktif bila rekening kosong; aktif bila `bank && rek` terisi
- **Musik latar** tombol pojok (autoplay muted saat buka undangan)
- Tombol "Konfirmasi Kehadiran" → `wa.me/?text=...`

---

## Tech

- Tailwind via CDN, font: Inter + Cormorant Garamond
- Vanilla JS, tidak ada bundler
- Deploy: `vercel --prod --yes` (project `voiddarkfire/ruang-resepsi`, alias `ruang-resepsi.vercel.app`)

---

## Ubah Cepat

Lihat **PANDUAN-EDIT.md** untuk cara mengubah warna, teks sambutan, daftar acara, QR, dll tanpa merusak layout.

## Lisensi

Frontend-only, bebas dipakai & dimodifikasi.
