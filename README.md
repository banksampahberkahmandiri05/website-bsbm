# Website BSBM + Form Pengelola Konten Kegiatan

Paket ini menambahkan halaman `konten-admin.html` agar pengelola bisa mengunggah foto kegiatan dan keterangannya tanpa masuk ke aplikasi transaksi/saldo BSBM.

## Isi paket
- `index.html` — website publik, bagian Berita & Kegiatan membaca konten yang berstatus Published dari backend.
- `konten-admin.html` — form unggah foto, judul, tanggal, kategori, deskripsi, dan status publikasi.
- `Code.gs` — backend Google Apps Script TERPISAH khusus konten website.
- `assets/images/` — aset logo/favicon yang sudah ada.

## Penting: backend perlu disiapkan sekali
Form tidak bisa menyimpan konten hanya dengan GitHub Pages karena GitHub Pages adalah hosting statis. Backend Apps Script di paket ini menyimpan data di Google Sheets dan foto di Google Drive.

### A. Buat backend konten
1. Buka https://script.google.com/ lalu buat proyek baru bernama `BSBM Website Content`.
2. Salin isi `Code.gs` dari paket ini ke editor Apps Script.
3. Di pengaturan proyek, set zona waktu ke `Asia/Jakarta`.
4. Pilih fungsi `setupContentBackend` lalu klik **Run/Jalankan**. Berikan izin Google Sheets dan Google Drive. Fungsi ini membuat Spreadsheet dan folder foto secara otomatis.
5. Buka **Project Settings / Setelan proyek > Script Properties**. Tambahkan:
   - `ADMIN_PIN` = PIN rahasia yang kuat (minimal 12 karakter, campuran huruf/angka). Jangan gunakan `admin123`.
   - `CONTENT_SHEET_ID` dan `CONTENT_FOLDER_ID` sudah diisi otomatis oleh setup.
6. Deploy > New deployment > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (endpoint baca publik; tindakan menambah konten tetap memerlukan ADMIN_PIN)
7. Salin URL deployment yang berakhiran `/exec`.

### B. Sambungkan form
1. Buka `konten-admin.html`.
2. Temukan `const CONTENT_API_URL = "";` dan isi dengan URL Web App `/exec` yang baru dibuat.
3. Simpan.

### C. Sambungkan galeri di halaman publik
1. Buka `index.html`.
2. Temukan `const BSBM_CONTENT_API = "";` dan isi dengan URL Web App `/exec` yang sama.
3. Simpan.

### D. Upload ke GitHub Pages
Upload/replace semua isi folder paket ke root folder repository yang melayani `/website-bsbm/`, lalu Commit changes. Jangan upload folder pembungkus ZIP; upload isinya. Tunggu deploy, kemudian refresh dengan Ctrl+F5.

Form bisa dibuka di:
`https://banksampahberkahmandiri05.github.io/website-bsbm/konten-admin.html`

## Cara mengisi kegiatan
1. Buka halaman Form Pengelola Konten.
2. Masukkan PIN `ADMIN_PIN` yang dibuat di Script Properties.
3. Isi judul, tanggal, kategori, deskripsi, pilih foto (JPG/PNG/WebP maksimal 5 MB).
4. Pilih **Tampilkan di website** atau **Simpan sebagai draft**.
5. Klik **Simpan Konten Kegiatan**. Konten Published akan ditampilkan di bagian Berita & Kegiatan pada halaman depan.

## Keamanan & privasi
- Jangan menulis PIN ke dalam HTML, README publik, atau GitHub. PIN hanya dimasukkan di form dan disimpan sebagai Script Property.
- Form tidak memakai login aplikasi transaksi. Ini adalah jalur pengelolaan konten yang terpisah.
- Foto yang ditampilkan pada website dibuat dapat dilihat siapa pun melalui tautan. Jangan unggah foto/dokumen berisi data sensitif, saldo nasabah, nomor telepon, alamat rumah, kartu identitas, atau QR Code yang berisi data pribadi.
- Karena hosting website statis, siapa pun dapat melihat halaman form. Keamanan aksi penyimpanan mengandalkan `ADMIN_PIN` di server Apps Script. Jaga PIN, ganti jika bocor, dan jangan membagikannya ke warga umum.
- Browser dapat membatasi pembacaan balasan POST lintas-domain; form memberi notifikasi bahwa permintaan dikirim. Periksa galeri website dan tab Executions pada Apps Script bila konten belum muncul.
- Jangan menaruh data nasabah atau saldo di spreadsheet konten ini. Gunakan hanya untuk informasi kegiatan publik.

## Catatan
Ini backend konten terpisah dan tidak mengubah database atau kode aplikasi transaksi BSBM. Jika mengubah nama deployment atau membuat deployment baru, perbarui URL di kedua file HTML.
