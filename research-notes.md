# Catatan Sumber Eksternal

## Jadwal Salat

Sumber: [AlAdhan Prayer Times API](https://aladhan.com/prayer-times-api) dan endpoint publik `https://api.aladhan.com/v1/timings/{DD-MM-YYYY}?latitude={latitude}&longitude={longitude}&method=20`.

AiraX mengirim koordinat lokasi presisi dan tanggal lokal, lalu menggunakan field `Fajr`, `Dhuhr`, `Asr`, `Maghrib`, dan `Isha`. Hasil diperlakukan sebagai jadwal hari itu dan alarm hanya dibuat setelah pengguna memberi izin notifikasi serta mengaktifkan sakelar alarm.

Catatan implementasi: jadwal salat bergantung pada koneksi internet dan metode perhitungan yang dipilih; aplikasi menampilkan koordinat/lokasi yang digunakan dan menyediakan pembaruan lokasi secara eksplisit.
