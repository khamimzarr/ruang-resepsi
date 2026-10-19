# PANDUAN EDIT — Ruang Resepsi

File utama **hanya `index.html`** (single-file FE) + `api/*.js` untuk foto 7-hari. Cari dengan `Ctrl/Cmd + F` sesuai kata kunci di bawah.

---

## 1. Ganti Warna Utama (Violet)

Cari `#a565ff` di dalam `<style>`.

| Token | Ganti menjadi |
|-------|---------------|
| `#a565ff` | Warna CTA & accent kamu (contoh `#ec4899` untuk pink) |
| `#ebebff` | Latar badge / highlight (lavender wash) |
| `#e0c9ff` | Glow / shimmer (iris glow) |
| `#e5e7eb` | Border tipis (ash) |

Atau di bagian `tailwind.config` (awal `<script>`) → objek `colors`. Ubah `violet-pulse`.

> Preview: ubah satu warna, semua tombol + dot + garis shimmer ikut berubah.

---

## 2. Sambutan / Hero Beranda

Cari `id="beranda"` (section hero full). Di dalamnya:

- **Eyebrow:** `Undangan Digital Pernikahan` → ganti label kecil di atas judul.
- **H1:** `Satu ruang untuk <em>kisah cinta</em>` → ganti headline besar. Serif hanya untuk h1.
- **Paragraf di bawahnya:** `Buat undangan pernikahan yang elegan...` → ganti subline.
- **Tombol:** `Mulai Buat Undangan` / `Lihat Contoh`

Contoh edit headline:

```html
<h1 class="font-serif ...">Selamat datang di <em class="italic" style="color:#a565ff;">hari bahagia kami</em></h1>
```

---

## 3. Navigasi

Cari `<nav class="sticky` → 3 link: Beranda, Cara Kerja, Contoh.

- Tambah menu baru: duplikasi satu `<a href="#...">` dan buat section dengan `id` yang sama.
- Garis bawah aktif diatur oleh `.nav-link.active` di `<style>` (violet, tebal 2px). Jangan tambah `underline` manual.

---

## 4. Undangan Tamu (State 3) + Expired + Foto 7-Hari

Cari `<!-- ===== INVITATION (STATE 3) ===== -->`.

- **Expired:** `id="expired-wrap"` — tampil jika `GET /api/invite?id=` → `404/410` (lewat 7 hari). Jangan hapus.
- **Foto hero (7-hari):** `cover-foto-wrap` / `cover-foto` (220px cover) + `inv-foto-wrap` / `inv-foto` (360px hero) — hanya muncul jika ada `fotoUrl` dari Blob. Logic di `initInvitation()` (`if(fotoUrl) ... else hidden`). Tanpa foto = tetap elegan (hidden).
- **Cover:** `cover-pria`, `cover-wanita`, `cover-tamu` — teks dari Blob/fallback localStorage. Ubah pembuka statis di atasnya ("Kepada Yth.").
- **Ayat/Quotes:** baris `<p class="font-serif italic text-[18px]">` berisi QS. Ar-Rum — ganti atau hapus.
- **Countdown:** `cd-d / cd-h / cd-m / cd-s` — jangan hapus id-nya. Target `tanggal + jam`.
- **Peta SATU SUMBER (wajib sinkron):** `inv-mapframe` + `inv-maps` + `inv-maps2` + `inv-qrlink` + `qrcode` — **semua pakai 1 `mapsLink`** dari pengirim (`field maps`). `embedFromMapsLink()` handle `?q`/`?query`, `/place/`, `@lat,lng`, `goo.gl`. Jangan ubah `embedFromMapsLink` sembarang — test 2 tombol + QR harus buka URL sama.
- **QR navigasi:** `id="qrcode"` — `qrcodejs@1.0.0` (bukan `qrcode@1.5.3` yang 404). Ukuran di `initInvitation` → `{width:160,height:160}`.
- **Susunan acara:** `acara-wrap` — hanya jika `setup-acara` diisi. Format `Nama | Jam` per baris.
- **Musik:** `audio-bg` (`soundhelix`, `preload="auto"`) + `btn-msc` (toggle). Play on `bukaUndangan()` (user gesture).

> Amplop digital **sudah dihapus** (kurang etis, `06343da`). Jangan kembalikan `setup-bank/rek` / `salinRek` / `ampop-list` — sudah bersih dari `index.html` + `api/create.js`.

---

## 5. Form Setup (State 1) — Foto Prewed

Cari `<!-- ===== SETUP (STATE 1) ===== -->`.

Field wajib (ada `required`):
- `setup-pria`, `setup-wanita`, `setup-tanggal`, `setup-jam`
- `setup-lokasi` (**nama tempat saja**, bukan URL)
- `setup-maps` (**link Google Maps wajib**, ada panduan di bawahnya)

Field opsional:
- `setup-acara` — satu acara per baris `Nama | Jam`. Kosong = tidak tampil.
- `setup-foto` — **1 foto prewed** (`accept="image/*"`, max asli `10MB`, auto-kompres `canvas 900px JPEG 0.6 ~40KB`, fallback `700px 0.55` jika >70KB, tolak >140KB). Preview: `setup-foto-preview` + `setup-foto-img` + `setup-foto-remove`. Status: `setup-status`. Data: `_fotoDataUrl` dikirim sebagai `fotoDataUrl` ke `POST /api/create` (Blob `prewed/<id>.jpg`). Tanpa foto = tetap buat short link.

> Panduan "Cara ambil link" ada di `<p>Cara ambil link: buka Google Maps → ...</p>` di bawah `setup-maps`.

