PAKET INTEGRASI WEBSITE BSBM + DASHBOARD PUBLIK

Website GitHub Pages BSBM dipertahankan, ditambah dashboard.html dan tautan Dashboard pada navigasi. Folder AppsScriptDashboard berisi backend terpisah, bukan aplikasi transaksi lama.

PEMASANGAN WEBSITE
1. Backup repository GitHub Pages saat ini.
2. Ekstrak ZIP, unggah file/folder ke repository yang sama dengan struktur yang sama; timpa index.html setelah backup dan tambahkan dashboard.html serta folder assets.
3. Commit changes dan tunggu GitHub Pages selesai deploy.
4. Buka website dan klik menu Dashboard.

KONEKSI DATA BELUM AKTIF OTOMATIS
1. Buat proyek Apps Script BARU dan salin AppsScriptDashboard/Code.gs.
2. Set Script Property SOURCE_SPREADSHEET_ID ke ID spreadsheet database BSBM. Jangan ubah aplikasi transaksi lama.
3. Jalankan setupDashboard dan pasang trigger setelah backend berhasil diuji.
4. Deploy backend sebagai Web App, salin URL /exec, lalu ganti URL_WEB_APP_DASHBOARD pada dashboard.html dengan URL tersebut.
5. Cocokkan angka agregat dengan aplikasi lama sebelum diumumkan.

PRIVASI
Dashboard template mencantumkan lima saldo terbesar beserta nama. Jangan tayangkan nama dan saldo tanpa persetujuan; gunakan inisial atau sembunyikan tabel jika belum ada persetujuan.
