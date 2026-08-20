# Catatan Audit UX/UI V A I R A  A I

## Temuan prioritas

1. **Waktu Salat dan alarm adzan**: alur izin, status channel, volume, dan tes alarm berada dalam modal yang padat. Nada khusus hanya bekerja saat aplikasi terbuka; alarm background memakai nada default sistem. Belum ada layar status izin berbentuk checklist atau panduan optimasi baterai. Full-screen alarm native belum tersedia.

2. **Keuangan**: tombol “Pindah dana” mengarah ke `/add-transaction` sama seperti “Tambah catatan”, sehingga alur transfer belum terlihat sebagai alur khusus. Bagian “Transaksi terbaru” saat ada transaksi hanya menampilkan kartu penjelasan, bukan daftar transaksi terbaru yang dijanjikan judulnya. Ini adalah gap UX utama.

3. **Foto profil**: `app/(tabs)/profile.tsx` membatasi foto unggulan menjadi 3 dan menampilkan `x/3`, sedangkan `app/profile-settings.tsx` menyatakan jumlah tidak dibatasi dan menerima banyak foto. Aturan produk tidak konsisten. Pengunggahan banyak foto dilakukan berurutan tanpa progress per foto dan tanpa ringkasan kegagalan sebagian.

4. **Administrator**: menu utama sudah ringkas, tetapi masih menampilkan snapshot, data lokal, aksi tarik/simpan snapshot, dan panel lanjutan dalam scroll yang panjang. Laporan, akun, cloud, dan audit telah dipindah ke halaman khusus; namun status pending dan tindakan berisiko dapat dibuat lebih mudah dipindai dengan badge dan konfirmasi yang konsisten.

5. **Room Global**: lint menunjukkan state/handler tidak terpakai (`retryingProvider`, `audioReady`, beberapa handler di wrapper), serta dependency effect heartbeat tidak lengkap. Area audio, header, chat, dan komposer masih membutuhkan hierarki visual yang ketat; status provider sebaiknya dipisahkan dari status koneksi peserta.

6. **Beranda**: hierarchy sudah baik dengan Aira, saldo, dan Room Global, tetapi banyak bagian vertikal: hero, status mode, antrean generasi, saldo, Room Global, dua grid aksi, pengingat, dan aktivitas. Mode landscape memakai grid padat sehingga perlu breakpoint yang diuji pada ukuran kecil dan besar.

7. **Aira**: tab Aira cukup bersih tetapi relatif statis; kemampuan utama berada di chat. Perlu empty/loading/error state yang konsisten, status token/kuota yang lebih jelas, dan ringkasan hasil generate yang tidak hanya bergantung pada halaman chat.

## Temuan teknis yang berdampak pada UX

- Lint: 13 warning, termasuk handler tidak terpakai dan dependency React Hook yang tidak lengkap pada Room Global.
- Expo Doctor: 18/18 pemeriksaan lulus.
- Backend build: berhasil dengan esbuild.
- Test terakhir setelah normalisasi error: 149 lulus, 1 dilewati.
- `tests/auth.logout.test.ts` masih `describe.skip`, sehingga alur logout belum memiliki regresi aktif.
- TODO lama masih menyisakan Google Drive OAuth, sumber knowledge eksternal, transaksi berulang/jatuh tempo versi lama, izin kontekstual lengkap, video/panggilan/berbagi layar provider, serta pengujian end-to-end rilis.
- `app.config.ts` versi 1.0.17 dan `package.json` versi 1.0.0 tidak selaras sebagai metadata proyek.

## Rekomendasi desain utama

- Tetapkan satu aturan foto unggulan: maksimal 3 atau tanpa batas; jangan menampilkan dua aturan berbeda.
- Ubah Waktu Salat menjadi halaman status izin dengan checklist dan sheet alarm yang memiliki bagian “Izin”, “Suara & getar”, “Jadwal”, dan “Tes”.
- Buat alur Pindah Dana khusus dengan sumber, tujuan, nominal, biaya, saldo sebelum/sesudah, dan konfirmasi.
- Tampilkan 3 transaksi terbaru sungguhan pada Keuangan.
- Tambahkan badge pending pada menu Administrator dan ringkas snapshot ke satu tombol “Snapshot”.
- Pisahkan status koneksi, status provider audio, dan jumlah peserta Room Global menjadi tiga indikator kecil.
- Gunakan satu komponen `AppErrorBoundary`/normalisasi error untuk toast, alert, dan inline validation.
- Tambahkan progress upload foto dan status berhasil/gagal per aset.
- Aktifkan kembali test logout atau beri alasan eksplisit mengapa masih dilewati.

## Status perubahan

Catatan ini hanya hasil audit. Belum ada perubahan UX dari temuan di atas dan belum dibuat checkpoint untuk audit tersebut.
