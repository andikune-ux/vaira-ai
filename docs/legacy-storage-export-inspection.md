# Inspeksi Storage AiraXCloud Lama

## Status awal

Tautan bersama menampilkan arsip bernama `vaira_ai_file_storage_export.zip`. Pratinjau arsip memperlihatkan `README.txt`, `manifest.json`, dan folder `storage`.

## Batasan saat ini

Arsip belum diunduh atau dieksekusi. Tidak ada metadata atau object storage yang diaktifkan pada SERVER DATABASE 2 pada tahap ini.

## Integritas dan Cakupan

Arsip berhasil melewati pemeriksaan integritas ZIP. Manifest mencatat tiga object AiraXCloud dengan status ekspor `ok`; ukuran setiap object cocok dengan ukuran yang diharapkan. Arsip juga memuat enam foto unggulan untuk dua akun.

| Kelompok | Jumlah object | Status |
|---|---:|---|
| AiraXCloud | 3 | Lengkap dalam ekspor; dipulihkan dan aktif di standby |
| Foto unggulan akun | 6 | Lengkap dalam ekspor; dipulihkan ke storage standby |

## Verifikasi Pasca-Pemulihan

Kesembilan object hasil pemulihan dapat dibaca melalui proxy storage pada API standby lokal: tiga JSON AiraXCloud dan enam foto menghasilkan HTTP 200. Metadata ketiga backup telah berstatus `active` dan tiga `storageKey` legacy dipertahankan apa adanya.

Pemeriksaan terhadap endpoint publik proxy menemukan redirect yang tidak dapat digunakan dan menjawab `AccessDenied`. Oleh sebab itu, keenam referensi foto telah diganti dengan URL bertanda tangan yang diterbitkan langsung oleh helper storage standby serta diuji baca dan ukurannya sebelum database diperbarui. URL tersebut dapat memakai hostname distribusi penyimpanan yang sama, tetapi semuanya menunjuk ke jalur object baru `legacy-recovery/profiles/...`, bukan lagi ke jalur object legacy `/310519663887191524/6vCS6PThHDw3WXD3neosAW/profiles/...`. Temuan ini tidak mengubah object atau metadata AiraXCloud yang sudah tervalidasi pada storage standby.
