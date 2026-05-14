# 🤖 Aiminizer Pro
**by Ziyad Web Studio**

Aplikasi chat AI berbasis web yang ringan, mobile-first, dan berjalan langsung di browser tanpa instalasi. Didukung oleh [g4f (GPT4Free)](https://g4f.dev) dengan dukungan banyak provider dan model secara gratis.

---

## ✨ Fitur

- 💬 **Chat AI real-time** dengan streaming typewriter per karakter
- 🧠 **Thinking block** — pemikiran AI tersembunyi, bisa dibuka/tutup
- 🔄 **Auto model fallback** — otomatis pindah ke model lain kalau model aktif error atau timeout
- 🎨 **Dual tema** — Cyber Technic (gelap) & Organic Refresh (terang)
- 📐 **Render Markdown & LaTeX** — bold, heading, list, kode, hingga rumus matematika
- 🔢 **Syntax highlighting** — blok kode otomatis ter-highlight sesuai bahasa
- 📎 **Upload dokumen** — lampirkan file teks/kode untuk dianalisis AI
- 📋 **Salin pesan** — ketuk bubble untuk salin teks
- 🔍 **Smart scroll** — bebas scroll ke atas saat AI ngetik, tombol "Lompat ke bawah" muncul otomatis
- ⏱️ **Timeout & retry** — deteksi koneksi lambat, retry otomatis sebelum menyerah
- 📱 **Mobile-first** — dioptimalkan untuk layar HP

---

## 📁 Struktur Folder

```
Aiminizer_mobile/
├── simple.html        # File utama aplikasi
└── asset/
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── android-chrome-192x192.png
    ├── android-chrome-512x512.png
    ├── site.webmanifest
    └── favicon_io.zip
```

---

## 🚀 Cara Pakai

1. Clone atau download repo ini
2. Buka `simple.html` langsung di browser, **atau** jalankan lewat local server:

```bash
# Pakai Python
python -m http.server 7700

# Pakai Node.js (npx)
npx serve . -p 7700
```

3. Buka browser ke `http://localhost:7700/simple.html`
4. Pilih **Provider** dan **Model** dari dropdown
5. Mulai chat!

> **Catatan:** Beberapa provider butuh API key. Isi di field API Key jika diperlukan.

---

## 🎨 Tema

| Tema | Deskripsi |
|------|-----------|
| **Organic** *(default)* | Latar krem hangat, aksen hijau alami |
| **Cyber** | Latar gelap, aksen biru neon |

Preferensi tema tersimpan otomatis di `localStorage`.

---

## 🧠 Cara Kerja Thinking Block

Beberapa model AI (seperti Qwen, DeepSeek-R1) mengirim proses berpikirnya dalam tag `<think>...</think>`. Aiminizer otomatis:
- Menyembunyikan konten thinking di dalam collapsible block
- Menampilkan spinner selama AI masih berpikir
- Memisahkan teks pemikiran dari jawaban utama

---

## 🔄 Auto Model Fallback

Kalau model yang aktif gagal merespon (timeout / respons kosong):
1. Aiminizer otomatis pindah ke model berikutnya di list
2. Muncul notifikasi di bubble: *"Model X timeout, beralih ke Model Y..."*
3. Retry otomatis — dropdown dan label header ikut terupdate
4. Kalau semua model habis dicoba → muncul pesan error

---

## 🛠️ Teknologi

| Library | Fungsi |
|---------|--------|
| [g4f JS](https://g4f.dev) | Provider & model AI gratis |
| [marked.js](https://marked.js.org) | Render Markdown |
| [highlight.js](https://highlightjs.org) | Syntax highlighting kode |
| [KaTeX](https://katex.org) | Render LaTeX / rumus matematika |
| [Font Awesome](https://fontawesome.com) | Ikon UI |
| [anime.js v4](https://animejs.com) | Animasi (import via ESM) |

Semua library di-load via CDN — tidak perlu `npm install` apapun.

---

## 📄 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">
  Made with ☕ by <strong>Ziyad Web Studio</strong>
</div>