Validasi di JS: cari `if(!data.pria||...)` dan `if(!/^https?:\/\//.test(data.maps))` dan `_fotoDataUrl.length>140000`.

---

## 6. Dashboard Pengiriman (State 2) — Short Link + WA +62

Cari `<!-- ===== SENDER (STATE 2) ===== -->`.

- Input tamu: `sender-nama`, `sender-wa` — prefix fixed `+62` di UI (`<span>+62</span>`), input hanya `8xxx` (`pattern ^8[0-9]{7,12}$`, auto-strip `0`/`62` di `input` event). Kirim ke `62+raw`.
- Preview tamu: `preview-wrap` / `preview-url` — pakai `buildGuestShortUrl(nama)` = `origin + /u/<id>?tamu=<b64>` jika ada `id` (dari `loadData().id` / `getShortIdFromPath()`), else fallback `buildGuestUrl()` legacy.
- Link pendek undangan: `sender-short-wrap` / `sender-short` — `data.shortUrl` + info `auto-hapus 7 hari`. Meta: `sender-meta` tambahan `Kadaluarsa <date>`.
- Tombol `Export Tamu (CSV)` → `exportCSV()` — `link` sudah `/u/<id>?tamu=...`.
- Peta ringkas: `snd-map` — `embedFromMapsLink(data.maps)` (SATU SUMBER).
- Hapus data: `btn-edit` → `localStorage.removeItem(LS_KEY)`.

---

## 7. OG Image (thumbnail saat share ke WA)

- File: `og-image.png` (1200×630, di root). Ganti file-nya lalu deploy ulang.
- Meta di `<head>`:
  ```html
  <meta property="og:image" content="https://ruang-resepsi.vercel.app/og-image.png">
  ```
  Jika ganti nama file, ubah `content` di atas.

---

## 8. Ubah Teks Notifikasi / Pesan WA

Cari di JS:

- `function konfirmasiWA()` — template pesan konfirmasi tamu.
- `function buildGuestUrl(nama)` — legacy panjang.
- `function buildGuestShortUrl(nama)` — short `/u/<id>?tamu=...` (dipakai sekarang).
- `function compressImage()` / `handleFotoFile()` — foto logic.

---

## 9. Animasi & Efek

Semua di `<style>`:

- `.reveal` + `.d1/.d2/.d3` — fade-up saat scroll (`IntersectionObserver`).
- `.dot-pulse` — titik violet berkedip.
- `.shimmer` — garis violet mengalir.
- `.float-card` — kartu mengambang.

Hapus class-nya bila tidak suka. `prefers-reduced-motion` sudah ada. `.ampop-card` sudah dihapus.

---

## 10. Deploy ke Vercel (Jangan Timpa!)

Dari folder `ruang-resepsi`:

```bash
# Guard anti-timpa — cek dulu!
cat .vercel/project.json 2>/dev/null | grep projectName
vercel ls 2>&1 | grep ruang-resepsi
vercel --prod --yes   # di folder baru ~/nama-baru = create new project di voiddarkfire
```

Alias: `https://ruang-resepsi.vercel.app`

`.vercel` ada di `.gitignore` jadi tidak ikut commit. Detail anti-timpa: `../khamim-portfolio/ALUR-KERJA-SUPERPOWERS.md` Fase 4.

**BE (foto 7-hari):**

```bash
vercel blob create-store ruang-resepsi-store --access public --yes  # store_zpZgtVgOvpE5px4A
vercel blob list-stores; vercel env ls
vercel --prod --yes
curl -s https://ruang-resepsi.vercel.app/api/invite?id=NOTEXIST | grep expired
curl -s https://ruang-resepsi.vercel.app/api/cleanup | head -c 500
```

`vercel.json`:
```json
{"cleanUrls":true,"rewrites":[{"source":"/u/:id","destination":"/"}],"crons":[{"path":"/api/cleanup","schedule":"0 20 * * *"}]}
```
`api/*`: `create.js` (POST + Blob `prewed/` + `invites/` + `expiresAt +7 hari`), `invite.js` (GET + 410), `cleanup.js` (cron `0 20 * * *` UTC = 03:00 WIB).

---

## 11. Daftar File & Yang Jangan Diotak-atik

| File | Fungsi |
|------|--------|
| `index.html` | FE utama — edit sesuai panduan di atas |
| `api/create.js` | BE: buat short link + simpan foto 7-hari ke Blob |
| `api/invite.js` | BE: cek expiresAt, return bundle atau 410 |
| `api/cleanup.js` | BE: cron hapus invites lewat 7 hari |
| `package.json` | `@vercel/blob` |
| `og-image.png` | Thumbnail share |
| `vercel.json` | Config Vercel (`rewrites /u/:id`, `crons`) — jangan hapus |
| `README.md` | Dokumentasi (sudah update BE + 7-hari) |
| `PANDUAN-EDIT.md` | File ini |
| `.gitignore` | `.vercel`, `*.bak`, `node_modules`, `.env*` |
| `index.html.bak` / `*.tmp` | Backup — boleh dihapus |

> Tips: sebelum edit besar, duplikasi `index.html` jadi `index.html.bak`.

---

## 12. Reset Data (saat testing)

Buka DevTools (F12) → Console → ketik:

```js
localStorage.clear()
location.href = location.pathname // kembali ke setup
```

Atau klik "Edit Data Mempelai" di dashboard. Untuk test expire: ubah `expiresAt` di `invites/<id>.json` di Blob jadi kemarin, lalu `GET /api/invite?id=<id>` → `410`.

---

Butuh ubah lagi? Cari kata kunci di atas, ubah secukupnya, lalu `vercel --prod --yes`. Selesai.
Selamat tidur!
