# Project TODO

- [x] Menyiapkan struktur data lokal untuk profil, dompet, transaksi, anggaran, target, komitmen, pengingat, dan knowledge pribadi.
- [x] Menata tema merek AiraX AI serta navigasi tab mobile yang mudah dipakai satu tangan.
- [x] Membuat sambutan dengan mode tamu dan akses masuk menggunakan email.
- [x] Membangun dashboard beranda dengan saldo, aksi cepat, insight, dan pengingat.
- [x] Membangun form transaksi manual dengan validasi dan langkah konfirmasi wajib.
- [x] Membangun daftar transaksi dengan waktu, sumber dana, masuk, keluar, kategori, keterangan, dan saldo berjalan.
- [x] Membangun manajemen dompet ganda serta fondasi aset, anggaran, target tabungan, tagihan, utang, dan piutang.
- [x] Menambahkan visualisasi laporan dan ekspor laporan ke Excel/PDF.
- [x] Menambahkan asisten percakapan lokal yang dapat membuat draft transaksi dari dialog.
- [x] Menambahkan integrasi AI server untuk tanya jawab multi-bahasa, analisis gambar, dan kategorisasi transaksi.
- [x] Menambahkan upload foto bukti, OCR berbantuan AI, suara output Aira, serta status online/offline.
- [x] Menambahkan notifikasi lokal untuk catatan harian.
- [x] Menambahkan autentikasi akun serta endpoint terproteksi untuk cadangan dan sinkronisasi snapshot data; pemulihan otomatis membutuhkan pengguna masuk dengan akun OAuth.
- [x] Menambahkan pengaturan instruksi dan knowledge pribadi serta mode developer yang aman.
- [x] Membuat ikon aplikasi kustom, memperbarui konfigurasi merek, lalu menyalin aset ke semua kebutuhan aplikasi.
- [x] Menulis pengujian unit untuk perhitungan saldo, transaksi terkonfirmasi, dan ringkasan anggaran.
- [x] Memeriksa lint, tipe, pengujian unit, dan status pekerjaan sebelum checkpoint pertama.
- [x] Memperbaiki tombol anggaran, target, tagihan, dan hutang agar membuka form serta menyimpan data dengan benar.
- [x] Memperbaiki koneksi layanan AiraX AI dengan fallback offline dan status proses yang dapat ditindaklanjuti.
- [x] Menambahkan input suara dengan mikrofon, indikator gelombang rekam, dan transkripsi menjadi draft pesan yang dapat ditinjau.
- [x] Menambahkan pusat media dengan pratinjau video, izin kamera/mikrofon kontekstual, serta tindakan berbagi layar yang transparan terhadap kebutuhan penyedia komunikasi real-time.
- [x] Memperluas mode developer dengan kontrol pengaturan UI, perilaku AI, dan inspeksi data yang aman.
- [x] Menampilkan waktu real-time, hari, dan tanggal pada beranda.
- [x] Menambahkan jadwal salat berdasarkan lokasi presisi serta alarm salat opsional untuk jadwal tersisa hari ini.
- [x] Menambahkan kalkulator mini dengan memori, persen, akar, pangkat, kurung, dan operasi dasar dari beranda.
- [x] Menambahkan alur autentikasi akun yang menjelaskan pilihan email, Google, dan WhatsApp secara aman; WhatsApp menunggu penyedia OTP resmi.
- [x] Menambahkan cadangan serta pemulihan file lokal pada direktori AiraXBrankas melalui pemilih berkas sistem.
- [x] Memperbarui identitas ikon AiraX AI dengan wordmark unik pada konfigurasi launcher aplikasi.
- [ ] Menguji ulang alur rencana, AI, waktu, salat, kalkulator, izin, dan cadangan sebelum checkpoint pembaruan.
- [x] Memperbaiki analisis foto umum untuk tanya jawab gambar di menu Aira
- [x] Memperbaiki mikrofon di menu Aira agar merekam, menyimpan audio, dan merespons pesan suara
- [x] Menjadikan video dan berbagi layar sebagai sarana obrolan interaktif dengan Aira AI; berbagi layar native masih menunggu penyedia komunikasi real-time.
- [x] Menambahkan fitur tahan teks pada chat pengguna (salin/edit) dan chat Aira (ulang respons)
- [x] Menyimpan bukti gambar/foto di rincian laporan keuangan agar tidak hilang
- [x] Memperbaiki anggaran, target, tagihan, hutang, dan piutang di menu Rencana beserta fungsi dan tujuannya
- [x] Menambahkan izin alarm dan notifikasi untuk pengingat salat
- [x] Menambahkan pengaturan waktu pengingat harian
- [x] Menambahkan grafik visual uang keluar masuk pada tab laporan
- [x] Menambahkan konfirmasi saat logout/ganti akun serta isolasi data per akun
- [x] Menambahkan PIN developer (140399) pada menu profil
- [x] Menambahkan opsi aktif/nonaktif waktu salat dan mode gelap/terang UI
- [x] Menambahkan reset factory dengan opsi hapus data berkas lokal atau cloud

## Checklist perubahan aktif

- [x] Memperbaiki analisis foto umum di chat Aira, termasuk pertanyaan tentang isi gambar dan contoh visual.
- [x] Mengirim pesan suara sebagai pesan chat yang terlihat, tersimpan di riwayat, dan dijawab Aira.
- [x] Menggunakan video serta berbagi layar untuk dialog dengan Aira, bukan panggilan dengan pengguna lain; berbagi layar native masih menunggu provider real-time.
- [x] Menambahkan menu tahan pesan pengguna: Salin dan Edit.
- [x] Menambahkan menu tahan pesan Aira: Salin dan Ulang respons.
- [x] Menyimpan bukti foto/gambar pada transaksi dan menampilkannya dalam rincian laporan.
- [x] Memisahkan fungsi anggaran, target, tagihan, hutang, dan piutang dengan data serta label yang benar.
- [x] Memperbaiki izin dering/notifikasi untuk alarm salat.
- [x] Menambahkan pengaturan jam pengingat harian.
- [x] Menambahkan grafik uang masuk dan keluar pada laporan.
- [x] Memisahkan data lokal guest dan akun berdasarkan identitas saat ganti akun, dengan konfirmasi logout.
- [x] Menambahkan PIN developer 140399 sebelum membuka studio developer.
- [x] Menambahkan sakelar aktif/nonaktif waktu salat.
- [x] Menambahkan mode gelap dan terang dari pengaturan UI.
- [x] Menambahkan reset factory dengan pilihan berkas atau cloud dan konfirmasi berlapis.
- [x] Menjalankan ulang lint, typecheck, unit test, serta menguji alur kritis sebelum checkpoint pembaruan.

## Implementasi berjalan

- [x] Mengubah chat Aira menjadi multimodal: teks, gambar umum, audio, dan video memakai payload AI yang sama.
- [x] Menambahkan tindakan tahan pesan, Salin/Edit pada pesan pengguna, dan Salin/Ulang respons pada pesan Aira.
- [x] Meneruskan URI bukti kamera/galeri ke transaksi terkonfirmasi serta menampilkan thumbnail pada daftar transaksi.
- [x] Menambahkan pilihan Piutang pada tab Rencana dan menyimpan jenis komitmen `receivable`.
- [x] Menyelesaikan pemeriksaan akhir untuk perubahan multimodal dan laporan.

## Catatan akun dan Google Drive

- [x] Data lokal dipisahkan berdasarkan scope guest atau identitas akun setelah refresh OAuth/logout; pemulihan cloud tetap memerlukan konfirmasi pengguna.
- [ ] PIN developer bersifat fitur akses UI, bukan pengganti keamanan akun atau enkripsi perangkat.
- [x] Mendiagnosis dan memperbaiki layanan Aira yang tidak dapat mengirim atau menerima respons di aplikasi.
- [x] Memperbaiki resolusi URL API Aira pada perangkat Android/iOS agar tidak menggunakan URL relatif yang tidak dapat dijangkau.
- [x] Menghapus mode JSON yang tidak kompatibel dengan web-search bawaan model AI agar respons Aira dapat diproses kembali.
- [x] Menambahkan mode respons Aira: biasa, persona kustom, dan gaya tegas tanpa menghapus pengamanan inti.
- [x] Menambahkan kontrol mode Aira pada studio developer dan mengirimkan preferensi itu ke layanan AI.
- [x] Mengubah tombol Enter keyboard menjadi baris baru serta mempertahankan tombol kirim eksplisit di samping mikrofon.
- [x] Memindahkan instruksi, knowledge, tema, dan reset factory dari Pengaturan umum ke studio developer berpemilik PIN.
- [x] Menambahkan aksesibilitas buta warna dengan palet alternatif yang tetap membedakan status penting.
- [x] Menjalankan typecheck, lint, unit test, dan checkpoint untuk pembaruan mode Aira serta aksesibilitas.

- [x] Mendiagnosis build Android yang berhenti di 1% pada panel Publish dan memulihkan proses ekspor APK.
- [x] Memvalidasi konfigurasi Expo Android, dependensi, dan layanan backend sebelum ekspor APK ulang.
- [x] Menjalankan typecheck, lint, dan verifikasi build setelah perbaikan ekspor APK.
- [x] Menyimpan checkpoint pemulihan untuk konfigurasi ekspor APK.

DIAGNOSTIC NOTE: Build APK stuck at 1% reported by user on Publish panel; inspect logs and build metadata before changing code.

PARALLEL INPUT LIST: 1) project mobile guide and build configuration, 2) dev/build logs and process status, 3) app config and package scripts/dependencies.

- [x] Memperbaiki aksi tahan pesan pengguna agar menu Salin/Edit muncul dengan ikon dan dapat dipakai.
- [x] Memperbaiki aksi tahan respons Aira agar opsi Salin/Ulang respons muncul dengan ikon dan dapat dipakai.
- [x] Menambahkan daftar instruction yang dapat dibuat, diedit, dihapus, dan dipilih massal di Studio Developer.
- [x] Menambahkan daftar knowledge dengan edit, hapus, tahan 3 detik, pilihan satuan, dan pilih semua.
- [x] Menampilkan notifikasi popup/toast sukses yang konsisten setelah data atau pengaturan disimpan.
- [x] Menjalankan pemeriksaan typecheck, lint, dan unit test untuk pembaruan chat serta Studio Developer.

- [x] Menyimpan riwayat percakapan Aira per akun agar dapat dilanjutkan setelah aplikasi dibuka kembali.
- [x] Menambahkan daftar percakapan, percakapan baru, pembukaan ulang, dan penghapusan percakapan dengan konfirmasi.
- [x] Mempertahankan konteks instruction serta knowledge aktif pada semua percakapan baru.
- [x] Menambahkan usulan knowledge atau instruction dari percakapan dengan persetujuan eksplisit sebelum disimpan.
- [x] Membersihkan cache serta artefak pengembangan yang aman tanpa menghapus data pengguna atau konfigurasi aplikasi.
- [x] Menjalankan typecheck, lint, dan unit test untuk riwayat chat serta pembersihan proyek.

- [x] Menambahkan pratinjau foto, video, dan audio sebelum serta setelah lampiran dikirim pada chat Aira.
- [x] Memastikan teks yang diketik tetap dikirim sebagai pesan pendamping ketika pengguna menambahkan foto atau video.
- [x] Memperbaiki alur perekaman dan transkripsi suara agar pesan suara dapat dikirim ke layanan Aira.
- [x] Menghapus ikon/tombol sama dengan duplikat pada kalkulator sehingga hanya satu tombol = tersedia.
- [x] Menambahkan PIN privasi per riwayat percakapan dengan status aktif/nonaktif dan pengaturan PIN di Profil.
- [x] Menjalankan typecheck, lint, serta unit test untuk pembaruan media, suara, kalkulator, dan PIN privasi.
- [x] Memastikan riwayat chat privat selalu meminta PIN sebelum dibuka, termasuk setelah aplikasi dimulai ulang.
- [x] Meminta verifikasi PIN sebelum status kunci riwayat diaktifkan atau dinonaktifkan dari Profil.
- [x] Memperbaiki area chat agar tetap terlihat saat keyboard perangkat muncul.
- [x] Menambahkan menu Laporkan Bug pada Profil dengan keterangan wajib, screenshot opsional, serta draf email ke andikune@gmail.com.
- [x] Menjalankan typecheck, lint, unit test, dan checkpoint untuk perbaikan PIN, keyboard, serta laporan bug.
- [x] Menambahkan pintasan Beranda untuk Anggaran, Target, Tagihan, Hutang, dan Piutang.
- [x] Menjaga komposer serta teks chat tetap di atas keyboard perangkat pada Android dan iOS.
- [x] Meminta PIN yang benar sebelum riwayat percakapan dapat dikunci atau dibuka dari daftar riwayat.
- [x] Menjalankan typecheck, lint, unit test, dan checkpoint untuk pintasan Beranda serta perbaikan keyboard dan PIN.
- [x] Memperbaiki routing pintasan Beranda Anggaran, Target, Tagihan, Hutang, dan Piutang agar formulir selalu terbuka.
- [x] Memastikan formulir Rencana menyimpan data dan memberi umpan balik untuk semua jenis rencana.
- [x] Menambahkan validasi alur rencana dari pintasan Beranda hingga daftar data diperbarui.
- [x] Menjalankan typecheck, lint, unit test, dan checkpoint untuk perbaikan fitur Rencana.

- [x] Memperbarui versi aplikasi Expo AiraX AI dari v1.0.11 menjadi v1.0.12.
- [x] Menjalankan typecheck, lint, dan unit test untuk rilis v1.0.12.
- [x] Membuat checkpoint baru untuk build APK v1.0.12.
- [x] Mengaudit ulang seluruh fitur SPCA, pintasan, dokumen chat, room suara, media sosial, dan donasi yang belum tampil.
- [x] Menerapkan ulang fitur yang tidak tersimpan atau tidak terhubung pada rilis aplikasi.
- [x] Memverifikasi fitur pada setiap layar utama sebelum membuat checkpoint baru.
- [x] Menjalankan validasi dan membuat checkpoint rilis perbaikan fitur yang benar-benar berisi perubahan.
- [x] Menaikkan versi aplikasi ke v1.0.14 untuk membedakan build perbaikan fitur dari APK sebelumnya.

- [x] Memperbaiki pemilihan dokumen PDF/Excel/audio di chat Aira.
- [x] Mengecilkan robot SPCA, membuatnya dapat digeser, dan mengatur default-nya nonaktif hingga diaktifkan dari Studio Developer.
- [x] Membangun room obrolan gelap dengan kamera, mikrofon, berbagi layar, earpiece/speaker, dan gelombang audio transparan interaktif.
- [x] Memvalidasi dan menyimpan checkpoint rilis baru.

- [x] Memeriksa dan memulihkan akses versi web AiraX AI untuk pengguna.

## Pembaruan lanjutan AiraX AI

- [x] Memindahkan pengaturan suara Aira ke Studio Developer, menghapus akses instruction/knowledge dari Profil, serta memisahkan instruction dan knowledge untuk setiap mode respons Aira.
- [x] Menambahkan pilihan bahasa sistem Indonesia dan Inggris di Studio Developer serta menerapkan lokalisasi pada tampilan inti aplikasi.
- [x] Menambahkan tindakan restart aplikasi dari Profil, memperbaiki tautan media sosial, dan menyempurnakan panel donasi dengan ikon bank/dompet serta tombol salin nomor rekening.
- [x] Menata ulang grid aksi cepat dan rencana cepat, lalu menambahkan pengaturan urutan pintasan oleh pengguna.
- [x] Menambahkan pemindahan dana antar dompet, biaya tambahan transaksi, sumber/tujuan dana manual untuk OCR, waktu bukti transaksi, pratinjau bukti, serta edit/hapus mutasi.
- [x] Memperluas laporan saldo dan arus dana per rekening serta menyelesaikan aturan pelunasan tagihan, hutang, dan piutang ketika nominal transaksi berbeda.
- [x] Menambahkan jatuh tempo, tenor, dan pengingat terjadwal pada anggaran, target, tagihan, hutang, dan piutang; termasuk pencatatan hutang/piutang dari bukti transaksi yang dikonfirmasi.
- [x] Memperbaiki respons Aira untuk lampiran audio/video, alur percakapan baru dan riwayat ber-PIN, serta aksi tahan pesan untuk pilih teks, lapor SPCA, edit, dan ulang respons.
- [x] Menjaga editor chat tetap di atas keyboard dan menyelaraskan sikap Aira di room obrolan dengan instruction, knowledge, dan mode respons aktif.
- [x] Memvalidasi seluruh pembaruan dengan typecheck, lint, pengujian unit, dan checkpoint rilis.

## Perbaikan Rencana

- [x] Menambahkan edit dan hapus dengan konfirmasi untuk Tagihan, Hutang, dan Piutang.

## Jadwal Rencana dan Cadangan Offline

- [x] Mengganti input jatuh tempo Tagihan, Hutang, dan Piutang menjadi tanggal bulanan serta waktu tanpa tahun, dengan tenor tetap tersimpan.
- [x] Memisahkan tanggal pengingat dan waktu pengingat sebelum jatuh tempo agar mudah diatur.
- [x] Menambahkan tag status Berjalan, Jatuh Tempo, GALBAYY, dan Lunas dengan warna yang sesuai pada daftar komitmen.
- [x] Membuat cadangan offline baru berformat nama versi dan tanggal pada folder AiraX AI Backup tanpa menimpa arsip lama.
- [x] Mempermudah pemulihan dengan pemilih berkas JSON serta petunjuk folder AiraX AI Backup pada perangkat.
- [x] Memvalidasi jadwal rencana dan alur cadangan offline, lalu menyimpan checkpoint rilis.

## Penyempurnaan Ketentuan

- [x] Memastikan hanya Tagihan, Hutang, dan Piutang yang memakai tanggal bulanan serta waktu pengingat terpisah; Anggaran dan Target tetap memakai tanggal lengkap tanpa tenor.
- [x] Memisahkan tampilan dan pengelolaan Knowledge serta Instruction khusus untuk respons Aira Biasa, Persona, dan Tegas di Studio Developer.

## Pembaruan branding AiraX Ai Generation

- [x] Membuat logo launcher baru bertuliskan “AiraX AI” dengan gaya visual modern.
- [x] Menerapkan logo baru pada ikon aplikasi dan foto profil yang memakai aset merek.
- [x] Mengubah nama tampilan aplikasi menjadi “AiraX Ai Generation” dan memvalidasi konfigurasi.
- [x] Menyelaraskan judul merek pada Beranda dengan nama aplikasi baru.

## Perbaikan tampilan layar sempit

- [x] Mencegah judul, jam, ikon, dan tombol tindakan keluar dari batas pada layar ponsel sempit.
- [x] Menyesuaikan kartu Cadangan dan Pemulihan agar label serta kontrolnya tetap terbaca dan dapat disentuh.
- [x] Memvalidasi tata letak responsif pada ukuran ponsel serta pemeriksaan kualitas kode.

## Status koneksi dan Robot SPCA

- [x] Memulihkan jam lengkap beserta hari, tanggal, bulan, tahun, dan label status koneksi pada Beranda.
- [x] Menampilkan status koneksi berwarna untuk menghubungkan, terhubung, tidak tersambung, dan offline.
- [x] Menambahkan Robot SPCA interaktif dengan ekspresi, animasi gerak ringan, dan kontrol aktif/nonaktif.
- [x] Menambahkan panel SPCA untuk analisis masalah, cache aplikasi, dan peninjauan tangkapan layar sesuai kemampuan perangkat.
- [x] Menambahkan bubble pengingat SPCA dan navigasi ke tujuan pengingat.
- [x] Menambahkan pengaturan perilaku SPCA di Studio Developer.
- [x] Memvalidasi pengembangan SPCA dengan pemeriksaan tipe, lint, dan unit test.

## Penyempurnaan interaksi Robot SPCA

- [x] Menampilkan ekspresi pada layar wajah robot, bukan sebagai ikon terpisah di bawah tubuh.
- [x] Menggunakan ikon robot berlatar transparan, lebih kecil, dan tetap mudah disentuh serta digeser.
- [x] Memperbaiki gerak patrol bebas serta efek tarikan tubuh dan jejak transisi saat robot digeser.
- [x] Memperbaiki kemunculan bubble pengingat di dekat posisi robot.
- [x] Menggunakan tangkapan layar perangkat langsung dengan pratinjau, batal, crop, dan simpan galeri.
- [x] Menambahkan pemindaian radar, laporan diagnostik terperinci, serta laporan yang dapat disalin dan diedit.
- [x] Memvalidasi penyempurnaan SPCA dengan pemeriksaan tipe, lint, dan unit test.

## Perbaikan autentikasi email

- [x] Menelusuri callback login email yang mengembalikan halaman HTML, bukan respons autentikasi.
- [x] Memperbaiki URL dan penanganan callback agar login email diproses oleh aplikasi.
- [x] Menampilkan pesan kegagalan login yang aman dan mudah dipahami.
- [x] Memvalidasi alur autentikasi serta pemeriksaan kualitas kode.

## Perbaikan percakapan MANU AIRA

- [x] Menelusuri penyebab tombol hapus percakapan tidak menjalankan penghapusan setelah PIN benar.
- [x] Memperbaiki verifikasi PIN dan tindakan hapus riwayat percakapan.
- [x] Memvalidasi penghapusan percakapan dengan pemeriksaan tipe, lint, dan unit test.

## Ekspor mutasi dan laporan keuangan

- [x] Menambahkan ekspor PDF untuk daftar mutasi keuangan.
- [x] Menambahkan ekspor Excel untuk daftar mutasi keuangan.
- [x] Menambahkan ekspor PDF untuk laporan keuangan.
- [x] Menambahkan ekspor Excel untuk laporan keuangan.
- [x] Memvalidasi ekspor keuangan dengan pemeriksaan tipe, lint, dan unit test.

## Perbaikan layanan Aira

- [x] Menelusuri kegagalan koneksi Aira untuk teks, foto, video, dan audio.
- [x] Memperbaiki URL, payload, dan penanganan lampiran layanan Aira.
- [x] Menambahkan pesan kegagalan yang dapat ditindaklanjuti saat layanan tidak tersedia.
- [x] Memvalidasi pengiriman teks dan lampiran dengan pemeriksaan tipe, lint, dan unit test.

## Unggahan besar dan pengiriman ulang Aira

- [x] Menetapkan alur unggahan hingga 200 MB yang aman untuk perangkat dan layanan Aira.
- [x] Menambahkan antrean pengiriman ulang saat koneksi terputus ketika aplikasi aktif.
- [x] Menampilkan progres unggah dan status pengiriman media secara jelas di chat.
- [x] Menampilkan batas ukuran 200 MB serta format yang didukung pada pemilih media dan file.
- [x] Memvalidasi unggahan besar serta pengiriman ulang dengan pemeriksaan tipe, lint, dan unit test.
- [x] Mengaktifkan kelanjutan unggahan terbatas saat aplikasi diminimalkan sesuai pilihan pengguna.

## Menu lampiran dokumen Aira

- [x] Menampilkan menu lampiran yang menjelaskan pilihan foto, video, audio, dokumen, dan berkas perangkat.
- [x] Menambahkan dukungan pemilih file internal untuk PDF, Excel, Word, PowerPoint, dan format umum lain.
- [x] Menampilkan jenis file, batas 200 MB, serta status pemilihan sebelum unggah.
- [x] Memvalidasi menu lampiran Aira dengan pemeriksaan tipe, lint, dan unit test.

## Percakapan suara otomatis Aira

- [x] Menambahkan mode dengar otomatis saat Room Obrolan aktif.
- [x] Mendeteksi jeda bicara untuk mengirim ucapan pengguna ke Aira tanpa tombol mikrofon berulang.
- [x] Membuat Aira merespons dengan suara setelah pengguna berhenti berbicara.
- [x] Menampilkan status mendengarkan, menganalisis, dan berbicara serta kontrol berhenti yang jelas.
- [x] Memvalidasi Room Obrolan dengan pemeriksaan tipe, lint, dan unit test.
- [x] Mengaktifkan mode hybrid: streaming sebagai jalur utama dan deteksi jeda lokal sebagai cadangan.

## Ukuran Robot SPCA

- [x] Menambahkan pilihan ukuran ikon Robot SPCA di Studio Developer.
- [x] Menyimpan ukuran pilihan pengguna dan menerapkannya pada overlay Robot SPCA.
- [x] Memvalidasi pengaturan ukuran Robot SPCA dengan pemeriksaan tipe, lint, dan unit test.

## Skala dan transparansi Robot SPCA

- [x] Memperbaiki penerapan pengaturan ukuran Robot SPCA yang tidak berfungsi.
- [x] Mengganti pilihan ukuran dengan penggeser skala 0–100% berawal dari 25%.
- [x] Menambahkan penggeser transparansi Robot SPCA yang tersimpan.
- [x] Memvalidasi penggeser tampilan Robot SPCA dengan pemeriksaan tipe, lint, dan unit test.
- [x] Menampilkan pratinjau langsung Robot SPCA saat skala atau transparansi digeser.

## Ekspresi wajah Robot SPCA

- [x] Menyempurnakan proporsi dan penempatan ekspresi pada layar wajah Robot SPCA.
- [x] Menambahkan ragam ekspresi wajah Robot SPCA yang lengkap dan kontekstual.
- [x] Menampilkan simbol emosi pendamping di atas sisi kanan kepala Robot SPCA sesuai ekspresi aktif.
- [x] Memvalidasi tampilan ekspresi Robot SPCA dengan pemeriksaan tipe, lint, dan unit test.

## Aksi ekspresi natural Robot SPCA

- [x] Menghilangkan latar simbol emosi agar aksesori ekspresi menyatu secara natural dengan Robot SPCA.
- [x] Menampilkan air mata dari sisi kanan dan kiri mata pada ekspresi menangis.
- [x] Menampilkan tisu ke arah hidung ketika Robot SPCA bersedih.
- [x] Menampilkan kaca pembesar ke arah mata saat Robot SPCA sedang menganalisis.
- [x] Menampilkan asap lelah di atas kepala dan menyempurnakan ekspresi ngambek serta aksi emosi lain.
- [x] Memvalidasi aksi ekspresi natural Robot SPCA dengan pemeriksaan tipe, lint, dan unit test.

## Tes notifikasi dan alarm salat

- [x] Menambahkan tombol tes notifikasi pengingat dengan pengaturan jeda dalam detik.
- [x] Menambahkan izin notifikasi yang jelas untuk alarm salat berdering.
- [x] Menambahkan tombol tes alarm adzan dengan pengaturan jeda dalam detik.
- [x] Memvalidasi alur tes notifikasi dan alarm salat dengan pemeriksaan tipe, lint, dan unit test.

## Pengaturan alarm salat

- [x] Menambahkan ikon gerigi pada sudut kanan atas layar Waktu Salat untuk membuka pengaturan alarm.
- [x] Memindahkan tes alarm dan pengaturan jeda detik ke jendela pengaturan alarm salat.
- [x] Menambahkan pilihan nada default perangkat atau berkas audio dari penyimpanan internal untuk tes alarm.
- [x] Menambahkan sakelar aktif/nonaktif getar alarm salat.
- [x] Memvalidasi jendela pengaturan alarm salat dengan pemeriksaan tipe, lint, dan unit test.

## Mode Administrator dan sinkronisasi server

- [x] Menambahkan pemicu tekan-tahan 30 detik pada ikon Mode Administrator di bagian bawah Opsi Developer.
- [x] Membuat antarmuka Mode Administrator bertema terminal gelap dengan animasi kode digital yang tetap berjalan.
- [x] Menambahkan urutan pemuatan dua menit dengan Robot SPCA dan indikator progres 0–100% sebelum autentikasi.
- [x] Menambahkan autentikasi administrator yang aman tanpa kredensial tertanam pada aplikasi klien.
- [x] Menambahkan layar SERVER DATABASE dengan status data dan kontrol sinkronisasi yang terlindungi.
- [x] Merancang sinkronisasi otomatis saat aplikasi terbuka atau jaringan kembali dengan ruang lingkup data per akun yang aman.
- [x] Memvalidasi keamanan, akses administrator, dan sinkronisasi dengan pemeriksaan tipe, lint, dan unit test.

## Snapshot global lingkungan uji

- [x] Menyediakan snapshot global pusat yang jelas ditandai hanya untuk lingkungan uji aplikasi pribadi.
- [x] Membatasi perubahan snapshot global pada akses administrator sisi server.
- [x] Memuat snapshot global uji saat aplikasi terbuka atau koneksi kembali tanpa meminta konfirmasi ulang.

## Perbaikan pemicu Mode Administrator

- [x] Menampilkan ikon ⓘ saja tanpa tulisan Mode Administrator.
- [x] Mengganti tekan-tahan menjadi 20 ketukan berurutan untuk membuka Mode Administrator.
- [x] Menampilkan umpan balik jumlah ketukan tersisa hanya mulai ketukan ke-10.
- [x] Memvalidasi pemicu Mode Administrator dengan pemeriksaan tipe, lint, dan unit test.

## Sinkronisasi otomatis Mode Guest

- [x] Membuka akses tarik snapshot global lingkungan uji untuk Mode Guest tanpa akses tulis.
- [x] Menjalankan penarikan snapshot otomatis pada Mode Guest saat aplikasi dibuka, aktif kembali, atau koneksi tersedia.
- [x] Memvalidasi sinkronisasi otomatis Mode Guest dengan pemeriksaan tipe, lint, dan unit test.

## Pembaruan autentikasi dan akun

- [x] Membuat registrasi dengan nama, username unik, tanggal lahir, email, WhatsApp, kata sandi, persetujuan syarat, dan token cadangan.
- [x] Memastikan username, email, serta WhatsApp unik dan menyimpan kata sandi serta token cadangan dalam bentuk hash aman di server.
- [x] Menambahkan login menggunakan username, email, atau WhatsApp dengan pemblokiran setelah tiga kegagalan.
- [x] Menambahkan pemulihan kata sandi menggunakan token cadangan, pembukaan blokir, dan cooldown login 30 menit.
- [x] Menambahkan formulir permasalahan akun dengan tautan email praisi kepada administrator.
- [x] Membuat pembatasan layanan Aira AI dan pindai bukti bagi Mode Guest dengan indikator gembok.
- [x] Menambahkan tutup akun yang dapat dibatalkan dalam 30 hari dan blacklist identifier setelah masa tersebut berlalu.
- [x] Menambahkan pencarian, pengelolaan akun, dan ekspor data aman pada SERVER DATABASE.
- [x] Memvalidasi pembaruan autentikasi, privasi, dan alur akun dengan pemeriksaan tipe, lint, serta unit test.

## Keputusan autentikasi manual dan blacklist harian

- [x] Menerapkan sesi login manual penuh AiraX tanpa ketergantungan login penyedia eksternal.
- [x] Menjalankan evaluasi blacklist akun tertutup setiap hari setelah 30 hari setelah proyek dipublikasikan.

## Pelengkapan pengelolaan akun SERVER DATABASE

- [x] Menambahkan pembaruan data profil akun oleh administrator dengan validasi identifier unik.
- [x] Menambahkan tindakan aktifkan/nonaktifkan dan blokir/buka blokir akun.
- [x] Menambahkan reset kata sandi aman yang tidak menampilkan kata sandi lama atau baru kepada administrator.
- [x] Menambahkan tutup akun dan hapus akun bertahap dengan konfirmasi berlapis tanpa penghapusan fisik seketika.
- [x] Menampilkan seluruh tindakan pengelolaan akun pada konsol SERVER DATABASE.
- [x] Memvalidasi manajemen akun administrator dengan pemeriksaan tipe, lint, dan unit test.

## AiraXCloud dan pencadangan offline

- [x] Membuat AiraXCloud sebagai penyimpanan cloud cadangan per akun untuk data keuangan, riwayat chat Aira, dan data aplikasi terkait.
- [x] Menambahkan menu AiraXCloud berikon awan di Studio Developer beserta daftar cadangan berdasarkan username.
- [x] Menambahkan kontrol administrator untuk membatasi atau menghapus arsip AiraXCloud secara aman.
- [x] Mengganti pencadangan online Google Drive menjadi AiraXCloud pada menu Profil dengan status berdasarkan akun yang masuk.
- [x] Memulihkan cadangan AiraXCloud saat akun manual berhasil login tanpa mencadangkan ulang tanpa tindakan pengguna.
- [x] Memperbarui lokasi default backup offline ke folder AiraXBackup dan mendukung pilihan lokasi penyimpanan alternatif.
- [x] Memungkinkan pemulihan backup offline berbasis berkas pada Mode Guest.
- [x] Memvalidasi AiraXCloud dan AiraXBackup dengan pemeriksaan tipe, lint, dan unit test.

