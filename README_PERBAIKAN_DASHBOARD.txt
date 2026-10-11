PERBAIKAN SINKRONISASI DASHBOARD BSBM

Perbaikan:
- Membaca spreadsheet transaksi lama dalam mode baca-saja; tidak mengubah sheet/database transaksi lama.
- Pencocokan nama sheet dan kolom lebih toleran terhadap variasi nama umum.
- Tidak membuat spreadsheet rekap baru jika PUBLIC_DASHBOARD_SPREADSHEET_ID sudah tersedia.
- Diagnostik menampilkan nama sheet yang dipakai, jumlah baris, dan header yang terbaca.
- Dashboard publik menampilkan nama sheet/baris sumber agar masalah sinkronisasi mudah diketahui.
- Pembaruan berkala setiap jam tersedia melalui installRefreshTrigger().

PENTING — pemasangan:
1. Backup repository dan project Apps Script terlebih dahulu.
2. Di project Apps Script yang URL-nya sudah dipakai dashboard.html, ganti Code.gs dengan AppsScriptDashboard/Code.gs dari ZIP ini.
3. Di Project Settings > Script Properties pastikan:
   SOURCE_SPREADSHEET_ID = ID spreadsheet transaksi BSBM yang benar
   PUBLIC_DASHBOARD_SPREADSHEET_ID = ID spreadsheet rekap publik yang sudah dipakai (jika sudah ada)
   Jangan isi ID spreadsheet website/konten jika itu bukan database transaksi.
4. Jalankan refreshDashboard() dari editor Apps Script. Jika PUBLIC_DASHBOARD_SPREADSHEET_ID belum pernah dibuat, jalankan setupDashboard() sekali (akan membuat sheet rekap baru).
5. Berikan otorisasi yang diminta, lalu Deploy > Manage deployments > Edit > New version > Deploy. Gunakan URL /exec deployment yang sama dengan API_URL pada dashboard.html.
6. Ganti dashboard.html di GitHub Pages dengan versi dari ZIP, commit, lalu lakukan Ctrl+F5.

Cara memeriksa:
- Di dashboard, baris status menampilkan nama sheet dan jumlah baris Nasabah/Setoran/Penarikan.
- Jika sheet tampil TIDAK DITEMUKAN, sesuaikan nama sheet pada daftar kandidat di fungsi readTable_().
- Jika baris Setoran ada tetapi nilai total nol, lihat header diagnostics dari respons API dengan menambahkan ?callback=tes ke URL /exec (JSONP), lalu tambahkan nama kolom sebenarnya ke daftar alias pada fungsi pick_().
- Kolom yang umum didukung antara lain ID Nasabah, Nama, Status, Nilai Setoran/Total Setoran/Total Harga/Nominal, Berat (kg)/Berat, Tanggal, serta Jumlah Penarikan/Nominal Penarikan.
- Perubahan file di ZIP tidak otomatis memperbarui Apps Script online; deployment harus diterbitkan sebagai versi baru.

Catatan privasi:
Dashboard hanya mempublikasikan ringkasan dan daftar nama/saldo teratas yang ditampilkan di halaman. Pastikan publikasi data nama/saldo sudah sesuai izin dan kebijakan pengelola.
