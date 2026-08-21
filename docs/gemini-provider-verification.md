# Verifikasi Provider Gemini untuk Aira

Tanggal verifikasi: 21 Agustus 2026.

Gemini API key backend berhasil mengakses katalog model resmi. Katalog yang tersedia mencantumkan keluarga Gemini dan Gemma. Pengujian `models/gemini-2.5-flash:generateContent` menerima respons 404 yang menyatakan model tersebut tidak tersedia bagi pengguna baru serta merekomendasikan `models/gemini-3.6-flash`.

Pengujian berikutnya terhadap `models/gemini-3.6-flash:generateContent` berhasil menghasilkan JSON valid ketika `maxOutputTokens` disediakan cukup untuk proses reasoning dan keluaran. Integrasi Aira harus memakai Gemini 3.6 Flash sebagai provider utama, mengirim API key hanya pada backend, dan mencoba Forge setelah Gemini mengembalikan error, kuota habis, atau melampaui batas waktu.

Referensi resmi: [Google AI Gemini API key documentation](https://ai.google.dev/gemini-api/docs/api-key).
