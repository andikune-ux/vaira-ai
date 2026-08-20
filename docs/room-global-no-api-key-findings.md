# Evaluasi Room Global Tanpa API Key

## Temuan proyek

Package proyek tidak memiliki SDK Daily, LiveKit, Twilio, Jitsi, mediasoup, atau socket.io. Server aplikasi berjalan sebagai server HTTP/tRPC biasa; belum ada transport WebSocket audio atau SFU media. Karena itu, menambahkan UI audio tanpa provider tidak akan menghasilkan suara lintas pengguna.

## Kapabilitas bawaan Manus

Kapabilitas backend proyek menyediakan server API, database, autentikasi, dan storage aplikasi. Komponen tersebut cukup untuk consent, pesan teks, status peserta, blokir, token internal, dan polling. Tidak ada indikasi bahwa server aplikasi otomatis menyediakan SFU WebRTC, TURN, atau media relay audio. Server aplikasi sendiri dapat menjadi signaling sederhana, tetapi belum cukup untuk NAT traversal dan forwarding audio multi-peserta.

## Jitsi Meet sebagai opsi gratis publik

Jitsi Meet menyatakan bahwa meet.jit.si dapat digunakan gratis tanpa akun dan menyediakan konferensi audio/video melalui URL room. Dokumentasi konfigurasi Jitsi mendukung pengaturan audio, tombol toolbar, dan integrasi API. Sumber: [Jitsi Meet](https://jitsi.org/jitsi-meet/) dan [Jitsi configuration](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-configuration/).

Namun, penggunaan meet.jit.si publik berarti aplikasi bergantung pada layanan pihak ketiga yang bukan milik proyek, kebijakan layanan, ketersediaan publik, dan kontrol room yang terbatas. Integrasi native Expo juga memerlukan SDK atau WebView/Jitsi Meet SDK yang belum ada di package proyek. Jitsi self-hosted memerlukan domain HTTPS, Docker/Compose, konfigurasi password, dan mesin yang terus berjalan; dokumentasi resmi menyebut `PUBLIC_URL`, HTTPS, dan beberapa komponen server diperlukan untuk deployment nyata. Sumber: [Jitsi Docker self-hosting](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker/).

## Kesimpulan teknis

Tanpa API key dan tanpa server media persistent, pilihan paling realistis untuk sekarang adalah mempertahankan chat teks polling dan menyediakan opsi membuka room Jitsi publik secara eksplisit sebagai eksperimen terpisah, bukan menyamarkannya sebagai audio native terintegrasi. Untuk audio native yang terkontrol, diperlukan provider resmi atau VM/server persistent untuk menjalankan Jitsi/LiveKit beserta TURN dan domain HTTPS.

## Rekomendasi

Pilihan aman tahap berikutnya adalah membuat mode **Room Audio Eksperimental** yang membuka room Jitsi melalui tautan eksternal setelah consent, dengan peringatan bahwa room tidak dikelola penuh oleh AiraX. Alternatif yang lebih terintegrasi adalah menyiapkan server persistent self-hosted, tetapi itu bukan solusi tanpa biaya operasional.
