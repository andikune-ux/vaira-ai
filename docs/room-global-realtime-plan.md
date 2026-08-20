# Rancangan Audio Room Global

## Status

Room Global saat ini menggunakan **pesan teks server-side dan polling**. Audio real-time belum diaktifkan karena sesi belum memiliki provider WebRTC/WebSocket yang disetujui dan terkonfigurasi.

## Opsi arsitektur

| Opsi | Fungsi | Kebutuhan | Status |
|---|---|---|---|
| WebRTC SFU | Audio banyak peserta dengan server media terpusat | Provider SFU, token ruang, ICE/TURN, aturan moderasi | Belum dipilih |
| WebSocket signaling + WebRTC | Server mengatur join/leave dan pertukaran offer/answer; media tetap peer/WebRTC | WebSocket server, ICE/TURN, token sementara | Belum dipilih |
| Audio relay pihak ketiga | Provider mengelola signaling dan media | Connector resmi, kredensial, kebijakan retensi | Belum tersedia |
| Polling teks | Pesan dan status dasar tanpa audio | Server aplikasi yang sudah aktif | Aktif |

## Aturan keamanan dan privasi

Audio harus **default mati**. Pengguna harus menyetujui Room Global sebelum melihat atau bergabung ke ruang. Status mic dan speaker hanya boleh menjadi status milik pengguna sendiri; administrator tidak boleh memaksa mic atau speaker perangkat pengguna. Token audio harus berumur pendek, dibatasi pada room dan akun, serta tidak disimpan sebagai data profil permanen.

Room harus menyediakan tindakan keluar, mute, blokir pengguna, laporkan, dan sembunyikan pesan. Perubahan status peserta perlu dicatat tanpa menyimpan rekaman audio secara default. Jika perekaman kelak diminta, diperlukan persetujuan terpisah dan indikator yang selalu terlihat.

## Connector yang dibutuhkan

Sebelum aktivasi, pengguna perlu memilih provider resmi yang mendukung salah satu arsitektur di atas dan menyediakan dokumentasi endpoint, metode autentikasi, wilayah penyimpanan, kebijakan retensi, batas peserta, serta mekanisme penghapusan data. Connector harus dibuat melalui konfigurasi aman; kredensial tidak boleh ditulis ke source code atau dikirim melalui chat biasa.

## Rencana implementasi setelah provider dipilih

Pertama, tambahkan endpoint server untuk membuat token room sementara setelah consent dan validasi status akun. Kedua, tambahkan signaling atau SDK provider pada layar Room Global dengan lifecycle join, leave, mute, speaker, reconnect, dan cleanup. Ketiga, tambahkan pengujian deterministik untuk consent, token kedaluwarsa, blokir, mute default, reconnect, dan keluar ruang. Keempat, uji perangkat nyata dengan dua akun sebelum mengaktifkan fitur pada build produksi.

## Fallback saat provider belum tersedia

Aplikasi mempertahankan polling pesan teks, menampilkan status **Audio belum tersedia**, dan tidak menampilkan tombol yang seolah-olah dapat menyalakan audio. Ini mencegah UI mengklaim fitur yang belum memiliki transport media nyata.

## Keputusan yang diperlukan

Pengguna perlu memilih provider atau menyetujui agar Room Global tetap berbasis teks. Setelah provider dipilih, pekerjaan connector dan pengaturan rahasia dapat dimulai melalui alur konfigurasi yang aman.
