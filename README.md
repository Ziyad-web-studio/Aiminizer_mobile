# Aiminizer Mobile

Antarmuka obrolan AI minimalis dengan estetika tinggi. Dikembangkan oleh **ziyad_studio** dengan filosofi *Designing Silence*.

## ⚡ Unduh Cepat

Dapatkan file aplikasi langsung untuk dijalankan di perangkat Anda:

[![Lihat & Unduh HTML](https://img.shields.io/badge/Buka_File-Aiminizer_HTML-FF5F1F?style=for-the-badge&logo=html5&logoColor=white)](https://raw.githubusercontent.com/Ziyad-web-studio/Aiminizer_mobile/refs/heads/main/index.html)

**Cara menyimpan:**
1. Klik tombol di atas.
2. Setelah halaman kode terbuka, tekan **Ctrl + S** (Windows) atau **Cmd + S** (Mac).
3. Jika menggunakan ponsel, buka menu peramban lalu pilih **Bagikan > Simpan ke File** atau **Unduh Halaman**.

---

## 💎 Fitur Utama

* **Apple-Style UI:** Menggunakan efek kaca dan palet warna gelap yang elegan.
* **Mobile First:** Dioptimalkan sepenuhnya untuk penggunaan satu tangan di perangkat seluler.
* **Zero Backend:** Berjalan sepenuhnya di sisi klien menggunakan `localStorage` untuk keamanan data.
* **Dynamic AI Support:** Siap dikonfigurasi untuk berbagai provider API.

## 🛠 Panduan Modifikasi API (via AI)

Gunakan prompt berikut jika Anda ingin meminta asisten AI mengubah penyedia API tanpa merusak desain:

### Prompt Eksekusi

```text
Tolong modifikasi logika API pada kode HTML ini. Ubah integrasi dari sistem saat ini menjadi integrasi untuk [masukkan provider api key].

Instruksi wajib:
1. Pertahankan seluruh desain visual. Jangan ubah kelas Tailwind, efek kaca, mode gelap, atau tata letak elemen sama sekali. Estetika harus tetap sama persis.
2. Ganti URL endpoint pada variabel baseUrl dan fungsi sendMessage() sesuai dengan dokumentasi resmi [masukkan provider api key].
3. Sesuaikan format request (payload) dan cara membaca respons JSON agar valid dengan format [masukkan provider api key].
4. Pastikan sistem penyimpanan API Key di pengaturan tetap berfungsi normal dengan localStorage.

Berikut kodenya:
[Tempel kode HTML Aiminizer di sini]
