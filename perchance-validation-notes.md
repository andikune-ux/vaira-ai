# Validasi URL Perchance

## URL yang diperiksa

- https://perchance.org/welcome
- https://perchance.org/plugins
- https://perchance.org/text-to-image-plugin
- https://perchance.org/learn-perchance-plugins-text-to-image
- https://perchance.org/ai-text-to-image-generator

## Lokasi kemampuan gambar

Kemampuan text-to-image berada pada plugin resmi `text-to-image-plugin`. Dokumentasi plugin menunjukkan pola generator Perchance: `image = {import:text-to-image-plugin}`, lalu pemanggilan `image(prompt)` atau `await image({prompt: "..."})` di dalam JavaScript halaman generator. Dokumentasi juga menjelaskan bahwa pemrosesan berjalan pada GPU server Perchance, bukan perangkat pengguna.

## Batasan API

Halaman welcome Perchance secara eksplisit menyatakan bahwa Perchance belum memiliki API resmi umum; pengguna dapat membuat API server sendiri untuk generatornya. Karena itu `https://perchance.org/welcome` adalah halaman pengantar, bukan endpoint gambar. Plugin text-to-image menyediakan fungsi di dalam konteks halaman generator, tetapi tidak memberikan kontrak REST publik `POST prompt -> image` untuk server eksternal.

## Kesimpulan

Proxy server Aira tidak boleh menebak endpoint internal plugin. Integrasi yang aman adalah WebView/embed generator, atau membuat generator Perchance milik VAIRA lalu memanggil fungsi plugin di dalam halaman generator tersebut. Proxy server baru dapat dibuat jika tersedia API resmi/kontrak publik terpisah.
