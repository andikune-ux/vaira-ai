# Audit Visual Pengaturan

Screenshot `/profile-settings` menunjukkan halaman Profil dan Beranda memuat kartu Foto profil di bagian atas, tombol Pilih, pratinjau logo/foto berbentuk lingkaran, lalu pengaturan Kartu rotasi Beranda. Pengaturan Waktu Salat dan rotasi masih berada dalam halaman kategori Profil dan Beranda.

Screenshot `/settings` menunjukkan halaman pusat Pengaturan dengan pencarian, chip kategori, dan row Profil dan Beranda yang mengarah ke subhalaman. Update Prompt tampil di atas konten saat screenshot; ini adalah overlay global yang sudah ada, bukan perubahan pengaturan.

Catatan: screenshot web menampilkan warning non-blocking `props.pointerEvents is deprecated`; TypeScript dan lint tetap lulus. Pengujian perangkat nyata masih diperlukan untuk memastikan dialog crop native berjalan di Android/iOS.
