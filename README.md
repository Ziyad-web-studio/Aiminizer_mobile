# Aiminizer Mobile

Sebuah antarmuka obrolan kecerdasan buatan dengan desain minimalis dan efek kaca. Proyek ini dikembangkan oleh ziyad_studio dengan fokus pada estetika dan fungsionalitas yang efisien.

## Fitur Utama

* **Desain Premium:** Menggunakan efek kaca dan mode gelap untuk tampilan antarmuka yang modern.
* **Optimalisasi Seluler:** Tata letak responsif yang dirancang khusus untuk kenyamanan penggunaan di perangkat seluler.
* **Penyimpanan Lokal:** Konfigurasi sistem dan Kunci API disimpan secara aman di dalam peramban menggunakan `localStorage`.
* **Dukungan Multi-Model:** Sistem dirancang untuk siap menerima berbagai model kecerdasan buatan.

## Panduan Modifikasi API

Sistem saat ini menggunakan format API standar. Jika Anda ingin mengubah penyedia API tanpa merusak desain visual yang sudah ada, salin dan gunakan prompt di bawah ini pada asisten AI Anda.

### Prompt Modifikasi

```text
Tolong modifikasi logika API pada kode HTML ini. Ubah integrasi dari sistem saat ini menjadi integrasi untuk [masukkan provider api key].

Instruksi wajib:
1. Pertahankan seluruh desain visual. Jangan ubah kelas Tailwind, efek kaca, mode gelap, atau tata letak elemen sama sekali. Estetika harus tetap sama persis.
2. Ganti URL endpoint pada variabel baseUrl dan fungsi sendMessage() sesuai dengan dokumentasi resmi [masukkan provider api key].
3. Sesuaikan format request (payload) dan cara membaca respons JSON agar valid dengan format [masukkan provider api key].
4. Pastikan sistem penyimpanan API Key di pengaturan tetap berfungsi normal dengan localStorage.

Berikut kodenya:
[Tempel kode HTML Aiminizer di sini]
