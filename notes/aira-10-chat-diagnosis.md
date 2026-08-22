# Diagnosis uji 10 percakapan Aira

Tanggal uji: 22 Agustus 2026.

Smoke test sepuluh permintaan singkat berurutan melalui jalur provider bawaan menggunakan model `gpt-5-mini` menghasilkan 0/10 respons AI dan 10/10 error yang sama: Forge mengembalikan HTTP 412 dengan pesan `your account has hit a usage exhausted`. Setiap kegagalan berlangsung sekitar 229–705 ms, sehingga masalah bukan timeout HP.

Uji langsung ke Gemini menunjukkan bahwa kontrak JSON aplikasi pada `gemini-3.6-flash` menerima HTTP 429; kuota free tier `generate_content_free_tier_requests` untuk model tersebut telah mencapai batas. `gemini-3.5-flash` dapat merespons tetapi cepat mencapai batas lima request. Sebaliknya, `gemini-3.5-flash-lite` menerima kontrak JSON yang sama dan menyelesaikan sepuluh percakapan singkat berurutan dengan 10/10 respons valid dalam sekitar 655–899 ms per request.

Perbaikan kode: Aira sekarang memakai urutan `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite`. Ketika model utama terkena quota/rate-limit, model utama diberi cooldown lima menit dan pesan berikutnya langsung memakai model Gemini alternatif. Bila seluruh Gemini benar-benar tidak tersedia, server tidak lagi memanggil Forge yang sudah terbukti quota habis berulang kali dan mengembalikan bantuan lokal terstruktur. Katalog fallback lain juga dibatasi empat detik dan maksimal dua kandidat model.

Validasi kode: TypeScript lulus, lint lulus dengan warning lama non-blocking, dan regresi layanan Aira 19/19 lulus. Respons AI penuh telah diuji pada `gemini-3.5-flash-lite` dengan 10/10 respons valid; fallback lokal tetap tersedia jika seluruh kuota provider habis.