## Indikator progres cadangan dan pemulihan

- [x] Menampilkan status tahap dan indikator progres saat membuat cadangan AiraXCloud serta AiraXBackup.
- [x] Menampilkan status tahap dan indikator progres saat memulihkan AiraXCloud serta AiraXBackup.
- [x] Menampilkan hasil berhasil atau gagal yang jelas setelah proses selesai.
- [x] Memvalidasi indikator progres cadangan dan pemulihan dengan pemeriksaan tipe, lint, dan unit test.

## Pintasan pemuatan Mode Administrator

- [x] Menambahkan tombol skip 🚀 tersembunyi pada kiri atas layar pemuatan Mode Administrator.
- [x] Menampilkan tombol skip hanya setelah wajah Robot SPCA ditekan tiga kali.
- [x] Mengganti ekspresi Robot SPCA setiap wajahnya ditekan selama pemuatan.
- [x] Mengarahkan tombol skip langsung ke layar login administrator tanpa menunggu pemuatan dua menit.
- [x] Memvalidasi pintasan pemuatan dengan pemeriksaan tipe, lint, dan unit test.

## Perbaikan kontrol SERVER DATABASE dan pemuatan SPCA

- [x] Memperbaiki tindakan nonaktif, blokir, tutup 30 hari, dan hapus akun pada SERVER DATABASE.
- [x] Menambahkan halaman atau panel Daftar Akun Blacklist pada SERVER DATABASE.
- [x] Mengubah pemicu ikon roket tersembunyi menjadi 10 ketukan wajah Robot SPCA.
- [x] Mengecilkan ikon roket dan menghapus semua petunjuk teks terkait skip pemuatan.
- [x] Menambah ragam ekspresi dan aksesori Robot SPCA saat disentuh selama pemuatan.
- [x] Memvalidasi kontrol akun dan interaksi pemuatan dengan pemeriksaan tipe, lint, dan unit test.

## Penyempurnaan layanan Aira dan audit administrator

- [x] Menampilkan kontrol input kamera, galeri media, suara, dan dokumen pada komposer chat Aira.
- [x] Memastikan komposer dan kursor teks tetap terlihat di atas keyboard pada seluruh mode input Aira.
- [x] Menambahkan gelembung respons sementara “Aira sedang berpikir…” sebelum jawaban Aira diterima.
- [x] Menampilkan logo profil AiraX Ai pada gelembung pesan Aira dan mendukung foto profil kustom dari galeri melalui Studio Developer.
- [x] Menyimpan dan menampilkan riwayat audit untuk setiap tindakan pengelolaan akun oleh administrator.
- [x] Memvalidasi pembaruan Aira dan audit administrator dengan typecheck, lint, serta unit test.

## Pembaruan sistem respons Aira

- [x] Mengganti nama mode respons menjadi Aira (Default), Aira Hot Pro 18+, dan Aira Ahli Ilmuan.
- [x] Memastikan aplikasi kembali memakai Aira (Default) saat sesi baru dimulai atau aplikasi kembali aktif setelah layar terkunci.
- [x] Memisahkan pengaturan instruksi dan knowledge Aira (Default) dari Studio Developer ke halaman Aira Setting di Profil.
- [x] Membatasi Aira Hot Pro 18+ dan Aira Ahli Ilmuan sebagai mode yang hanya tersedia melalui Studio Developer.
- [x] Menambahkan tim ahli yang dipilih berdasarkan relevansi topik pada respons Aira Ahli Ilmuan, dengan peran netral dan batasan keselamatan domain profesional.
- [x] Memvalidasi mode respons, reset sesi, dan pemilihan tim ahli dengan typecheck, lint, serta unit test.

## Branding AiraX AI dan profil pengguna

- [x] Membuat logo AiraX AI baru yang sederhana dengan monogram A× dan wordmark AiraX AI.
- [x] Menerapkan logo baru pada ikon aplikasi, splash, favicon, dan avatar bawaan Aira.
- [x] Mengizinkan pengguna mengganti foto profil dari galeri dengan mengetuk foto pada menu Profil.
- [x] Menampilkan nama pengguna di bawah nama lengkap pada Profil.
- [x] Menampilkan foto profil pengguna pada setiap bubble chat pengguna.
- [x] Memvalidasi aset merek dan alur foto profil dengan typecheck, lint, serta unit test.

## Avatar mode respons Aira

- [x] Membuat avatar Aira Hot Pro 18+ berupa karakter wanita dewasa generik berhijab coklat muda, riasan natural, softlens abu-biru, dan jas putih.
- [x] Membuat avatar berbeda untuk setiap peran ahli generik dalam mode Aira Ahli Ilmuan tanpa merepresentasikan tokoh nyata.
- [x] Menerapkan avatar mode pada bubble respons Aira secara konsisten.
- [x] Memvalidasi avatar mode respons dengan typecheck, lint, serta unit test.

## Penggantian logo dari pengguna

- [x] Mengganti ikon launcher, splash, favicon, Android, avatar merek, dan metadata logo dengan gambar AiraX AI yang dikirim pengguna.
- [x] Menghapus aset logo lama yang tidak lagi dirujuk oleh aplikasi tanpa menghapus aset Robot SPCA atau aset fungsional lain.
- [x] Memvalidasi konfigurasi dan pemakaian aset logo baru dengan typecheck, lint, serta unit test.

## Perbaikan layanan respons Aira AI

- [x] Menelusuri kegagalan pengiriman atau penerimaan respons Aira dari layar chat hingga endpoint server.
- [x] Memperbaiki integrasi layanan Aira dan penanganan error agar respons dapat diterima kembali.
- [x] Memvalidasi pengiriman pesan dan respons Aira dengan typecheck, lint, serta unit test.

## Logo terbaru pengguna dan stabilisasi Aira

- [x] Menerapkan logo terbaru yang dikirim pengguna pada seluruh ikon aplikasi, splash, favicon, avatar merek, dan metadata logo.
- [x] Membersihkan aset logo sebelumnya yang tidak lagi dirujuk tanpa menghapus aset fungsional lain.
- [x] Menyelesaikan serta memvalidasi perbaikan respons Aira AI setelah strategi JSON dan model cadangan diterapkan.

## Diagnosis mendalam respons Aira AI

- [x] Menguji jalur lengkap login manual, header sesi, endpoint tRPC, dan respons model menggunakan kondisi yang setara dengan aplikasi pengguna.
- [x] Mengidentifikasi serta memperbaiki akar kegagalan respons Aira yang masih terjadi setelah fallback model diterapkan.
- [x] Memvalidasi respons Aira end-to-end dan menambahkan pengujian regresi untuk penyebab yang ditemukan.

## Perbaikan mode khusus dan PIN Aira

- [x] Memperbaiki sakelar aktif/nonaktif Aira Hot Pro 18+ dan Aira Ahli Ilmuan di Studio Developer.
- [x] Menampilkan status mode aktif yang jelas pada sambutan dan header layanan Aira.
- [x] Menghapus kunci riwayat percakapan serta pengaturan PIN dari Aira biasa.
- [x] Mempertahankan dan membatasi kunci riwayat, pembukaan, dan penghapusan ber-PIN hanya untuk Aira Hot Pro 18+ dan Aira Ahli Ilmuan.
- [x] Memvalidasi perpindahan mode, status UI, dan alur PIN riwayat dengan typecheck, lint, serta unit test.

## Perbaikan komposer dan media Aira

- [x] Mengganti toolbar awal dengan tombol lampiran 📎 yang membuka pilihan Kamera, Galeri, Musik, dan Dokumen.
- [x] Memulihkan mikrofon di samping tombol kirim dengan indikator serta gelombang suara saat perekaman.
- [x] Menambahkan pratinjau dan konfirmasi lampiran foto, video, audio, serta dokumen sebelum pesan dikirim.
- [x] Menambahkan tindakan edit yang tersedia secara aman untuk foto dan video sebelum dikirim, serta pratinjau media dalam bubble chat setelah dikirim.
- [x] Menyamarkan judul riwayat percakapan terkunci dan memastikan kontrol PIN tetap sesuai mode khusus.
- [x] Memperbaiki pemetaan avatar Aira Hot Pro dan ahli ilmuwan saat mode diaktifkan.
- [x] Memvalidasi seluruh alur komposer, media, privasi, dan avatar dengan typecheck, lint, serta unit test.

## Perbaikan tombol Kamera Aira

- [x] Menelusuri penyebab tombol Kamera pada panel lampiran membuka galeri alih-alih kamera perangkat.
- [x] Memperbaiki pemanggilan kamera dan izin perangkat agar tindakan Kamera memakai jalur kamera secara eksplisit.
- [x] Memvalidasi jalur Kamera dan Galeri secara terpisah dengan typecheck, lint, serta unit test.

## Evaluasi ulang akun closing

- [x] Memeriksa ulang kandidat akun manual berstatus closing yang melewati 30 hari sejak closeRequestedAt.
- [x] Menandai hanya kandidat yang memenuhi syarat sebagai blacklisted dan mengisi blacklistedAt dengan waktu evaluasi.

## Identitas visual dan riwayat terpisah per mode Aira

- [x] Mempertahankan tema, warna, tulisan, dan sapaan Aira Default tanpa perubahan.
- [x] Menerapkan tema merah muda, label, sapaan dewasa yang aman, serta avatar khusus pada Aira Hot Pro 18+.
- [x] Menerapkan tema hijau muda, label, sapaan tim ahli, serta avatar khusus pada Aira Ahli Ilmuan.
- [x] Memisahkan daftar dan isi riwayat percakapan untuk Default, Hot Pro 18+, dan Ahli Ilmuan tanpa menghapus data antarmode.
- [x] Memastikan mode aktif selalu kembali ke Aira Default ketika aplikasi dibuka kembali atau kembali aktif setelah layar perangkat tidak aktif.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Diagnosis ulang Kamera layanan Aira

- [x] Menelusuri penyebab tombol Kamera layanan Aira masih tidak membuka kamera perangkat secara andal.
- [x] Memperbaiki jalur pemanggilan kamera dan umpan balik izin pada web serta perangkat native.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Perbaikan mikrofon dan animasi layanan Aira

- [x] Menelusuri penyebab tombol mikrofon Aira tidak memulai atau menghentikan perekaman dengan benar.
- [x] Memperbaiki izin, perekaman, pengukuran suara, dan pengiriman audio pada web serta perangkat native.
- [x] Memulihkan animasi gelombang suara dan umpan balik visual yang diperlukan selama proses Aira.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Perbaikan lanjutan perekaman dan pratinjau audio Aira

- [x] Mendiagnosis kegagalan perekaman audio yang masih terjadi pada perangkat pengguna.
- [x] Memastikan pratinjau audio muncul setelah rekaman berhenti dan sebelum pesan dikirim.
- [x] Menampilkan animasi gelombang audio berwarna biru muda yang selalu terlihat selama rekaman aktif.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Desain ulang navigasi dan riwayat layanan Aira

- [x] Mengganti panel riwayat lama dengan sidebar dari kiri dan tombol hamburger di header chat.
- [x] Menambahkan tombol percakapan baru berbentuk kapsul/FAB yang mudah dijangkau di atas komposer.
- [x] Menambahkan menu konteks titik tiga berbentuk bottom sheet untuk ganti nama, sematkan, arsip, bagikan, hapus, dan kunci sesuai mode.
- [x] Menambahkan folder Arsip dan Baru Saja Dihapus dengan pemulihan percakapan serta penghapusan otomatis setelah 30 hari.
- [x] Memastikan PIN tetap hanya tersedia pada Aira Hot Pro 18+ dan Aira Ahli Ilmuan.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Perbaikan kontrol chat baru dan hapus riwayat

- [x] Menghapus tombol tambah chat lama dari panel riwayat agar hanya satu tombol Chat baru yang digunakan.
- [x] Memperbaiki tindakan hapus agar riwayat aktif berpindah ke Sampah dan antarmuka kembali ke percakapan baru.
- [x] Memastikan Aira Hot Pro 18+ meminta dan memverifikasi PIN sebelum percakapan dapat dihapus.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Kalender mini untuk input tanggal

- [x] Menambahkan kalender mini yang mengikuti tanggal perangkat untuk input Anggaran dan Target pada menu Rencana.
- [x] Menambahkan kalender mini untuk input tanggal lahir pada formulir akun.
- [x] Memastikan tanggal tersimpan dalam format yang kompatibel dengan data dan validasi yang telah ada.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Perbaikan sampah dan kontrol riwayat Aira

- [x] Memperbaiki aksi Pindahkan ke Baru Saja Dihapus agar riwayat benar-benar masuk ke folder Sampah.
- [x] Menambahkan menu titik tiga pada setiap riwayat di Sampah dengan opsi Pulihkan dan Hapus selamanya.
- [x] Menghapus seluruh ikon dan kontrol riwayat/chat baru lama yang masih muncul di layar layanan Aira.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Perbaikan masuk ulang dan pembatasan Mode Guest

- [x] Memperbaiki tombol Masuk lagi pada Profil agar selalu menuju layar login manual AiraX.
- [x] Mengizinkan Mode Guest membuka dan melihat layanan Aira, tetapi mengunci komposer dengan tombol Masuk untuk mengirim.
- [x] Mengunci aksi Pindai bukti pada menu Keuangan bagi Mode Guest dengan tombol Masuk yang jelas.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Diagnosis ulang Sampah dan tombol tambah percakapan lama

- [x] Melacak penyebab aksi Pindahkan ke Baru Saja Dihapus masih tidak mengubah riwayat pengguna.
- [x] Menghapus seluruh ikon tambah percakapan lama yang masih dirender pada layanan Aira.
- [x] Memvalidasi perpindahan ke Sampah, pembaruan sidebar, dan alur PIN mode khusus.
- [x] Menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Generasi media dari prompt Aira

- [x] Menambahkan pilihan pembuatan gambar dan dokumen dari prompt pada layanan Aira.
- [x] Menambahkan keluaran dokumen PDF, Word, PowerPoint, Excel, Markdown, serta teks sesuai kebutuhan prompt.
- [x] Menghubungkan gambar dan dokumen ke kemampuan server Manus dengan status proses dan penanganan kegagalan yang jelas.
- [x] Menampilkan pratinjau hasil gambar dan dokumen di percakapan serta tindakan penggunaan hasil yang sesuai.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Perbaikan hasil generasi Aira dan penggunaan di chat

- [x] Mendiagnosis kegagalan gambar atau dokumen hasil generasi yang tidak kembali dan tidak muncul di bubble chat.
- [x] Memastikan hasil generasi tersimpan, memiliki URL yang dapat diakses, dan dapat langsung digunakan sebagai lampiran konteks pada percakapan lanjutan.
- [x] Menambahkan alur generasi media yang tersedia serta pesan status khusus untuk video dan audio yang masih memerlukan penyedia server resmi.
- [x] Menambahkan pengujian end-to-end berbasis server dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Generasi langsung dari text box Aira

- [x] Mengenali permintaan pembuatan gambar atau dokumen dari prompt yang dikirim melalui text box Aira.
- [x] Menjalankan generator server secara langsung dan menampilkan status proses pada bubble chat.
- [x] Menyisipkan hasil gambar atau dokumen sebagai bubble chat yang dapat digunakan sebagai konteks percakapan lanjutan.
- [x] Menampilkan pesan kegagalan yang spesifik bila hasil media belum dapat dibuat oleh server.

## Perbaikan penyimpanan riwayat percakapan Aira

- [x] Menelusuri penyebab pesan percakapan dan hasil generasi tidak selalu tersimpan ke riwayat aktif.
- [x] Memastikan pesan pengguna, status proses, bubble hasil, dan respons Aira tersimpan secara atomik pada percakapan aktif.
- [x] Menambahkan pengujian regresi penyimpanan riwayat setelah pesan normal dan hasil generasi.

## Sinkronisasi pratinjau terbaru

- [x] Memulai ulang pratinjau agar memuat checkpoint generasi Aira terbaru.
- [x] Memverifikasi pratinjau tidak lagi menggunakan bundel versi lama.

## Perbaikan pratinjau dan tindakan hasil generasi Aira

- [x] Mendiagnosis penyebab hasil gambar atau dokumen generasi tidak tampil pada bubble chat.
- [x] Menambahkan pratinjau layar penuh untuk gambar dan tampilan berkas untuk dokumen hasil generasi.
- [x] Menambahkan tombol Generate ulang yang memakai prompt asal dan tombol Unduh pada hasil generasi.
- [x] Menambahkan pengujian regresi lalu menjalankan typecheck, lint, serta unit test sebelum checkpoint.

## Galeri hasil, berbagi, dan resolusi gambar Aira

- [x] Menambahkan Galeri Hasil Aira yang terpisah per akun dan menyimpan hasil gambar serta dokumen yang dibuat.
- [x] Menambahkan tombol Bagikan langsung pada hasil gambar dan dokumen.
- [x] Menambahkan pilihan resolusi gambar sebelum generate serta meneruskan pilihan ke server Manus.
- [x] Menambahkan pengujian regresi dan menjalankan typecheck, lint, serta unit test sebelum meminta persetujuan akhir.

## Penyempurnaan galeri hasil Aira

- [x] Menambahkan pencarian dan filter hasil berdasarkan jenis serta kata kunci.
- [x] Menambahkan album Gambar dan Dokumen dengan jumlah hasil yang jelas.
- [x] Menambahkan batas penyimpanan galeri dan pembersihan otomatis hasil lama secara aman.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Kontrol lanjutan galeri hasil Aira

- [x] Menambahkan pilihan pengurutan hasil terbaru dan terlama.
- [x] Menambahkan penandaan serta filter hasil favorit.
- [x] Menambahkan mode multi-pilih untuk hapus dan bagikan hasil sekaligus.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Koleksi, ekspor, dan cloud galeri hasil Aira

- [x] Menambahkan label atau koleksi kustom untuk mengelompokkan hasil galeri.
- [x] Menambahkan ekspor daftar galeri hasil ke PDF dan Excel.
- [x] Menyertakan Galeri Hasil Aira dalam cadangan serta pemulihan AiraXCloud per akun.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Indikator progres generasi layanan Aira

- [x] Menampilkan tahap loading dan progres yang mudah dipahami saat Aira membuat gambar atau dokumen.
- [x] Menampilkan status selesai atau gagal beserta tindakan yang dapat dilakukan pengguna.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Penyempurnaan progres generasi layanan Aira

- [x] Menampilkan estimasi waktu tersisa sebagai indikator perkiraan selama proses generasi.
- [x] Menyimpan dan menampilkan riwayat proses generasi terbaru pada layanan Aira.
- [x] Menampilkan notifikasi yang jelas ketika hasil generasi selesai atau gagal.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Pengaturan notifikasi generasi Aira

- [x] Menambahkan pengaturan aktif/nonaktif notifikasi selesai atau gagal untuk generasi Aira.
- [x] Menerapkan format rekomendasi fitur berurutan pada komunikasi lanjutan.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Penyempurnaan generasi Aira terpilih

- [x] Menambahkan template prompt siap pakai untuk gambar dan dokumen Aira.
- [x] Menambahkan perbandingan hasil A/B sebelum pengguna menentukan hasil yang dipakai.
- [x] Menambahkan edit cepat hasil gambar sebelum diunduh atau dibagikan.
- [x] Menambahkan tindakan Buka hasil, Bagikan, dan Generate ulang dari notifikasi generasi.
- [x] Menambahkan antrean generasi yang mencoba melanjutkan proses saat koneksi kembali stabil.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Kontrol antrean generasi Aira

- [x] Menambahkan tombol batalkan dan hapus item antrean generasi dari panel proses Aira.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Ringkasan antrean dan tema mode Aira

- [x] Menambahkan ringkasan antrean generasi pada Beranda.
- [x] Menyelaraskan seluruh warna UI Aira Default dengan tema biru muda.
- [x] Menyelaraskan seluruh warna UI Aira Hot Pro 18+ dengan tema merah muda.
- [x] Menyelaraskan seluruh warna UI Aira Ahli Ilmuan dengan tema hijau muda.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Personalisasi tema dan status mode Aira

- [x] Menambahkan pilihan aksen warna yang tetap sesuai keluarga warna setiap mode Aira.
- [x] Menambahkan pratinjau tema Aira di Studio Developer sebelum mode diaktifkan.
- [x] Menambahkan ringkasan mode Aira aktif pada Beranda.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Aksen koleksi dan widget Beranda

- [x] Menambahkan aksen warna khusus pada koleksi hasil Aira.
- [x] Menambahkan widget ringkas target serta tagihan terdekat pada Beranda.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Perapihan kartu Aira dan Beranda

- [x] Menyatukan status Aira aktif menjadi ikon kecil pada kartu biru “Aira siap membantu”.
- [x] Merapikan posisi ikon, jarak komponen, dan tata letak Beranda agar tidak bergeser pada layar ponsel.
- [x] Mempertahankan posisi overlay Robot SPCA tanpa perubahan karena telah sesuai.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Teks kartu utama per mode Aira

- [x] Membuat judul “Aira siap membantu” berubah sesuai Aira Default, Aira Hot Pro 18+, dan Aira Ahli Ilmuan.
- [x] Menyelaraskan keterangan serta ikon kartu utama dengan mode dan tema warna aktif.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Personalisasi lanjutan mode Aira

- [x] Menambahkan pengeditan keterangan kartu utama untuk setiap mode pada Studio Developer.
- [x] Menambahkan animasi transisi lembut ketika mode Aira berubah.
- [x] Menambahkan label mode aktif pada tab Aira bawah.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Preset mode dan perapihan Beranda

- [x] Menambahkan beberapa preset keterangan untuk setiap mode Aira.
- [x] Menambahkan bunyi atau getar halus ketika mode Aira berhasil berganti.
- [x] Merapikan posisi jam, status online, dan foto profil pada sisi kanan header Beranda.
- [x] Menampilkan foto Profil pengguna sebagai ikon profil di Beranda.
- [x] Mengecilkan kartu biru Aira serta memperbesar kartu Saldo yang tercatat.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Status profil dan donasi QR

- [x] Menambahkan cincin status online, offline, dan menghubungkan pada foto profil Beranda.
- [x] Memindahkan Opsi Developer ke bagian paling bawah Profil setelah Donasi.
- [x] Mengubah kartu Donasi menjadi QR beserta tautan Rincian rekening dan tombol salin.
- [x] Menambahkan halaman Rincian Donasi yang menampilkan daftar rekening pengguna.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Pelengkapan donasi QR

- [x] Menampilkan nama pemilik rekening Andik pada seluruh rekening donasi.
- [x] Menambahkan tombol untuk membagikan QR dan tautan donasi.
- [x] Menambahkan riwayat konfirmasi donasi lokal tanpa pemrosesan pembayaran.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Umpan balik donasi dan animasi Robot SPCA

- [x] Menambahkan notifikasi terima kasih lokal setelah konfirmasi donasi dicatat.
- [x] Menambahkan efek animasi visual halus saat Robot SPCA melayang di overlay.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Intensitas animasi Robot SPCA

- [x] Menambahkan pilihan Halus, Standar, dan Ekspresif pada Opsi Developer.
- [x] Menghubungkan pilihan intensitas ke tinggi gerak, kemiringan, dan aura animasi overlay Robot SPCA.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Pratinjau animasi Robot SPCA

- [x] Menambahkan pratinjau langsung gerakan dan aura Robot SPCA di Opsi Developer.
- [x] Menyelaraskan pratinjau dengan pilihan Halus, Standar, dan Ekspresif sebelum konfigurasi disimpan.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Aura, kecepatan, dan gelembung Robot SPCA

- [x] Menambahkan pilihan warna aura Robot SPCA di Opsi Developer.
- [x] Menambahkan pengaturan kecepatan animasi Robot SPCA di Opsi Developer.
- [x] Membuat gelembung pengingat mengikuti posisi Robot SPCA saat digeser atau berpatroli.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Gelembung dan patroli pasif Robot SPCA

- [x] Menambahkan posisi gelembung otomatis, kiri, atau kanan serta efek masuk dan keluar yang lembut.
- [x] Menambahkan sakelar aura terpisah dari animasi melayang.
- [x] Menambahkan mode patroli pasif Robot SPCA saat SPCA tidak diaktifkan oleh pengguna.
- [x] Menambahkan respons ketukan, pengelakan, serta dialog bawaan pada mode patroli pasif.
- [x] Menambahkan pengaturan jeda kemunculan, durasi tampil, dan pesan gelembung mode patroli pasif.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Pusat pengaturan Robot SPCA dan landscape

- [x] Menambahkan batas kemunculan patroli pasif per sesi yang dapat diatur di menu Robot SPCA.
- [x] Menambahkan riwayat patroli lokal tanpa pengumpulan data layar.
- [x] Membuat halaman pengaturan Robot SPCA terpisah dari Studio Developer.
- [x] Memindahkan seluruh pengaturan Robot SPCA ke halaman pengaturan khusus tersebut.
- [x] Menambahkan pengaturan Profil untuk mengaktifkan atau menonaktifkan tata letak adaptif landscape.
- [x] Menyesuaikan Beranda dan Profil agar tetap rapi pada tampilan landscape ketika pengaturan aktif.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Mode tampilan manual dan penyempurnaan Robot SPCA

- [x] Mengubah sakelar landscape Profil menjadi tombol mode manual landscape dan portrait tanpa menunggu rotasi perangkat.
- [x] Memperluas durasi patroli pasif Robot SPCA dari 0 hingga 1 jam sejak aplikasi dibuka.
- [x] Memperbaiki pengelakan Robot SPCA setelah ketukan ketiga agar tidak menghilang sebelum durasi patroli berakhir.
- [x] Mengganti emoji respons ketukan dengan ekspresi pada layar wajah Robot SPCA.
- [x] Menyempurnakan animasi pemindaian dengan gerak bebas, kaca pembesar lebih besar, dan efek mata membesar.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Scanner mini Robot SPCA

- [x] Menambahkan tampilan scanner mini dengan garis radar lembut pada gelembung Robot SPCA saat pemindaian berlangsung.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Warna dan progres scanner mini

- [x] Menambahkan pilihan warna biru, ungu, hijau, dan emas untuk scanner mini Robot SPCA.
- [x] Menambahkan indikator progres pemindaian 0–100% pada scanner mini.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Perbaikan QR donasi

- [x] Memperbaiki URL QR donasi agar membuka halaman rincian rekening tanpa halaman Cannot GET.
- [x] Menghapus nomor rekening dari bawah QR dan mempertahankan tombol Rincian sebagai akses informasi rekening.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Unduh QR donasi

- [x] Menambahkan tombol untuk mengunduh QR Donasi dari halaman Rincian.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Tindakan tambahan QR donasi

- [x] Menambahkan tampilan QR Donasi layar penuh sebelum pengguna mengunduhnya.
- [x] Menampilkan keterangan lokasi penyimpanan QR setelah unduhan berhasil.
- [x] Menambahkan tombol cetak QR Donasi pada web.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Perbaikan rute QR donasi publik

- [x] Membuat halaman rincian rekening publik mandiri yang dapat dibuka dari hasil pemindaian QR.
- [x] Membuat ulang QR Donasi agar mengarah ke halaman publik mandiri tanpa rute aplikasi yang hilang.
- [x] Memvalidasi URL publik agar tidak lagi memunculkan respons Cannot GET.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## QR pembuka aplikasi AiraX

- [x] Menambahkan QR kedua pada halaman donasi publik yang membuka aplikasi AiraX.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Penyempurnaan patroli pasif Robot SPCA

- [x] Membuat kemunculan awal menunggu jeda yang diatur sejak layar aplikasi dibuka, lalu mengintip dari kanan bawah sebelum masuk penuh.
- [x] Memperlebar gelembung notifikasi Robot SPCA agar teks mudah dibaca.
- [x] Membuat Robot SPCA lebih aktif menelusuri layar selama patroli analisis.
- [x] Mengubah respons ketukan menjadi siklus mengelak lalu diam sampai durasi selesai, kemudian pergi menghilang.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Jejak radar patroli Robot SPCA

- [x] Menambahkan efek jejak radar tipis yang mengikuti patroli pasif Robot SPCA.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Pengaturan jejak radar Robot SPCA

- [x] Menambahkan pilihan warna jejak radar di halaman Robot SPCA.
- [x] Menambahkan sakelar aktif/nonaktif jejak radar di halaman Robot SPCA.
- [x] Menambahkan garis radar kecil yang berputar selama patroli pasif.
- [x] Menambahkan pengujian regresi serta menjalankan typecheck, lint, dan unit test sebelum meminta persetujuan akhir.

## Crash aplikasi setelah publish dan instalasi

- [ ] Mengidentifikasi penyebab aplikasi native keluar sendiri saat pertama kali dibuka setelah instalasi.
- [ ] Memperbaiki konfigurasi atau jalur startup yang menyebabkan crash.
- [ ] Menambahkan regresi startup dan menjalankan typecheck, lint, serta unit test sebelum checkpoint.
- [ ] Memvalidasi hasil pada konfigurasi web dan pemeriksaan build native yang tersedia.

### Catatan diagnosis awal

- [ ] Memeriksa log crash perangkat atau pesan error native dari pengguna jika tersedia.
- [ ] Memeriksa konfigurasi Expo, plugin native, orientasi layar, asset, dan deep link.
- [ ] Memeriksa kompatibilitas modul yang hanya tersedia pada native atau web.

### Catatan

- [x] Checkpoint stabil sebelum diagnosis crash: 8a36e5eb.
- [x] Web preview berhasil dibundel; error autentikasi invalid session cookie pada mode guest bukan crash native.
- [x] Pembuatan checkpoint diagnosis tanpa perubahan kode: 8a36e5eb.

> Catatan: checkpoint diagnosis dibuat tanpa perubahan kode karena belum ada perbaikan yang diterapkan.

- [ ] Menunggu atau memperoleh log crash native spesifik bila pemeriksaan konfigurasi tidak cukup.

### Status

- [ ] Bug crash native belum terselesaikan; item tetap terbuka sampai ada bukti startup native berhasil.

### Referensi pengguna

- [ ] Aplikasi keluar sendiri setelah publish dan instalasi, lalu tidak dapat dibuka kembali.

### Pemeriksaan awal

- [x] Dev server aktif.
- [x] TypeScript pada dev server tidak melaporkan error.
- [x] Web preview berhasil dimuat.
- [ ] APK/native install smoke test belum tersedia dari sandbox.
- [ ] Logcat atau crash report belum tersedia.

### Rencana tindak lanjut

- [ ] Periksa app.config.ts dan plugin Expo.
- [ ] Periksa package Expo serta dependensi native.
- [ ] Periksa root layout dan modul yang dipanggil saat startup.
- [ ] Jalankan validasi statis dan test regresi.
- [ ] Minta logcat bila crash tetap tidak dapat direproduksi.

### Kriteria selesai

- [ ] Aplikasi tidak lagi crash pada startup native.
- [ ] Typecheck, lint, dan unit test lulus.
- [ ] Checkpoint perbaikan dibuat setelah bukti validasi tersedia.

### Pembatasan pengujian

- [x] Web preview dapat divalidasi.
- [ ] APK terpasang pada perangkat pengguna belum dapat divalidasi langsung dari sandbox.

### Informasi yang mungkin diperlukan

- [ ] Merek/model perangkat.
- [ ] Versi Android/iOS.
- [ ] Versi APK/build.
- [ ] Log error atau video saat crash.

### Keputusan sementara

- [x] Jangan mengklaim crash sudah diperbaiki sebelum ada validasi native.
- [ ] Jika perlu, gunakan rollback checkpoint 8a36e5eb setelah eksperimen gagal.

### Risiko

- [ ] Perubahan orientasi manual dapat memerlukan dukungan native khusus.
- [ ] Deep link QR dapat memengaruhi startup bila dieksekusi terlalu awal.
- [ ] Asset atau plugin native yang tidak kompatibel dapat menyebabkan crash sebelum React dimuat.

### Audit pekerjaan

