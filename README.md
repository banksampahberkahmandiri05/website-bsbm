# BSBM GitHub Pages — FIXED

Paket ini diperbaiki agar halaman GitHub Pages tidak lagi tampil sebagai HTML polos.

## Perbaikan utama
- CSS dibuat **inline di index.html**, sehingga tidak bergantung pada path CSS GitHub Pages.
- Logo dibuat **tertanam (data URI)** di halaman, sehingga tidak menjadi gambar rusak.
- Logo juga tetap tersedia di `assets/images/` untuk kebutuhan pengeditan.
- Tampilan responsif desktop, tablet, dan HP.
- Menu mobile, tombol, kartu informasi, tabel harga, jadwal, aplikasi, berita, dan footer sudah ditata ulang.
- Tidak memakai library/font eksternal, sehingga aman untuk GitHub Pages.
- File `.nojekyll` tetap disertakan.

## Cara upload
1. Ekstrak ZIP.
2. Upload **isi folder** ke repository GitHub Pages yang saat ini dipakai untuk:
   `https://banksampahberkahmandiri05.github.io/website-bsbm/`
3. Pastikan `index.html` berada di root folder yang dipublish, bukan di dalam folder tambahan.
4. Commit/push perubahan.
5. Tunggu GitHub Pages selesai deploy, lalu lakukan hard refresh browser (`Ctrl + F5`).

## Menghubungkan Login Aplikasi
Buka `index.html`, cari:
`const APP_URL="";`
Isi URL Web App Google Apps Script di antara tanda kutip, contoh:
`const APP_URL="https://script.google.com/macros/s/XXXXXXXX/exec";`

Paket ini sengaja dibuat self-contained supaya masalah CSS/gambar 404 seperti pada screenshot tidak terjadi lagi.
