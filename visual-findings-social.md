# Temuan visual Room Global — fitur sosial

Pemeriksaan portrait 390x844 menunjukkan route `/global-room-chat` yang belum login tetap menampilkan keadaan terkunci dengan pesan masuk diperlukan, sesuai aturan akses. Route `/global-room` menampilkan kartu status koneksi, pesan akses akun, syarat Room Global, kontrol mikrofon/speaker, persetujuan, dan tombol masuk akun. Karena sesi screenshot tidak login, komposer Room Global yang berisi tombol Foto, reaksi, dan editor status tidak dapat diverifikasi melalui screenshot interaktif; typecheck dan test tetap digunakan untuk validasi struktur fitur.

Temuan penting: indikator merah kecil pada header Room Global route akses terlihat, tetapi keadaan terkunci tidak boleh diartikan sebagai tombol posting tidak tersedia. Tombol Foto hanya tersedia setelah akun login, persetujuan usia/ketentuan, dan berhasil masuk ke room.