- [x] Permintaan pengguna diterima.
- [x] Diagnosis dimulai.
- [x] Root cause terkonfirmasi sebagai ketidakcocokan `expo-screen-orientation@57.0.1` dengan Expo SDK 54 yang mengharapkan `~9.0.9`; pemeriksaan juga menemukan paket Expo lain yang tertinggal minor patch.
- [x] Perbaikan diterapkan dengan menyelaraskan `expo-screen-orientation` ke `~9.0.9` dan menaikkan versi aplikasi ke `1.0.16`.
- [x] Validasi statis selesai: konfigurasi Expo publik berhasil, typecheck lulus, lint lulus, dan 110 unit test lulus dengan 1 dilewati.
- [ ] Validasi native pada APK terpasang masih menunggu build baru dan uji pada perangkat.

### Next action

- [x] Baca konfigurasi Expo dan entry point startup.
- [x] Cari impor native-only pada layout awal; overlay SPCA global menjadi area risiko sekunder.
- [x] Periksa plugin dan package versions; ketidakcocokan orientasi terkonfirmasi.
- [x] Tambahkan cakupan regresi konfigurasi/startup melalui test yang sudah ada dan validasi Expo config.

### Status akhir sesi ini

- [ ] Belum siap dinyatakan selesai tanpa APK baru yang diuji pada perangkat.
- [x] Diagnosis dan patch konfigurasi native siap divalidasi melalui build baru.

### Triage

- [ ] Prioritas P0: crash saat startup setelah instalasi.
- [ ] Dampak: aplikasi tidak dapat digunakan pada perangkat native.
- [ ] Lingkup: build/publish native, bukan sekadar web preview.

### Catatan komunikasi

- [x] Pengguna diberi tahu bahwa analisis akan dilakukan.
- [ ] Pengguna belum diminta logcat karena pemeriksaan konfigurasi awal belum selesai.

### Konfirmasi

- [x] Jangan menyatakan crash native selesai sebelum validasi native atau batasan pengujian dijelaskan.

### Pemilik tindak lanjut

- [x] Agen menginvestigasi konfigurasi proyek.
- [ ] Pengguna dapat menyediakan log crash bila dibutuhkan.

### Marker

- [ ] CRASH_NATIVE_OPEN

### End

- [ ] Tetap terbuka sampai diperbaiki.

### Validasi tambahan

- [x] Jalankan expo config --type public --json; konfigurasi publik berhasil dibuat.
- [x] Jalankan pemeriksaan package Expo; menemukan mismatch dan memperbaiki versi orientasi utama.
- [x] Tinjau app/_layout.tsx.
- [x] Tinjau app.config.ts.
- [x] Tinjau package.json.

### Hasil yang diharapkan

- [x] Root cause ditemukan.
- [x] Patch minimal diterapkan.
- [x] Regresi diuji.
- [ ] Pengguna diberi instruksi instalasi ulang build baru setelah checkpoint perbaikan.

### Catatan checkpoint

- [x] Checkpoint 8a36e5eb tetap menjadi baseline.
- [ ] Checkpoint baru hanya setelah perbaikan.

### Handoff

- [ ] Jika diperlukan, minta pengguna mengirim screenshot crash atau logcat.

### Selesai

- [ ] Belum selesai.

## Ketidaksesuaian versi Publish

- [ ] Menentukan sumber metadata yang membuat panel Publish masih menampilkan versi 1.0.6.
- [ ] Menyelaraskan versi Publish dengan konfigurasi aplikasi perbaikan crash.
- [ ] Memvalidasi konfigurasi Expo dan metadata build setelah penyelarasan.
- [ ] Menjalankan typecheck, lint, dan unit test sebelum checkpoint.
- [ ] Meminta pengguna membuat build APK baru dari versi yang sudah diselaraskan.

### Catatan

- [x] `app.config.ts` sudah menunjukkan versi 1.0.16.
- [ ] Panel Publish pada perangkat pengguna masih menunjukkan versi 1.0.6.
- [ ] Checkpoint perbaikan crash sebelumnya: 155b492d.

### Status

- [ ] Ketidaksesuaian versi belum terselesaikan.
- [ ] Jangan menyatakan APK baru sudah memakai patch crash sebelum panel Publish menampilkan versi yang benar.

### Pemeriksaan

- [ ] Periksa metadata proyek yang dibaca panel Publish.
- [ ] Periksa instruksi atau file konfigurasi publish jika tersedia.
- [ ] Periksa nomor versi terakhir pada riwayat checkpoint.
- [ ] Uji kembali `expo config --type public --json`.

### Kriteria selesai

- [ ] Panel Publish menunjukkan versi build yang diselaraskan.
- [ ] Build APK baru dapat dibuat dari metadata tersebut.
- [ ] Pengguna memasang dan menguji APK baru.

### Hasil audit ketidaksesuaian versi Publish

- [x] `app.config.ts` aktif berisi `version: "1.0.16"`.
- [x] Tidak ditemukan referensi `1.0.6` di source aplikasi; angka tersebut berasal dari draft/versi build yang sedang dipilih di panel Publish.
- [ ] Panel Publish perlu disegarkan atau nomor pada ikon pensil perlu disetel ke 1.0.16 sebelum Build APK.
- [ ] Pengguna perlu membuat build APK baru dari versi tersebut; APK lama tidak berubah hanya karena source version diperbarui.


## Perbaikan Layanan Aira — Sesi Aktif

- [ ] Audit alur komposer Aira dari input sampai respons.
- [ ] Audit client tRPC, endpoint server, dan konfigurasi URL API.
- [ ] Periksa error runtime/server yang membuat Aira tidak merespons.
- [ ] Perbaiki jalur pengiriman pesan dan status loading/error.
- [ ] Pastikan riwayat pesan tersimpan setelah respons berhasil atau gagal.
- [ ] Tambahkan atau perbarui regresi test untuk alur chat.
- [ ] Jalankan typecheck, lint, dan seluruh unit test.
- [ ] Buat checkpoint setelah pengguna diberi opsi tambahan dan menyetujuinya.


## Perbaikan Aira dan Komposer Lampiran — Sesi Aktif

- [ ] Audit jalur pemanggilan AI dan penyebab Aira tidak merespons.
- [ ] Audit antrean penyimpanan percakapan dan hidrasi riwayat chat.
- [ ] Perbaiki respons Aira dengan status loading, error, dan retry yang jelas.
- [ ] Pastikan pesan pengguna, respons Aira, lampiran, dan hasil generate tersimpan di riwayat aktif.
- [ ] Satukan kontrol Buat, Galeri Hasil Aira, Template Prompt, dan Batalkan ke menu 📎.
- [ ] Tampilkan galeri foto/video langsung di bawah menu lampiran ketika menu 📎 terbuka.
- [ ] Pertahankan fungsi kamera, galeri, audio, dokumen, mikrofon, dan Robot SPCA.
- [ ] Tambahkan atau perbarui regresi test untuk chat, riwayat, dan komposer lampiran.
- [ ] Jalankan typecheck, lint, unit test, dan verifikasi preview.
- [ ] Tawarkan opsi tambahan sebelum checkpoint akhir.


## Perluasan Perbaikan Aira, Akun, dan Keuangan — Sesi Aktif

- [ ] Verifikasi kembali penyebab layanan Aira tidak merespons.
- [ ] Pastikan riwayat percakapan Aira tersimpan dan dapat dibuka ulang.
- [ ] Satukan tombol Buat, Galeri Hasil Aira, Template Prompt, dan Batalkan di menu 📎.
- [ ] Tampilkan galeri foto/video langsung saat menu 📎 terbuka.
- [ ] Tambahkan mini kalender real-time pada formulir permasalahan akun dan pola formulir tanggal lain yang relevan.
- [ ] Tambahkan tombol tampil/sembunyikan kata sandi.
- [ ] Sederhanakan pesan validasi untuk sandi dan data formulir yang tidak lengkap.
- [ ] Tambahkan edit nama bank, nomor rekening, dan saldo awal pada dompet.
- [ ] Tambahkan salin cepat nomor rekening.
- [ ] Tambahkan analisis saldo Aira pada Dompet, Mutasi, Laporan, Transaksi, dan pintasan Beranda.
- [ ] Tambahkan regresi test untuk perubahan Aira, formulir, dompet, dan analisis saldo.
- [ ] Jalankan typecheck, lint, unit test, dan pemeriksaan visual.
- [ ] Tawarkan opsi tambahan sebelum checkpoint akhir.


### Milestone implementasi sesi ini

- [x] Kalender mini ditambahkan ke formulir permasalahan akun.
- [x] Tombol mata kata sandi ditambahkan pada login dan registrasi.
- [x] Pesan validasi utama login, registrasi, dan permasalahan akun dibuat lebih ramah pengguna.
- [x] Model Wallet mendukung nomor rekening dan FinanceProvider mendukung pembaruan dompet.
- [x] Layar Dompet mendukung edit nama, jenis, saldo awal, nomor rekening, serta salin nomor rekening.
- [x] Persistensi riwayat chat Aira diperkuat dengan antrean snapshot eksplisit.
- [x] Kontrol Buat, Galeri Hasil, Template Prompt, dan Batalkan dipusatkan ke menu 📎.
- [x] Media hasil terbaru ditampilkan pada menu 📎.
- [x] Pintasan audit saldo Aira ditambahkan pada tab Keuangan dan layar Dompet.
- [x] Typecheck, lint, dan 110 unit test lulus pada validasi sesi ini; 1 test tetap dilewati sesuai konfigurasi.
- [x] Menambahkan pintasan audit saldo Aira secara langsung pada layar Mutasi, Laporan, dan Transaksi.
- [ ] Memverifikasi respons chat Aira dengan sesi akun nyata setelah pengguna membuat build/preview terbaru.


## Opsi Tambahan Disetujui

- [x] Tombol audit saldo membuka chat Aira dengan ringkasan otomatis.
- [x] Thumbnail media lokal yang baru dipilih tampil di bawah menu 📎.
- [x] Retry otomatis dan log diagnostik ditambahkan saat respons Aira gagal.
- [x] Validasi ulang dan checkpoint setelah tiga opsi tambahan selesai.


## Skill Reusable Pengembangan AiraX

- [ ] Ekstrak pola diagnosis layanan Aira, persistensi riwayat, komposer lampiran, dan validasi native.
- [ ] Rancang struktur skill dengan workflow inti dan referensi implementasi.
- [ ] Inisialisasi direktori skill menggunakan template resmi skill creator.
- [ ] Tulis dan uji SKILL.md reusable.
- [ ] Jalankan quick validation skill.
- [ ] Serahkan SKILL.md kepada pengguna untuk ditambahkan ke My Skills atau diunduh.


### Status Skill Reusable

- [x] Pola diagnosis layanan Aira, persistensi riwayat, komposer lampiran, formulir, keuangan, Robot SPCA, dan build native diekstrak.
- [x] Struktur skill dirancang dengan workflow berurutan, tabel diagnosis, dan checklist akhir.
- [x] `SKILL.md` dibuat di `/home/ubuntu/skills/airax-mobile-development-workflow/`.
- [x] File contoh hasil inisialisasi yang tidak diperlukan dihapus.
- [x] Validator resmi skill creator lulus setelah dependensi PyYAML tersedia.


## Perubahan dari pasted_content.txt — Sesi Aktif

- [x] Pindahkan tombol Gambar Pembanding dan Hapus yang tersisa ke menu 📎.
- [x] Tambahkan riwayat catatan kesalahan sinkronisasi pada Analisis Keuangan Aira.
- [x] Perluas patroli pasif Robot SPCA menjadi lintasan zigzag luas dan laporan hasil pemindaian.
- [x] Ubah ikon Target dari babi menjadi ayam.
- [ ] Rancang ID pengguna permanen dengan panjang acak fleksibel dan pilihan draft saat pendaftaran.
- [ ] Tambahkan kontrol administrator untuk pengkinian ID dan pratinjau foto profil pengguna.
- [x] Tambahkan halaman Pengaturan Profil terpisah dengan bio/status dan maksimal tiga foto unggulan.
- [x] Evaluasi keamanan, persetujuan, usia, moderasi, dan kebutuhan backend untuk Room Global.
- [ ] Jangan mengaktifkan Room Global, pemantauan administrator, kontrol mic paksa, atau audio latar belakang sebelum desain otorisasi, privasi, dan infrastruktur disetujui.
- [x] Evaluasi perubahan nama aplikasi menjadi VAIRA AI sebelum mengubah branding global.
- [x] Jalankan validasi dan tawarkan opsi tambahan sebelum checkpoint.


### Hasil implementasi pasted_content.txt terbaru

- [x] Tombol Gambar Pembanding dipusatkan ke menu 📎 dan trigger floating disembunyikan.
- [x] Kontrol Antrean/Hapus dipusatkan ke menu 📎; penghapusan item antrean tetap tersedia.
- [x] Riwayat kesalahan sinkronisasi ditambahkan pada Analisis Keuangan Aira.
- [x] Kegagalan Snapshot Global dicatat ke riwayat sinkronisasi lokal.
- [x] Patroli pasif SPCA diperluas menjadi lintasan zigzag lintas layar dan mencatat laporan pemindaian.
- [x] Ikon Target diperbarui dari savings menjadi egg/ikon ayam pada layar rencana.
- [x] Typecheck, lint, dan 110 unit test lulus; 1 test dilewati.
- [ ] ID akun permanen, pilihan draft ID, dan pengkinian administrator.
- [ ] Pengaturan profil terpisah, bio/status, dan tiga foto unggulan.
- [ ] Room Global audio/chat, moderasi, blokir, dan administrator.
- [ ] Perubahan branding global menjadi VAIRA AI.


## Opsi 1–4 Disetujui — ID, Profil, Room Global, Branding

- [ ] Audit skema akun manual/OAuth dan alur pendaftaran.
- [ ] Tambahkan ID pengguna permanen acak 9 digit atau lebih dan pilihan draft ID.
- [ ] Pastikan ID tidak dapat diubah pengguna setelah dibuat.
- [ ] Tambahkan jalur administrator untuk pengkinian ID dengan audit.
- [ ] Audit model profil lokal/server dan layar Profil.
- [ ] Tambahkan halaman Pengaturan Profil terpisah.
- [ ] Tambahkan bio/status dan maksimal tiga foto unggulan dengan preview, ganti, dan hapus.
- [ ] Rancang fondasi Room Global dengan persetujuan, usia minimum, privasi, blokir, mute, dan status mic/speaker.
- [ ] Jangan mengaktifkan kontrol administrator yang dapat memaksa mic/speaker pengguna sebelum otorisasi dan kebijakan privasi tersedia.
- [ ] Audit branding dan ubah nama tampilan menjadi V A I R A AI tanpa mengubah slug/bundle ID.
- [ ] Jalankan typecheck, lint, test, dan tawarkan opsi sebelum checkpoint.


### Status opsi 1–4

- [x] Kolom `publicId` ditambahkan ke `manualAccounts` melalui migrasi non-destruktif 0007.
- [x] Pendaftaran manual mendukung draft ID 9–12 digit atau generator acak server.
- [x] `publicId` dikembalikan pada respons akun manual.
- [x] Halaman Pengaturan Profil terpisah dibuat dengan bio/status dan maksimal tiga foto unggulan, termasuk preview dan hapus lokal.
- [x] Akses Pengaturan Profil ditambahkan dari tab Profil.
- [x] Fondasi Room Global dibuat dengan persetujuan, peringatan privasi, mute/mic default mati, dan pratinjau lokal.
- [x] Pintasan Room Global ditambahkan ke Beranda.
- [x] Branding tampilan dan appName diubah menjadi `V A I R A AI`; appSlug, scheme, dan bundle ID dipertahankan.
- [x] Typecheck, lint, dan 110 unit test lulus; 1 test dilewati.
- [ ] Backfill publicId untuk akun manual lama dan kontrol pengkinian ID administrator.
- [ ] Persistensi foto unggulan ke server/AiraXCloud lintas perangkat.
- [ ] Backend real-time Room Global, audio, voice note, blokir, moderasi, dan kontrol administrator.


## Lanjutan Room Global dan Sinkronisasi — Sesi Aktif

- [ ] Audit dukungan server untuk room state, pesan global, blokir, dan status audio.
- [ ] Backfill publicId untuk akun manual lama dengan ID unik non-destruktif.
- [ ] Tambahkan kontrol administrator untuk mengubah publicId dengan audit log.
- [ ] Tambahkan penyimpanan metadata profil dan URL foto unggulan pada akun.
- [ ] Upload foto unggulan ke storage dan sinkronkan saat login.
- [ ] Tambahkan consent Room Global yang tersimpan per akun.
- [ ] Tambahkan room message server-side, daftar peserta, dan blokir server-side.
- [ ] Tambahkan status mic/speaker peserta tanpa kontrol paksa dari administrator.
- [ ] Evaluasi jalur audio real-time dan background audio sebelum mengaktifkannya.
- [ ] Jalankan typecheck, lint, unit test, dan tawarkan opsi sebelum checkpoint.


## Prioritas 3-1-2 Disetujui

- [ ] Audit connector dan library audio real-time yang tersedia.
- [ ] Tentukan fallback aman bila WebRTC/WebSocket belum tersedia.
- [ ] Tambahkan consent dan status audio Room Global tanpa kontrol paksa.
- [ ] Tambahkan field publicId pada editor administrator.
- [ ] Pastikan pengkinian publicId tercatat pada audit administrator.
- [ ] Tambahkan upload foto unggulan ke storage cloud.
- [ ] Sinkronkan URL foto cloud ke profil akun dan pulihkan saat login.
- [ ] Jalankan validasi dan tawarkan opsi sebelum checkpoint.


### Keputusan pengguna: opsi B

- [x] Audio real-time ditunda karena provider WebRTC/WebSocket belum tersedia.
- [x] Room Global mempertahankan chat teks server-side dan polling.
- [ ] UI administrator untuk mengedit publicId.
- [ ] Upload foto unggulan ke storage cloud.
- [ ] Sinkronisasi profil setelah upload dan validasi akhir.


### Status opsi B

- [x] Room Global memakai chat teks server-side dan polling sebagai fallback aman.
- [x] Editor administrator memiliki field publicId 9–12 digit.
- [x] Pengkinian publicId dikirim ke endpoint admin dan dicatat pada audit log.
- [x] Endpoint upload foto unggulan menyimpan maksimal tiga foto ke storage privat dengan batas 5,5 MB per foto.
- [x] Pengaturan Profil mengunggah foto lokal saat disimpan dan menyinkronkan URL bertanda tangan ke profil akun.
- [x] Typecheck, lint, dan 110 unit test lulus; 1 test dilewati.
- [ ] Provider WebRTC/WebSocket untuk audio real-time.


## Perubahan batas foto dan rancangan audio

- [ ] Hapus batas jumlah foto unggulan pada pemilih dan state profil.
- [ ] Ubah upload foto menjadi bertahap per berkas agar tidak membuat satu payload besar.
- [ ] Hapus batas array tiga foto pada endpoint upload dan metadata profil.
- [ ] Pertahankan validasi tipe file dan pengamanan ukuran per berkas untuk mencegah crash.
- [ ] Dokumentasikan kebutuhan connector WebRTC/WebSocket tanpa mengaktifkannya.
- [ ] Jalankan validasi dan tawarkan opsi sebelum checkpoint.


### Hasil perubahan terbaru

- [x] Pemilih foto unggulan tidak lagi membatasi jumlah pilihan menjadi tiga.
- [x] State lokal profil tidak lagi memotong daftar foto menjadi tiga.
- [x] Upload foto cloud diproses satu per satu agar tidak mengirim payload gabungan besar.
- [x] Metadata profil menerima daftar URL foto tanpa batas jumlah.
- [x] Validasi tipe file dan batas ukuran per berkas tetap dipertahankan untuk mencegah crash dan payload tak terkendali.
- [x] Rancangan provider WebRTC/WebSocket dan fallback polling ditulis di `docs/room-global-realtime-plan.md`.
- [x] Typecheck, lint, dan 110 unit test lulus; 1 test dilewati.
- [ ] Provider audio real-time belum dipilih atau diaktifkan.


## Koreksi sisa batas foto dan lanjut nomor 3



### Hasil koreksi dan riset provider

- [x] Pemotongan `.slice(0, 3)` di normalisasi akun publik dihapus.
- [x] Pemotongan `.slice(0, 3)` pada penyimpanan database profil dihapus.
- [x] Upload foto berjalan satu per satu tanpa batas jumlah foto pada UI, metadata, dan endpoint.
- [x] Adapter audio provider-agnostik dibuat dengan status default `unavailable`.
- [x] Test keamanan adapter audio ditambahkan.
- [x] Riset kandidat resmi dilakukan: LiveKit SFU, Daily WebRTC, dan Twilio Video.





### Hasil failover provider audio

- [x] Daily ditetapkan sebagai urutan pertama.
- [x] LiveKit ditetapkan sebagai fallback kedua.
- [x] Twilio ditetapkan sebagai fallback ketiga.
- [x] Controller failover mencoba health check dan join secara berurutan.
- [x] Jika semua provider gagal atau belum dikonfigurasi, controller kembali ke polling teks.
- [x] Test Daily gagal lalu LiveKit berhasil ditambahkan.
- [x] Test tanpa provider yang dikonfigurasi mengembalikan mode polling.
- [x] Temuan token dan lifecycle provider disimpan di `docs/room-global-provider-findings.md`.

















- [x] Server proyek diaudit; belum ada SDK media atau transport WebSocket audio.
- [x] Kapabilitas backend Manus dipetakan: cukup untuk teks, consent, status, dan polling; bukan SFU audio.
- [x] Jitsi publik diteliti sebagai opsi gratis tanpa API key.
- [x] Tombol Room Audio Eksperimental ditambahkan untuk membuka room Jitsi publik melalui browser setelah consent.
- [x] Peringatan privasi dan status bahwa Jitsi bukan audio native AiraX ditampilkan.
- [x] UI status provider/fallback tetap menampilkan Daily → LiveKit → Twilio → polling.
- [x] Typecheck, lint, dan 114 unit test lulus; 1 test dilewati.


## Penyelarasan Label Room Global

- [ ] Pertahankan judul dan nama tampilan `Room Global`.
- [ ] Jelaskan Jitsi publik hanya pada keterangan keamanan, bukan mengganti nama fitur.
- [ ] Validasi tautan room dan consent setelah perubahan label.
- [ ] Tawarkan opsi tambahan lalu simpan checkpoint.


## Moderasi Room Global Disetujui

- [x] Audit otorisasi moderator dan status peserta aktif di room.
- [x] Tambahkan tindakan mute mic peserta dengan notifikasi dan audit log.
- [x] Tambahkan tindakan menghentikan audio room yang diterima peserta.
- [x] Tambahkan kunci room, keluarkan peserta, dan blokir peserta.
- [x] Tambahkan permintaan unmute yang harus disetujui peserta.
- [x] Jangan menyalakan mic atau speaker perangkat secara paksa.
- [x] Validasi bahwa tindakan moderator berakhir atau tidak berlaku setelah peserta keluar room.
- [x] Jalankan test dan tawarkan checkpoint.


## Restrukturisasi Profil dan Pengaturan

- [x] Audit semua section dan navigasi pengaturan yang saat ini berada di Profil.
- [x] Tambahkan tombol Pengaturan di sudut kanan atas dan halaman Pengaturan terpadu.
- [x] Pindahkan Preferensi, Kontrol data, Follow media sosial, Dukung V A I R A AI, dan Opsi developer ke Pengaturan.
- [x] Sederhanakan Profil agar hanya menampilkan bio dan maksimal tiga foto unggulan pengguna.
- [x] Validasi seluruh navigasi dan jalankan regresi sebelum checkpoint.


## Peningkatan Pengaturan dan Proses Sebelum Bundling

- [x] Tambahkan pencarian dan pengelompokan kategori di halaman Pengaturan.
- [x] Tambahkan konfirmasi sebelum menghapus foto unggulan atau mengubah sinkronisasi.
- [x] Tambahkan badge perhatian pada tombol Pengaturan untuk notifikasi, cadangan gagal, atau tindakan developer.
- [ ] Tawarkan daftar opsi lanjutan kepada pengguna sebelum bundling atau checkpoint berikutnya.
- [ ] Validasi dan simpan checkpoint setelah pengguna memilih opsi lanjutan.


## Penyempurnaan Badge, Pencarian, dan Branding Dukungan

- [ ] Tambahkan panel detail yang terbuka saat badge perhatian Pengaturan diketuk.
- [ ] Tambahkan sinonim pencarian Pengaturan dan pesan saat tidak ada hasil.
- [ ] Ganti seluruh judul dukungan lama menjadi Dukung V A I R A AI.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Riwayat Perhatian dan Penyempurnaan Pencarian

- [x] Tambahkan riwayat perhatian dengan status dan waktu kejadian.
- [x] Tambahkan penyorotan kata yang cocok pada hasil pencarian.
- [x] Tambahkan tombol Reset pencarian dan Tampilkan semua kategori.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Animasi Hasil Pencarian Pengaturan

- [x] Tambahkan animasi ringan saat hasil pencarian atau kategori berubah.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Jumlah Hasil Kategori Pengaturan

- [x] Tambahkan jumlah hasil pada setiap chip kategori dan perbarui saat pencarian aktif.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Warna Kategori Tanpa Hasil

- [x] Beri warna berbeda pada chip kategori dengan jumlah hasil nol.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Label Kategori Tanpa Hasil

- [x] Tampilkan keterangan “Tidak ada hasil” pada chip kategori dengan jumlah nol.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Migrasi Aset Avatar Profil V A I R A AI

- [x] Audit seluruh aset dan referensi icon/avatar profil lama.
- [x] Salin logo baru pengguna ke aset profil dan fallback avatar yang diperlukan.
- [x] Perbarui referensi bubble profil dan avatar default tanpa mengubah foto profil pribadi pengguna.
- [x] Hapus aset lama yang tidak lagi direferensikan.
- [ ] Validasi branding, tawarkan opsi lanjutan sebelum checkpoint, lalu simpan checkpoint.


## Label Branding Preview Avatar

- [x] Tambahkan label kecil “V A I R A AI” pada preview avatar di Pengaturan.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Pemulihan Avatar Khusus Aira

- [x] Audit aset khusus Hot Pro dan avatar tim ahli yang tersedia.
- [x] Pulihkan file avatar khusus yang sebelumnya tertimpa.
- [x] Pastikan logo V A I R A AI hanya dipakai sebagai avatar umum/fallback.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Perlindungan dan Preview Avatar Khusus

- [x] Tambahkan penanda mode Hot Pro dan Tim Ahli pada avatar khusus.
- [x] Lindungi aset avatar khusus agar tidak tertimpa saat mengganti logo umum.
- [x] Tambahkan preview perbandingan avatar umum dan avatar khusus di Studio Developer.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Preview Seluruh Avatar Ahli

- [x] Tampilkan preview sepuluh avatar ahli dengan nama bidang masing-masing.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Preview Penuh dan Label Tokoh Ahli

- [x] Tambahkan pratinjau layar penuh saat avatar ahli dipilih.
- [x] Ubah baris utama menjadi nama tokoh dan baris kedua menjadi bidang keahlian.
- [x] Gunakan warna berbeda untuk nama bidang keahlian.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Geser Antar-Avatar Ahli

- [x] Tambahkan gesture geser kiri/kanan pada modal avatar ahli.
- [x] Tampilkan indikator posisi avatar saat modal dibuka.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Animasi Transisi Avatar Ahli

- [x] Tambahkan animasi perpindahan avatar saat gesture geser.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Persistensi Foto Profil Per Akun

- [x] Audit penyimpanan foto profil dan foto unggulan saat logout/login.
- [x] Pastikan foto profil serta maksimal tiga foto unggulan tersimpan per akun.
- [x] Pulihkan foto saat akun yang sama login kembali.
- [x] Pastikan foto antar-akun tidak tertukar dan mode tamu tetap terisolasi.
- [ ] Validasi alur logout-login, tawarkan opsi lanjutan sebelum checkpoint.


## Audit Room Global dan Layanan Aira

- [x] Audit UI, state, endpoint, polling, moderasi, consent, dan audio Room Global.
- [x] Audit chat Aira, retry, riwayat, lampiran, generasi, dan status loading.
- [x] Jalankan typecheck, lint, unit test, dan pemeriksaan log runtime.
- [x] Perbaiki regresi fungsional yang terbukti.
- [ ] Laporkan fitur yang berfungsi, masalah, dan batas pengujian; tawarkan opsi sebelum checkpoint.


## Perbaikan Alur Masuk Room Global

- [x] Audit penyebab tombol Masuk tidak merespons.
- [x] Ubah default peserta yang memenuhi syarat menjadi tidak mute mic dan speaker.
- [x] Hilangkan keterangan kecil di bawah kontrol Mikrofon saya dan Speaker global.
- [x] Hapus kartu Jitsi biru dari tampilan Room Global.
- [x] Pastikan Room Global hanya dapat dimasuki akun yang login dan memenuhi syarat.
- [x] Ubah label tombol menjadi “Masuk”.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Status Generator Video dan Audio

- [x] Audit semua tombol dan label generate video/audio yang belum tersedia.
- [x] Tambahkan gembok serta toast “fitur belum tersedia” untuk video/audio.
- [x] Ganti label tampilan atribusi menjadi Web V A I R A AI.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Penyempurnaan Status Room Global

- [x] Tambahkan tombol Keluar room setelah presence aktif.
- [x] Ubah indikator status koneksi menjadi hijau ketika presence aktif.
- [x] Tampilkan pesan ringkas jika akun belum login atau persetujuan belum terpenuhi.
- [ ] Validasi alur masuk-keluar dan tawarkan opsi lanjutan sebelum checkpoint.


## Status Lock dan Composer Room Global

- [x] Tampilkan status “Room terkunci moderator” saat room dikunci.
- [x] Nonaktifkan composer pesan setelah pengguna keluar room.
- [ ] Validasi alur lock-keluar-masuk dan tawarkan opsi sebelum checkpoint.


## Penyempurnaan Feedback Room Global

- [x] Tambahkan tombol Coba lagi saat room terkunci agar status dapat diperiksa ulang.
- [x] Pertahankan placeholder composer “Masuk room untuk mengirim pesan” saat tidak aktif.
- [x] Tampilkan toast setelah pengguna berhasil keluar room.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Loading Tombol Coba Lagi Room Global

- [x] Tambahkan indikator loading singkat saat status room dimuat ulang.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Indikator Status Koneksi Room Global

- [x] Tampilkan indikator di sisi kanan status koneksi dengan keadaan Terhubung, Menghubungkan, dan Terputus.
- [x] Sesuaikan warna dan label indikator berdasarkan status query Room Global.
- [ ] Validasi tampilan dan tawarkan minimal 10 opsi lanjutan sebelum checkpoint.


## Retry dan Toast Status Koneksi Room Global

- [x] Tambahkan tombol coba ulang saat status koneksi Terputus.
- [x] Tampilkan toast saat koneksi berubah menjadi Terhubung.
- [x] Tampilkan toast saat koneksi berubah menjadi Terputus.
- [ ] Validasi dan tawarkan opsi lanjutan sebelum checkpoint.


## Jumlah Peserta dan Deduplikasi Saran

- [x] Tampilkan jumlah peserta aktif di samping status koneksi.
- [x] Catat saran yang sudah pernah ditampilkan atau dipilih.
- [x] Jangan tawarkan saran yang sudah pernah ditampilkan atau dipilih.
- [x] Validasi dan tawarkan hanya opsi baru sebelum checkpoint.
- [x] Daftar peserta aktif hanya tampil setelah pengguna masuk Room Global.
- [x] Badge Anda dan peran Administrator/Peserta pada daftar peserta.
- [x] Avatar peserta dari foto unggulan dengan fallback inisial.
- [x] Urutkan daftar berdasarkan lastSeenAt terbaru.
- [x] Tombol Tutup pada panel daftar peserta.
- [x] Transisi halus pada angka jumlah peserta.
- [x] Pesan Belum ada peserta lain saat hanya akun sendiri aktif.
- [x] Isolasi peserta keluar, kedaluwarsa, atau akun nonaktif melalui unit test.

## Pembaruan Daftar Peserta Room Global

- [x] Tambahkan pratinjau profil ringkas peserta dan tombol laporkan peserta.
- [x] Gunakan FlatList untuk virtualisasi daftar peserta aktif.
- [x] Tandai peserta yang baru masuk dan tampilkan namanya.

## Sistem Laporan Peserta Room Global

- [x] Tambahkan kategori alasan laporan dan konfirmasi kedua sebelum pengiriman.
- [x] Simpan laporan ke server dan tampilkan pada menu administrator.
- [x] Tampilkan status laporan untuk administrator dan sediakan alur peninjauan.
- [x] Tambahkan animasi singkat pada badge peserta baru.
- [x] Pastikan pratinjau profil ringkas terbuka saat baris peserta diketuk.

