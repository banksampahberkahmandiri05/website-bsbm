# Dashboard Publik Bank Sampah Berkah Mandiri

Paket ini membuat proyek Apps Script dan spreadsheet rekap yang **terpisah** dari aplikasi transaksi BSBM. Kode dashboard hanya membaca database lama; hasil rekap disimpan di spreadsheet publik baru.

## A. Siapkan backend
1. Buka database Google Sheets aplikasi BSBM. Dari URL `https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit`, salin `ID_SPREADSHEET`.
2. Buka `https://script.google.com/` → proyek baru bernama `BSBM Dashboard Publik`.
3. Tempel `Code.gs` ke editor.
4. Di **Project Settings → Script Properties**, tambahkan `SOURCE_SPREADSHEET_ID` dengan nilai ID spreadsheet database lama. Jangan ubah atau bagikan database lama.
5. Jalankan `setupDashboard()` sekali dan setujui izin Google. Fungsi membuat spreadsheet baru bernama `BSBM - Rekap Dashboard Publik`.
6. Jalankan `installRefreshTrigger()` sekali agar rekap diperbarui setiap jam. Untuk uji langsung, jalankan `refreshDashboard()`.

## B. Deploy API
1. **Deploy → New deployment → Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Deploy, lalu salin URL berakhiran `/exec`.
4. URL endpoint ini hanya menyajikan statistik agregat, data bulanan, serta lima saldo terbesar. Tetap anggap endpoint sebagai informasi publik.

## C. Pasang dashboard ke GitHub Pages
1. Buka `dashboard.html` dan ganti `URL_WEB_APP_DASHBOARD` dengan URL `/exec` yang baru.
2. Unggah file ke repository GitHub Pages, misalnya sebagai `dashboard.html`, lalu commit.
3. Buka `https://USERNAME.github.io/NAMA-REPO/dashboard.html`.

## Data yang dibaca
Sheet sumber yang diharapkan: `Nasabah`, `Setoran`, `Penarikan`. Header yang diharapkan meliputi `ID Nasabah`, `Nama`, `Status`, `Tanggal`, `Nama Nasabah`, `Berat (kg)`, `Nilai Setoran`, dan `Jumlah Penarikan`. Jika header aplikasi Anda berbeda, sesuaikan nama header di `Code.gs`.

## Privasi dan pemeriksaan
- Lima nama + saldo terbesar adalah informasi finansial pribadi. Minta persetujuan nasabah sebelum menayangkan nama lengkap dan saldo. Jika belum ada persetujuan, gunakan inisial/kode atau hapus bagian peringkat.
- Jangan publikasikan NIK, nomor HP, alamat, QR identitas, atau detail transaksi individu.
- Saldo di template dihitung sebagai total `Nilai Setoran` dikurangi total `Jumlah Penarikan` per ID nasabah. Cocokkan hasil dengan aplikasi lama sebelum ditayangkan.
- Template ini belum ter-deploy ke akun Google/GitHub Anda; perlu pemasangan dan pengujian menggunakan akun pemilik database.
