# Temuan Provider Room Global

## Daily sebagai utama

Dokumentasi Daily menjelaskan bahwa meeting token dibatasi oleh domain dan room, dapat diberi identitas pengguna, masa berlaku, serta pengaturan audio mulai mati. Token perlu dibuat server-side dan tidak boleh memuat informasi rahasia yang tidak sengaja terekspos. Sumber: [Daily Meeting Tokens](https://docs.daily.co/reference/rest-api/meeting-tokens).

## LiveKit sebagai fallback pertama

Dokumentasi LiveKit menjelaskan bahwa koneksi room membutuhkan URL WebSocket server dan access token unik yang memuat identitas peserta, nama room, serta izin. SDK menyediakan lifecycle connect/disconnect dan event reconnect. React Native memerlukan SDK serta izin mikrofon. Sumber: [LiveKit Connecting to a Room](https://docs.livekit.io/intro/basics/connect/).

## Twilio sebagai fallback kedua

Dokumentasi Twilio menjelaskan bahwa Access Token bersifat singkat, dibuat server-side, memuat identity dan Video Grant, serta dapat dibatasi ke room tertentu. Token harus valid saat join dan reconnect. Sumber: [Twilio User Identity and Access Tokens](https://www.twilio.com/docs/video/tutorials/user-identity-access-tokens).

## Kontrak failover yang direncanakan

Urutan provider adalah Daily, LiveKit, lalu Twilio. Server harus membuat token hanya untuk provider yang sedang dicoba dan room identity yang sama. Perpindahan dilakukan bila health check gagal, join timeout, koneksi putus berulang, atau provider mengembalikan error otorisasi/infrastruktur. Failover tidak boleh mengaktifkan mikrofon otomatis; consent pengguna harus tetap berlaku tetapi status mic dimulai mati pada provider baru. Jika seluruh provider gagal, aplikasi kembali ke chat teks polling dan menampilkan status audio tidak tersedia.

## Status aktivasi

Tidak ada connector atau kredensial provider yang aktif di sesi ini. Implementasi provider belum boleh diaktifkan sebelum endpoint, credential, SDK mobile, dan kebijakan privasi dikonfirmasi.