## Laporan Room Global Lanjutan

- [x] Tambahkan keterangan bebas dan konteks pesan terakhir pada laporan.
- [x] Tambahkan filter status serta penghitung laporan baru di konsol administrator.
- [x] Tambahkan pencegahan laporan duplikat untuk pasangan pelapor-terlapor.
- [x] Tambahkan notifikasi administrator untuk laporan baru.
- [x] Tambahkan ekspor laporan ke Excel.
- [x] Tambahkan prioritas otomatis untuk kategori konten berbahaya.
- [x] Tambahkan tindakan tinjau peserta langsung dari kartu laporan.

## Detail dan Moderasi Laporan Room Global

- [x] Tambahkan halaman detail laporan layar penuh.
- [x] Catat perubahan status laporan ke audit administrator.
- [x] Tambahkan aksi mute langsung dari kartu laporan setelah ditinjau.

## Perbaikan Navigasi Room Obrolan Global

- [x] Tombol Masuk Room membuka jendela baru Room Obrolan Global.
- [x] Pertahankan validasi login dan persetujuan sebelum navigasi.
- [x] Sediakan alur kembali/keluar room dari layar baru.
- [x] Tambahkan pengujian routing Masuk Room dan akses guest.

## Penyempurnaan Multimodal Room Obrolan Global

- [x] Pindahkan kontrol mic/speaker dan status moderasi ke jendela chat baru.
- [x] Tambahkan indikator gelombang suara serta alur mikrofon yang aman dan sukarela.
- [x] Tidak menambahkan kamera, video, lampiran media, atau pratinjau pada jendela Room Obrolan Global sesuai keputusan pengguna.
- [x] Tidak menambahkan berbagi layar pada jendela Room Obrolan Global sesuai keputusan pengguna.
- [x] Hubungkan status fallback provider yang relevan pada jendela chat baru, tanpa menambahkan media atau berbagi layar.
- [x] Tambahkan pengujian lintas platform untuk alur teks dan audio room baru.

## Penyelesaian Persyaratan Room Global

- [x] Validasi usia minimal 16 tahun dari tanggal lahir akun di server.
- [x] Tampilkan dan simpan syarat keamanan Room Global secara eksplisit.
- [x] Tambahkan dialog konfirmasi final saat masuk dan keluar.
- [x] Paksa tema gelap pada jendela Room Global.
- [x] Tampilkan avatar dan warna nama berbeda pada bubble chat.
- [x] Batasi profil publik peserta pada nama lengkap dan ID publik.
- [x] Tambahkan profil peserta dari bubble chat.
- [x] Implementasikan voice note dengan transkripsi fallback dan status provider audio yang transparan; audio realtime antar peserta tetap menunggu provider.
- [x] Tambahkan pengujian regresi untuk semua persyaratan Room Global.

## Pembaruan Room Global Lanjutan

- [x] Simpan versi syarat Room Global dan minta persetujuan ulang saat berubah.
- [x] Tambahkan layar khusus untuk alasan akun di bawah 16 tahun tidak dapat masuk.
- [x] Tambahkan laporan pesan langsung dari bubble chat.
- [x] Tambahkan label bubble voice note yang berbeda dari teks.
- [x] Tampilkan durasi rekaman voice note sebelum dikirim.
- [x] Perbarui avatar bubble saat foto profil berubah ketika room aktif.
- [x] Tambahkan pengujian izin mikrofon ditolak dan rekaman dibatalkan.

## Penyelesaian Gap Room Global

- [x] Jadikan mic dan speaker default off saat pertama masuk.
- [x] Posisikan tombol mute/speaker dan mic sesuai tata letak room yang diminta.
- [x] Tambahkan voice note dengan fallback transkripsi dan penjelasan provider audio secara transparan.
- [x] Tampilkan baris peserta audio maksimal enam peserta dengan indikator status audio lokal; status berbicara peserta lain tetap menunggu provider realtime.
- [x] Selesaikan blokir, daftar blokir, unblokir, dan durasi moderasi.
- [x] Lengkapi pengaturan dan panel Room Global administrator.
- [x] Tambahkan fallback audio dan dokumentasi keterbatasan provider.
- [x] Tambahkan migrasi serta pengujian regresi untuk gap Room Global.

## Diagnosis Crash dan Instalasi APK

- [x] Bandingkan versi aplikasi, bundle ID, dan konfigurasi Expo dengan checkpoint/build.
- [x] Periksa log build serta potensi crash startup native.
- [x] Terapkan perbaikan kompatibilitas jika ditemukan.
- [x] Jalankan validasi build dan regresi setelah perbaikan.

## Sinkronisasi Branding Publish

- [x] Mengunggah logo V A I R A AI terbaru ke CDN.
- [x] Memperbarui `logoUrl` pada `app.config.ts`.
- [x] Menyinkronkan metadata platform Publish melalui `VITE_APP_LOGO`.
- [x] Memastikan test branding dan typecheck lulus.

- [x] Memulihkan identifier teknis AiraXCloud, AiraXBackup, X-AiraX-Session, URL logo terbaru, dan nama file QR setelah sinkronisasi branding; label user-facing tetap V A I R A  A I.
- [x] Memvalidasi ulang layanan Aira dan Room Global melalui typecheck, lint, 125 unit test lulus, dan 1 test dilewati.
- [ ] Uji manual pada perangkat nyata untuk alur Room Global Login → usia 16+ → persetujuan → chat → keluar serta respons Aira dengan akun pengguna.

<!-- Branding spacing: exactly "V A I R A  A I" -->
# Final branding note
Nama tampilan resmi aplikasi adalah "V A I R A  A I". Identifier teknis lama seperti AiraXCloud, AiraXBackup, dan X-AiraX-Session dipertahankan hanya untuk kompatibilitas kode, penyimpanan, API, dan pengujian.

- [x] Memperbaiki hasil generate gambar Aira yang sudah tersimpan di file storage tetapi tidak muncul atau tidak dapat dipratinjau di bubble chat.
- [x] Menambahkan regresi test untuk URL hasil generate, attachment gambar, dan rendering bubble chat Aira.

- [x] Menambahkan fallback tampilan dan tombol Muat ulang ketika gambar hasil generate gagal dimuat atau signed URL kedaluwarsa.
- [x] Menambahkan pemulihan URL akses untuk hasil dokumen agar dapat dibuka konsisten pada web dan perangkat native.
- [x] Menambahkan regresi test untuk fallback gambar, muat ulang, signed URL dokumen, dan hasil generate di bubble chat.

- [x] Memvalidasi generate PDF, Word, Excel, dan PowerPoint dari prompt Aira.
- [x] Memastikan signed URL, MIME type, ekstensi, pembukaan, unduhan, dan bubble chat konsisten untuk semua dokumen.
- [x] Menambahkan atau memperbarui regresi test untuk seluruh format dokumen.

- [x] Menelusuri kegagalan koneksi layanan chat Aira dan status “sedang berpikir” yang menggantung.
- [x] Memperbaiki timeout, retry, sesi, dan pesan error agar Aira dapat pulih tanpa dead-end.
- [x] Menambahkan regresi test untuk koneksi Aira, loading selesai, dan retry respons.

- [x] Membandingkan jalur chat teks dengan jalur generate gambar yang berhasil pada endpoint dan model Manus.
- [x] Mengisolasi penyebab fallback “tidak dapat terhubung” pada chat Aira, termasuk sesi, model, format JSON, dan endpoint produksi.
- [x] Memperbaiki respons error dan menambahkan diagnosis aman agar masalah tidak tersamarkan sebagai sekadar gangguan koneksi.
- [x] Menambahkan regresi test dan validasi end-to-end untuk chat Aira.

- [x] Mengunci chat Aira dan generator gambar, video, audio, PDF, Word, Excel, PowerPoint, serta format lain dengan icon gembok; Pindai Bukti tetap terbuka.
- [x] Menambahkan pop-up penjelasan akses uji coba dan halaman permintaan token melalui Email serta WhatsApp.
- [x] Menambahkan input token sekali pakai untuk membuka hak akses sesuai kriteria administrator.
- [x] Menambahkan model token Pro, Premium, dan Admin dengan durasi, masa berlaku, pemakaian sekali, dan hak layanan di server.
- [x] Menambahkan panel administrator untuk membuat, menampilkan, menyalin, dan mengelola token secara aman.
- [x] Menambahkan tombol mata tampil/sembunyikan password pada formulir login dan administrator; formulir lain yang sudah memiliki kontrol tetap dipertahankan.
- [x] Menambahkan regresi test untuk hak akses token, expiry, single-use, generator terkunci, deep link kontak, dan password visibility.

- [x] Memetakan kategori pesan kegagalan Aira: login, token, token kedaluwarsa, provider terbatas, timeout, koneksi, validasi, dan error server.
- [x] Menampilkan alasan detail serta langkah pemulihan pada bubble chat atau dialog akses Aira.
- [x] Menambahkan regresi test untuk memastikan pesan pengguna tidak lagi generik atau menyesatkan.

- [x] Memperbaiki tombol Masuk Room Global dari menu administrator agar terlihat dan membuka layar entry Room Global.
- [x] Memastikan administrator dapat mencapai alur Room Global tanpa bypass syarat login, usia minimal 16 tahun, dan persetujuan keamanan.
- [x] Menambahkan regresi test untuk visibilitas tombol dan navigasi Room Global administrator.
- [ ] Menampilkan daftar tawaran fitur baru dan menunggu pilihan pengguna sebelum bundling/checkpoint berikutnya.

- [x] Memperlebar area Percakapan Room Global hingga sekitar 80% ruang tampilan.
- [x] Memperkecil kartu Peserta audio agar tidak mengambil ruang percakapan.
- [x] Menghapus tulisan Mikrofon saya dan Speaker global, menyisakan icon kontrol mic/speaker.
- [ ] Menampilkan tawaran fitur baru dan menunggu pilihan pengguna sebelum build/checkpoint berikutnya.

- [x] Menambahkan Jitsi publik sebagai provider audio uji coba Room Global tanpa API key.
- [x] Menambahkan mode audio lokal-uji yang hanya melaporkan status siap secara jujur tanpa klaim realtime.
- [x] Menambahkan regresi test untuk mode Jitsi dan mode lokal-uji.
- [ ] Menampilkan tawaran fitur baru dan menunggu pilihan pengguna sebelum build/checkpoint berikutnya.

- [ ] Menambahkan pemeriksaan izin mikrofon dan pesan pemulihan yang spesifik.
- [ ] Menentukan arsitektur server audio realtime sendiri serta pilihan hosting sebelum implementasi server.
- [ ] Menampilkan tawaran fitur baru dan menunggu pilihan pengguna sebelum build/checkpoint berikutnya.

- [x] Menambahkan fitur balasan pesan Room Global dengan kutipan ringkas pada bubble.
- [x] Menambahkan pencabutan token oleh administrator sebelum masa berlaku berakhir.
- [x] Menambahkan riwayat redeem token berisi akun, waktu, kriteria, dan status tanpa token mentah.
- [x] Memindahkan Riwayat Audit Administrator ke halaman baru melalui tombol icon.
- [x] Mengubah menu AiraXCloud menjadi tombol icon yang membuka halaman baru.
- [x] Memindahkan Laporan Room Global dan Moderasi ke halaman baru yang dibuka dari tombol di dalam Room Global.
- [x] Menggabungkan aksi Kunci Room/Buka Room menjadi satu toggle.
- [x] Memindahkan pengelolaan akun terdaftar ke halaman edit terpisah dari tombol Kelola.
- [x] Menambahkan regresi test untuk reply, token, navigasi halaman baru, moderasi, toggle room, dan edit akun.
- [ ] Menampilkan tawaran fitur baru dan menunggu pilihan pengguna sebelum build/checkpoint berikutnya.

- [x] Memastikan regresi test tombol Buat token menghasilkan kode acak berbeda setiap penerbitan dan hanya menampilkan token mentah pada respons pembuatan pertama.

- [ ] Menambahkan kalender mini real-time pada halaman Kelola Akun untuk tanggal lahir.
- [ ] Menambahkan icon mata tampil/sembunyikan pada seluruh kolom password yang terkait alur administrator dan reset akun.
- [ ] Menyamakan notifikasi sukses/gagal pada edit akun, pencabutan token, moderasi, dan perubahan AiraXCloud.
- [ ] Menambahkan tag peserta Room Global melalui tanda @ dengan rekomendasi pengguna aktif.
- [ ] Mengunci room obrolan Aira menggunakan hak token Premium dan Admin; Pro tetap tidak membuka room obrolan.
- [ ] Menambahkan regresi test untuk kalender, password visibility, notifikasi, mention, dan gate room obrolan Aira.
- [ ] Menampilkan tawaran fitur baru dan menunggu pilihan pengguna sebelum build/checkpoint berikutnya.

- [ ] Membuat layar baru Room Obrolan Aira dengan akses token Premium/Admin.
- [ ] Mengunci percakapan suara dan mic pada chat Aira utama untuk Premium/Admin, sementara chat teks Pro tetap terbuka.
- [ ] Menambahkan navigasi ke Room Obrolan Aira dari layanan Aira dengan indikator gembok.
- [ ] Menambahkan regresi test untuk gate Premium/Admin dan pembatasan suara/mic.

## Pembaruan sesi lanjutan

- [x] Membatasi Room Obrolan Aira dan voice note chat utama untuk token Premium/Admin.
- [x] Menambahkan rekomendasi mention peserta aktif Room Global saat mengetik `@`.
- [x] Mengganti input tanggal lahir Kelola Akun dengan MiniDatePicker standar berformat YYYY-MM-DD.
- [x] Menambahkan tombol mata tampil/sembunyikan pada password baru di alur pemulihan akun.
- [x] Menjalankan typecheck dan 140 unit test dengan 1 test dilewati.
- [ ] Audit lanjutan tombol mata pada seluruh formulir PIN/password dan standardisasi notifikasi admin di semua aksi.
- [ ] Menawarkan opsi fitur tambahan sebelum bundling/checkpoint berikutnya.


## Permintaan UI Beranda terbaru

- [ ] Mengecilkan kartu biru “Ada yang bisa Aira bantu hari ini?” agar lebih ringkas dan sederhana.
- [ ] Menambahkan widget Room Global berbentuk kotak panjang kecil berwarna hitam di bawah kartu saldo tercatat.
- [ ] Menghapus tombol Room Global dari bagian Aksi cepat karena akses dipindahkan ke widget.
- [ ] Menawarkan fitur tambahan kepada pengguna sebelum checkpoint atau bundling APK.


## Animasi widget Room Global

- [x] Menambahkan animasi tekan yang halus pada widget Room Global.
- [x] Menambahkan animasi singkat ketika jumlah peserta Room Global berubah.
- [x] Memvalidasi animasi dan navigasi tanpa bundling APK atau checkpoint sebelum persetujuan pengguna.


## Penyempurnaan animasi widget Room Global

- [x] Menambahkan animasi ikon peserta aktif ketika jumlah peserta berubah.
- [x] Menambahkan getaran ringan saat widget Room Global ditekan pada perangkat native, tanpa efek pada web.
- [x] Memvalidasi fallback web/native dan fungsi navigasi tanpa bundling sebelum persetujuan pengguna.


## Indikator online Room Global

- [x] Menampilkan indikator online pada widget Room Global.
- [x] Menampilkan jumlah peserta aktif pada widget Room Global.
- [x] Mempertahankan pembaruan berkala tanpa membuka room otomatis.
- [x] Memvalidasi widget tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Profil publik peserta Room Global

- [x] Membuka halaman baru saat nama atau foto peserta Room Global ditekan.
- [x] Menampilkan foto profil, bio, dan maksimal tiga foto unggulan peserta lain.
- [x] Menjaga batas privasi: tidak menampilkan username, email, nomor WhatsApp, atau data sensitif.
- [x] Memvalidasi routing dan data profil publik tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Penyempurnaan profil publik Room Global

- [x] Menambahkan tombol laporkan profil pada halaman profil publik.
- [x] Menambahkan blokir peserta dari halaman profil publik dengan durasi yang aman.
- [x] Menambahkan galeri foto unggulan layar penuh dengan swipe.
- [x] Menampilkan status aktif terakhir tanpa membocorkan waktu login atau data privat.
- [x] Menyempurnakan tombol kembali pada tema gelap Room Global.
- [x] Memvalidasi privasi dan moderasi tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Fallback foto profil publik

- [x] Menampilkan placeholder avatar jika foto profil gagal dimuat.
- [x] Menampilkan placeholder pada foto unggulan yang gagal dimuat.
- [x] Menjaga galeri layar penuh tetap dapat digunakan ketika sebagian gambar gagal dimuat.
- [x] Memvalidasi fallback tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Simpan dan muat ulang profil publik

- [x] Menambahkan simpan foto unggulan dengan izin perangkat.
- [x] Memperjelas pesan ketika profil publik tidak tersedia.
- [x] Menambahkan tombol muat ulang saat data profil gagal diambil.
- [x] Memvalidasi izin media, fallback gambar, dan navigasi tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Checkpoint dan bundling akhir

- [x] Membaca ulang TODO dan memastikan item implementasi yang relevan sudah ditandai selesai.
- [x] Menjalankan typecheck dan seluruh test sebagai validasi akhir.
- [x] Menyimpan checkpoint terbaru.
- [x] Mengarahkan pengguna melakukan bundling APK melalui Publish, bukan build manual di sandbox.


## Penyederhanaan Room Global

- [x] Menghapus kartu “Room teks server-side” dari halaman Room Global.
- [x] Memastikan percakapan teks tetap tersedia di dalam tampilan room utama.
- [x] Memastikan kontrol audio, peserta, persetujuan, dan tombol masuk/keluar tetap berfungsi.
- [x] Memvalidasi layout Room Global tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Penyelesaian checkpoint Room Global

- [x] Menjalankan typecheck, lint, dan seluruh test setelah kartu teks server-side dihapus.
- [ ] Menyimpan checkpoint terbaru untuk perubahan Room Global.
- [ ] Memberikan instruksi Publish untuk bundling APK melalui UI.


## Perbaikan tombol crop foto Aira

- [x] Menemukan preview crop foto pada alur lampiran layanan Aira.
- [x] Menampilkan tombol Kembali/Batal yang jelas dan mudah disentuh.
- [x] Menampilkan tombol Oke/Gunakan foto yang jelas dan mudah disentuh.
- [x] Memastikan tombol crop mengembalikan atau meneruskan foto dengan benar.
- [x] Memvalidasi crop preview tanpa checkpoint sebelum persetujuan pengguna.


## Perapian UI Room Global terbaru

- [x] Memindahkan Status Provider dan Uji Audio Publik menjadi ikon kecil di kanan atas.
- [x] Memadatkan kartu peserta audio menjadi badge ikon tanpa teks penjelasan panjang.
- [x] Menghilangkan tampilan text box besar dan merapikan tombol mic, voice note, serta kirim.
- [x] Menambahkan tombol gerigi untuk mengatur ukuran bubble chat dan jarak antar bubble.
- [x] Memvalidasi tampilan dan interaksi Room Global tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Moderasi pesan dan link Room Global

- [x] Menambahkan aksi hapus pesan hanya pada menu Room Global Administrator.
- [x] Mengganti pesan yang dihapus dengan teks miring “Pesan dihapus admin”.
- [x] Memastikan pengguna biasa tidak melihat tombol hapus pesan.
- [x] Menampilkan link pesan dengan warna biru dan dapat ditekan.
- [x] Menampilkan peringatan keamanan sebelum link dibuka.
- [x] Membuka link melalui browser eksternal hanya setelah pengguna menyetujui peringatan.
- [x] Memvalidasi moderasi dan link aman tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Deteksi link dan identitas ADMIN VAIRA

- [x] Mendeteksi link mencurigakan dan menjelaskan alasannya sebelum membuka link.
- [x] Tetap mengizinkan link dibuka setelah pengguna memberikan konfirmasi eksplisit.
- [x] Masuk Room Global dari menu Administrator menggunakan identitas khusus ADMIN VAIRA, bukan akun pengguna pribadi.
- [x] Menampilkan nama ADMIN VAIRA dengan inti emas, outline putih, glow emas tipis, dan badge centang hijau.
- [x] Memvalidasi batas akses admin dan tampilan identitas tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Deteksi link dan identitas ADMIN VAIRA

- [x] Mendeteksi link mencurigakan dan menjelaskan alasannya sebelum membuka link.
- [x] Tetap mengizinkan link dibuka setelah pengguna memberikan konfirmasi eksplisit.
- [x] Masuk Room Global dari menu Administrator menggunakan identitas khusus ADMIN VAIRA, bukan akun pengguna pribadi.
- [x] Menampilkan ADMIN VAIRA dengan tulisan bold, inti emas, outline putih, glow emas tipis, dan badge centang hijau.
- [x] Memvalidasi batas akses admin dan tampilan identitas tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Avatar dan pengaturan administrator Room Global

- [ ] Menyalin ikon kiriman pengguna ke aset avatar ADMIN VAIRA.
- [ ] Menampilkan border emas mewah pada avatar ADMIN VAIRA di peserta dan bubble pesan.
- [ ] Menampilkan border warna berbeda untuk avatar pengguna lain berdasarkan akun.
- [ ] Memindahkan pengaturan moderasi Room Global dari Administrator ke halaman baru melalui tombol gerigi.
- [ ] Menampilkan halaman pengaturan admin hanya pada mode Administrator.
- [ ] Mempertahankan pengaturan ukuran dan jarak bubble untuk pengguna biasa.
- [ ] Memvalidasi aset, akses, dan layout tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Cakupan space bubble Room Global

- [x] Menambahkan switch “Hanya ADMIN VAIRA” dan “Semua pengguna” pada pengaturan administrator.
- [x] Menerapkan nilai space bubble administrator sesuai cakupan switch.
- [x] Menerapkan nilai global pada tampilan pengguna ketika cakupan semua pengguna aktif.
- [x] Menjaga kontrol cakupan tetap tersembunyi dari pengguna biasa.
- [x] Memvalidasi switch tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Pemusatan pengaturan dan foto publik peserta

- [x] Menghapus panel moderasi Room Global yang duplikat dari Administrator lama.
- [x] Menambahkan preview langsung perubahan ukuran dan jarak bubble pada halaman admin.
- [x] Memastikan URL avatar publik memakai signed URL yang dapat diakses peserta lain.
- [x] Memastikan URL foto unggulan publik memakai signed URL yang dapat diakses peserta lain.
- [x] Memvalidasi fallback foto tanpa menutupi foto yang sebenarnya tersedia.
- [x] Memvalidasi pengaturan hanya admin dan preview bubble tanpa checkpoint atau bundling.


## Penyempurnaan pemuatan foto publik

- [x] Menambahkan tombol Muat ulang foto pada profil peserta.
- [x] Menambahkan indikator loading untuk setiap avatar dan foto unggulan.
- [x] Menampilkan pesan khusus jika URL media lama tidak valid dan menyarankan unggah ulang.
- [x] Memvalidasi refresh, loading, dan fallback tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Cache foto dan pengelolaan riwayat token

- [x] Menambahkan cache foto publik agar tidak memuat ulang terlalu sering.
- [x] Memastikan panel menjelaskan akun yang melakukan redeem token tanpa menampilkan token mentah.
- [x] Menambahkan tombol hapus riwayat token yang hanya dapat digunakan Administrator.
- [x] Menambahkan tombol hapus riwayat redeem yang hanya dapat digunakan Administrator.
- [x] Menambahkan tombol gerigi untuk pengaturan hapus otomatis.
- [x] Menyediakan pilihan hapus otomatis setelah 1 minggu, 1 bulan, atau 1 tahun.
- [x] Memvalidasi otorisasi dan penghapusan tanpa checkpoint atau bundling sebelum persetujuan pengguna.


## Pemulihan regresi menu Administrator

- [x] Audit menu Administrator yang hilang: akun terdaftar, daftar akun, pengkinian data, dan panel administrasi lain.
- [x] Pulihkan navigasi login Administrator dan halaman kelola akun tanpa menghapus pengaturan Room Global.
- [x] Pulihkan formulir pengkinian data akun Administrator beserta validasi tanggal lahir, password, dan pesan error sederhana.
- [x] Pulihkan panel audit, token, laporan Room Global, AiraxCloud, dan pengaturan administrator yang sebelumnya tersedia.
- [x] Pastikan pengaturan yang dipindahkan ke Room Global tetap tersedia melalui gerigi di dalam room dan tidak tampil pada pengguna biasa.
- [x] Tambahkan regresi test untuk menu dan navigasi Administrator.
- [x] Jalankan typecheck, lint, dan seluruh test setelah pemulihan; jangan membuat checkpoint sebelum hasil validasi selesai.

## Menu ringkas Administrator

- [x] Mengubah halaman utama Administrator menjadi grid tombol/icon kategori yang ringkas.
- [x] Menjaga akses ke akun, pengkinian data, blacklist, audit, AiraXCloud, laporan, moderasi, token, snapshot, dan Room Global.
- [x] Membuka detail setiap kategori melalui halaman/jendela khusus tanpa menghapus endpoint atau fungsi yang sudah ada.
- [x] Memastikan pengaturan moderasi Room Global tetap diakses dari gerigi di dalam room.
- [x] Menambahkan regresi test untuk navigasi menu ringkas Administrator.
- [x] Menjalankan typecheck, lint, dan seluruh test sebelum menawarkan checkpoint.

## Penyederhanaan Administrator dan bubble Room Global

- [x] Menyembunyikan daftar pesan dan panel panjang dari halaman awal Administrator.
- [x] Menambahkan halaman khusus Pesan Room Global dengan aksi hapus yang ringkas.
- [x] Menyederhanakan tombol hapus Administrator menjadi ikon yang jelas tanpa menghapus fungsinya.
- [x] Menambahkan hapus pesan milik pengguna sendiri dari bubble atau aksi tahan lama pada Room Global.
- [x] Menambahkan pemisah tanggal realtime dan nama hari pada riwayat Room Global.
- [x] Menambahkan waktu kirim kecil namun terbaca di sudut kanan bawah bubble.
- [x] Menambahkan regresi test dan menjalankan typecheck, lint, serta seluruh test.


## Undo penghapusan pesan Room Global

- [x] Menambahkan jendela waktu undo setelah pengguna menghapus pesan sendiri.
- [x] Memulihkan pesan secara aman hanya jika masih berada dalam jendela undo.
- [x] Menampilkan toast dengan tombol Undo dan status yang jelas.
- [x] Menambahkan regresi test untuk alur hapus dan undo.
- [x] Menjalankan typecheck dan seluruh test; checkpoint menunggu pilihan pengguna.


## Perbaikan layout Room Global dan komposer

- [x] Mengembalikan komposer teks dengan tombol mic dan kirim berbasis ikon yang tetap berfungsi.
- [x] Meringkas indikator terhubung dengan ikon peserta dan jumlah peserta aktif.
- [x] Memindahkan peserta audio tepat di bawah header Room Global dan mengecilkan kartu tanpa menghilangkan interaksi.
- [x] Membuat area percakapan memenuhi ruang yang tersedia setelah peserta audio.
- [x] Memperbaiki kontrol ukuran bubble dan jarak antar bubble agar benar-benar memengaruhi render.
- [x] Menambahkan regresi test untuk komposer dan pengaturan layout Room Global.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Penyempurnaan Room Global pilihan pengguna

- [x] Menambahkan sakelar tampil/sembunyikan label nama pada kartu peserta audio.
- [x] Menambahkan tombol scroll cepat ke pesan terbaru.
- [x] Menyimpan ukuran bubble dan jarak bubble per akun secara lokal.
- [x] Menambahkan regresi test untuk ketiga fitur.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Penyempurnaan scroll dan sinkronisasi bubble

- [x] Menambahkan indikator visual saat tombol scroll ke pesan terbaru ditekan.
- [x] Menambahkan tombol reset pengaturan bubble dan label ke nilai default.
- [x] Menambahkan sinkronisasi pengaturan bubble per akun melalui server lintas perangkat.
- [x] Menambahkan regresi test untuk scroll, reset, dan sinkronisasi.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Preferensi bubble terpisah per mode

- [x] Memisahkan kunci penyimpanan lokal Administrator dan pengguna.
- [x] Memisahkan data preferensi server berdasarkan mode Administrator dan akun pengguna.
- [x] Menampilkan reset dan sinkronisasi sesuai mode yang sedang aktif.
- [x] Menambahkan regresi test untuk isolasi preferensi antar mode.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Penyederhanaan header Room Global

- [x] Menghapus teks “Percakapan publik server-side” di bawah judul Room Obrolan Global.
- [x] Memastikan judul, status koneksi, jumlah peserta, dan kontrol header tetap berfungsi.
- [x] Menambahkan regresi test untuk memastikan subjudul tidak muncul lagi.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Perbaikan prioritas alarm adzan

- [x] Audit permission notifikasi, exact alarm, dan mode gangguan perangkat.
- [x] Memperbaiki channel notifikasi adzan dengan prioritas tinggi, suara, getar, dan kategori alarm.
- [x] Memastikan penjadwalan ulang alarm salat setelah izin atau jadwal berubah.
- [x] Menambahkan feedback jelas jika izin sistem belum diberikan.
- [x] Menambahkan regresi test untuk permission, channel prioritas, dan penjadwalan alarm.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Aksi notifikasi alarm adzan

- [x] Menambahkan kategori notifikasi alarm adzan dengan aksi Matikan alarm dan Ingatkan 5 menit lagi.
- [x] Menangani aksi matikan tanpa membuka aplikasi penuh.
- [x] Menjadwalkan ulang alarm yang ditunda lima menit dengan channel prioritas alarm.
- [x] Menutup notifikasi setelah aksi agar pengguna kembali ke aplikasi atau layar sebelumnya.
- [x] Menambahkan listener aksi notifikasi saat aplikasi foreground, background, dan cold start.
- [x] Menambahkan regresi test untuk kategori, aksi, dan penjadwalan ulang.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Tambahan alarm adzan pilihan pengguna

- [x] Menambahkan tombol pemeriksaan status izin alarm secara langsung.
- [x] Menambahkan pengaturan volume alarm terpisah sejauh kemampuan sistem perangkat mendukungnya.
- [x] Menambahkan aksi Matikan alarm dan Ingatkan 5 menit lagi pada notifikasi native.
- [x] Menambahkan listener aksi saat foreground, background, dan cold start.
- [x] Menambahkan regresi test untuk seluruh aksi dan status izin.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Dukungan latar belakang alarm dan penyederhanaan error

- [ ] Audit izin background alarm, exact alarm, battery optimization, dan kategori notifikasi.
- [x] Menambahkan konfigurasi izin latar belakang alarm sejauh didukung Android/iOS.
- [x] Audit semua pesan error login, logout, email, password, sesi, dan validasi akun.
- [x] Audit semua pesan error Administrator, token, akun terdaftar, dan pengkinian data ID/username.
- [x] Mengubah error JSON, JavaScript, dan kode mentah menjadi pesan sederhana dengan tindakan yang jelas.
- [x] Menambahkan helper normalisasi error agar pesan konsisten di seluruh form.
- [x] Menambahkan regresi test untuk pesan error ramah pengguna dan alarm latar belakang.
- [x] Menjalankan typecheck serta seluruh test; checkpoint menunggu persetujuan pengguna.


## Audit menyeluruh proyek

- [x] Audit item TODO yang masih tertunda dan kelompokkan berdasarkan dampak.
- [x] Audit semua rute layar dan navigasi agar tidak ada halaman tanpa akses atau dead end.
- [x] Audit alur login, registrasi, pemulihan, token, dan pengkinian akun.
- [x] Audit Room Global, audio, pesan, moderasi, profil publik, dan izin usia.
- [x] Audit layanan Aira, generator, penyimpanan hasil, retry, timeout, dan kuota provider.
- [x] Audit keuangan, backup, restore, kalender, pengingat, serta sinkronisasi data.
- [x] Audit permission native, notifikasi alarm, background, Android/iOS, dan konfigurasi rilis.
- [x] Audit test coverage, lint, typecheck, dependency, konfigurasi, dan risiko crash APK.
- [x] Menyusun laporan prioritas dan saran baru; tidak mengubah kode atau membuat checkpoint sebelum pengguna memilih perbaikan.


## Audit UX/UI mendalam

