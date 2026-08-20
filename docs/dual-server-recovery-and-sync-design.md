# Desain Pemulihan Cadangan dan Sinkronisasi Dua Server

## Status Audit

Server lama tetap merupakan **sumber data utama**. Copy server baru sudah memiliki skema aplikasi, tetapi tabel pemulihan yang diperiksa—termasuk `airaxCloudBackups`, `financeSnapshots`, `manualAccounts`, `manualAccountSessions`, `globalRoomMessages`, dan `users`—masing-masing masih berisi **0 baris**. Dengan demikian, server baru adalah cadangan code dan skema, bukan replika data dari server lama.

Pencadangan yang sudah tersedia di aplikasi terbagi menjadi dua. Berkas **AiraXBackup** berupa JSON dapat dipilih dan dipulihkan kembali pada perangkat setelah lolos validasi struktur. **AiraXCloud** disimpan per akun pada server yang menerima backup tersebut, beserta metadata dan berkas storage terkait. AiraXCloud yang tersimpan hanya di server lama tidak otomatis muncul di server baru karena metadata database dan storage object belum disalin.

Tidak ditemukan konfigurasi koneksi database jarak jauh, job replikasi, atau mekanisme sinkronisasi primary-ke-standby pada copy baru. Karena itu, kedua server saat ini belum terhubung untuk auto-migrasi.

## Pilihan Arsitektur

| Pilihan | Cara kerja | Kelebihan | Risiko dan batasan |
|---|---|---|---|
| Cadangan pasif dan pemulihan terkontrol | Server lama tetap aktif. Ekspor database atau arsip backup disalin hanya saat pemulihan atau uji berkala. | Paling aman, sederhana, tidak menulis data silang, dan cocok untuk data penting. | Tidak otomatis; data standby hanya setepat waktu backup terakhir. |
| Replikasi satu arah primary ke standby | Server lama mengirim snapshot/record perubahan bertanda waktu ke endpoint server standby. Server baru hanya menerima dan mencatat status sinkronisasi. | Mendekati cadangan otomatis tanpa dua sumber penulisan yang saling bertabrakan. | Membutuhkan konfigurasi koneksi aman pada kedua server, kunci layanan terpisah, job terjadwal, log audit, dan prosedur retry. |
| Replikasi database tingkat infrastruktur | Penyedia database menyalin database utama ke replica standby secara native. Aplikasi tetap menulis hanya ke primary. | Cadangan paling dekat dengan data primary dan tidak memerlukan sinkronisasi data aplikasi satu per satu. | Memerlukan dukungan provider database, pengaturan jaringan, biaya/operasi tambahan, serta pengujian failover. |

## Rancangan Aman Bila Replikasi Satu Arah Dipilih

Server lama harus ditetapkan sebagai **satu-satunya sumber kebenaran dan satu-satunya tujuan tulis pengguna**. Server baru menerima perubahan secara idempoten melalui endpoint khusus server-ke-server yang memerlukan kunci rahasia berbeda dari kredensial administrator. Setiap batch harus memiliki `sourceServerId`, nomor urut atau cursor, waktu perubahan, checksum, dan audit status. Penghapusan tidak diterapkan otomatis; perubahan harus memakai soft-delete atau status terlebih dahulu.

Data diproses bertahap: akun dan profil, metadata backup cloud, snapshot sinkronisasi, lalu data Room Global. Berkas AiraXCloud tidak cukup direplikasi melalui metadata saja; object storage terkait juga perlu disalin atau diberi referensi yang tetap valid. Konflik ditolak, bukan ditimpa: jika server standby menerima versi dengan cursor yang tidak sesuai, batch dicatat sebagai gagal dan memerlukan peninjauan. Pemulihan ke primary selalu menjadi tindakan manual yang memerlukan approval eksplisit.

## Prasyarat Sebelum Transfer Data

1. Pemilik harus memilih satu arsitektur dan mengonfirmasi server lama sebagai primary.
2. Backup dari server lama harus tersedia sebagai ekspor database yang disetujui atau arsip AiraXBackup/AiraXCloud milik akun terkait.
3. Koneksi server-ke-server memerlukan kredensial baru yang dikelola aman pada kedua server; nilai rahasia tidak dikirim melalui chat atau disimpan dalam source code.
4. Uji dilakukan terlebih dahulu dengan satu snapshot non-produksi atau satu akun yang disetujui, kemudian diverifikasi checksum, jumlah record, dan kemampuan rollback.
