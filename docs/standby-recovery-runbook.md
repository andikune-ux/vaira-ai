# Runbook Cadangan Standby V A I R A AI

## Tujuan dan Batas Operasi

> **Server lama tetap menjadi layanan utama.** Copy project ini adalah lingkungan cadangan untuk pemulihan terkontrol, pengujian perubahan, dan perbandingan fungsional. Tidak ada tindakan dalam runbook ini yang mengalihkan pengguna, trafik, atau data dari server lama secara otomatis.

| Area | Server utama lama | Copy standby baru |
|---|---|---|
| Peran | Layanan aktif dan sumber data operasional | Cadangan pemulihan serta lingkungan verifikasi |
| Source code | Referensi fungsional yang sudah berjalan | Salinan independen dengan riwayat checkpoint sendiri |
| Database | Data operasional tetap berada di server utama | Skema tersedia, tetapi tabel penting terverifikasi kosong saat audit |
| Kredensial | Tetap berada pada konfigurasi server utama | Dikonfigurasi terpisah bila standby perlu diaktifkan |
| Perubahan selama persiapan | Tidak diubah | Diuji dan dicatat secara terisolasi |

## Status Kesiapan Saat Ini

Copy standby memiliki source code, aset aplikasi, migrasi database, dan fitur cadangan aplikasi. Pemeriksaan menunjukkan tabel `airaxCloudBackups`, `financeSnapshots`, `globalRoomMessages`, `manualAccountSessions`, dan `users` tidak berisi data pada copy ini. Karena itu, copy ini **belum** merupakan replika data server utama dan tidak boleh dianggap sebagai failover otomatis.

Aplikasi sudah memiliki dua lapisan pemulihan data pengguna. Cadangan offline menyimpan snapshot lokal dalam berkas JSON yang tervalidasi dan dapat dipilih kembali melalui pemilih berkas perangkat. Cadangan AiraXCloud menyimpan snapshot akun setelah pengguna masuk, lalu memulihkan data lokal hanya setelah konfirmasi pengguna. Token dan kata sandi tidak termasuk dalam arsip AiraXCloud.

## Data yang Harus Diamankan Terpisah

| Komponen | Sumber cadangan yang disarankan | Catatan pemulihan |
|---|---|---|
| Source code dan aset | Checkpoint project standby | Gunakan checkpoint terverifikasi, bukan direktori kerja yang belum diuji |
| Skema database | Migrasi Drizzle dalam `drizzle/` | Terapkan migrasi pada database standby yang baru; jangan menimpa database utama |
| Data server utama | Ekspor/backup database yang dibuat dari server utama | Pemulihan harus dilakukan secara manual dan terverifikasi sebelum dipakai |
| Data lokal pengguna | Berkas JSON dari fitur Cadangan Lokal | Berkas harus lolos validasi snapshot saat dipulihkan |
| Data akun aplikasi | Arsip AiraXCloud milik akun terkait | Memerlukan akun yang sama dan persetujuan pemulihan di aplikasi |
| Konfigurasi rahasia | Penyimpanan rahasia terpisah untuk server standby | Jangan menyalin atau menampilkan nilai rahasia server utama di source code atau dokumen |

## Prosedur Perbandingan Aman

Gunakan daftar skenario yang sama pada server utama dan copy standby, lalu catat hasilnya tanpa menulis ke server utama. Prioritas perbandingan adalah pembukaan Aira AI Browser, perpindahan Rencana Cepat ke browser, Perchance AI melalui browser internal, riwayat/bookmark/tab privat, serta respons endpoint kesehatan server.

| Skenario | Hasil yang diharapkan | Batas aman |
|---|---|---|
| Aira AI Browser membuka URL sederhana | Halaman mulai memuat atau pesan pemulihan menjelaskan pembatasan domain | Jangan mengubah konfigurasi WebView server utama |
| Rencana Cepat membuka browser | Pintasan menuju layar browser internal | Uji dari copy standby terlebih dahulu |
| Perchance AI membuka browser internal | URL diteruskan ke tab browser internal | Domain yang memblokir WebView dicatat sebagai batasan domain, bukan dipaksa bypass |
| API health | Mengembalikan respons sukses dari server yang sedang diuji | Endpoint tidak boleh dipakai untuk mentransfer data produksi |
| Pemulihan backup lokal/cloud | Selalu meminta tindakan eksplisit sebelum mengganti data lokal | Gunakan data uji atau arsip yang telah disetujui |

## Prosedur Pemulihan Terkendali

1. Tentukan insiden dan pastikan server utama benar-benar memerlukan pemulihan; copy standby tidak boleh digunakan hanya karena perbedaan tampilan atau uji coba kecil.
2. Buat atau kumpulkan backup terbaru dari server utama: source code/checkpoint, ekspor database, arsip file pengguna bila ada, serta daftar variabel konfigurasi tanpa menyalin nilainya ke dokumentasi.
3. Siapkan database standby baru dan jalankan migrasi sesuai urutan. Verifikasi tabel dan jumlah data hasil impor sebelum aplikasi dihubungkan ke database tersebut.
4. Atur kredensial server standby secara terpisah. Nilai seperti koneksi database, rahasia sesi, kredensial administrator, dan kunci internal tidak boleh dipindahkan melalui source code, chat, atau file backup biasa.
5. Jalankan pemeriksaan kode, lint, pengujian regresi, dan endpoint health pada copy standby. Bandingkan skenario inti dengan server utama secara read-only.
6. Jika pemulihan benar-benar akan diaktifkan, lakukan keputusan pengalihan secara manual setelah owner memverifikasi hasilnya. Pastikan ada rencana rollback ke server utama dan catatan waktu pengalihan.

## Temuan Audit Standby

Validasi TypeScript dan lint berhasil setelah beban generated route types dikurangi. Orkestrasi development juga diperbaiki agar keluarnya Metro secara normal setelah bundle awal tidak lagi menghentikan API server. Pemeriksaan API lokal mengembalikan HTTP 200 saat server standby berjalan.

Rangkaian tes lengkap masih memiliki pemeriksaan konfigurasi yang memerlukan kredensial administrator dan kunci internal khusus server standby. Hal ini bukan kegagalan fitur aplikasi; konfigurasi tersebut harus dibuat terpisah ketika standby akan dipakai untuk autentikasi administrator atau pemeriksaan API internal.

## Kriteria Siap Digunakan sebagai Standby

Copy standby dianggap siap untuk pemulihan terkontrol bila checkpoint tervalidasi tersedia, skema database berhasil diterapkan, backup data utama yang sesuai telah disimpan di lokasi aman, konfigurasi rahasia standby telah disiapkan secara terpisah, dan skenario inti lulus pada lingkungan standby. Hingga semua syarat tersebut dipenuhi, status yang benar adalah **cadangan kode dan skema yang tervalidasi**, bukan replika produksi penuh.