- [x] Audit konsistensi warna, tipografi, radius, border, ikon, dan status tombol.
- [x] Audit kepadatan layout, hierarchy, safe area, keyboard, dan penggunaan satu tangan.
- [x] Audit Home, Aira, Keuangan, Rencana, Profil, Waktu Salat, dan formulir utama.
- [x] Audit Administrator, Room Global, audio, chat, modal, toast, dan halaman khusus.
- [x] Audit loading, empty state, error state, aksesibilitas, dan feedback aksi.
- [x] Menyusun rekomendasi visual berdasarkan prioritas dan contoh layout yang lebih nyaman.
- [x] Tidak mengubah kode atau membuat checkpoint sebelum pengguna memilih rekomendasi implementasi.


## Implementasi seluruh rekomendasi audit

- [x] Membuat struktur menu ringkas dengan grup dan halaman detail khusus.
- [x] Keuangan: membuat alur Pindah Dana khusus dan menampilkan transaksi terbaru nyata.
- [x] Keuangan: mengelompokkan Ringkasan, Dompet, Transaksi, Laporan, dan Analisis Aira.
- [x] Profil: menyatukan aturan foto unggulan dan menambahkan progress upload per foto.
- [ ] Waktu Salat: memisahkan grup Izin, Suara & Getar, Jadwal, dan Tes Alarm dalam halaman khusus.
- [x] Waktu Salat: menambahkan panduan optimasi baterai dan status izin berbentuk checklist.
- [x] Administrator: merangkum snapshot, badge pending, dan konfirmasi tindakan berisiko.
- [x] Aira: merapikan status token, kuota, loading, empty state, error state, dan hasil generasi.
- [x] Menyamakan normalisasi error pada toast, alert, dan validasi inline.
- [x] Menyelaraskan metadata versi aplikasi dan package.
- [x] Menjalankan typecheck, lint, test, Expo Doctor, dan build; checkpoint menunggu peninjauan pengguna.


## Kriteria backward-compatible wajib

- [x] Memastikan setiap perubahan UI mempertahankan endpoint, hak akses, izin, validasi, batas usia, gate token, dan fungsi lama.
- [ ] Menambahkan regresi test untuk mencegah menu atau aturan lama hilang saat detail dipindahkan ke halaman baru.
- [ ] Membandingkan fungsi sebelum dan sesudah setiap kelompok perubahan.
- [ ] Melaporkan secara eksplisit setiap batasan platform yang tidak dapat dikendalikan aplikasi.




## Penyelesaian audit dan audit kedua

- [x] Memetakan semua item TODO yang masih relevan dan tidak bertentangan dengan keputusan pengguna.
- [x] Menyelesaikan struktur menu ringkas dan halaman detail khusus tanpa mengurangi fungsi.
- [x] Menyelesaikan perbaikan Keuangan, Profil, dan Waktu Salat.
- [x] Menyelesaikan perapian Administrator, Aira, Room Global, dan pesan error.
- [x] Menyelesaikan warning lint, test yang dilewati, metadata versi, dan validasi build.
- [x] Melakukan audit kedua terhadap UX/UI, navigasi, permission, state loading/error, dan integrasi.
- [ ] Menyimpan temuan baru dan menawarkan pilihan perbaikan sebelum checkpoint.

## Permintaan versi 1.0.21 dan pesan progres

- [x] Menyelaraskan versi package dan metadata Expo menjadi 1.0.21 tanpa mengubah slug atau bundle ID.
- [x] Menemukan bahwa pemotongan baris pada tangkapan layar berasal dari UI percakapan Manus, bukan komponen aplikasi; laporan hasil akhir akan disampaikan dalam teks utuh.
- [x] Menambahkan regresi test untuk perubahan minor upload foto dan status izin alarm; pemotongan daftar progres Manus berada di luar kode aplikasi.
- [x] Menjalankan validasi rilis versi 1.0.21; checkpoint disimpan setelah persetujuan pengguna.

## Catatan backward compatibility

- [x] Mempertahankan seluruh aturan akses, gate token, batas usia Room Global, izin alarm, sinkronisasi preferensi, dan endpoint yang sudah ada.

## Lanjutan minor setelah checkpoint 1.0.21

- [x] Memperjelas grouping Waktu Salat menjadi Jadwal, Izin Sistem, Suara & Getar, serta Tes Alarm dalam halaman pengaturan yang sama.
- [x] Menambahkan regresi untuk memastikan menu Administrator, gate token, batas usia Room Global, kontrol moderator, dan izin alarm tetap tersedia setelah pengelompokan.
- [x] Menjalankan validasi lengkap; checkpoint hasil lanjutan siap disimpan tanpa bundling APK manual.

## Audit kedua mendalam sebelum Publish

- [ ] Memeriksa navigasi dan rute untuk dead end, tombol tanpa aksi, dan halaman yang hanya bisa dibuka dari kondisi tertentu.
- [ ] Memeriksa risiko crash native, permission, background alarm, audio provider, media, dan orientation.
- [ ] Memeriksa backward compatibility untuk auth, gate token, Room Global 16+, ADMIN VAIRA, profil, foto unggulan, dan sinkronisasi.
- [ ] Memeriksa state loading, retry, timeout, empty state, error message, serta signed URL hasil generasi Aira.
- [ ] Memeriksa branding, metadata versi 1.0.21, konfigurasi Android/iOS/Web, dan aset launcher.
- [ ] Menjalankan audit test, visual, konfigurasi Expo, serta mengklasifikasikan temuan menjadi kritis, sebelum Publish, atau minor.

## Audit interaksi tombol dan UX praktis

- [ ] Memetakan setiap onPress/onLongPress/onChange dan membandingkan label, ikon, rute, serta aksi aktualnya.
- [ ] Mendeteksi tombol yang tidak memiliki aksi, rute yang salah, tombol yang membuka halaman kosong, dan modal tanpa jalan keluar.
- [ ] Memeriksa alur simpan, batal, kembali, hapus, salin, ulangi, retry, kunci, dan buka kunci.
- [ ] Memeriksa ukuran target sentuh, posisi kontrol satu tangan, keyboard overlap, scroll, modal, dan landscape.
- [ ] Memeriksa konsistensi feedback loading, toast, alert, disabled state, dan error pada setiap aksi utama.
- [ ] Menjalankan validasi visual serta test regresi untuk temuan interaksi yang diperbaiki.

## Perbaikan regresi header Room Global

- [x] Mencegah judul “Room Global” terpecah vertikal pada portrait.
- [x] Merapikan deretan kontrol header agar tidak menekan area judul dan tetap memiliki target sentuh yang layak.
- [x] Menambahkan regresi layout untuk judul, status, dan kontrol Room Global pada portrait serta landscape.
- [x] Menjalankan validasi penuh; checkpoint siap disimpan setelah perbaikan tervalidasi.

## Diagnosis ulang Room Global sebelum perubahan

- [ ] Memeriksa ulang sumber judul terpecah pada portrait tanpa mengubah kode.
- [ ] Membandingkan hasil preview web dengan screenshot/perangkat pengguna dan memeriksa kemungkinan cache bundle lama.
- [ ] Menawarkan opsi perbaikan layout kepada pengguna sebelum implementasi atau checkpoint baru.

## Opsi 1 — Header Room Global dua baris

- [ ] Memisahkan baris judul/status dari toolbar ikon Room Global Chat.
- [ ] Memastikan semua kontrol lama tetap tersedia dengan label aksesibilitas dan target sentuh yang sama.
- [ ] Menambahkan regresi struktur header dua baris dan validasi portrait/landscape.
- [ ] Menawarkan checkpoint kepada pengguna setelah hasil diuji; tidak bundling APK otomatis.

## Opsi A+B — Navigasi dan toolbar Room Global

- [x] Menambahkan tombol Kembali kecil pada baris judul Room Global Chat.
- [x] Memindahkan status provider dan uji audio ke dalam menu gerigi tanpa menghapus fungsi retry atau Jitsi.
- [x] Menambahkan regresi untuk tombol kembali dan visibilitas kontrol provider/uji audio.
- [x] Menjalankan validasi dan menawarkan checkpoint sebelum bundling APK.

## Checkpoint A+B Room Global

- [x] Menyimpan checkpoint setelah tombol Kembali dan pengelompokan provider/uji audio tervalidasi.
- [ ] Tidak menjalankan bundling APK manual; Publish tetap dilakukan dari UI setelah pengguna meninjau checkpoint.

## Audit layout Room Global dari screenshot terbaru

- [ ] Menata judul Room Global agar selalu satu baris dan tidak terpecah.
- [ ] Memindahkan gerigi ke paling kanan, status terhubung di sampingnya, serta mic/speaker rapat di baris bawah.
- [ ] Mengecilkan kartu status “Room Global aktif untuk percakapan publik” sesuai panjang teks dengan ruang aman.
- [ ] Menghapus kotak latar kartu profil peserta audio tetapi tetap menampilkan avatar dan nama pengguna.
- [ ] Menambahkan badge kecil “Ada pesan baru · jumlah” di kanan bawah area percakapan di atas composer.
- [ ] Menawarkan opsi tambahan sebelum implementasi atau checkpoint baru.

## Bubble chat dua sisi dan perapian Room Global

- [ ] Menambahkan badge unread dengan opsi nama pengirim dan jumlah pesan baru.
- [ ] Menampilkan nama peserta audio satu baris di bawah avatar tanpa kotak tile besar.
- [ ] Menata bubble pengguna sendiri di kanan dan bubble pengguna lain di kiri.
- [ ] Membuat bubble bergaya daun dengan ekor mengarah ke avatar di masing-masing sisi.
- [ ] Menjaga aturan hapus, reply, mention, link warning, voice note, dan admin tetap berfungsi.
- [ ] Menawarkan hasil serta opsi tambahan sebelum checkpoint baru.

## Penyempurnaan ekor bubble

- [ ] Menempatkan ekor bubble sejajar dengan area icon profil, bukan di atas avatar.
- [ ] Mengarahkan ujung ekor bubble ke bawah dekat avatar untuk bubble kanan dan kiri.
- [ ] Menjalankan validasi regresi tanpa checkpoint langsung.

## Ekor bubble menempel avatar

- [ ] Menempelkan ujung ekor bubble langsung ke sisi foto profil tanpa celah.
- [ ] Menjaga ekor sejajar dengan avatar dan ujung daun mengarah ke bawah.
- [ ] Menjalankan validasi regresi tanpa checkpoint langsung.

## Ekor bubble lebih kecil

- [ ] Mengecilkan ukuran ekor bubble yang menempel avatar agar tidak menutup tepi foto.
- [ ] Mempertahankan posisi sejajar avatar dan arah ujung daun ke bawah.
- [ ] Menjalankan validasi regresi tanpa checkpoint langsung.

## Tawaran lanjutan Room Global

- [ ] Menyusun dan menawarkan minimal lima opsi UX/UI lanjutan sebelum implementasi berikutnya.
- [ ] Menunggu pilihan pengguna sebelum mengubah kode atau membuat checkpoint.

## Interaksi bubble pilihan 4+5+9

- [ ] Menambahkan swipe bubble untuk reply dan menghapus ikon reply dari bubble.
- [ ] Memindahkan Hapus dan Laporkan ke menu tahan bubble, serta memastikan aksi menu berfungsi.
- [ ] Mempertahankan peringatan keamanan sebelum link dibuka di browser eksternal.
- [ ] Menata jam pesan sendiri di sisi kiri dan jam pesan pengguna lain di sisi kanan sesuai posisi avatar.
- [ ] Menjaga ruang kontrol hapus administrator agar jam tidak bertabrakan.
- [ ] Menguji seluruh aksi bubble sebelum menawarkan checkpoint.

## Ikon aksi bubble dan ikon ayam Rencana

- [ ] Mengubah aksi menu bubble menjadi ikon ringkas dengan label aksesibilitas yang jelas.
- [ ] Menambahkan ikon Pilih teks yang benar-benar menyeleksi dan menyalin teks pesan.
- [ ] Memastikan Reply, Hapus, Laporkan, Salin, dan Buka link tetap berfungsi dari ikon masing-masing.
- [ ] Mengganti ikon babi pada menu Rencana menjadi ikon ayam dan memastikan mapping ikon tidak tertukar.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Toolbar aksi bubble di atas pesan dan aset ayam

- [ ] Menyiapkan aset ikon ayam khusus untuk Target pada halaman Rencana.
- [ ] Menampilkan toolbar ikon aksi tepat di atas bubble saat bubble ditekan lama.
- [ ] Menambahkan toast kecil setelah teks dipilih/disalin.
- [ ] Memastikan toolbar tidak keluar layar pada bubble dekat tepi atas atau samping.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Penyelarasan ikon ayam global

- [ ] Menemukan semua penggunaan ikon Target di Rencana, Beranda, aksi cepat, empty state, dan komponen terkait.
- [ ] Menggunakan satu aset ikon ayam yang sama pada semua konteks Target.
- [ ] Menambahkan tooltip ringkas untuk toolbar ikon menu tahan bubble.
- [ ] Menunggu aset ayam selesai dan memverifikasi fallback/ukuran pada perangkat.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Saran tambahan sebelum checkpoint

- [ ] Menyusun opsi tambahan yang tidak mengulang tawaran sebelumnya.
- [ ] Menunggu pilihan pengguna sebelum implementasi atau checkpoint.

## Pilihan 5+6+7 Room Global

- [ ] Menempatkan toolbar aksi secara cerdas agar berpindah ke bawah bila terlalu dekat tepi atas.
- [ ] Menambahkan haptic feedback ringan untuk swipe reply dan menu tahan pada perangkat native.
- [ ] Menampilkan ikon Hapus/Laporkan sesuai hak akses pengguna, dengan kontrol admin tetap tersedia di mode Administrator.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Opsi tambahan baru

- [ ] Menyusun tawaran baru yang tidak mengulang opsi cache, preload, uji visual, atau checkpoint.
- [ ] Menunggu pilihan pengguna sebelum implementasi atau checkpoint.

## Pilihan 1+2+8 Room Global

- [ ] Menambahkan animasi masuk bubble yang halus dan tidak menggeser pesan lama secara berlebihan.
- [ ] Menambahkan pemisah “Mulai pesan baru” pada pesan pertama yang belum dibaca.
- [ ] Menampilkan status composer Mengirim, Terkirim, atau Gagal secara jelas.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Tawaran lanjutan setelah status composer

- [ ] Menyusun opsi baru yang belum pernah ditawarkan sebelumnya.
- [ ] Menunggu pilihan pengguna sebelum perubahan kode atau checkpoint.

## Mention pribadi dan voice note Room Global

- [ ] Memberi aksen visual hanya pada mention yang menyebut pengguna aktif.
- [ ] Menampilkan voice note dengan durasi dan status sudah/belum diputar.
- [ ] Memastikan aksen mention dan status voice note tidak mengubah isi pesan atau aturan moderasi.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Voice note dan verify pengguna

- [ ] Menambahkan kontrol play/pause voice note nyata dengan status pemutaran.
- [ ] Mengubah mention pengguna biasa menjadi putih dan mempertahankan ADMIN VAIRA emas.
- [ ] Menambahkan kontrol Administrator untuk memberi atau mencabut verify pengguna.
- [ ] Menampilkan verify pengguna biasa hijau dan verify ADMIN VAIRA emas.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Verify di Room Global Administrator

- [ ] Memindahkan kontrol Verify dari daftar akun utama ke gerigi Room Global Administrator.
- [ ] Menambahkan konfirmasi sebelum Verify dicabut.
- [ ] Menambahkan filter pengguna terverifikasi di pengaturan Room Global Administrator.
- [ ] Menampilkan badge Verify pada halaman profil publik peserta.
- [ ] Menjalankan validasi tanpa checkpoint langsung.

## Tawaran lain untuk Verify dan moderasi

- [ ] Menyusun opsi baru yang belum pernah ditawarkan terkait Verify, profil publik, dan moderasi.
- [ ] Menunggu pilihan pengguna sebelum implementasi atau checkpoint.

## Fokus Room Global sebagai layanan sosial

- [ ] Menentukan visi Room Global sebagai ruang sosial audio, teks, dan profil publik yang aman.
- [ ] Memetakan fitur komunikasi ala WhatsApp dan fitur profil/konten ala Instagram tanpa menghapus moderasi yang ada.
- [ ] Menyusun prioritas fase fitur dan menunggu pilihan pengguna sebelum implementasi atau checkpoint.

## Prioritas Room Global fase komunikasi dan identitas

- [ ] Memprioritaskan reply swipe, voice note nyata, status pengiriman, pesan belum dibaca, salin teks, hapus/Undo, laporkan, dan pencarian pesan.
- [x] Mempertahankan profil publik, avatar, bio, tiga foto unggulan, status aktif, dan Verify tanpa menambahkan followers.
- [x] Membuat satu komponen badge Verify bersama untuk mention, voice note, bubble, peserta audio, dan profil publik.
- [x] Menyamakan ukuran serta warna badge: hijau untuk pengguna terverifikasi dan emas untuk ADMIN VAIRA.
- [x] Menunggu urutan implementasi fase pertama sebelum mengubah kode atau membuat checkpoint.

## Room Global fase lanjutan terpilih

- [x] Mengirim dan menyimpan voice note sebagai audio asli yang dapat diputar ulang dengan kontrol play/pause.
- [x] Menambahkan pencarian pesan Room Global dengan hasil yang aman dan tetap menghormati soft-delete serta moderasi.
- [x] Memperjelas status pesan: mengirim, terkirim, gagal, dan coba lagi.
- [x] Melakukan audit visual badge Verify pada tampilan portrait untuk mention, voice note, bubble, peserta audio, dan profil publik.
- [x] Memvalidasi seluruh perubahan dengan typecheck, lint, test, dan pemeriksaan visual sebelum menawarkan checkpoint.

## Eksplorasi fitur sosial Room Global berikutnya

- [ ] Memetakan fitur sosial tambahan yang tidak memakai followers.
- [ ] Mempertahankan profil publik tanpa email, nomor WhatsApp, username sensitif, atau data pribadi.
- [ ] Menentukan prioritas fitur sosial berdasarkan manfaat, keamanan, beban moderasi, dan kenyamanan satu tangan.
- [ ] Menunggu pilihan pengguna sebelum implementasi atau checkpoint.

## Posting foto dan indikator mention Room Global

- [x] Menambahkan posting foto singkat dengan caption opsional, pratinjau, batas ukuran, dan penghapusan aman.
- [x] Menjaga posting media tunduk pada moderasi Administrator, laporan, soft-delete, dan aturan akun Room Global.
- [x] Mendeteksi mention `@` yang benar-benar menandai pengguna dan menyimpan jumlah mention belum dibaca per akun.
- [x] Menampilkan titik merah serta jumlah mention belum dibaca pada widget Room Global di Beranda.
- [x] Menghapus indikator setelah pengguna membuka Room Global dan membaca mention terkait.
- [x] Memvalidasi fitur pada portrait, typecheck, lint, dan test sebelum menawarkan checkpoint.

## Fitur sosial Room Global pilihan pengguna

- [x] Menampilkan tombol posting foto yang jelas dan mudah ditemukan di komposer Room Global.
- [x] Mempertahankan upload foto dengan caption, pratinjau, batas ukuran, laporan, dan moderasi Administrator.
- [x] Menambahkan reaksi pesan sederhana tanpa followers.
- [x] Menambahkan status singkat pengguna yang dapat diatur dan dihapus.
- [x] DM satu lawan satu dikeluarkan dari ruang lingkup sesuai keputusan pengguna.
- [x] Menjaga privasi, token, login, batas usia, persetujuan Room Global, dan tanpa followers.
- [x] Memvalidasi semua fitur dengan typecheck, lint, test, dan pemeriksaan portrait sebelum checkpoint.

## Perubahan ruang lingkup fitur sosial

- [x] Menghapus DM singkat dari ruang lingkup berdasarkan keputusan pengguna.
- [x] Memastikan tombol Foto terlihat jelas di komposer Room Global dan tetap berfungsi.
- [x] Menambahkan reaksi pesan yang tersimpan dan dapat dimoderasi.
- [x] Menambahkan status singkat pengguna tanpa followers.
- [x] Memvalidasi ulang aturan privasi, token, login, usia, moderasi, typecheck, lint, test, dan portrait UI.

## Eksplorasi fitur sosial tambahan tanpa DM

- [ ] Memetakan fitur komunitas, keamanan, penemuan, dan personalisasi Room Global selain posting foto, reaksi, dan status singkat.
- [ ] Menolak followers dan DM sebagai bagian dari ruang lingkup sosial Room Global.
- [ ] Menilai dampak moderasi, privasi, beban storage, dan kenyamanan satu tangan untuk setiap opsi.
- [ ] Menunggu pilihan pengguna sebelum implementasi atau checkpoint.

## Pesan sematan Room Global khusus Administrator

- [x] Menambahkan penyimpanan pesan sematan Room Global tanpa menghapus isi pesan asli.
- [x] Menambahkan endpoint semat dan lepas semat yang hanya dapat dipanggil ADMIN VAIRA.
- [x] Menambahkan ikon semat pada menu tekan lama khusus mode Administrator.
- [x] Menampilkan kartu pesan sematan di bagian atas percakapan untuk semua peserta.
- [x] Menyediakan navigasi dari kartu sematan menuju pesan asli.
- [x] Memvalidasi bahwa pengguna biasa tidak dapat menyematkan atau melepas sematan.
- [x] Memvalidasi typecheck, lint, test, dan tampilan portrait sebelum checkpoint.

## Penghapusan massal Room Global dan katalog Dompet

- [x] Menambahkan aksi Administrator untuk menghapus seluruh pesan Room Global sekaligus melalui pengaturan, dengan konfirmasi ganda, soft-delete, dan audit log.
- [x] Memastikan pengguna biasa tidak melihat atau dapat memanggil aksi hapus massal.
- [x] Mempertahankan pesan sematan, reaksi, laporan, dan aturan moderasi tanpa perubahan akses yang tidak diminta.
- [x] Menambahkan katalog bank pada menu Dompet berdasarkan referensi pengguna: BCA, Mandiri, BNI, BRI, CIMB Niaga, Danamon, Permata, OCBC NISP, Maybank Indonesia, Panin, BTN, Bank Mega, BSI, Bank Jawa Barat/BJB, Bank Jawa Timur, Bank Sinarmas, serta opsi bank manual.
- [x] Menambahkan katalog dompet digital: GoPay, OVO, DANA, LinkAja, ShopeePay, Superbank, serta opsi manual.
- [x] Menyediakan ikon katalog berbasis inisial/warna sebagai fallback lokal yang aman dan tidak menghapus aset lama.
- [x] Mempertahankan saldo awal, nama bank, nomor rekening, saldo, dan data dompet yang sudah tersimpan.
- [x] Memvalidasi typecheck, lint, test, keamanan, dan tampilan portrait sebelum checkpoint.

## Tambahan katalog bank dan dompet digital

- [x] Mengidentifikasi entri bank dan dompet digital yang belum ada tanpa menduplikasi katalog lama.
- [x] Menambahkan logo/aset lokal atau fallback logo konsisten untuk setiap entri baru.
- [x] Menambahkan entri baru ke katalog Dompet tanpa mengubah sumber dana lama atau saldo tersimpan.
- [x] Memvalidasi nama, kategori, logo, duplikasi, typecheck, lint, test, dan portrait UI.

## Perbaikan logo dan pemilih bank

- [ ] Mengganti logo-mark inisial bank/dompet digital dengan aset eksternal atau aset lokal yang lebih mirip, dengan fallback aman.
- [ ] Mengubah daftar bank/dompet menjadi tombol pemilih ringkas yang membuka modal baru.
- [ ] Menambahkan kolom pencarian nama bank/dompet pada modal dan mengembalikan pilihan ke formulir.
- [ ] Memperbaiki ikon ayam pada tombol Target agar menggunakan aset ayam yang benar.
- [ ] Menunggu saran dan persetujuan pengguna sebelum implementasi serta checkpoint.

## Implementasi perbaikan logo dan picker yang disetujui

- [x] Membuat modal pemilih bank/dompet digital dengan kolom cari, tab kategori, tombol pilih manual, dan kembali otomatis setelah memilih.
- [x] Mengganti tampilan grid logo menjadi tombol ringkas pada formulir sumber dana.
- [x] Menambahkan aset logo lokal yang lebih mirip untuk katalog bank/dompet dengan fallback yang konsisten.
- [x] Membuat satu aset ikon ayam bersama dan mengganti ikon Target yang masih memakai ikon tabungan/generik.
- [x] Menambahkan test aset, duplikasi, picker, dan target chicken icon.
- [x] Menjalankan typecheck, lint, test, dan pemeriksaan portrait tanpa membuat checkpoint sebelum hasil ditinjau pengguna.

## Logo resmi bank dan dompet digital

- [x] Menemukan sumber logo resmi untuk setiap entri bank/dompet digital yang digunakan katalog.
- [x] Menghubungkan katalog ke favicon/logo dari domain resmi masing-masing penyedia dengan fallback lokal; penyalinan file logo resmi lokal penuh tetap menjadi opsi lanjutan bila diperlukan.
- [x] Menormalisasi tampilan melalui container logo tanpa mengubah bentuk logo yang dimuat dari sumber resmi.
- [x] Menghubungkan aset resmi ke picker dan kartu sumber dana, dengan fallback aman bila aset resmi tidak tersedia.
- [x] Memvalidasi tidak ada duplikasi, logo tidak hilang, data lama tetap aman, typecheck, lint, test, dan portrait UI.

## Audit ulang logo resmi dan ikon Target

- [ ] Memeriksa semua lokasi pemakaian logo bank/dompet dan mencocokkannya dengan domain resmi penyedia.
- [ ] Memvalidasi URL logo, status respons, format aset, dan fallback agar tidak menampilkan logo yang salah atau kosong.
- [ ] Mencari semua lokasi Target yang masih memakai ikon savings, wallet, pig, atau ikon generik.
- [ ] Memastikan ChickenIcon dipasang pada seluruh tombol/widget Target tanpa mengubah aturan data keuangan.
- [ ] Menyimpan temuan audit dan memberikan saran sebelum melakukan perubahan atau checkpoint.

## Manifest logo resmi dan ChickenIcon menyeluruh

- [x] Membuat manifest eksplisit per brand berisi nama, domain resmi, sumber aset, URL logo, dan fallback lokal.
- [x] Mengganti ketergantungan favicon umum dengan manifest logo yang dapat diaudit.
- [x] Memasang ChickenIcon pada EmptyState target, kartu daftar target, widget Beranda, aksi cepat, dan detail target yang tersedia.
- [x] Menambahkan regresi test agar ikon generik tidak dipakai pada konteks Target.
- [x] Menjalankan typecheck, lint, test, dan pemeriksaan portrait tanpa checkpoint sebelum peninjauan pengguna.

## Logo utama SVG/PNG resmi lokal

- [x] Menemukan halaman Brand Asset, Media Kit, atau Brand Guideline resmi untuk setiap brand katalog.
- [x] Mengunduh file SVG/PNG logo resmi yang tersedia dan menyimpannya dengan nama aset lokal yang konsisten.
- [x] Memverifikasi format, integritas file, dan kesesuaian logo sebelum dipakai.
- [x] Menghapus favicon.ico sebagai logo utama dari BrandMark dan menggantinya dengan aset lokal.
- [x] Menyimpan domain sumber dan catatan penggunaan pada manifest.
- [x] Memvalidasi picker, kartu Dompet, fallback, typecheck, lint, test, dan portrait tanpa checkpoint sebelum peninjauan.

## Audit logo satu per satu

- [x] Membuat checklist per brand untuk BCA, Mandiri, BNI, BRI, CIMB Niaga, Danamon, Permata, OCBC, Maybank, Panin, BTN, Bank Mega, BSI, BJB, Bank Jatim, Bank Sinarmas, Bank Jago, blu, SeaBank, Bank Neo Commerce, Krom, Amar, Bank Raya, Hibank, Allo Bank, GoPay, OVO, DANA, LinkAja, ShopeePay, Superbank, PosPay, AstraPay, Sakuku, i.saku, DOKU, KasPro, dan TrueMoney.
- [x] Membuka situs resmi setiap brand terlebih dahulu dan mencari Brand Asset, Media Kit, Press Room, atau Brand Guideline.
- [x] Memeriksa opsi file gambar SVG/PNG dan memvalidasi logo secara visual serta teknis.
- [x] Mencari melalui Google hanya jika situs resmi tidak menyediakan aset, lalu memverifikasi hasil terhadap situs/identitas resmi brand.
- [x] Mencatat URL, status sumber resmi/cadangan, format, lisensi/pedoman penggunaan, dan keputusan aset untuk setiap brand.
- [ ] Menunggu hasil audit dan persetujuan sebelum mengganti semua aset atau membuat checkpoint.

- [x] Perbaiki pemetaan key asset TrueMoney agar mengikuti id katalog `true money` dan logo resmi benar-benar tampil pada BrandMark.

- [x] Mengintegrasikan asset resmi lokal bjb, Bank Sinarmas, SeaBank, Bank Neo Commerce, Krom, Amar, dan Bank Raya ke katalog Dompet; typecheck dan 168 test lulus.
- [x] Menjalankan pemeriksaan portrait katalog Dompet; layout one-hand dan kartu empty state tampil rapi.
- [ ] Menemukan asset mentah resmi Hibank dan Allo Bank tanpa favicon atau sumber pihak ketiga; saat ini fallback dipertahankan karena asset langsung belum dapat diverifikasi.

- [x] Menghapus background hijau icon ayam dan mempertahankan karakter ayam transparan pada Target.
- [ ] Menelusuri dan memverifikasi asset resmi Hibank serta Allo Bank dari media kit/domain resmi.
- [x] Melakukan visual pass modal picker seluruh brand dengan data contoh dan viewport portrait.

- [x] Memperbaiki dan memverifikasi ulang logo AstraPay, Sakuku, OVO, DANA, Krom Bank, Hibank, dan Allo.
- [x] Menormalisasi rasio, crop, transparansi, dan ukuran tampilan tujuh logo tersebut pada picker.
- [x] Menambahkan regresi tujuh brand dan melakukan visual pass portrait sebelum menawarkan checkpoint.

- [x] Memperbaiki asset logo BSI, BRI, AstraPay, CIMB Niaga, Danamon, dan Permata dari sumber penyedia yang dapat diverifikasi.
- [x] Membersihkan sisa background hijau/gelap pada icon ayam dan memastikan transparansi bersih.
- [x] Menambahkan regresi enam brand serta visual pass portrait tanpa checkpoint.

- [x] Mengambil dan memasang asset penyedia untuk BSI, BRI, AstraPay, CIMB Niaga, Danamon, Permata, dan Sakuku.
- [x] Membersihkan sisa background hijau/gelap pada icon ayam sampai transparan.
- [x] Menambahkan regresi tujuh brand dan visual pass portrait tanpa checkpoint.

- [ ] Mengganti logo AstraPay dengan asset yang terlihat jelas pada kartu picker.
- [ ] Membuat ulang icon ayam dengan alpha transparan nyata tanpa background atau halo.
- [ ] Menambahkan regresi dan visual pass untuk AstraPay serta icon ayam tanpa checkpoint.

- [x] Melanjutkan pemasangan logo AstraPay yang terlihat jelas pada picker.
- [x] Menyelesaikan cutout alpha icon ayam tanpa background atau halo.
- [x] Menjalankan regresi dan pemeriksaan visual AstraPay serta icon ayam tanpa checkpoint.

- [ ] Merancang fitur nonton video dari URL website dengan UI custom tanpa API key.
- [ ] Menentukan sumber yang legal dan metode pemutaran yang kompatibel web/mobile.
- [ ] Menyusun alur UI, fallback error, dan batasan sumber video sebelum implementasi.

- [ ] Mendukung mode video langsung, embed resmi, dan WebView dalam rancangan pemutar VAIRA AI.
- [ ] Merancang UI custom yang mengelilingi player tanpa menghapus kontrol atau branding sumber.
- [ ] Menambahkan deteksi koneksi, retry, fallback browser, dan cache legal tanpa membypass blokir, DRM, paywall, atau pembatasan akses.

- [ ] Menerapkan pemutar video aman dengan mode direct, embed resmi, dan WebView.
- [ ] Menambahkan deteksi offline/blocked, retry terbatas, fallback browser, dan sumber alternatif legal.
- [ ] Menyediakan UI custom untuk katalog, pemutar, bookmark, riwayat, dan pesan error tanpa bypass pembatasan provider.

