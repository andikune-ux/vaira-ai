# Inspeksi Awal Ekspor SQL SERVER DATABASE Lama

## Status

Tautan bersama menampilkan berkas bernama `database_export_vaira_ai.sql`. Pratinjau menunjukkan ini adalah dump MySQL dari TiDB Serverless dan berisi struktur tabel serta data, termasuk tabel migrasi dan tabel aplikasi.

## Hasil Validasi

Dump berisi 22 tabel dan 683 baris SQL. Nama 22 tabel tersebut cocok dengan skema SERVER DATABASE 2 yang ada saat ini. Terdapat data pada 17 tabel: migrasi, audit Administrator, pengaturan Administrator, token Aira, metadata AiraXCloud, persetujuan/pesan/moderasi/presence/komentar/love/laporan/pengaturan/status Room Global, sesi akun manual, dan akun manual.

Lima tabel yang diekspor tanpa data adalah `financeSnapshots`, `globalRoomBlocks`, `globalRoomMessageReactions`, `globalTestSnapshots`, dan `users`. Artinya dump ini memulihkan data server yang ada pada saat ekspor, tetapi tidak menciptakan data pada kelima tabel tersebut.

Dump berisi 22 perintah `DROP TABLE IF EXISTS` dan 22 perintah `CREATE TABLE`. Perintah tersebut tidak akan dijalankan langsung pada SERVER DATABASE 2. Hanya data yang sudah dipetakan dan disetujui yang dapat dimasukkan ke database cadangan yang kosong.

## Batasan AiraXCloud

SQL menyertakan metadata `airaxCloudBackups`, termasuk referensi storage. Isi berkas AiraXCloud sendiri tidak berada di dalam SQL; pemulihan isi cloud memerlukan object storage dari server lama tetap tersedia atau diekspor terpisah. Data akun dan metadata dapat dipulihkan dari SQL, tetapi setiap arsip cloud perlu diuji setelah impor.

## Rencana Impor SERVER DATABASE 2

1. Server lama tidak disentuh. Hanya SERVER DATABASE 2 yang diperiksa dan, setelah persetujuan, ditulis.
2. Dump tidak dijalankan langsung. Perintah `DROP TABLE`, `CREATE TABLE`, pengaturan sesi database, dan data `__drizzle_migrations` dilewati karena skema standby sudah tersedia.
3. Data akun manual dimasukkan lebih dahulu. Setelah itu, data turunan seperti persetujuan, pengaturan, status, pesan, moderasi, laporan, komentar, love, token, pengaturan Administrator, dan audit dimasukkan sesuai urutan dependensi.
4. `manualAccountSessions` tidak dipulihkan agar sesi dari server lama tidak otomatis berlaku pada server baru. Pengguna akan login kembali bila SERVER DATABASE 2 diaktifkan.
5. Metadata `airaxCloudBackups` hanya dapat dimasukkan dengan status terbatas sampai object storage terkait tersedia dan diuji. Arsip cloud tidak akan ditampilkan sebagai pulih/aktif bila file aslinya belum tersedia.
6. Sebelum dan sesudah impor, jumlah record per tabel dicatat. Bila pemeriksaan gagal, proses berhenti sebelum tabel berikutnya dan laporan audit dibuat.

## Batasan Keselamatan

Belum ada SQL yang dijalankan. Dump terlihat memuat perintah destruktif seperti `DROP TABLE IF EXISTS`, sehingga tidak boleh dijalankan langsung terhadap SERVER DATABASE 2. Tahap berikutnya adalah mengambil berkas secara pasif, menghitung tabel dan record, lalu menghasilkan rencana impor yang menghindari perintah destruktif atau menerapkannya hanya setelah persetujuan eksplisit pada database cadangan yang benar.
