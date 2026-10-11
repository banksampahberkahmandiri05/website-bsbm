PEMBARUAN WEBSITE BANK SAMPAH BERKAH MANDIRI

Dashboard telah diisi dengan URL Web App Apps Script yang diberikan pengguna.
URL Dashboard API: https://script.google.com/macros/s/AKfycbxGGQ8Aq2wHwPtU2bLMmngIaFx87BSHc7fe4bNJiSbzmRWT5dbOsWZDmh0itkETty-nJw/exec

Cara pasang: backup repositori GitHub Pages terlebih dahulu, ekstrak ZIP ini, lalu unggah/ganti file sesuai struktur folder pada repositori website (jangan unggah ZIP sebagai pengganti file website). Commit perubahan dan tunggu GitHub Pages selesai deploy.

Jika dashboard tetap tidak memuat data, pastikan deployment Apps Script dijalankan sebagai pemilik, akses diatur agar dapat diakses publik (Anyone jika sesuai kebijakan), dan fungsi setupDashboard() serta refreshDashboard() sudah berhasil dijalankan pada proyek Apps Script dashboard. Periksa juga bahwa Script Properties SOURCE_SPREADSHEET_ID dan PUBLIC_DASHBOARD_SPREADSHEET_ID sudah diisi. URL saja tidak dapat membuat konfigurasi sumber data otomatis.

Privasi: sebelum mempublikasikan nama dan saldo nasabah, pastikan sudah ada persetujuan.