- [ ] Merancang fitur VPN VAIRA AI yang terhubung ke server milik atau dikelola pengguna.
- [ ] Menentukan kebutuhan iOS/Android, protokol, autentikasi, dan pengelolaan konfigurasi secara aman.
- [ ] Merancang UI koneksi, daftar server, status, pemutusan, dan fallback tanpa bypass pembatasan provider.

- [ ] Menentukan hosting server VPN untuk opsi 3 tanpa mengaktifkan biaya atau layanan berbayar tanpa persetujuan.
- [ ] Menyiapkan client WireGuard yang dapat menerima konfigurasi server setelah endpoint tersedia.
- [ ] Menambahkan UI pilihan lokasi server, koneksi, status, dan fallback setelah jalur hosting disetujui.

- [ ] Memeriksa apakah server database pengguna mendukung WireGuard dan koneksi UDP publik.
- [ ] Memastikan port database tetap privat dan tidak terekspos melalui tunnel VPN.
- [ ] Menyiapkan konfigurasi client VAIRA AI berdasarkan endpoint server database yang disetujui.

- [ ] Memilih dan mengikat host persisten untuk server WireGuard VAIRA AI.
- [ ] Menyiapkan konfigurasi server, firewall, dan pemisahan port database setelah host disetujui.
- [ ] Menghubungkan backend dan client VAIRA AI setelah endpoint VPN aktif.

- [ ] Mengikat komputer pengguna melalui Manus Desktop sebagai host VPN pilihan C.
- [ ] Memeriksa OS, IP lokal/publik, router, DDNS, dan port UDP tanpa menyentuh port database.
- [ ] Menyiapkan WireGuard setelah komputer host tersedia dan pengguna menyetujui konfigurasi firewall.

- [ ] Menambahkan perlindungan DNS untuk mengurangi domain iklan dan pelacak.
- [ ] Menambahkan UI aktif/nonaktif, status pemfilteran, statistik, dan daftar pengecualian.
- [ ] Menjelaskan batasan: tidak menjamin penghapusan iklan in-stream, iklan aplikasi, DRM, atau layanan premium.

- [x] Menambahkan opsi admin untuk mencabut akses dari token yang sudah diredeem.
- [x] Mempertahankan riwayat redeem dan menandai akses sebagai revoked tanpa menghapus audit.
- [x] Menambahkan regresi agar token redeemed yang dicabut tidak lagi memberikan akses layanan.

- [x] Mencabut akses layanan dari pengguna yang tokennya sudah diredeem, dengan audit dan tanpa menghapus riwayat.
- [x] Menampilkan durasi token yang diredeem: 1 hari, 1 minggu, 1 bulan, 1 tahun, atau permanen.
- [x] Menambahkan regresi untuk revoke redeemed dan label durasi riwayat redeem.

- [x] Menampilkan waktu dan tanggal pengguna melakukan redeem pada riwayat redeem.
- [x] Merapikan tombol Tinjau, Selesaikan, dan Abaikan agar responsif dan tidak terpotong.
- [x] Menambahkan hapus satu laporan, hapus semua laporan, dan hapus laporan yang ditandai dengan konfirmasi serta audit.
- [x] Menambahkan regresi untuk timestamp redeem, layout tombol, dan penghapusan laporan.

- [x] Menambahkan metadata pembuat akun administrator tanpa menyimpan atau menampilkan password/token.
- [x] Menambahkan pengaturan untuk menetapkan atau mencabut label akun yang dibuat administrator.
- [x] Menampilkan label "Akun dibuat oleh administrator" pada daftar Akun Terdaftar dan detail Kelola.
- [x] Menambahkan audit serta regresi untuk label akun administrator.

- [x] Mengubah tombol Hapus AiraxCloud agar menghapus arsip dan riwayat secara permanen sehingga langsung hilang dari daftar.
- [x] Menambahkan retensi otomatis satu bulan per akun dengan menghapus cadangan paling lama jika tersedia dua atau lebih cadangan.
- [x] Menambahkan keterangan dan audit retensi AiraxCloud tanpa menampilkan isi cadangan.
- [x] Menambahkan regresi untuk hapus permanen, penghapusan riwayat, dan retensi cadangan tertua.

- [x] Menghapus tombol Tampilkan panel lanjutan dari konsol administrator tanpa menghapus fungsi pengaturan di halaman ringkas.
- [x] Menambahkan hapus pesan Room Global yang ditandai dan hapus seluruh pesan dengan konfirmasi serta audit.
- [x] Menambahkan hapus riwayat audit yang ditandai dan hapus seluruh riwayat dengan konfirmasi.
- [x] Menambahkan regresi untuk konsol ringkas dan penghapusan massal/terpilih.

- [x] Menambahkan kalender pop-up real-time pada ikon kalender halaman Keuangan.
- [x] Menampilkan nama hari, tanggal, hari libur, dan keterangan hari besar yang relevan.
- [x] Menambahkan pengingat manual dengan tanggal dan jam serta penyimpanan lokal.
- [x] Menghubungkan pengingat ke notifikasi/menu Beranda tanpa menghapus pengaturan alarm yang sudah ada.
- [x] Membuat kartu Beranda berganti antara Layanan Aira dan Kartu Ucapan setiap 5 detik dengan animasi spin satu kali.
- [x] Membuat kartu ucapan offline berdasarkan hari besar/event dan dapat dibagikan sebagai gambar.
- [x] Menambahkan saran otomatis untuk event libur yang akan datang.
- [x] Menambahkan regresi kalender, pengingat, rotasi kartu, dan kartu ucapan.

- [x] Memindahkan pengaturan kartu ucapan ke jendela khusus Opsi Developer.
- [x] Menambahkan sakelar animasi kartu ucapan dengan default aktif.
- [x] Menambahkan slider durasi 5–60 detik dengan default 10 detik.
- [x] Menambahkan pilihan efek pergantian teks saja atau seluruh kartu.
- [x] Menambahkan 10 pilihan animasi dengan pratinjau dan pilihan aktif.
- [x] Menghubungkan preferensi ke rotasi kartu Beranda dan mempertahankan pengaturan setelah restart.
- [x] Menambahkan regresi, typecheck, lint, dan screenshot untuk pengaturan kartu ucapan.

- [x] Mengubah default dan fallback animasi kartu ucapan menjadi Swipe/Geser dengan durasi default 10 detik.
- [x] Menambahkan regresi untuk default Swipe/Geser tanpa menimpa pilihan pengguna tersimpan.

- [x] Mengubah default dan fallback efek kartu ucapan menjadi teks saja, dengan Swipe/Geser dan 10 detik tetap dipertahankan.
- [x] Menambahkan regresi untuk default efek teks saja tanpa menimpa preferensi tersimpan.

- [x] Menambahkan pratinjau langsung untuk 10 animasi kartu ucapan di Opsi Developer.
- [x] Menambahkan pilihan format berbagi kartu: persegi, portrait, dan Story 9:16.
- [x] Menampilkan event mendatang dengan hitung mundur dan tawaran membuat kartu ucapan.
- [x] Menghubungkan tawaran event mendatang ke pembuatan kartu offline dan berbagi.
- [x] Menambahkan regresi serta validasi UI untuk tiga fitur kartu ucapan.

- [x] Menambahkan tipe dan default template kartu ucapan mewah.
- [x] Menambahkan pilihan template di Opsi Developer dengan pratinjau visual.
- [x] Menggunakan template terpilih pada pratinjau dan kartu ucapan yang dibagikan.
- [x] Menambahkan regresi serta validasi template kartu ucapan.

- [x] Menyesuaikan template kartu ucapan dengan tema event, termasuk Idul Fitri dan HUT Kemerdekaan Indonesia.
- [x] Mengaudit seluruh tombol dan status Room Obrolan Aira agar tidak ada kontrol yang mati.
- [x] Memperbaiki mode hands-free: dengar saat pengguna berbicara, deteksi jeda, lalu Aira merespons tanpa toggle mic berulang.
- [x] Mengganti balok audio dengan visual gelombang gradasi warna yang mengikuti amplitudo suara.
- [x] Memvalidasi izin mikrofon, transkripsi, respons suara, speaker, dan fallback web/native.
- [x] Menambahkan regresi serta pemeriksaan UI Room Obrolan Aira.

- [x] Mengaudit server Aira dan pola router/WebSocket yang sudah tersedia sebelum menambahkan signaling.
- [x] Menambahkan kontrak signaling room satu lawan satu dengan validasi session akun dan batas dua peserta.
- [ ] Menyiapkan konfigurasi ICE/STUN/TURN melalui environment yang aman, tanpa kredensial di source code.
- [ ] Menghubungkan client Room Obrolan Aira ke signaling dan RTCPeerConnection secara bertahap tanpa mengganggu hands-free.
- [x] Menambahkan regresi awal untuk URL signaling, event server, serta mempertahankan fallback tanpa provider.
- [x] Memvalidasi bahwa database tidak digunakan untuk menyimpan atau mengalirkan media audio/video.

- [ ] Mengaudit kemampuan native/web untuk `RTCPeerConnection` dan akses mikrofon/kamera.
- [ ] Menambahkan endpoint konfigurasi ICE/STUN/TURN yang hanya mengembalikan konfigurasi aman.
- [ ] Menambahkan secret TURN melalui pengelolaan environment, bukan source code.
- [ ] Menghubungkan Room Aira ke signaling dan peer connection dengan fallback hands-free.
- [ ] Menambahkan kontrol status WebRTC dan fallback jika koneksi gagal.
- [ ] Menambahkan regresi dan validasi pada web serta perangkat native.

- [x] Memeriksa apakah environment Aira sudah memiliki URL STUN/TURN dan kredensial relay.
- [x] Memeriksa apakah server Aira dapat menjalankan layanan TURN persisten atau hanya signaling.
- [x] Menyiapkan template konfigurasi aman untuk STUN/TURN; relay nyata belum diaktifkan karena endpoint/kredensial belum tersedia.
- [x] Memvalidasi endpoint `/api/webrtc/config` secara kode dan mendokumentasikan bahwa hasilnya kosong tanpa konfigurasi relay nyata.

- [ ] Mengaudit kemampuan hosting untuk menjalankan Coturn dan port UDP relay.
- [ ] Membuat kredensial TURN acak melalui secret manager, bukan source code.
- [ ] Mengaktifkan konfigurasi ICE server pada server Aira jika relay dapat dijalankan.
- [ ] Menghubungkan client Room Aira ke konfigurasi ICE dan mempertahankan fallback.
- [ ] Memvalidasi koneksi relay, endpoint ICE, signaling, dan status Room Aira.

- [x] Memeriksa apakah host relay TURN sudah tersedia pada environment atau konektor server Aira.
- [x] Memeriksa runtime Coturn/Docker, DNS publik, IP, dan port UDP/TCP relay.
- [x] Menyiapkan template konfigurasi host relay Aira; aktivasi runtime belum dapat dilakukan pada environment ini.
- [ ] Membuat kredensial relay secara aman dan menghubungkannya ke endpoint ICE setelah host relay tersedia.
- [ ] Memvalidasi keterjangkauan relay dari sisi aplikasi setelah host relay dan port media aktif.

- [x] Menetapkan status WebRTC sebagai signaling + STUN opsional tanpa TURN produksi.
- [x] Menampilkan status relay yang jelas ketika konfigurasi ICE kosong.
- [x] Mempertahankan fallback hands-free rekam/transkripsi/TTS tanpa bergantung pada WebRTC.
- [x] Menambahkan regresi untuk fallback dan status relay tidak tersedia.

- [x] Mengembalikan kartu ucapan menjadi widget Beranda berukuran normal.
- [x] Membuka pop-up pratinjau gambar hanya setelah widget diketuk.
- [x] Menambahkan tombol Simpan ke penyimpanan perangkat.
- [x] Menambahkan tombol Bagikan melalui sheet berbagi sistem, termasuk WhatsApp bila tersedia.
- [x] Menambahkan regresi dan validasi ukuran widget serta alur pop-up.

- [ ] Menyalin foto yang dikirim ke aset lokal dan memasangnya sebagai foto profil khusus ADMIN VAIRA.
- [ ] Menambahkan ucapan syukur panjang pada profil/foto admin.
- [ ] Menambahkan reaksi love dengan batas satu kali per pengguna per hari dan jumlah total.
- [ ] Menambahkan komentar foto dengan status menunggu tinjauan admin.
- [ ] Menambahkan daftar tinjauan, setujui, dan tolak komentar di menu admin.
- [ ] Memperbaiki reply Room Global agar kutipan menampilkan pesan asal dan ketukannya menggulir/menyorot pesan tersebut.
- [ ] Menambahkan regresi dan validasi untuk profil admin, reaksi, komentar, serta navigasi reply.

- [x] Menambahkan profil khusus ADMIN VAIRA dengan asset foto resmi lokal, badge verifikasi, ucapan terima kasih panjang, serta branding V A I R A  A I.
- [x] Menambahkan love profil ADMIN VAIRA dengan batas satu love per akun per hari dan hitungan tersinkron melalui database.
- [x] Menambahkan komentar foto ADMIN VAIRA dengan status pending dan panel administrator untuk setujui atau tolak.
- [x] Memperbaiki kutipan reply Room Global agar dapat ditekan, melompat ke pesan asal, dan memberi highlight sementara.
- [x] Menjalankan migration database sosial, typecheck, lint, dan 179 regression tests.
- [ ] Menyediakan TURN publik untuk WebRTC Room Global; masih menunggu infrastruktur relay eksternal.

- [x] Menambahkan gambar kiriman pengguna sebagai foto unggulan ADMIN VAIRA tanpa mengganti avatar atau foto profil utama.
- [x] Mengganti asset foto unggulan berukuran besar dengan WebP lokal terkompresi berukuran 188 KB; URL File Storage tetap menjadi opsi untuk asset produksi berikutnya.
- [x] Memvalidasi galeri foto unggulan dan tampilan profil; typecheck serta 179 test lulus.

- [x] Memastikan ketukan nama atau ikon ADMIN VAIRA di Room Global membuka profil publik dengan foto unggulan kiriman pengguna sebagai fallback yang selalu tersedia.
- [x] Menambahkan regresi untuk alur Room Global → profil ADMIN VAIRA → foto unggulan.

- [x] Memisahkan kalimat ajakan pada widget kartu ucapan dari teks final kartu yang disimpan atau dibagikan.
- [x] Memastikan pratinjau, Simpan, dan Bagikan menampilkan ucapan final tanpa pertanyaan.
- [x] Menambahkan regresi untuk teks final kartu ucapan.

- [x] Menambahkan hiasan tematik Maulid Nabi: lentera islami, bulan sabit, ornamen geometris, dan palet hijau-emas.
- [x] Menambahkan hiasan tematik HUT Kemerdekaan: bendera merah putih, pita, confetti, dan elemen ilustratif perlombaan.
- [x] Memastikan hiasan tematik tampil konsisten pada widget, pratinjau, hasil Simpan, dan hasil Bagikan tanpa checkpoint langsung.

- [x] Membuat ornamen kartu lebih meriah dengan beberapa lapisan dekorasi tematik dan animasi lembut.
- [x] Membuat komposisi sudut kartu lebih organik, tidak kaku, tetapi tetap aman untuk teks dan hasil capture.
- [x] Menambahkan kredit kecil di sudut bawah: “Dibuat oleh : VAIRA AI”.
- [x] Memvalidasi animasi dan dekorasi pada widget, pratinjau, Simpan, dan Bagikan tanpa checkpoint langsung.

- [x] Mengubah kartu ucapan dari panel kotak kaku menjadi komposisi scrapbook/editorial berlapis.
- [x] Menambahkan bingkai melengkung, pita/label, ornamen tepi mengalir, dan elemen dekorasi dengan sudut bervariasi.
- [x] Menyesuaikan tema Maulid Nabi dan HUT Kemerdekaan dalam gaya kartu desain yang lebih natural, bukan sekadar emoji.
- [x] Memastikan teks final dan kredit “Dibuat oleh : VAIRA AI” tetap terbaca dalam layout baru tanpa checkpoint langsung.

- [x] Menyederhanakan widget kartu ucapan agar teks dan isi tidak bertumpuk dengan ornamen.
- [x] Mempertahankan ornamen mewah hanya pada pratinjau, Simpan, dan Bagikan setelah widget ditekan.
- [x] Mengaudit alur layanan Aira AI, termasuk akses layar, koneksi, chat, dan respons kegagalan yang mudah dipahami.
- [x] Menambahkan regresi untuk perbedaan widget versus kartu final dan alur layanan Aira AI tanpa checkpoint langsung.

- [x] Menelusuri log server dan jalur invokeLLM untuk memastikan sumber pembatasan Aira.
- [x] Membuat perbedaan yang jelas antara kuota provider, limit model, kredensial, dan masalah koneksi.
- [x] Memperbaiki fallback atau pemilihan model bila ditemukan masalah konfigurasi tanpa menghapus pesan pengguna.
- [x] Menambahkan regresi untuk pesan error Aira dan status pemulihan layanan.

- [x] Membuat secret `AIRA_INTERNAL_API_KEY` acak untuk akses internal server Aira.
- [ ] Menambahkan validasi token internal pada endpoint server-ke-server yang relevan tanpa mengekspos token ke aplikasi mobile.
- [x] Menambahkan regresi keberadaan secret dan pemeriksaan endpoint kesehatan server.

- [x] Menetapkan self-host OpenAI-compatible sebagai jalur utama dan free-tier provider sebagai backup.
- [x] Menambahkan registry provider dengan prioritas, health state, timeout, dan cooldown.
- [x] Mengaktifkan auto-switch server-side tanpa rebuild APK serta menjaga pesan pengguna tetap aman.
- [x] Menambahkan regresi untuk urutan provider utama, fallback, dan kondisi semua provider tidak tersedia.

- [ ] Memverifikasi provider yang dapat diaktifkan secara sah berdasarkan endpoint dan kredensial yang tersedia.
- [ ] Mengaktifkan hanya provider yang health check-nya berhasil.
- [ ] Memastikan provider tanpa API key atau endpoint tetap berstatus nonaktif/menunggu konfigurasi.
- [ ] Menguji auto-switch antarprovider aktif dan mendokumentasikan status masing-masing.

- [x] Memverifikasi Forge provider yang sudah tersedia; endpoint `/v1/models` merespons HTTP 200.
- [ ] Menyediakan endpoint self-host dan kredensial backup provider agar jalur kedua dapat diaktifkan secara nyata.

- [ ] Mencari kandidat provider AI tambahan yang memiliki dokumentasi resmi dan akses gratis atau kredit gratis.
- [ ] Memverifikasi apakah kandidat memerlukan API key, token, akun, atau memiliki endpoint anonim yang sah.
- [ ] Menguji hanya endpoint yang legal dan tidak mem-bypass autentikasi atau limit provider.

- [ ] Memeriksa apakah secret SambaNova, Cloudflare Account ID, dan Cloudflare API token tersedia di server.
- [ ] Mengaktifkan provider baru hanya setelah health check berhasil.
- [ ] Memperbarui status auto-switch dan melaporkan provider yang benar-benar aktif.

- [x] Menetapkan Forge sebagai satu-satunya provider Aira yang aktif.
- [x] Menonaktifkan self-host, SambaNova, dan Cloudflare yang belum dikonfigurasi.
- [x] Memvalidasi Forge dan menyelesaikan proses tanpa checkpoint otomatis.

- [x] Memastikan composer Room Aira selalu berada di atas keyboard Android.
- [x] Menambahkan keyboard-aware inset dan scrolling agar input, lampiran, mic, dan kirim tetap terlihat.
- [x] Menambahkan regresi untuk fokus input dan pengiriman pesan saat keyboard terbuka.

- [x] Menambahkan layanan web Perchance dengan label yang jelas sebagai layanan eksternal.
- [x] Membuka URL resmi Perchance melalui browser eksternal tanpa menyalin API internal.
- [x] Menambahkan regresi navigasi layanan web Perchance.

- [x] Menambahkan akses Perchance AI ke menu generator dengan label “layanan eksternal”.
- [x] Memastikan atribusi Perchance tetap terlihat dan tidak mengklaim backend pihak ketiga sebagai milik Aira.
- [x] Menguji tombol buka Perchance dan navigasi kembali ke aplikasi.

- [x] Menghapus kartu Perchance dari tab Aira utama.
- [x] Menambahkan tombol Perchance ke menu ikon lampiran hanya untuk mode `hot_pro`.
- [x] Memastikan mode Aira biasa dan mode AI lain tidak menampilkan tombol tersebut.
- [x] Menambahkan regresi visibilitas tombol lampiran Perchance.

- [x] Menelusuri log request chat Aira dan respons endpoint Forge.
- [x] Menguji payload chat serta model yang dipilih setelah health check `/v1/models`.
- [x] Memperbaiki pemetaan error agar `usage exhausted` Forge tidak lagi disamarkan sebagai masalah koneksi.
- [x] Menambahkan regresi untuk limit dan ketersediaan provider Forge.

- [x] Memperbaiki hitung mundur kartu ucapan berdasarkan tanggal lokal hari ini, bukan nilai yang tersimpan lama.
- [x] Menambahkan refresh otomatis saat tanggal lokal berganti.
- [x] Menambahkan regresi untuk perubahan 6 hari menjadi 5 hari setelah pergantian tanggal.

- [x] Memperbaiki teks widget agar tidak terpotong pada layar sempit.
- [x] Memperkecil kredit “Dibuat oleh : VAIRA AI” dan memindahkannya ke sudut kanan bawah kartu.
- [x] Menambahkan editor teks ucapan sebelum Simpan atau Bagikan.
- [x] Menambahkan pilihan font dekoratif yang dapat dipilih pengguna.
- [x] Menambahkan regresi untuk widget, editor teks, font, dan hasil capture kartu.

- [x] Memastikan pratinjau crop foto Room Global menampilkan tombol Batal dan Kirim.
- [x] Menghubungkan Batal untuk membuang crop dan Kirim untuk melanjutkan upload/pengiriman foto.
- [x] Menambahkan regresi aksi crop pada layar kecil dan area aman perangkat.

- [x] Audit penyebab Aira tetap menampilkan provider usage exhausted pada perangkat pengguna.
- [x] Memperbaiki auto-switch agar provider cadangan benar-benar dicoba ketika provider utama terkena batas.
- [x] Menambahkan regresi untuk jalur failover dan pesan status Aira yang dapat dipahami.

- [x] Audit dan perbaiki pemuatan profil publik peserta Room Global yang saat ini menampilkan profil tidak tersedia.
- [x] Tambahkan tombol Edit dan Simpan untuk bio, foto profil, serta foto unggulan pengguna.
- [x] Simpan perubahan profil ke server dan tampilkan data publik kepada peserta lain sesuai privasi.

- [x] Tambahkan animasi swipe/geser bubble untuk memulai reply dengan efek pesan tertarik.
- [x] Perbaiki menu tahan pesan pengguna lain agar opsi aksi yang telah ditentukan tampil tepat dan berfungsi.
- [x] Tambahkan regresi gesture swipe-to-reply dan menu tahan pesan Room Global.

- [x] Pisahkan tap foto/nama profil dari tahan isi bubble agar profil tetap terbuka sesuai target.
- [x] Hentikan auto-scroll ke bawah saat pengguna membaca pesan lama dan pertahankan posisi scroll.
- [x] Tambahkan regresi target profil dan perilaku scroll manual Room Global.

- [x] Tambahkan indikator “Seseorang sedang mengetik…” privat pada Room Global tanpa menampilkan identitas pengetik.
- [x] Sinkronkan status mengetik dengan timeout agar tidak tertinggal saat pengguna berhenti mengetik.
- [x] Tambahkan regresi indikator mengetik dan validasi tampilan composer.

- [x] Kecilkan tulisan dan ikon indikator “Seseorang sedang mengetik…” agar tetap terbaca namun lebih halus.
- [x] Validasi ukuran indikator pada portrait dan regresi Room Global.

- [x] Siapkan sound effect ringan untuk Kirim, Terkirim, mulai mengetik, berhenti mengetik, dan gagal mengirim.
- [x] Hubungkan sound effect ke event Room Global dengan kontrol volume dan pencegahan bunyi berulang.
- [x] Tambahkan regresi audio event dan jelaskan seluruh perubahan tanpa checkpoint.

- [x] Otomatiskan leave room ketika pengguna menekan kembali atau meninggalkan halaman Room Global.
- [x] Cegah pemanggilan leave ganda saat tombol Keluar room dan unmount berjalan bersamaan.
- [x] Tambahkan regresi bahwa peserta tidak lagi aktif setelah keluar halaman.

- [ ] Verifikasi batasan resmi Perchance untuk generator gambar dan API publik.
- [ ] Bandingkan opsi embed web, generator khusus, dan provider server-side untuk Aira.
- [ ] Tentukan pilihan integrasi setelah pengguna menyetujui trade-off.

- [ ] Uji proxy server Aira ke Perchance dengan kontrak prompt, gaya, bentuk, dan hasil gambar.
- [ ] Tambahkan timeout, rate limit, validasi input, dan fallback provider.
- [ ] Hubungkan UI generator gambar Aira ke jalur proxy tanpa mengekspos endpoint internal.
- [ ] Tambahkan regresi untuk respons berhasil, timeout, error eksternal, dan prompt berbahaya.

- [ ] Menunggu endpoint/API resmi Perchance untuk jalur proxy pilihan B.
- [ ] Validasi format request, autentikasi, respons gambar, rate limit, dan batas penggunaan sebelum implementasi.

- [x] Validasi URL ai-text-to-image-generator sebagai endpoint resmi, bukan sekadar halaman generator.
- [x] Catat hasil pemeriksaan request, respons gambar, dan batas proxy untuk URL tersebut.

- [x] Periksa apakah https://perchance.org/welcome memuat dokumentasi API resmi atau hanya halaman pengantar.
- [x] Perbarui catatan kelayakan proxy berdasarkan hasil verifikasi URL welcome.

- [ ] Baca dan validasi panduan DIY API Perchance untuk generator VAIRA.
- [ ] Rancang preset gambar, branding V A I R A A I, dan aturan prompt aman.
- [ ] Tentukan kontrak API generator VAIRA serta kebutuhan konfigurasi server Aira.

- [x] Siapkan spesifikasi dan kode generator gambar khusus V A I R A A I untuk ditinjau.
- [ ] Siapkan langkah publikasi Perchance setelah rancangan disetujui, tanpa meminta password melalui chat.

- [ ] Ubah arah implementasi: Perchance menjadi sumber layanan gambar di dalam Aira.
- [ ] Tentukan UI Aira untuk membuka, mengirim prompt, dan menerima hasil Perchance tanpa menebak API internal.

- [x] Validasi integrasi native Perchance tanpa WebView dan tanpa API key pengguna.
- [x] Jangan membuat endpoint tebakan atau meminta API key pengguna; hentikan bila jalur resmi tidak tersedia.

- [x] Tambahkan WebView Perchance di layanan Aira dengan tombol kembali, loading, error, dan buka eksternal.
- [x] Audit dan perbaiki force close saat robot SPCA ditekan.
- [x] Tambahkan regresi navigasi Perchance dan fallback aman robot SPCA.

- [x] Verifikasi ulang apakah tekan Robot SPCA masih menyebabkan force close pada runtime.
- [x] Periksa log SPCA dan tambahkan regresi untuk sumber crash yang ditemukan.

- [x] Jalankan ulang typecheck dan regresi stabilitas Robot SPCA.
- [x] Jalankan seluruh suite dan pemeriksaan preview tanpa checkpoint.

- [x] Audit mengapa akun ADMIN VAIRA ditolak saat menyimpan snapshot global.
- [x] Selaraskan pemeriksaan admin, sesi, dan koneksi server tanpa melemahkan akses pengguna biasa.
- [x] Tambahkan regresi akses snapshot untuk administrator terverifikasi.

- [x] Validasi akhir: konsol admin yang sudah login dapat membaca status dan menyimpan snapshot global.

- [x] Audit query dan tombol hapus riwayat token.
- [x] Lindungi token aktif agar tidak ikut terhapus atau disembunyikan.
- [x] Tambahkan regresi token aktif, dicabut, dan kedaluwarsa.

- [x] Audit gesture drag Robot SPCA dan clamp posisi terhadap ukuran layar.
- [x] Validasi robot dapat menempel di tepi tanpa keluar layar.

- [x] Audit alur lokasi presisi waktu salat, izin, timeout, dan status memuat.
- [x] Tambahkan fallback lokasi tersimpan atau manual ketika lokasi perangkat gagal.
- [x] Validasi jadwal waktu salat tidak menggantung dan memiliki status error/coba lagi yang jelas.

- [x] Audit akar masalah lokasi waktu salat yang tidak diperoleh pada perangkat.
- [x] Perbaiki konfigurasi atau alur geolokasi berdasarkan temuan runtime.
- [x] Tambahkan regresi untuk penyebab lokasi gagal, bukan hanya timeout.

- [x] Tambahkan pilihan lokasi manual kota/kecamatan.
- [x] Tampilkan sumber koordinat, tingkat akurasi, dan waktu sinkronisasi.
- [x] Tambahkan cache jadwal offline serta pembaruan lokasi cerdas.
- [x] Deteksi pergantian tanggal/zona waktu dan segarkan jadwal secara aman.
- [x] Tambahkan tautan pengaturan lokasi perangkat dan pilihan metode perhitungan.

- [x] Riset sumber suara adzan gratis tanpa API key dan verifikasi lisensinya.
- [x] Pilih strategi audio lokal yang stabil untuk Android/iOS.
- [x] Integrasikan pilihan suara adzan dan validasi pemutaran alarm.

- [x] Audit dependency Expo dan pertahankan seluruh fitur yang sudah berjalan.
- [x] Validasi WebView Perchance, native audio, Room Global, lokasi salat, SPCA, dan seluruh suite setelah penyelarasan.

- [x] Pertahankan satu aset OGG adzan dan hapus MP3/WAV adzan yang tidak diperlukan.
- [x] Sesuaikan konfigurasi alarm dan regresi audio dengan aset OGG yang dipertahankan.

- [x] Kompres aset OGG adzan di bawah 1 MB sesuai persetujuan pengguna dan validasi ulang checkpoint.

- [x] Tambahkan tombol kompas pada menu Waktu salat.
- [x] Bangun halaman kompas arah kiblat dengan koordinat lokasi dan tombol Oke.
- [x] Tambahkan regresi perhitungan arah kiblat dan navigasi kompas.

- [x] Audit alur hapus bank/dompet dan keterkaitannya dengan riwayat mutasi.
- [x] Tentukan dan terapkan konfirmasi hapus dompet beserta mutasi terkait secara aman.
- [x] Tambahkan regresi agar mutasi dompet terhapus tidak memengaruhi dompet lain atau sinkronisasi.

- [x] Audit transfer yang sumber atau tujuannya dihapus agar saldo tidak tampak seimbang secara palsu.
- [x] Terapkan aturan rekonsiliasi transfer yatim saat dompet dihapus.
- [x] Tambahkan regresi saldo transfer dan validasi sinkronisasi dompet.

- [x] Kembalikan hapus transfer terkait dompet ke perilaku sebelum rekonsiliasi otomatis.
- [x] Perbarui regresi dan validasi ulang suite setelah rollback perilaku.

- [x] Audit model Rencana, transaksi, pengingat, dan pintasan Rencana cepat untuk Keuangan Pintar.
- [x] Rancang perhitungan gaji, kebutuhan rutin, target mingguan/harian, checklist, dan sisa saldo.
- [x] Tambahkan fitur Keuangan Pintar dengan analisis offline/online, pengingat, dan batasan regulasi aman.
- [x] Tambahkan regresi serta validasi Keuangan Pintar tanpa checkpoint.

- [x] Audit Keuangan Pintar untuk profil keluarga dan kategori kebutuhan rumah tangga lengkap.
- [x] Tambahkan profil anggota rumah, batas anggaran fleksibel, dan rekomendasi konsumsi offline.
- [x] Tambahkan kebutuhan pangan, utilitas, transportasi, hutang, kesehatan, pendidikan, komunikasi, kebersihan, dan dana darurat.
- [x] Tambahkan regresi skenario keluarga dan pengeluaran melebihi batas tanpa checkpoint.

- [x] Audit pemisahan data Keuangan Pintar dan profil sehat dari laporan/sinkronisasi.
- [x] Tambahkan profil individu opsional: nama, umur, tinggi, berat, dan kebutuhan dasar.
- [x] Tambahkan detail pangan opsional: sayur, lauk, beras, bumbu pokok, harga, jumlah, dan frekuensi.
- [x] Tambahkan rekomendasi anggaran sehat yang bersifat estimasi, lokal, dan tidak menjadi transaksi.
- [x] Tambahkan regresi privasi serta validasi agar data sehat tidak masuk laporan atau sinkronisasi.

