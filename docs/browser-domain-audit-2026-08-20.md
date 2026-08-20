# Audit Respons Domain Aira AI Browser — 20 Agustus 2026

Pengujian pasif dari sandbox memakai `curl -L -I`/header retrieval menunjukkan koneksi HTTPS ke beberapa domain tersedia, tetapi kebijakan respons berbeda:

| URL | Respons | Temuan penting |
|---|---:|---|
| https://www.google.com | HTTP/2 200 | `x-frame-options: SAMEORIGIN`; ini dapat menolak iframe lintas asal, tetapi tidak membuktikan Android WebView top-level gagal. |
| https://www.tiktok.com/@mastercorbuzier/video/766 | HTTP/2 200 | `x-frame-options: SAMEORIGIN`, `strict-transport-security`, dan respons dinamis; embedded/automated browsers dapat diperlakukan berbeda. |
| https://example.com | HTTP/2 200 | Domain sederhana yang cocok untuk uji WebView dasar. |
| https://www.wikipedia.org | HTTP/2 200 | Respons HTTPS publik berhasil dari jaringan sandbox. |

Kesimpulan teknis sementara: koneksi jaringan umum dari sandbox tersedia. `ERR_BLOCKED_BY_RESPONSE` pada perangkat berasal dari kombinasi kebijakan respons domain/embedded browser dan lifecycle WebView, bukan bukti bahwa seluruh internet perangkat mati. Kode aplikasi perlu mengabaikan error subresource, menangani hanya main-frame error, tidak memblokir redirect HTTP/HTTPS, mereset WebView secara benar, dan menyediakan fallback sistem bila domain menolak embedded WebView. Uji native Android tetap diperlukan untuk memisahkan perilaku WebView perangkat dari preview iframe web.

Sumber yang diuji langsung:
- https://www.google.com
- https://www.tiktok.com/@mastercorbuzier/video/766
- https://example.com
- https://www.wikipedia.org
