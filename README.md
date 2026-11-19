# V A I R A  A I

V A I R A  A I adalah asisten keuangan berbasis AI dengan pencatatan transaksi, pemindaian bukti pembayaran, sinkronisasi data dan media per akun, kalender, waktu sholat, cuaca, kartu ucapan, Room Global, grup privat, serta layanan Aira.

## Unduh dan instal APK Android

APK siap pasang tersedia di halaman **Releases** GitHub:

<https://github.com/andikune-ux/vaira-ai/releases>

Langkah pemasangan:

1. Buka halaman Releases dan pilih rilis terbaru.
2. Pada bagian **Assets**, unduh file yang berakhiran `-android.apk`.
3. Buka file APK di perangkat Android.
4. Jika diminta, izinkan browser atau aplikasi file manager memasang aplikasi dari sumber tersebut.
5. Tekan **Pasang**. Jika V A I R A  A I sudah terpasang dengan package yang sama, Android dapat menawarkan pembaruan.

APK pada GitHub Release dibuat otomatis oleh GitHub Actions dari kode pada tag versi. APK ini ditujukan untuk pemasangan langsung dan pengujian distribusi di luar Google Play.

## Cara membuat rilis baru

Untuk membuat APK dan GitHub Release baru:

```bash
git checkout main
git pull
git tag v1.0.24
git push github v1.0.24
```

Setelah tag terkirim, workflow **Build Android APK and Release** akan:

- memasang dependency dari `pnpm-lock.yaml`;
- memvalidasi TypeScript;
- menghasilkan proyek Android dari Expo;
- membangun APK debug yang dapat dipasang;
- mengunggah APK sebagai workflow artifact;
- membuat GitHub Release dan melampirkan APK secara otomatis.

Workflow juga dapat dijalankan manual dari tab **Actions** menggunakan **Run workflow**. Hasil manual tersedia sebagai artifact selama 30 hari; GitHub Release dibuat ketika workflow dipicu oleh tag `v*`.

## Pengembangan lokal

```bash
pnpm install
pnpm run check
pnpm run dev
```

Konfigurasi runtime seperti database, storage, OAuth, dan AI dibaca dari environment server. Jangan menaruh nilai kredensial di source code atau commit. File `.env` dan `.env.*` diabaikan oleh Git; gunakan secret environment pada layanan server/deployment.

## Distribusi Google Play

APK GitHub Release memakai signing debug agar dapat dibuat otomatis tanpa menyimpan keystore pribadi di repository. APK ini cocok untuk pemasangan langsung. Untuk Google Play Store, buat build release dengan keystore produksi atau Play App Signing melalui jalur distribusi resmi; jangan mengunggah keystore atau password signing ke repository.

## Repository

<https://github.com/andikune-ux/vaira-ai>