- [x] Pastikan form Keuangan Sehat tersimpan lokal dan tidak terhapus otomatis.
- [x] Tambahkan hapus individu, hapus bahan, dan hapus semua dengan konfirmasi.
- [x] Tambahkan ekspor PDF khusus data Keuangan Sehat tanpa data laporan keuangan.
- [x] Tambahkan ikon lucu dan sesuai pada profil, bahan, pangan, kesehatan, hapus, simpan, dan ekspor.
- [x] Tambahkan regresi persistensi, privasi, hapus, dan ekspor PDF.

- [x] Perbaiki tombol Keuangan Pintar agar langsung membuka panel smart.
- [x] Tampilkan tombol Keuangan Pintar yang jelas pada halaman Rencana.
- [x] Tambahkan regresi route dan parameter pembuka panel.

- [x] Perbaiki ikon tombol Keuangan Pintar yang tidak muncul di menu Rencana.
- [x] Perbaiki handler navigasi seluruh tombol Rencana Cepat yang tidak membuka form.
- [x] Tambahkan dan jalankan regresi ikon serta navigasi Rencana Cepat.

- [x] Analisis akar masalah event tekan, overlay, parsing route, dan ikon Rencana Cepat.
- [x] Validasi semua tombol Rencana Cepat pada alur Beranda dan halaman Rencana.

- [x] Satukan Profil Rumah Tangga dan Keuangan Sehat dalam satu data lokal bersama; tambahkan tinggi dan berat.
- [x] Pindahkan Pemasukan ke bagian paling atas dan tambahkan pemasukan tambahan opsional.
- [x] Ubah checklist menjadi alur bertahap kategori → subkategori → detail/jenis → nominal.
- [x] Buat percabangan transportasi: motor/mobil/angkot/ojol, lalu detail biaya yang sesuai.
- [x] Buat percabangan pangan: sayur/beras/bawang/bumbu, jenis atau merek, lalu nominal.
- [x] Kategorikan kebutuhan checklist secara otomatis tanpa memasukkan data Keuangan Sehat ke laporan keuangan.
- [x] Tambahkan regresi untuk penyatuan data lokal dan alur checklist bertahap.

- [x] Rapikan lebar kotak form agar tidak melewati batas layar pada mobile dan web.
- [x] Tambahkan pertanyaan adaptif untuk transportasi, pangan, listrik, dan kategori kebutuhan lain.
- [x] Simpan detail pembelian seperti merek, jumlah, satuan, nominal, dan tanggal beli.
- [x] Tambahkan perbandingan harga offline dengan kisaran referensi yang diberi label sebagai estimasi.
- [x] Tambahkan regresi untuk layout responsif dan kategori adaptif.

- [x] Pindahkan detail Transportasi ke dalam wizard Tambah kebutuhan checklist.
- [x] Pindahkan detail Keuangan Sehat dan bahan pangan ke dalam wizard checklist.
- [x] Hapus panel Transportasi dan Keuangan Sehat lama dari Keuangan Pintar.
- [x] Audit urutan pertanyaan adaptif dan kategorisasi otomatis.
- [x] Tambahkan regresi untuk memastikan panel lama hilang dan data kesehatan tetap lokal-only.

- [x] Jadikan Keuangan Sehat sebagai judul konteks seluruh form pangan lokal.
- [x] Hapus opsi kategori Keuangan Sehat karena sudah diwakili oleh Pangan.
- [x] Pindahkan ekspor PDF ke bagian paling bawah sebagai ekspor seluruh laporan.
- [x] Ganti Analisis Aira online menjadi Analisis Aira dan jalankan otomatis saat halaman dibuka.
- [x] Jadikan tombol Analisis Aira sebagai muat ulang analisis.
- [x] Tambahkan regresi untuk alur judul, kategori, ekspor, dan analisis otomatis.

- [x] Tambahkan kalender mini pada setiap field tanggal Keuangan Pintar.
- [x] Jadikan semua field checklist opsional, termasuk nominal dan tanggal.
- [x] Tambahkan regresi untuk penyimpanan data parsial dan date picker.

- [x] Hapus tombol dan keterangan ekspor Keuangan Sehat terpisah.
- [x] Ubah ekspor laporan gabungan menjadi Ekspor Excel.
- [x] Tambahkan analisis porsi makan spesifik per anggota berdasarkan profil lokal.
- [x] Tambahkan regresi untuk ekspor tunggal dan analisis protein/karbohidrat/porsi.

- [x] Tambahkan pilihan pola makan opsional pada profil anggota.
- [x] Tambahkan catatan alergi atau pantangan opsional pada profil anggota.
- [x] Sesuaikan Analisis Aira berdasarkan pola makan dan alergi tanpa menyinkronkan data kesehatan.
- [x] Tambahkan regresi untuk penyimpanan lokal dan rekomendasi yang dipersonalisasi.

- [x] Tambahkan pilihan Ekspor PDF untuk laporan keuangan.
- [x] Pertahankan pilihan Ekspor Excel untuk laporan keuangan.
- [x] Pastikan kedua format tidak memasukkan data Keuangan Sehat lokal.
- [x] Tambahkan regresi untuk tombol dan handler ekspor PDF/Excel.

- [x] Audit aset gambar yang tidak direferensikan atau duplikat.
- [x] Susun kandidat aman untuk dihapus beserta estimasi penghematan.

- [x] Hapus kandidat aset yang sudah terbukti tidak direferensikan.
- [x] Pertahankan semua aset wajib konfigurasi platform.
- [x] Validasi referensi source dan ukuran aset setelah pembersihan.

- [ ] Gabungkan ikon mic dan speaker ke kartu status Room Global.
- [ ] Hapus teks Mic mati dan kartu Peserta Audio, pertahankan gelombang lima garis.
- [ ] Geser tombol pensil ke kiri dan perluas area percakapan.
- [ ] Ganti tombol kembali dan tulisan Keluar room dengan ikon power merah di kiri atas.
- [ ] Tambahkan regresi untuk layout dan interaksi Room Global baru.

## Refaktor Room Global — menunggu persetujuan pengguna

- [x] Menggabungkan kontrol mikrofon dan speaker ke kartu status Room Global.
- [x] Menghapus label status mic redundan dan kartu peserta audio terpisah.
- [x] Menyisakan strip peserta audio ringkas dengan gelombang lima garis, avatar, dan ikon speaker.
- [x] Mengganti navigasi kembali dengan ikon power merah yang memanggil konfirmasi keluar room.
- [x] Memperluas area percakapan dan merapatkan jarak antar elemen pada viewport mobile.
- [x] Memperbarui regresi global-room-audio dan minor-ux-regression untuk layout baru.
- [x] Validasi: TypeScript lulus, lint lulus dengan warning Node non-fungsional, 69 file test dan 252 test lulus, git diff --check lulus.
- [ ] Review pengguna untuk layout Room Global sebelum checkpoint berikutnya.
- [ ] Buat checkpoint hanya setelah pengguna menyetujui layout Room Global.

## Perbaikan overlay Robot SPCA — menunggu validasi

- [x] Saat analisis dimulai, hentikan gerak patroli sementara gelembung analisis tampil agar teks dapat dibaca.
- [x] Pastikan gelembung teks tetap mengikuti posisi robot SPCA selama robot bergerak atau mengelak.
- [x] Saat robot disentuh berulang kali, tampilkan gelembung respons baru, lakukan gerak mengelak, lalu berhenti sementara sampai gelembung hilang.
- [x] Setelah gelembung selesai, lanjutkan patroli pasif tanpa mengubah pengaturan SPCA yang sudah ada.
- [x] Tambahkan atau perbarui regresi untuk timer gelembung, pause/resume patroli, dan sentuhan berulang.
- [x] Validasi typecheck, test, lint, dan preview tanpa membuat checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Perbaikan batas geser Robot SPCA aktif — menunggu validasi

- [x] Pisahkan ukuran badan/hitbox Robot SPCA dari ukuran radar, aura, dan gelombang dekoratif.
- [x] Izinkan badan Robot SPCA menyentuh tepi kiri, kanan, atas, dan batas bawah yang aman tanpa melewati layar.
- [x] Pastikan radar atau gelombang boleh melampaui area hitbox tanpa menggeser batas posisi robot.
- [x] Tambahkan regresi untuk clamp badan robot dan validasi posisi tepi layar.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Aira AI Browser — implementasi awal tanpa checkpoint

- [x] Menambahkan route internal Aira AI Browser dengan WebView di dalam aplikasi.
- [x] Menambahkan address/search bar, navigasi kembali/maju/muat ulang, dan indikator loading.
- [x] Menambahkan tab browsing lokal dengan tab baru dan penutupan tab.
- [x] Menambahkan bookmark, riwayat, dan mode privat berbasis AsyncStorage/local state.
- [x] Menambahkan panel unduhan dengan pembeda unduhan biasa dan mode super cepat secara jujur sebagai mode prioritas/antrean.
- [x] Menambahkan akses Aira AI Browser di Beranda dan Rencana Cepat.
- [x] Menambahkan regresi routing, internal WebView, dan penyimpanan browser.
- [x] Menjalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Penyesuaian pintasan Aira AI Browser

- [x] Hapus pintasan Aira AI Browser dari Aksi Cepat Beranda.
- [x] Pertahankan pintasan Aira AI Browser di Rencana Cepat.
- [x] Validasi regresi tanpa membuat checkpoint.

## Default halaman awal Aira AI Browser

- [x] Ubah tampilan awal agar langsung membuka www.google.com.
- [x] Hapus tombol contoh Example.com dan Wikipedia dari tampilan awal.
- [x] Validasi route browser tanpa membuat checkpoint.

## Perbaikan akses internet Aira AI Browser

- [x] Tangani Google/WebView yang gagal dengan `net::ERR_BLOCKED_BY_RESPONSE`.
- [x] Hentikan loading yang menggantung dan tampilkan status error jaringan yang jelas.
- [x] Perbaiki konfigurasi kompatibilitas WebView tanpa membuka browser eksternal secara otomatis.
- [x] Tambahkan regresi untuk URL default Google, error network/http, dan retry.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Perbaikan halaman situs gagal dimuat

- [x] Bedakan timeout, error koneksi, dan penolakan navigasi oleh situs/WebView.
- [x] Tampilkan diagnosis yang sesuai untuk situs yang menolak WebView, bukan pesan generik.
- [x] Perbaiki retry agar memuat ulang URL aktif dan mereset fallback dengan benar.
- [x] Tambahkan regresi untuk www.xnxx.com atau domain non-Google yang gagal dimuat.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Peningkatan pembukaan situs Aira AI Browser

- [x] Tingkatkan kompatibilitas pembukaan situs pada WebView native.
- [x] Tambahkan fallback aman untuk URL yang ditolak atau gagal dimuat.
- [x] Pastikan retry mengulang URL aktif dan tidak mengunci tab pada status error.
- [x] Tambahkan regresi untuk pembukaan domain umum dan domain yang menolak embedded browser.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Perbaikan akses dan UI Aira AI Browser

- [x] Perbaiki situs yang masih timeout atau tidak terbuka pada WebView native.
- [x] Ganti ikon Rencana Cepat menjadi ikon browser yang sesuai dan label “Aira AI Browser”.
- [x] Ubah header awal browser menjadi ikon besar dengan label kecil “Aira AI Browser”.
- [x] Posisikan kolom pencarian sejajar di samping identitas browser secara ringkas.
- [x] Tambahkan tab Pengaturan di sebelah Unduhan.
- [x] Tambahkan regresi untuk UI baru, tab pengaturan, dan strategi retry situs.
- [x] Jalankan typecheck, test, lint, dan preview mobile tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Koreksi ruang lingkup ikon browser

- [x] Jangan mengubah ikon atau struktur menu Rencana Cepat secara umum.
- [x] Ganti hanya ikon tombol Aira AI Browser pada Rencana Cepat.

## Audit browsing dan perapihan header Aira AI Browser

- [x] Perkecil kolom pencarian dan sisakan ruang aman untuk ikon tab.
- [x] Perbaiki spacing header agar ikon, label, pencarian, dan tab tidak bertabrakan.
- [x] Analisis akar masalah browsing yang terus loading atau gagal memuat.
- [x] Perbaiki alur timeout, fallback, remount WebView, dan retry berdasarkan penyebab yang ditemukan.
- [x] Tambahkan regresi layout dan diagnosis kegagalan browsing.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Audit loading dan tombol Home browser

- [x] Perkecil lagi kolom pencarian agar ikon tab terlihat penuh pada perangkat sempit.
- [x] Tambahkan tombol Home di antara tombol navigasi sebelum dan sesudah.
- [x] Audit lifecycle WebView, overlay loading, timeout, dan event navigasi karena Google juga gagal dimuat.
- [x] Perbaiki penyebab loading palsu atau WebView yang terus menunggu.
- [x] Tambahkan regresi tombol Home, layout header, dan diagnosis Google gagal dimuat.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Audit sistem browsing ERR_BLOCKED_BY_RESPONSE

- [x] Audit apakah interceptor `onShouldStartLoadWithRequest` memblokir redirect, subframe, atau skema yang dibutuhkan situs.
- [x] Audit lifecycle overlay loading dan event `onLoadEnd`, `onError`, `onHttpError`, serta timeout.
- [x] Audit fallback user-agent dan remount WebView agar tidak membentuk loop atau mempertahankan error lama.
- [x] Uji URL Google dan URL TikTok contoh secara aman pada alur browser proyek.
- [x] Perbaiki akar masalah yang ditemukan dan tambahkan regresi.
- [x] Jalankan typecheck, test, lint, dan preview tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Penuntasan total pembukaan situs

- [x] Pastikan URL HTTPS biasa dapat dimuat di WebView tanpa terjebak pada overlay loading.
- [x] Pastikan error main-frame tidak tertimpa oleh onLoadEnd atau timeout lama.
- [x] Pastikan fallback Google, mode desktop, retry, dan browser sistem memiliki alur yang jelas dan tidak berulang tanpa akhir.
- [x] Pastikan URL TikTok/domain yang menolak WebView memberikan pemulihan yang benar.
- [x] Tambahkan regresi kriteria keberhasilan untuk Google, example.com, Wikipedia, dan domain yang ditolak.
- [x] Jalankan seluruh validasi tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Diagnosis ulang native Android WebView

- [ ] Audit dependency react-native-webview, plugin Expo, permission INTERNET, dan konfigurasi Android.
- [ ] Tambahkan jalur uji domain sederhana seperti example.com untuk membedakan kerusakan WebView dari kebijakan domain.
- [ ] Audit apakah native WebView yang benar-benar terpasang pada build pengguna sudah memuat konfigurasi terbaru.
- [ ] Perbaiki konfigurasi native Android yang menjadi penyebab jika ditemukan.
- [ ] Tambahkan regresi untuk domain sederhana, Google, TikTok, dan error main-frame.
- [ ] Jalankan validasi lengkap tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Perbaikan Google → TikTok

- [x] Audit URL hasil pencarian Google saat tautan TikTok ditekan.
- [x] Pastikan redirect, target blank, dan navigasi top-level tidak diblokir oleh interceptor.
- [x] Perbaiki perpindahan dari hasil Google ke URL TikTok tanpa mengganggu pencarian Google.
- [x] Tambahkan regresi skenario search-to-site dan fallback bila target menolak WebView.
- [x] Jalankan validasi tanpa checkpoint.
- [x] Menunggu persetujuan pengguna sebelum membuat checkpoint.

## Integrasi Perchance dan kontrol browser

- [x] Ubah tombol Perchance.org agar membuka URL di Aira AI Browser internal.
- [x] Perbaiki tombol Home agar terlihat dan mengembalikan tab ke Google.
- [x] Perbaiki tombol Tab agar terlihat penuh dan membuka panel tab aktif.
- [x] Tambahkan regresi Perchance → browser, Home, dan Tab.
- [x] Jalankan validasi lengkap tanpa checkpoint terlebih dahulu.
- [x] Tandai seluruh item selesai sebelum membuat checkpoint.


## Independent Copy Session Note

This is a new independent copy of the source project. Existing source-project checklist items remain as historical context only and will not be continued automatically. New items will be added only after the user explicitly requests the next change, investigation, or validation.

Current copied-project focus from the source summary: Aira AI Browser, Perchance AI integration, Quick Plans shortcut, WebView navigation handling, Secure Tab fallback, multi-tab/private browsing, bookmarks, history, downloads, and Room Global audio/layout refinements.


## New Request: Complete Gradually and Carefully

- [x] Audit the copied project structure, current feature implementation, tests, and runtime logs.
- [x] Identify and prioritize functional issues in the Aira AI Browser and related integrations.
- [x] Fix issues incrementally with focused changes and regression coverage.
- [x] Validate the main browser, Perchance AI, Rencana Cepat, and navigation flows through automated regression coverage.
- [x] Review native-only limitations and document anything requiring device/build validation.
- [x] Save a final checkpoint after validation.

## Server Separation and Baseline Comparison

- [x] Superseded: keep the new server as the isolated primary environment for this independent copy.
- [x] Superseded: treat the former server as read-only baseline for controlled feature comparisons.
- [ ] Compare browser, Perchance AI, Rencana Cepat, and API health behavior using matching test scenarios.
- [x] Document configuration differences without copying production data or secrets automatically.

## Primary Server and Standby Backup

- [x] Keep the former server as the active primary service and do not alter it during standby preparation.
- [x] Prepare this independent copy as a code-and-schema standby recovery environment without automatic production-data synchronization.
- [x] Audit source code, configuration, database schema, user-managed secrets, and backup artifacts needed for recovery.
- [x] Document a controlled recovery and comparison procedure for the standby copy.
- [x] Prevent a normal Metro exit from terminating the standby API server during local development.
- [x] Run TypeScript, lint, API health, browser regression, and full regression validation on the standby copy.
- [x] Configure separate standby credentials before enabling administrator or internal API verification outside test mode.
- [x] Import a user-authorized export of primary-server data only if a full data-recovery replica is required.

## Konfigurasi Kredensial Standby

- [x] Mengumpulkan username administrator, password administrator, dan AIRA_INTERNAL_API_KEY khusus server standby melalui isian aman.
- [x] Memvalidasi konfigurasi kredensial standby tanpa menampilkan nilai rahasia.

## Pemeriksaan Akhir

- [x] Memeriksa ulang status proses, endpoint kesehatan, kredensial standby, dan hasil validasi terakhir.

## Perbaikan Build Android

- [x] Mengumpulkan log dan memeriksa konfigurasi Expo/Android untuk kegagalan tahap prebuild.
- [x] Memperbaiki hanya penyebab build yang dapat dikonfirmasi.
- [x] Menjalankan validasi konfigurasi Android dan regresi sebelum Publish dicoba ulang.
- [x] Menyimpan checkpoint kesiapan build yang telah diperbaiki.
- [x] Mengganti nama aset suara notifikasi Android agar memakai nama resource yang valid tanpa tanda hubung.

## Perbaikan Koneksi Login dan SERVER DATABASE

- [x] Menelusuri respons HTML yang diterima aplikasi native pada alur login dan verifikasi administrator.
- [x] Memperbaiki resolusi URL API agar aplikasi native menerima respons JSON dari server.
- [x] Memvalidasi login manual dan pembukaan SERVER DATABASE administrator tanpa error parsing JSON.
- [x] Mencegah APK standalone memakai URL preview sandbox yang sudah tidak sesuai sebagai API server.
- [x] Menyimpan checkpoint koneksi login dan SERVER DATABASE yang telah tervalidasi.

## Audit Pemulihan Cadangan dan Sinkronisasi Dua Server

- [x] Memeriksa ketersediaan arsip cadangan pengguna, status database primary, dan database standby tanpa memindahkan data.
- [x] Memetakan perbedaan skema, kredensial, endpoint, serta risiko konflik antara server utama dan server backup.
- [x] Menyusun desain pemulihan dan auto-migrasi yang aman, dengan satu arah sumber kebenaran, audit, dan rollback.
- [x] Meminta dan menerima persetujuan eksplisit sebelum impor data ke SERVER DATABASE 2 diaktifkan.

## Pilihan C — Replika Database Infrastruktur

- [x] Superseded: replikasi otomatis diganti oleh backup manual sesuai arahan pengguna.
- [x] Superseded: prasyarat replikasi infrastruktur tidak diterapkan agar server lama tetap primary tanpa sinkronisasi otomatis.
- [x] Superseded: koneksi replikasi tidak diaktifkan.

## Backup Manual Primary ke SERVER DATABASE 2

- [x] Menetapkan server lama sebagai primary dan menonaktifkan rencana replikasi otomatis.
- [x] Menyimpan kredensial administrator yang diberikan melalui konfigurasi rahasia, bukan source code atau chat.
- [x] Menambahkan tombol SERVER DATABASE 2 pada menu Administrator dan layar kontrol backup manual.
- [ ] Menambahkan alur backup manual dari primary ke standby dengan pratinjau, konfirmasi, audit, dan tanpa penimpaan data otomatis.
- [ ] Menambahkan pemulihan terkontrol melalui AiraXCloud atau berkas AiraXBackup yang tervalidasi.
- [x] Memvalidasi akses kredensial saat login atau perpindahan akun tanpa menampilkan nilai rahasia.

## Pemulihan dari Ekspor Database SERVER DATABASE Lama

- [x] Menyiapkan SERVER DATABASE 2 untuk menerima ekspor database lengkap yang disetujui dari server lama.
- [x] Memeriksa kompatibilitas skema, urutan impor, metadata AiraXCloud, dan inventaris berkas storage sebelum data ditulis.
- [x] Meminta dan menerima ekspor database yang berwenang sebelum menjalankan impor pemulihan.

## Kegagalan Unduhan Ekspor SERVER DATABASE Lama

- [x] Mendiagnosis kegagalan unduhan/ekspor dari panel Database tanpa mengubah data server lama.
- [x] Menyiapkan jalur ekspor pemulihan alternatif yang tidak bergantung pada unduhan panel yang gagal.

## Validasi Berkas AiraXBackup yang Diunggah

- [x] Memeriksa integritas, versi, struktur, dan cakupan data berkas AiraXBackup tanpa mengimpor.
- [x] Memetakan data backup yang tervalidasi ke prosedur pemulihan SERVER DATABASE 2 yang tidak mengubah server lama.
- [x] Menerima persetujuan untuk pemulihan dari sumber backup yang dipilih; data server dipulihkan dari ekspor SQL lengkap, bukan dari JSON satu pengguna.

## Validasi Ekspor SQL SERVER DATABASE Lama

- [x] Mengambil dan memeriksa ekspor SQL yang diberikan tanpa mengeksekusi perintah database.
- [x] Memetakan tabel, jumlah record, dan dependensi storage terhadap skema SERVER DATABASE 2.
- [x] Menyusun impor pemulihan yang tidak merusak dan meminta persetujuan akhir sebelum data ditulis.

## Impor SQL Disetujui ke SERVER DATABASE 2

- [x] Menerima persetujuan eksplisit untuk mengimpor data SQL ke SERVER DATABASE 2.
- [x] Menyiapkan skrip impor data saja yang mengecualikan perubahan skema, sesi lama, dan aktivasi storage cloud.
- [x] Menerapkan impor data terkontrol ke database standby.
- [x] Memverifikasi cakupan record dan batasan pemulihan storage setelah impor.
- [x] Memulihkan metadata AiraXCloud dengan status terbatas tanpa mengaktifkan arsip yang object storage-nya belum diverifikasi.
- [x] Menyimpan checkpoint pemulihan SERVER DATABASE 2 yang telah tervalidasi.

## Validasi Storage AiraXCloud SERVER DATABASE Lama

- [x] Mengambil dan memeriksa export storage AiraXCloud tanpa mengaktifkan atau menyalin arsip.
- [x] Mencocokkan object storage yang tersedia terhadap tiga metadata AiraXCloud berstatus restricted di SERVER DATABASE 2.
- [x] Meminta persetujuan akhir sebelum mengaktifkan arsip cloud yang objeknya telah diverifikasi.
- [x] Memulihkan tiga objek AiraXCloud terverifikasi ke storage server standby dan mengaktifkan metadatanya.
- [x] Memulihkan enam foto unggulan ke storage standby serta memperbarui URL foto akun yang kedaluwarsa.
- [x] Memvalidasi object storage, metadata database, dan regresi aplikasi setelah pemulihan storage.
- [x] Memperbaiki referensi foto hasil pemulihan agar memakai URL bertanda tangan dari storage standby, bukan endpoint publik legacy.

## Pemisahan SERVER DATABASE Lama dan SERVER DATABASE 2

- [x] Menyimpan kredensial SERVER DATABASE lama dan SERVER DATABASE 2 sebagai dua konfigurasi terpisah.
- [x] Memastikan implementasi hanya menambahkan SERVER DATABASE 2 tanpa menghapus atau mengubah perilaku SERVER DATABASE lama.

## Stabilitas Kompas, Salat, Room Global, dan Aira

- [x] Menyempurnakan tampilan kompas kiblat dengan informasi arah, kalibrasi, dan nuansa Islami yang lebih lengkap.
- [x] Mengubah batas waktu pencarian lokasi untuk jadwal salat menjadi 60 detik serta memperbaiki umpan balik lokasi presisi.
- [x] Mencegah crash saat gestur swipe untuk membalas pesan di Room Global.
- [x] Mencegah crash saat mengirim pesan teks, video, atau pesan suara di Room Global.
- [x] Menjaga box penulisan pesan tetap berada di atas keyboard pada Room Global dan chat Aira.
- [x] Mendiagnosis serta memperbaiki layanan Aira yang terkadang tidak merespons pesan.
- [ ] Uji native Android untuk sensor kompas, GPS 60 detik, swipe balas, pengiriman media, keyboard, dan respons Aira pada APK terbaru.
- [x] Menghapus batas ukuran media di Room Global tanpa menghapus pengamanan terhadap pengiriman ganda dan kegagalan file.
- [x] Menahan pembuatan checkpoint setelah perubahan sampai pengguna memberi persetujuan eksplisit.
- [x] Memverifikasi dan memprioritaskan provider Aira gratis yang tersedia secara sah tanpa API key pengguna.
- [x] Menyimpan Gemini API key sebagai secret backend dan memverifikasi health check provider.
- [x] Menghubungkan dan memvalidasi Gemini API sebagai provider utama Aira.
- [x] Menghubungkan Forge bawaan sebagai fallback otomatis setelah Gemini mencapai kuota atau gagal.
- [ ] Memeriksa kembali kapasitas runtime Forge saat layanan bawaan tidak lagi mengembalikan status usage exhausted.
- [x] Menguji alur end-to-end Aira melalui endpoint backend aktif, termasuk Gemini utama dan respons fallback.
- [x] Menguji respons ringan Forge saat ini untuk menentukan apakah fallback dapat digunakan langsung.
- [x] Merapikan tombol berjudul panjang: hapus teks sekunder, gunakan label kecil, dan sejajarkan ikon serta judul secara horizontal.
- [x] Memulai ulang dan memverifikasi dev server setelah laporan layanan tidak merespons.
- [x] Mencegah Metro yang berhenti karena tekanan memori menghentikan API dev server melalui pengawasan proses yang terpisah.

## Grup Obrolan Privat

- [x] Merancang skema grup privat, member, pesan, dan tautan undangan dengan satu admin grup.
- [x] Menambahkan backend pembuatan grup, pengelolaan member, pergantian admin, keluar grup, serta batas 10 grup per pengguna.
- [x] Menambahkan obrolan grup dan pengaturan grup dengan antarmuka selaras Room Global, termasuk unggah foto dan voice note langsung ke storage.
- [x] Menambahkan tombol buat grup pada profil pengguna serta daftar grup pada Room Global.
- [x] Menambahkan tautan undangan yang menggabungkan pengguna ke grup privat secara aman.
- [x] Menambahkan daftar grup dan kontrol pantau, beku, serta hapus grup untuk Administrator Vaira tanpa hak berkomentar.
- [x] Menambahkan regresi untuk hak akses grup, alih admin, batas grup, tautan undangan, dan pembekuan grup.
- [x] Menahan checkpoint grup sampai pengguna memberi persetujuan eksplisit; persetujuan diterima melalui perintah `cp`.

## Pembaruan Waktu Salat, Room Global, Grup, dan Beranda

- [x] Menambahkan sakelar Waktu Salat aktif/nonaktif yang default aktif serta menyembunyikan pintasan Waktu Salat dari Beranda saat nonaktif.
- [x] Menambahkan countdown waktu salat berikutnya pada kartu ucapan event dengan animasi yang mengikuti pengaturan animasi Studio Developer.
- [x] Menambahkan kartu cuaca hari ini dengan suhu dan tampilan animasi yang tetap berfungsi saat data cuaca belum tersedia.
- [x] Memperbaiki tautan pesan Room Global dan Grup agar berwarna biru serta dapat disentuh untuk dibuka.
- [x] Memastikan seluruh composer Room Global dan Grup selalu berada di atas keyboard perangkat.
- [x] Menambahkan tindakan Administrator untuk menghapus seluruh riwayat Room Global, dengan konfirmasi berlapis.
- [x] Menambahkan penghapusan pesan per bubble dan penghapusan seluruh riwayat Grup oleh admin grup, dengan konfirmasi berlapis.
- [x] Menambahkan pencarian/tambah member grup berdasarkan ID pengguna.
- [x] Mengalihkan admin grup yang keluar kepada member yang paling awal bergabung.
- [x] Menambahkan foto profil grup yang dapat dipasang atau diganti admin grup.
- [x] Mencegah member yang dikeluarkan bergabung lewat link lama; sediakan tindakan buat link undangan baru.
- [x] Menjalankan validasi TypeScript, lint, API, dan regresi penuh sebelum meminta checkpoint.

## Penyempurnaan Kartu Aira Terpadu

- [x] Memindahkan waktu salat berikutnya serta cuaca/suhu dari kartu terpisah ke dalam kartu biru Aira siap membantu di Beranda.
- [x] Menjaga kartu Aira terpadu tetap ringkas pada layar mobile dan menghapus kartu cuaca terpisah di bawahnya.
- [x] Menjalankan TypeScript dan regresi fokus setelah penataan kartu Aira terpadu.

## Animasi Random dan Sakelar Waktu Salat Profil

- [x] Menambahkan pilihan Random pada animasi kartu ucapan di opsi Developer.
- [x] Memilih variasi animasi kartu ucapan secara acak ketika opsi Random dipilih pada Studio Developer.
- [x] Menambahkan sakelar Waktu Salat pada Pengaturan Profil yang aktif secara default.
- [x] Menyembunyikan tombol Waktu Salat Aksi Cepat dan sinyal salat kartu Aira saat sakelar Profil dimatikan.
- [x] Menjalankan TypeScript, lint, dan regresi fokus sebelum meminta checkpoint.

## Rotasi Empat Kartu Utama Beranda

- [x] Mengubah rotasi kartu utama menjadi Aira, kartu ucapan, waktu salat berikutnya, dan cuaca hari ini bersuhu.
- [x] Menghapus panel sinyal salat-cuaca gabungan yang berada di bawah kartu utama.
- [x] Memastikan sakelar Waktu Salat Profil mengeluarkan kartu salat dari rotasi saat dinonaktifkan.
- [x] Menjalankan TypeScript, lint, dan regresi fokus untuk rotasi empat kartu utama.

## Kontrol Lengkap Kartu Rotasi Beranda

- [x] Memulihkan klik, pratinjau, simpan, dan berbagi gambar pada kartu ucapan rotasi.
- [x] Memperluas event kalender penting dan menampilkan countdown event berdasarkan tanggal terdekat.
- [x] Menambahkan kartu pengingat pengguna serta saran Aira yang sesuai konteks.
- [x] Menambahkan tombol geser kartu kiri dan kanan serta jeda rotasi setelah interaksi pengguna.
- [x] Menambahkan pilihan visibilitas kartu Aira, ucapan, pengingat, salat, dan cuaca di Pengaturan Profil.
- [x] Memprioritaskan pengingat dengan sisa waktu kurang dari 24 jam dan menampilkan ringkasan agenda hari ini.
- [x] Menambahkan tindakan langsung pada kartu event, pengingat, salat, dan cuaca.
- [x] Menambahkan tema otomatis berdasarkan event serta refresh cuaca manual dengan status pemuatan.
- [x] Menjalankan TypeScript, lint, dan regresi fokus sebelum meminta checkpoint.

