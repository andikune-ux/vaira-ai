# Audit Kedua Mendalam — Temuan Sementara

Tanggal audit: 17 Agustus 2026.

## Temuan yang perlu diverifikasi atau diperbaiki

| Prioritas | Area | Temuan | Dampak |
|---|---|---|---|
| Tinggi | Room Global pra-masuk | Pada mode guest, halaman menampilkan pesan “Masuk akun untuk mengakses Room Global” dan tombol utama tampak nonaktif. Belum terlihat tombol langsung menuju `/login`, sehingga pengguna dapat mengalami dead end dan harus kembali ke Profil secara manual. | Alur masuk Room Global tidak praktis bagi guest. |
| Sedang | Beranda | `latestTransactions` mengambil tiga transaksi confirmed dengan `.slice(0, 3)` tanpa sort berdasarkan `occurredAt`; jika state tidak tersusun terbaru, bagian “Aktivitas terbaru” dapat menampilkan transaksi lama. | Informasi aktivitas dapat terlihat tidak aktual. |
| Sedang | Pengaturan | Chip kategori memakai horizontal ScrollView tanpa indikator visual. Pada viewport 390px, kategori terakhir tampak terpotong; fungsinya kemungkinan masih dapat digeser, tetapi affordance-nya kurang jelas. | Pengguna dapat mengira kategori yang terpotong tidak tersedia. |
| Sedang | Komponen UI | `SectionHeading` menerima `action` dan menampilkan Pressable meskipun `onPress` opsional. Semua pemakaian perlu diverifikasi agar tidak ada label aksi yang tampil tetapi tidak melakukan apa-apa. | Potensi tombol aksi semu/dead end. |
| Sedang | Room Global | Kontrol mic/speaker pra-masuk tampil sebagai Switch meskipun pengguna belum masuk room. Perlu dipastikan ini memang pengaturan awal, bukan kontrol yang seharusnya hanya aktif setelah masuk. | Risiko kebingungan status dan ekspektasi pengguna. |
| Rendah | Runtime/dev | Log server menampilkan `Invalid session cookie` untuk `/api/auth/me` saat preview tanpa sesi. Ini tampak sebagai kondisi guest yang ditangani, tetapi perlu dipastikan tidak mengulang request atau membuat UI loading menggantung. | Noise log dan potensi state loading berulang. |
| Rendah | Tooling | Lint lulus, tetapi Node menampilkan warning `MODULE_TYPELESS_PACKAGE_JSON` terkait `eslint.config.js`. | Warning tooling, bukan error aplikasi. |

## Kondisi yang sudah terkonfirmasi dari audit visual

Beranda dan Keuangan dapat dirender pada viewport mobile 390px. Waktu Salat memiliki halaman utama dan modal pengaturan yang sudah dikelompokkan. Room Global menerapkan batas usia minimal 16 tahun dan mensyaratkan login serta persetujuan. Pengaturan memakai pencarian dan kategori horizontal.

## Batasan audit

Audit preview web tidak menggantikan pengujian perangkat fisik Android/iOS untuk alarm layar mati, exact alarm, battery saver, microphone, audio provider, orientation lock, dan deep link eksternal.

## Perubahan yang diterapkan selama audit

Guest Room Global kini memiliki tombol utama “Masuk ke akun” yang aktif dan dialognya menawarkan rute langsung ke `/login`; syarat login, usia minimum, persetujuan, dan room lock tidak diubah. Aktivitas terbaru di Beranda kini diurutkan berdasarkan `occurredAt` sebelum mengambil tiga item. `SectionHeading` tidak lagi menampilkan label aksi tanpa callback sebagai tombol aktif.

## Temuan penting yang belum diubah

| Prioritas | Area | Temuan | Rekomendasi |
|---|---|---|---|
| Tinggi sebelum Publish | Audio Room Global | Preview menunjukkan status “TEKS” dan “Polling teks aktif”. Jalur aplikasi belum menyediakan audio realtime internal tanpa provider/connector audio yang benar-benar aktif; tombol uji Jitsi hanya membuka URL eksternal. | Jika audio realtime wajib untuk rilis, siapkan dan uji provider audio nyata atau nyatakan mode polling sebagai fallback terbatas. Jangan menyebutnya audio realtime sebelum peserta dapat mendengar satu sama lain di perangkat berbeda. |
| Sedang | Pengaturan | Kategori masih memakai scroll horizontal; pada layar kecil kategori berikutnya terlihat terpotong walau dapat digeser. | Tambahkan affordance scroll/fade atau ubah menjadi wrap dua baris setelah pengukuran ruang. |
| Rendah | Runtime preview | `Invalid session cookie` muncul saat preview guest memanggil `/api/auth/me`. Tidak menyebabkan typecheck/lint/test gagal, tetapi perlu dipantau agar tidak menjadi loop request. | Uji guest dan account pada perangkat nyata; bila berulang, tambahkan guard client agar query auth tidak dipanggil berulang setelah 401. |

## Validasi audit setelah perbaikan

Typecheck lulus, lint lulus dengan warning Node `MODULE_TYPELESS_PACKAGE_JSON` non-blocking, suite penuh lulus dengan 155 test, dan Expo web export berhasil menghasilkan seluruh route. Screenshot mobile memverifikasi tombol “Masuk ke akun” sudah terlihat aktif pada pra-masuk Room Global.
