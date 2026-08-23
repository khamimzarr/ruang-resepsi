# PANDUAN EDIT — Ruang Resepsi

File utama **hanya `index.html`** (single-file app). Cari dengan `Ctrl/Cmd + F` sesuai kata kunci di bawah.

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

## 4. Undangan Tamu (State 3)

Cari `<!-- ===== INVITATION (STATE 3) ===== -->`.

- **Cover:** id `cover-pria`, `cover-wanita`, `cover-tamu` — teks otomatis dari URL. Ubah pembuka statis di atasnya ("Kepada Yth.").
- **Ayat/Quotes (fitur 10):** baris `<p class="font-serif italic text-[18px]">` berisi QS. Ar-Rum — ganti atau hapus.
- **Countdown:** 4 kotak `cd-d / cd-h / cd-m / cd-s` — jangan hapus id-nya. Target dihitung dari `tanggal + jam` mempelai.
- **Peta:** iframe `inv-mapframe` + tombol `inv-maps`. Link diset di JS (`initInvitation`). Bila mau ubah placeholder: edit teks "Buka Google Maps".
- **QR navigasi:** div `qrcode` — script `QRCode` dari CDN. Ubah ukuran di `initInvitation` → `{width:160,height:160}`.
- **Susunan acara:** div `acara-wrap` — hanya muncul bila `setup-acara` diisi. Format di setup: `Nama Acara | Jam` per baris.
- **Amplop digital:** id `ampop-list`. Placeholder default nonaktif. Bila rekening terisi baru jadi tombol Salin.

---

## 5. Form Setup (State 1)

Cari `<!-- ===== SETUP (STATE 1) ===== -->`.

Field wajib (ada `required`):
- `setup-pria`, `setup-wanita`, `setup-tanggal`, `setup-jam`
- `setup-lokasi` (**nama tempat saja**, bukan URL)
- `setup-maps` (**link Google Maps wajib**, ada panduan di bawahnya)

Field opsional:
- `setup-acara` (textarea) — satu acara per baris `Nama | Jam`. Kosong = tidak tampil ke tamu.
- `setup-bank`, `setup-rek` — tampil amplop bila keduanya terisi.

> Panduan "Cara ambil link" ada di `<p>Cara ambil link: buka Google Maps → ...</p>` di bawah `setup-maps`.

Validasi wajib di JS: cari `if(!data.pria||!data.wanita||!data.tanggal||!data.jam||!data.lokasi||!data.maps)` dan `if(!/^https?:\/\//.test(data.maps))`.

---

## 6. Dashboard Pengiriman (State 2)

Cari `<!-- ===== SENDER (STATE 2) ===== -->`.

- Input tamu: `sender-nama`, `sender-wa` (format `628...`)
- Preview link: `preview-wrap` / `preview-url`
- Tombol `Export Tamu (CSV)` → fungsi `exportCSV()` di JS.
- Peta ringkas: `snd-map`
- Hapus data: tombol `btn-edit` → `localStorage.removeItem(LS_KEY)`.

---

## 7. OG Image (thumbnail saat share ke WA)

- File: `og-image.png` (1200×630, di root). Ganti file-nya lalu deploy ulang.
- Generate via script: `gen_og.py` (Pillow) sudah tidak ada — buat manual atau pakai desain apapun 1200×630.
- Meta di `<head>`:
  ```html
  <meta property="og:image" content="https://ruang-resepsi.vercel.app/og-image.png">
  ```
  Jika ganti nama file, ubah `content` di atas.

---

## 8. Ubah Teks Notifikasi / Pesan WA

Cari di JS:

- `function konfirmasiWA()` — template pesan konfirmasi tamu.
- `function buildGuestUrl(nama)` — format URL personal.
- `function salinRek()` — format copy rekening.

---

## 9. Animasi & Efek

Semua di `<style>`:

- `.reveal` + `.d1/.d2/.d3` — fade-up saat scroll (pakai `IntersectionObserver`).
- `.dot-pulse` — titik violet berkedip.
- `.shimmer` — garis violet mengalir.
- `.float-card` — kartu mengambang.

Hapus class-nya bila tidak suka. Tambah `prefers-reduced-motion` sudah ada.

---

## 10. Deploy ke Vercel

Dari folder `ruang-resepsi`:

```bash
vercel --prod --yes
```

Alias: `https://ruang-resepsi.vercel.app`

Jangan lupa: `.vercel` ada di `.gitignore` jadi tidak ikut commit.

---

## 11. Daftar File & Yang Jangan Diotak-atik

| File | Fungsi |
|------|--------|
| `index.html` | Satu-satunya file yang perlu diedit |
| `og-image.png` | Thumbnail share |
| `vercel.json` | Config Vercel (jangan hapus) |
| `README.md` | Dokumentasi projek |
| `PANDUAN-EDIT.md` | File ini |
| `.gitignore` | Isinya `.vercel` |
| `index.html.bak` / `*.tmp` | Backup — boleh dihapus |

> Tips: sebelum edit besar, duplikasi `index.html` jadi `index.html.bak` dulu.

---

## 12. Reset Data (saat testing)

Buka DevTools (F12) → Console → ketik:

```js
localStorage.clear()
location.href = location.pathname // kembali ke setup
```

Atau klik "Edit Data Mempelai" di dashboard.

---

Butuh ubah lagi? Cari kata kunci di atas, ubah secukupnya, lalu `vercel --prod --yes`. Selesai.