## Editor Kartu Ucapan dan Informasi Cuaca

- [x] Memulihkan editor kata-kata kartu ucapan pada pratinjau kartu.
- [x] Menambahkan animasi yang terlihat pada kartu ucapan dan pratinjau gambar.
- [x] Memisahkan pesan kartu cuaca dari pengaturan Waktu Salat saat lokasi cuaca belum tersedia.
- [x] Menjalankan validasi lengkap editor, animasi, dan kartu cuaca sebelum meminta checkpoint.

## Riwayat Layanan Aira per Akun

- [x] Menambahkan penyimpanan percakapan Aira per akun dan mode Aira, Hot Pro, serta Ahli Ilmuwan.
- [x] Memulihkan riwayat percakapan akun setelah pengguna login kembali tanpa mencampur mode.
- [x] Menambahkan akses Administrator read-only untuk daftar akun, mode, dan isi riwayat layanan Aira.
- [x] Menambahkan tombol Administrator bernama Layanan Aira dengan ikon forum yang sesuai.
- [x] Menjalankan migrasi aditif, TypeScript, lint, API, dan regresi fokus sebelum meminta checkpoint; regresi lama yang tidak terkait dicatat terpisah.

## Perbaikan Kartu Rotasi Beranda

- [x] Menghapus tumpang tindih kartu lama dan kartu rotasi agar hanya satu kartu terlihat dalam satu waktu.
- [x] Mengurangi tinggi kartu utama dan mengembalikan jarak Beranda agar tidak terlalu besar.
- [x] Menghapus tombol panah kanan-kiri pada kartu.
- [x] Menambahkan swipe horizontal kanan/kiri untuk berpindah kartu satu per satu.
- [x] Menjalankan TypeScript, lint, dan regresi fokus sebelum meminta checkpoint.

## Audit Mendalam Aplikasi

- [x] Memetakan arsitektur server, database, penyimpanan, dan jalur sinkronisasi yang berlaku.
- [x] Mengaudit layanan Aira, Gemini, Forge fallback, dan status kegagalan yang dapat terjadi.
- [x] Mengaudit fungsi, tombol, navigasi, pengaturan, serta fitur lama yang berisiko tersembunyi atau regresi.
- [x] Mengaudit konsistensi antarmuka, ukuran teks, pengelompokan pengaturan, aksesibilitas, dan responsivitas.
- [x] Mengaudit risiko crash, performa, jaringan lambat, serta waktu tunggu pemuatan.
- [x] Menjalankan pemeriksaan terarah dan menyusun laporan temuan beserta prioritas perbaikan tanpa membuat checkpoint.

## Tindak Lanjut Audit Menyeluruh

- [x] Menonaktifkan penghapusan otomatis metadata AiraXCloud dan mempertahankan data sampai ada tindakan administrator yang terkonfirmasi.
- [x] Menampilkan status primary/standby secara jelas serta menyiapkan fondasi backup manual tanpa sinkronisasi otomatis dan tanpa mengubah server legacy.
- [ ] Menghubungkan tombol salin backup manual primary ke standby setelah alamat koneksi MySQL server legacy tersedia; tidak dapat diselesaikan tanpa `PRIMARY_DATABASE_URL` dari server lama.
- [x] Memulihkan panel riwayat Aira, menyatukan status penyimpanan, dan mengurangi waktu tunggu serta retry provider yang tumpang tindih.
- [x] Menjadikan Pengaturan sebagai pintu kategori yang terhubung, memulihkan akses Pengaturan Profil, dan memperbaiki aksi akun manual.
- [x] Menghapus interaksi tombol bersarang, memperjelas fitur audio/video yang belum aktif penuh, dan merapikan label panjang.
- [x] Memperbaiki pemuatan media bertanda tangan, retry unggahan, serta risiko lag Room Global dan chat Aira.
- [x] Menyelaraskan regresi kartu Beranda, memeriksa test finance lama, dan menjalankan validasi akhir tanpa checkpoint otomatis.

## Konfigurasi Koneksi Primary untuk Backup Manual

- [x] Menambahkan slot aman `PRIMARY_DATABASE_URL` untuk alamat koneksi database server legacy primary.
- [x] Membatasi pemeriksaan koneksi primary dan backup pada mode read-only tanpa operasi tulis atau sinkronisasi.
- [ ] Ditunda atas arahan pengguna: memvalidasi koneksi read-only setelah host, port, dan nama database primary tersedia.
- [ ] Ditunda atas arahan pengguna: mengaktifkan tombol backup manual satu arah hanya setelah koneksi primary tervalidasi; tidak ada sinkronisasi otomatis.
- [x] Menambahkan slot aman `SERVER_DATABASE_2_URL` untuk alamat koneksi database backup yang terpisah dari primary.
- [ ] Ditunda atas arahan pengguna: memvalidasi koneksi backup read-only setelah host, port, dan nama database SERVER DATABASE 2 tersedia.

## Lanjutan Perbaikan Independen

- [ ] Meninjau dan memperbaiki risiko aplikasi yang tidak memerlukan koneksi primary atau backup.
- [x] Membatasi render awal daftar riwayat Aira agar percakapan akun yang panjang tetap responsif.
- [x] Menambahkan pemuatan riwayat Aira bertahap dengan tombol Muat riwayat lebih lama tanpa menghapus percakapan.

## Penyempurnaan Grup, Chat, Administrator, dan Update

- [x] Merapikan tombol Administrator sebagai grid empat kolom dan dua baris tanpa teks terpotong.
- [x] Menambahkan ID grup privat unik, tampilan ID, serta pencarian dan join grup menggunakan ID.
- [x] Menambahkan pembaruan ID grup dan link undangan bersamaan agar anggota yang di-kick tetap tidak dapat bergabung sampai ID/link diperbarui.
- [x] Menjadikan komposer Room Global serta grup bertumbuh sesuai teks, mendukung Enter sebagai baris baru, dan mempertahankan tombol kirim terpisah.
- [x] Menambahkan penawaran update ketika aplikasi dibuka dengan ringkasan perubahan, dialog detail, tombol Update, dan Skip per versi.
- [x] Menjalankan migrasi aditif, regresi, TypeScript, lint, dan pemeriksaan layanan sebelum meminta checkpoint.
- [x] Pertahankan branding persis `V A I R A  A I` dengan dua spasi di antara `A` dan `A I`; jangan gunakan `V A I R A AI`.
- [x] Audit dan selaraskan Update Prompt, header, konfigurasi aplikasi, serta metadata publik dengan branding asli.
- [ ] Implementasikan deep link grup: buka aplikasi bila terpasang dan arahkan ke halaman unduhan resmi bila belum terpasang.
- [x] Pulihkan rujukan branding lama yang keliru tanpa mengubah appSlug, scheme, atau bundle ID.
- [x] Audit format link grup privat, route join, dan konfigurasi scheme/domain aplikasi.
- [x] Tambahkan halaman fallback web yang mengarahkan penerima tanpa aplikasi ke unduhan resmi.
- [x] Proses token/link grup setelah aplikasi terbuka atau selesai dipasang.
- [x] Uji keamanan rotasi ID/link serta pencegahan akses anggota yang sudah di-kick.
- [x] Audit build Publish yang berhenti di 1% melalui log/status yang tersedia.
- [x] Kembalikan ikon pintar bulat di bawah kiri kartu ucapan tanpa mengubah pengaturan kartu baru.
- [x] Validasi layout ikon, TypeScript, lint, dan regresi build sebelum checkpoint.
- [x] Ganti ikon ayam pada overlay kartu dengan ikon orang pintar layanan Aira AI.
- [x] Kecilkan ukuran visual ikon tetapi pertahankan area sentuh yang mudah ditekan.
- [x] Validasi ikon baru tidak mengubah rotasi, swipe, atau pengaturan kartu.
- [x] Hapus lingkaran latar ikon orang pintar Aira AI pada kartu.
- [x] Atur ikon visual menjadi 40px dengan area sentuh terpisah yang tetap nyaman.
- [x] Validasi perubahan tanpa membuat checkpoint otomatis sampai pengguna menyetujui.
- [ ] Kembalikan lingkaran ikon layanan Aira AI dengan ukuran 40px.
- [ ] Atur ikon orang pintar di dalam lingkaran menjadi 32px.
- [ ] Validasi tampilan dan fungsi tanpa checkpoint otomatis.
- [x] Atur lingkaran ikon layanan Aira AI menjadi 29px.
- [x] Atur ikon orang pintar di dalamnya menjadi 28px.
- [x] Validasi ukuran final tanpa checkpoint otomatis.
- [x] Audit mendalam proses/job Publish yang berhenti di 1% dan log layanan terkait.
- [x] Audit konfigurasi Expo Android, dependensi, dan artefak yang dapat menghambat build.
- [x] Terapkan pemulihan aman tanpa menghapus perubahan aplikasi atau checkpoint stabil.
- [x] Validasi build lokal, server, dan regresi setelah pemulihan.
- [x] Audit layar pengaturan, preferensi kartu Beranda, Waktu Salat, dan alur foto profil.
- [x] Satukan preferensi ke halaman Semua Pengaturan dengan kategori dan subhalaman yang rapi.
- [x] Tempatkan Kartu Rotasi Beranda dan Waktu Salat di kategori Profil dan Beranda.
- [x] Pulihkan alur foto profil: galeri, crop, Oke, simpan, dan kembali.
- [x] Validasi tombol, navigasi, penyimpanan foto, dan regresi tanpa mengubah pengaturan lain.
- [x] Audit semua text box/composer dan penyebab regresi keyboard overlap di seluruh layar.
- [x] Terapkan pola keyboard-safe yang konsisten agar input selalu di atas keyboard.
- [x] Pindahkan akses Riwayat Aira dari Preferensi ke Administrator pada Server Database.
- [x] Pertahankan data riwayat Aira dan validasi navigasi Administrator.
- [x] Jalankan regresi keyboard, navigasi, TypeScript, dan lint tanpa checkpoint otomatis.
- [x] Audit kontrak server/database untuk foto profil, bio, dan foto unggulan.
- [x] Tambahkan upload dan penyimpanan foto profil pada server akun.
- [x] Pulihkan avatar, bio, dan foto unggulan setelah logout lalu login kembali.
- [x] Pindahkan Waktu Salat dan Kartu Beranda ke Pengaturan Referensi Aira.
- [x] Hilangkan Waktu Salat dan Kartu Beranda dari halaman Profil, sisakan profil/bio/foto unggulan.
- [x] Validasi crop, simpan, logout-login, navigasi, dan regresi tanpa checkpoint otomatis.

- [x] Audit ulang agar Foto Profil, Bio, dan Foto Unggulan hanya tampil di menu Profil.
- [x] Pastikan Referensi Aira menampilkan Waktu Salat dan seluruh pengaturan Kartu Beranda.
- [x] Validasi tidak ada preferensi yang hilang atau berpindah dari state tersimpan.

- [ ] Hilangkan baris Profil dari Pengaturan Umum karena profil sudah memiliki menu sendiri.
- [ ] Buat tombol/menu khusus untuk Waktu Salat dan Kartu Beranda di luar Referensi Aira.
- [ ] Keluarkan kontrol Waktu Salat dan Kartu Beranda dari halaman Referensi Aira tanpa mengubah preferensi tersimpan.
- [ ] Validasi rute baru, tampilan menu, dan pemulihan preferensi.

- [x] Hapus baris Profil dari Pengaturan Umum.
- [x] Pastikan tombol baru Kartu Beranda & Waktu Salat tersedia dan membuka halaman khusus.
- [x] Hapus seluruh kontrol Waktu Salat dan Kartu Beranda dari Referensi Aira.
- [x] Ubah deskripsi Referensi Aira agar hanya menyebut instruction dan knowledge.
- [x] Validasi struktur akhir dan rute menu tanpa mengubah nilai preferensi tersimpan.

- [x] Audit jalur layanan Aira, provider utama, fallback, timeout, dan penyimpanan riwayat.
- [x] Jalankan regresi 10 percakapan Aira dengan hasil tiap percakapan tercatat.
- [x] Perbaiki penyebab error layanan Aira tanpa checkpoint otomatis.
- [x] Validasi ulang 10 percakapan dan pastikan fallback tidak salah muncul saat provider sehat.
- [x] Bandingkan kuota Gemini per jenis request dan model dengan kontrak Aira.
- [x] Verifikasi apakah provider alternatif aktif atau semua jalur AI penuh.
- [x] Bedakan perbaikan aplikasi dari batas kuota eksternal dalam hasil uji 10 chat.
- [ ] Audit PIN lama, mode Aira, riwayat per mode, dan posisi tombol pemilih mode.
- [ ] Pindahkan alur PIN dari Profil ke layanan Aira: buat PIN pertama, verifikasi PIN, dan ubah PIN.
- [ ] Tambahkan tombol informasi outline transparan di kanan bawah layanan Aira untuk pemilih mode.
- [ ] Tampilkan pilihan Aira Hot Pro 18+ dan Aira Ahli Ilmuwan setelah PIN benar.
- [ ] Hapus pengaturan PIN lama dari Profil tanpa menghapus riwayat Aira per mode.
- [ ] Validasi alur PIN dan mode tanpa checkpoint otomatis.
- [x] Hilangkan kebutuhan PIN saat mengunci atau menghapus riwayat percakapan Aira pada semua mode.
- [x] Pertahankan PIN hanya untuk membuka mode tersembunyi Aira Hot Pro 18+ dan Aira Ahli Ilmuwan melalui tombol ℹ️.
- [x] Validasi ulang tindakan riwayat dan akses mode tersembunyi tanpa checkpoint otomatis.
- [x] Uji alur PIN mode tersembunyi: buat, verifikasi benar/salah, pilih Hot Pro atau Ahli Ilmuwan, dan ubah PIN.
- [x] Pastikan kunci serta hapus riwayat percakapan tetap tanpa PIN selama uji mode tersembunyi.
- [x] Audit tawaran update lama dan kompatibilitas aplikasi versi lama dengan endpoint server.
- [x] Sediakan endpoint server publik berisi versi terbaru, ringkasan perubahan, URL unduhan, dan aturan Skip per versi.
- [x] Hubungkan tawaran update server ke aplikasi saat dibuka tanpa menggantikan data pengguna.
- [x] Uji Update, Skip per versi, kegagalan koneksi, dan kompatibilitas respons server.
- [x] Audit ulang kualitas kode, pengujian, konfigurasi rilis, dan dependensi aplikasi.
- [x] Audit layanan server, endpoint pembaruan, serta alur fallback Aira.
- [x] Klasifikasikan temuan terbukti menurut risiko dan dampak pengguna tanpa checkpoint otomatis.
- [ ] Sediakan jalur unduhan/manual yang jelas bagi APK sangat lama yang belum memiliki pemeriksa tawaran update server.
- [ ] Tegaskan atau ubah arti tombol kunci riwayat Aira karena tanpa PIN tombol tersebut hanya menjadi penanda privat, bukan perlindungan akses.
- [ ] Uji langsung fitur native pada perangkat Android/iOS: kamera, mikrofon, lokasi salat, notifikasi, alarm, dan unggahan latar belakang.
- [ ] Lengkapi kredensial host SERVER DATABASE 2 sebelum menyatakan backup manual lintas server siap digunakan.
- [x] Jalankan pemeriksaan Expo untuk kesiapan dependensi dan konfigurasi native sebelum rilis.
- [x] Hilangkan peringatan deprecation CJS Vite pada konfigurasi pengujian.
- [x] Buka tawaran update melalui browser perangkat atau Chrome, bukan deep link internal aplikasi.
- [x] Pastikan Hot Pro 18+ dan Ahli Ilmuwan otomatis kembali ke Aira Default saat aplikasi background, pindah aplikasi, atau layar terkunci.
- [x] Pertahankan riwayat mode lama tetapi selalu mulai chat baru saat reset otomatis memasuki Aira Default.
- [x] Validasi lifecycle aplikasi, isolasi riwayat antar mode, dan jalur unduhan browser tanpa checkpoint otomatis.
- [x] Perbaiki nama kunci SecureStore PIN mode Aira yang tidak valid pada perangkat Android.
- [x] Tambahkan regresi untuk memastikan key SecureStore hanya memakai karakter yang didukung.
- [x] Validasi pembuatan, verifikasi, serta perubahan PIN mode tersembunyi tanpa checkpoint otomatis.
- [x] Pindahkan pemicu mode tersembunyi dari layar percakapan awal ke panel Daftar Riwayat Aira.
- [x] Terapkan 20 ketukan: diam pada ketukan 1–10 dan tampilkan sisa ketukan pada ketukan 11–20.
- [x] Pertahankan PIN numerik 4–8 angka pada pembuatan, verifikasi, dan perubahan PIN.
- [x] Validasi pemicu riwayat, PIN, dan pemilihan mode tanpa checkpoint otomatis.
- [x] Simpan checkpoint otomatis setelah seluruh perbaikan pemicu PIN Daftar Riwayat tervalidasi.
- [x] Temukan dan perbaiki panel Riwayat Aira aktif yang belum menampilkan tombol pemicu di sudut kanan bawah.
- [x] Validasi kembali tombol terlihat dan pemicu 20 ketukan bekerja pada panel riwayat yang benar tanpa checkpoint otomatis.
- [x] Audit alur Kelola Akun, penyimpanan sandi, dan otorisasi administrator.
- [x] Pulihkan reset sandi sementara untuk pemulihan akun oleh administrator.
- [x] Perbaiki penyimpanan pembaruan data akun dari Kelola Akun ke server utama.
- [x] Uji penolakan akses non-admin, reset sandi, pembaruan data, dan login ulang tanpa checkpoint otomatis.
- [x] Tambahkan status wajib ganti sandi ketika administrator menetapkan sandi sementara.
- [x] Arahkan pengguna yang masuk dengan sandi sementara ke layar ganti sandi pribadi.
- [x] Bersihkan status sementara hanya setelah pengguna menyimpan sandi pribadi yang baru.
- [x] Uji reset administrator, login dengan sandi sementara, dan penggantian sandi tanpa checkpoint otomatis.
- [x] Verifikasi tombol Reset sandi sementara terlihat dan dapat ditekan pada Kelola Akun.
- [x] Uji alur reset administrator, login sementara, dan ganti sandi pribadi sebelum checkpoint.
- [x] Simpan checkpoint setelah tombol dan seluruh alur sandi sementara tervalidasi.
- [x] Audit ekstraksi OCR/AI Pindai Bukti dan form tinjauan transaksi.
- [x] Prioritaskan nominal transaksi meskipun tanggal atau jam bukti tidak terbaca.
- [x] Tambahkan nama penerima ke keterangan transaksi bila dapat diidentifikasi.
- [x] Pisahkan input tanggal DD-MM-YYYY dan jam HH:MM pada tinjauan bukti.
- [x] Uji ekstraksi, validasi input, dan penyimpanan transaksi tanpa checkpoint otomatis.
- [x] Audit seluruh konversi tanggal dan waktu pada jalur Pindai Bukti.
- [x] Paksa normalisasi input menjadi Tanggal DD-MM-YYYY dan Jam HH:MM terpisah.
- [x] Tambahkan regresi format tanggal-jam dan fallback input manual tanpa checkpoint otomatis.
- [x] Audit penyedia OCR online non-Aira serta titik fallback analisis Pindai Bukti.
- [x] Tambahkan fallback OCR online yang otomatis dipakai saat Aira gagal atau tidak tersedia.
- [x] Uji nominal, penerima, auto-switch, dan mode manual saat kedua layanan gagal.
- [x] Tunda OCR online non-Aira sampai API key OCR tersedia.
- [x] Buka Pindai Bukti untuk pengguna umum tanpa token layanan Aira.
- [x] Pastikan input transaksi manual tetap dapat digunakan oleh pengguna umum.
- [x] Uji akses umum Pindai Bukti serta validasi transaksi manual tanpa checkpoint otomatis.
- [x] Simpan OCR_SPACE_API_KEY melalui kolom aman dan verifikasi kredensial penyedia OCR.
- [x] Implementasikan OCR.Space sebagai fallback otomatis setelah analisis Aira gagal.
- [x] Uji auto-switch OCR, ekstraksi nominal, dan input manual tanpa checkpoint otomatis.
- [x] Catat dua kegagalan pemindaian Aira untuk bukti yang sama di perangkat pengguna.
- [x] Gunakan OCR.Space langsung pada pemindaian ketiga setelah dua kegagalan Aira.
- [x] Uji urutan Aira pertama-kedua, OCR ketiga, dan fallback manual.
- [x] Simpan checkpoint otomatis setelah urutan pemindaian tervalidasi.
- [x] Audit pilihan jenis transaksi pada Pindai Bukti dan klasifikasi OCR/Aira.
- [x] Tambahkan pilihan pengguna: Uang masuk, Uang keluar, dan Pindah saldo antar rekening.
- [x] Perbaiki Aira dan OCR agar mengklasifikasikan jenis transaksi dari bukti serta membiarkan pengguna mengoreksinya.
- [x] Uji alur masuk, keluar, transfer, dan pemilihan rekening tanpa checkpoint otomatis.
- [x] Tambahkan kolom nama pengirim/penerima pada Pindai Bukti; isi otomatis hanya bila OCR menemukan nama dan tetap dapat dikoreksi pengguna.
- [x] Simpan nama pengirim/penerima sebagai data transaksi terstruktur sekaligus keterangan yang dapat dibaca pada konfirmasi.
- [x] Hubungkan Aira Default dengan ringkasan catatan keuangan yang terbatas dan hanya-baca; Aira Hot Pro serta Ahli Ilmuwan tidak menerima konteks finansial.
- [x] Tambahkan regresi pengirim/penerima, parser OCR, ringkasan Default, dan isolasi sisi klien/server tanpa checkpoint otomatis.
- [x] Jadikan percakapan Aira Default yang memuat transaksi sebagai draft yang dapat ditinjau pengguna.
- [x] Jadikan foto bukti yang dikirim di chat Aira sebagai draft transaksi setelah nominal dan rincian dapat dianalisis.
- [x] Tampilkan pilihan eksplisit Tambah ke data keuangan atau Tidak sekarang; jangan pernah menyimpan transaksi tanpa persetujuan pengguna.
- [x] Uji penolakan, pengeditan, dan persetujuan draft transaksi dari chat maupun foto bukti tanpa checkpoint otomatis.
- [x] Audit semua jalur pengiriman, tampilan, dan sinkronisasi data keuangan terhadap Room Global, grup, serta profil publik.
- [x] Pastikan data keuangan tidak dapat masuk ke konten publik tanpa tindakan berbagi eksplisit dari pengguna.
- [x] Tutup setiap jalur eksposur yang ditemukan dan tambahkan regresi isolasi data keuangan.
- [x] Validasi temuan keamanan privasi dan laporkan hasil tanpa checkpoint otomatis.
- [x] Audit tombol, status, dan tindakan Snapshot Global pada menu Administrator.
- [x] Hapus antarmuka Snapshot Global beserta pemanggilan data yang tidak lagi dipakai.
- [x] Validasi tidak ada tombol atau navigasi Snapshot Global tersisa tanpa checkpoint otomatis.
- [x] Audit penyimpanan Snapshot Global lama dan siapkan penghapusan yang tidak menyentuh data akun pribadi.
- [x] Hapus isi Snapshot Global lama yang tersimpan setelah tindakan aman siap.
- [x] Validasi pembersihan snapshot serta isolasi data keuangan tanpa checkpoint otomatis.
- [x] Audit alur pemilihan gambar pada Pindai Bukti dan titik pemindaian OCR saat ini.
- [x] Tambahkan layar pratinjau bukti transaksi sebelum pemindaian dengan Crop, Oke/Gunakan, dan Kembali/Batal.
- [x] Tampilkan kembali gambar bukti yang telah digunakan pada formulir tinjauan transaksi.
- [x] Tambahkan regresi dan validasi alur pratinjau bukti tanpa checkpoint otomatis.
- [x] Audit penghapusan pesan Room Global untuk membedakan soft-delete moderator dan hapus riwayat permanen yang dikonfirmasi.
- [x] Tambahkan tombol Hapus riwayat percakapan pada pesan Room Global untuk menghapus konten tanpa sisa placeholder.
- [x] Tampilkan tanggal serta jam pembuatan akun pada daftar akun Administrator dengan tampilan ringkas.
- [x] Perluas pencarian daftar akun ke nama, username, ID publik, email, dan nomor WhatsApp/telepon.
- [x] Pastikan menu Administrator membuka daftar akun pada halaman khusus dan hapus panel Token Aira yang tampil ganda.
- [x] Tambahkan regresi serta validasi penghapusan riwayat dan pengelolaan akun tanpa checkpoint otomatis.
- [x] Audit komponen Robot SPCA, status layanan aplikasi, izin perangkat, dan jalur pelaporan Administrator yang sudah tersedia.
- [x] Bangun mesin diagnosis SPCA untuk koneksi server/Aira, izin kamera-mikrofon-lokasi, unggahan, serta gejala UI yang dapat dideteksi aman.
- [x] Tambahkan rekomendasi tindakan, coba ulang, pemeriksaan izin, dan laporan bug aman tanpa merekam sandi, token, isi chat, atau data keuangan.
- [x] Tambahkan halaman status SPCA aktif serta laporan diagnostik privat untuk Administrator.
- [x] Tambahkan regresi diagnosis, redaksi data sensitif, tindakan pemulihan, dan validasi tanpa checkpoint otomatis.
- [x] Audit status konfigurasi rahasia dan indikator kesehatan layanan tanpa membaca atau menampilkan nilainya.
- [x] Identifikasi konfigurasi yang benar-benar hilang dan pulihkan hanya jika diperlukan melalui isian aman.
- [x] Validasi layanan terkait dan laporkan hasil pemeriksaan tanpa checkpoint otomatis.
- [x] Audit transform animasi pada overlay dan layar SPCA yang menyebabkan crash Android saat tombol SPCA ditekan.
- [x] Perbaiki nilai `translateY` agar selalu berupa angka atau persentase yang valid pada Android.
- [x] Tambahkan regresi transform animasi dan validasi pembukaan SPCA tanpa checkpoint otomatis.
- [x] Audit pemanggilan screenshot SPCA yang memicu tugas `undefined` pada Android.
- [x] Audit lapisan pointer dan target sentuh Robot SPCA yang tidak dapat ditekan.
- [x] Perbaiki screenshot dan interaksi sentuh SPCA dengan fallback aman lintas platform.
- [x] Tambahkan regresi serta validasi screenshot dan sentuhan SPCA tanpa checkpoint otomatis.
- [x] Audit konflik gesture PanResponder dan `onPress` yang membuat ketukan Robot SPCA tidak membuka panel.
- [x] Pisahkan tap pembuka SPCA dari gesture geser yang hanya aktif setelah pergerakan nyata.
- [x] Tambahkan regresi dan validasi ketukan Robot SPCA membuka panel tanpa checkpoint otomatis.
- [x] Audit model data, layar Keuangan Pintar, analisis anggaran, penyimpanan, dan ekspor yang ada.
- [x] Tambahkan pendapatan utama/pasangan/tambahan serta pemisahan pengeluaran pribadi dan pengeluaran bersama.
- [x] Tambahkan profil anggota keluarga wajib dengan peran, umur, tinggi, berat, pola makan, dan alergi.
- [x] Tambahkan pertanyaan adaptif dewasa bekerja dan anggota sekolah/kuliah berdasarkan profil, tempat tinggal, transportasi, serta kebutuhan.
- [x] Tambahkan pertanyaan kebutuhan rumah tangga bersama untuk pangan, gas, air, internet, listrik, TV, dan tagihan lain dengan frekuensi.
- [x] Bangun analisis anggaran terstruktur, saran efisiensi yang transparan, dan batas aman rekomendasi kesehatan/nutrisi.
- [x] Hitung dan tampilkan total pendapatan, total pengeluaran pribadi, total pengeluaran bersama, total keseluruhan, serta sisa dana per periode.
- [x] Simpan, hapus, lihat kembali, dan ekspor hasil analisis per akun tanpa membocorkan data anggota keluarga.
- [ ] Tambahkan regresi analisis, privasi, perhitungan frekuensi, dan validasi tanpa checkpoint otomatis.
- [x] Tambahkan rekomendasi belanja sayur, lauk/protein, dan bumbu untuk periode harian, mingguan, serta bulanan berdasarkan nominal pengguna.
- [x] Tampilkan kembali total keseluruhan seluruh komponen di bagian paling bawah hasil analisis dan laporan PDF.
- [x] Validasi rekomendasi harga pangan serta total akhir tanpa checkpoint otomatis.
- [x] Audit jalur Pindai Bukti agar hanya menggunakan OCR dan tidak memakai Aira.
- [x] Optimalkan OCR untuk nominal, tipe transaksi masuk/keluar/pindah dana, nama pengirim/penerima, tanggal, dan jam tanpa nilai buatan.
- [x] Tambahkan pengaturan tanggal dan jam pada edit mutasi agar transaksi terlambat dapat dikoreksi.
- [x] Tambahkan kalender mini serta input jam untuk catatan transaksi manual masuk, keluar, dan pindah dana.
- [x] Tambahkan regresi OCR dan waktu transaksi lalu validasi tanpa checkpoint otomatis.
- [x] Audit keselarasan formulir Anggaran, Target, Tagihan, Hutang, dan Piutang dalam menu Rencana.
- [x] Selaraskan tampilan serta pengisian setiap tujuan rencana agar tidak memunculkan formulir yang salah atau tidak konsisten.
- [x] Tambahkan isian sisa tenor tagihan dalam bulan dan tampilkan informasinya pada daftar serta ringkasan tagihan.
- [x] Tambahkan regresi sisa tenor serta validasi tanpa checkpoint otomatis.
- [x] Audit hubungan hutang, piutang, transaksi, saldo dompet, dan Pindai Bukti.
- [x] Sinkronkan pencatatan pembayaran hutang dan penerimaan piutang dengan transaksi saldo setelah konfirmasi pengguna.
- [x] Tambahkan pilihan hutang dan piutang pada Pindai Bukti serta buat komitmen terkait setelah konfirmasi pengguna.
- [x] Tambahkan regresi saldo dan pemindaian hutang-piutang lalu validasi tanpa checkpoint otomatis.
- [x] Audit ulang model transaksi, OCR, dompet, foto bukti, serta alur Hutang/Piutang berdasarkan dokumen pengguna.
- [x] Perluas OCR untuk identitas bank/QRIS, nama dan nomor rekening pihak, tanggal-jam, ID referensi, serta klasifikasi berbasis dompet pengguna tanpa nilai buatan.
- [x] Tambahkan keterangan transaksi terstruktur yang dapat disunting, termasuk kategori saran yang transparan dari nama merchant/QRIS.
- [x] Samakan data inti antara tambah transaksi, edit mutasi, dan Pindai Bukti; tambahkan tombol Pindai Bukti dan peninjauan foto pada formulir manual.
- [x] Pastikan foto bukti tetap tersimpan pada transaksi serta dapat ditinjau ketika menambah atau mengedit catatan.
- [x] Lengkapi sinkronisasi dua arah Hutang/Piutang dengan transaksi serta Pindai Bukti, termasuk tombol Pindai Bukti khusus per komitmen.
- [x] Tambahkan tawaran draft Tagihan untuk pinjaman online/offline hanya setelah pengguna mengonfirmasi, dengan data OCR yang diketahui terisi sebagai draft.
- [x] Tambahkan regresi OCR bank/QRIS, metadata transaksi, foto bukti, sinkronisasi Hutang/Piutang, dan draft Tagihan tanpa checkpoint otomatis.
- [x] Audit pemilihan foto, pemuatan URI, serta modal pratinjau Pindai Bukti yang tidak menampilkan gambar.
- [x] Perbaiki tampilan dan pembesaran foto bukti sebelum OCR maupun konfirmasi transaksi.
- [x] Tambahkan regresi pratinjau foto bukti dan validasi tanpa checkpoint otomatis.
- [x] Audit kembali kelengkapan tambah/edit transaksi dibanding Pindai Bukti, termasuk tanggal, jam, kalender, foto, dan metadata bukti.
- [x] Lengkapi serta rapikan tambah/edit transaksi agar semua detail bukti dapat ditampilkan dan diubah sebelum konfirmasi.
- [x] Tambahkan regresi kelengkapan edit transaksi lalu validasi tanpa checkpoint otomatis.
