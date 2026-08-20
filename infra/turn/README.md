# Aira TURN relay

Folder ini berisi template relay TURN untuk WebRTC Aira. Audit pada lingkungan development menunjukkan belum ada service TURN aktif dan port 3478/5349 belum mendengarkan. Karena itu, file ini adalah fondasi deployment, bukan bukti bahwa relay sudah online.

Relay harus dijalankan pada host persisten yang memiliki IP publik atau DNS publik, dukungan UDP/TCP, sertifikat TLS untuk `turns:`, serta port media UDP 49152–65535 yang terbuka. Nilai `AIRA_TURN_REALM`, `AIRA_TURN_USERNAME`, dan `AIRA_TURN_CREDENTIAL` wajib diberikan melalui secret manager; jangan menaruh nilai nyata di repository.

Setelah relay benar-benar aktif, konfigurasi server aplikasi menggunakan `AIRA_ICE_SERVER_URLS=stun:<host>:3478,turn:<host>:3478?transport=udp,turns:<host>:5349?transport=tcp`, bersama username dan credential yang sama. Endpoint `/api/webrtc/config` kemudian dapat mengembalikan konfigurasi ICE kepada pengguna yang sudah login.

Database Aira tetap hanya menyimpan metadata room dan audit. Relay TURN membawa paket media sementara dan tidak menyimpan isi percakapan sebagai arsip.
