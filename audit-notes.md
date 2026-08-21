# Catatan Kerja Audit V A I R A AI

> Dokumen ini mencatat bukti audit teknis secara bertahap. Ini bukan perubahan fungsional dan tidak memuat data pengguna atau kredensial.

## Baseline

- Audit dimulai setelah perbaikan kartu rotasi Beranda yang belum disimpan sebagai checkpoint, sesuai permintaan pengguna.
- Fokus audit mencakup jalur server/backup, layanan Aira, fungsi dan navigasi, pengaturan, kualitas antarmuka, performa, serta regresi fitur lama.
- Panduan proyek mengonfirmasi aplikasi menggunakan Expo/React Native, Expo Router, tRPC, MySQL/Drizzle, serta storage S3-compatible.
- Root aplikasi sudah menggunakan `GestureHandlerRootView`; ini mendukung navigasi swipe yang baru diterapkan.

## Status Pemeriksaan

| Area | Status | Catatan |
|---|---|---|
| Arsitektur dan server | Berjalan | Menunggu inventaris dan pemeriksaan jalur runtime. |
| Database dan backup | Berjalan | Menunggu pemetaan prosedur manual dan batas sinkronisasi. |
| Aira dan provider AI | Berjalan | Menunggu pemeriksaan fallback, timeout, dan penanganan error. |
| Fungsi/navigasi | Belum dimulai | Akan diperiksa melalui pemetaan rute dan handler. |
| UI/UX dan performa | Belum dimulai | Akan diperiksa melalui audit statis dan pengujian terarah. |

## Temuan Awal: Server, Backup, dan Aira

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| S-01 | Tinggi | `pruneOldestAiraXCloudBackup()` menghapus metadata backup tertua bila umur minimal 30 hari dan jumlah backup minimal dua; fungsi ini dipanggil ketika membuat, membuka daftar, dan admin melihat daftar backup. | Bertentangan dengan ketentuan bahwa data tidak boleh dihapus tanpa persetujuan eksplisit. Perlu dihentikan atau diubah menjadi usulan penghapusan berkonfirmasi. |
| S-02 | Sedang | Aira mengunggah lampiran data-URL ke storage dan membatasi ukuran mentah menjadi 5,5 MB. | Kegagalan lampiran Aira dapat dirasakan sebagai layanan tidak berfungsi. Batas ini berbeda dari kebijakan Room Global yang tidak membatasi ukuran di sisi aplikasi. |
| S-03 | Sedang | Chat Aira mencoba Gemini utama, kemudian Forge/built-in provider, lalu bantuan lokal. Timeout Gemini tercatat 28 detik sebelum fallback. | Pada saat Gemini lambat atau quota habis, pengguna berpotensi menunggu lama sebelum melihat respons fallback. |
| S-04 | Perlu konfirmasi | Jalur AiraXCloud dan status `database2` ditemukan dalam router, tetapi konfigurasi yang terlihat masih memakai satu `DATABASE_URL` runtime. | Perlu dipetakan lebih lanjut apakah tombol SERVER DATABASE 2 benar-benar terhubung ke database backup terpisah atau hanya memeriksa database aktif. |

## Konfirmasi Arsitektur: Database dan Aira

| ID | Status | Bukti pemeriksaan | Kesimpulan audit |
|---|---|---|---|
| S-04 | Terkonfirmasi | `getDb()` membuat tepat satu instance Drizzle dari `process.env.DATABASE_URL`. Endpoint `administrator.database2.status` hanya memanggil `getServerDatabase2RecoveryStatus()`, yang pada akhirnya memakai `getDb()` yang sama. | **SERVER DATABASE 2 belum merupakan koneksi database kedua.** Saat ini tombolnya hanya menjadi gerbang kredensial dan menghitung isi dari database runtime tunggal. Tidak ada rute koneksi ke server legacy maupun mekanisme salin manual antardatabase dalam kode yang diperiksa. |
| S-05 | Tinggi | Kartu `database2` hanya memiliki endpoint `verify` dan `status`; tidak ada endpoint ekspor, salin, impor, pembandingan, atau pemulihan antardatabase. | Kebutuhan pengguna untuk server lama sebagai primary dan database baru sebagai backup manual belum terimplementasi secara fungsional; nama tombol berpotensi menyesatkan. |
| A-01 | Sedang | Gemini diberi batas 28 detik. Bila gagal, sistem mencoba hingga empat kandidat built-in, masing-masing hingga 12 detik secara berurutan. | Pada kegagalan gabungan, respons dapat tertunda hingga sekitar 76 detik sebelum bantuan lokal, belum termasuk upload media dan latensi jaringan. Ini sesuai keluhan loading lama. |
| A-02 | Sedang | `invokeGeminiAira()` mengubah seluruh konten pesan menjadi teks dan tidak meneruskan data gambar, audio, video, atau PDF ke API Gemini langsung. | Jika Gemini aktif, chat dengan media dapat kehilangan konteks media dan hanya mengirim teks; fallback built-in mungkin menangani media, tetapi perilaku menjadi tidak konsisten antar-provider. |
| A-03 | Sedang | Endpoint `media.createUpload` mendukung objek hingga 200 MB, tetapi jalur chat Aira yang menerima data-URL tetap membatasi unggahan hingga 5,5 MB. | Infrastruktur unggahan media besar sudah ada, namun belum tersambung konsisten ke alur chat Aira. |
| A-04 | Rendah | Output sukses Aira selalu menandai `source: "ai"`, tanpa membedakan Gemini dari Forge/built-in. | Administrator dan pengguna tidak dapat mengetahui provider mana yang benar-benar menjawab; ini menyulitkan diagnosis kuota dan respons lambat. |

## Temuan Tambahan: Autentikasi dan Media

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| AU-01 | Sedang | Sesi akun manual hanya dibaca dari header `x-airax-session`. Helper publik akun memuat email, nomor telepon, dan tanggal lahir lengkap; keamanan paparan akhir tergantung seleksi data di tiap endpoint. | Perlu audit endpoint profil dan administrator lebih lanjut agar profil publik tidak pernah membocorkan data identitas sensitif. |
| M-01 | Sedang | Storage mengembalikan URL baca bertanda tangan untuk penggunaan media. Beberapa endpoint chat menyimpan URL tersebut sebagai nilai media yang dipakai ulang. | Jika URL bertanda tangan kedaluwarsa, foto/voice/media lama dapat gagal dimuat meski objek storage masih ada. Perlu menyimpan storage key dan membuat URL baca baru saat diperlukan. |
| M-02 | Rendah | Terdapat dua pola unggahan: unggahan data-URL melalui backend dan URL presigned langsung. Batas serta pesan errornya berbeda-beda. | Pengalaman unggah Room Global, grup privat, dan Aira tidak konsisten; pengguna sulit memahami mengapa media tertentu gagal di satu layar tetapi berhasil di layar lain. |

## Temuan Tambahan: Runtime Server dan Tujuan API

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| S-06 | Tinggi | Middleware CORS menerima dan memantulkan origin apa pun sambil mengizinkan kredensial. | Situs pihak ketiga berpotensi membuat permintaan berautentikasi dari browser pengguna. Origin perlu dibatasi ke domain aplikasi yang disetujui. |
| S-07 | Sedang | Parser JSON dan URL-encoded server menerima payload hingga 50 MB, sementara beberapa alur masih mengirim media base64 melalui API. | Beberapa unggahan media bersamaan dapat menghabiskan memori proses dan berkontribusi pada API/preview berhenti merespons. |
| S-08 | Ambigu-kritis | APK standalone menggunakan fallback API tetap `https://airaxai-6vcs6pth.manus.space`, sedangkan web produksi memakai origin domain aktif dan workspace ini dipublikasikan pada domain berbeda. | Ini mungkin disengaja karena server legacy adalah primary, tetapi harus ditegaskan: APK dan web backup dapat membaca/menulis ke server yang berbeda. Tanpa label/status server, pengguna tidak tahu data sedang menuju primary atau standby. |

## Temuan Awal: Pengaturan, Profil, dan Navigasi

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| U-01 | Sedang | Halaman `Pengaturan` sudah mengelompokkan banyak opsi ke Preferensi, Pengingat, Kontrol data, Sosial, Dukungan, dan Developer. Namun profil masih menyimpan editor bio/foto sendiri, sementara beberapa opsi lain tersebar di halaman khusus. | Permintaan pengguna untuk satu pintu pengaturan belum sepenuhnya konsisten. Perlu menu Pengaturan sebagai hub kategoris, lalu halaman khusus hanya sebagai detail kategori yang jelas. |
| N-01 | Tinggi | Tab Profil memakai `useAuth().isAuthenticated` (OAuth) untuk menentukan aksi akun, sedangkan aplikasi memakai sesi akun manual untuk `profile.mode === "account"`. | Pengguna yang berhasil masuk lewat akun manual dapat melihat tombol **Masuk lagi** dan diarahkan ke login alih-alih **Ganti akun**, walau sesi manual masih valid. |
| U-02 | Rendah | Tombol pengaturan Profil mengandung `Pressable` perhatian di dalam `Pressable` yang sama. | Sentuhan pada indikator perhatian dapat ikut memicu navigasi Pengaturan induk; perilaku sentuh menjadi tidak tegas di perangkat tertentu. |
| M-03 | Rendah | Pemilih foto profil membaca seluruh file ke base64 lalu endpoint server menerapkan batas 5,5 MB. | Foto resolusi besar dapat gagal disimpan tanpa pengecilan/kompresi yang terukur terlebih dahulu. |

## Audit Navigasi dan Riwayat Fitur

| ID | Status | Bukti | Kesimpulan audit |
|---|---|---|---|
| N-02 | Lulus audit statis awal | Lima tab utama memiliki rute fisik dan peta ikon Android/web yang lengkap. Target navigasi statis yang dipetakan juga merujuk ke halaman aplikasi yang tersedia. | Tidak ditemukan tautan tab utama yang putus pada pemetaan statis. Pengujian runtime tetap diperlukan untuk target bersyarat dan deep link. |
| R-01 | Perlu perhatian | Riwayat checkpoint menunjukkan fitur lama tetap ada dalam kode: kalkulator, kompas, waktu salat, Room Global, Room suara, media, cadangan, pengaturan developer, grup privat, AiraXCloud, serta kartu ucapan. | Fitur-fitur lama tidak tampak dihapus dari rute, tetapi banyak tersembunyi di bawah menu Profil, Pengaturan, atau Developer sehingga dapat dipersepsikan sebagai hilang. Perlu peta fitur untuk pengguna dan penataan navigasi. |
| R-02 | Sedang | Perubahan kartu rotasi Beranda yang sedang belum checkpoint dimaksudkan menonaktifkan hero lama demi mengatasi tampilan ganda. | Kode hero lama dan state terkait masih tersimpan namun disembunyikan. Ini bukan kehilangan fitur, tetapi duplikasi kode dapat kembali memicu regresi jika tidak dibersihkan secara terencana. |

## Temuan Tambahan: Layar Pengaturan Profil

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| U-03 | Sedang | `app/profile-settings.tsx` menyediakan bio, foto, sakelar kartu rotasi, Waktu Salat, dan daftar blokir. Pencarian referensi menunjukkan tidak ada navigasi aplikasi yang membuka `/profile-settings`; hanya test yang membacanya. | Ini adalah **fitur lama yang secara praktik hilang dari pengguna**. Kode dan pengujian masih ada, tetapi layar tidak terjangkau sehingga sakelar kartu rotasi dan Waktu Salat tidak mudah ditemukan. |
| U-04 | Sedang | Editor bio/foto terdapat dua kali: di tab Profil dan di Pengaturan Profil. | Data dan UI berisiko tidak sinkron di antara dua layar, sekaligus menambah kebingungan pengaturan. |
| U-05 | Rendah | Item foto menggunakan `Pressable` hapus di dalam `Pressable` pratinjau. | Tap hapus dapat juga memicu pratinjau foto pada sebagian platform; interaksi perlu dipisahkan. |

## Temuan Awal: Room Global

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| P-01 | Sedang | Room Global melakukan beberapa polling paralel: status, pesan, peserta setiap 5 detik dan indikator mengetik setiap 2 detik. | Pada koneksi lambat atau banyak pengguna, permintaan berulang dapat membuat layar terasa patah-patah serta menambah beban server. |
| P-02 | Sedang | Gesture reply memperbarui state React pada setiap `onTouchMove` bubble pesan. | Scroll/list dapat kehilangan kelancaran ketika pengguna menggeser pesan karena banyak rerender selama satu gesture. |
| F-01 | Sedang | Tombol mikrofon dan speaker Room Global terutama mengubah state lokal. Bila provider audio internal tidak tersedia, UI menawarkan Jitsi eksternal sebagai **uji audio publik**. | Pengguna dapat mengira fitur room suara nyata sudah aktif, padahal percakapan suara real-time internal belum terhubung. Status perlu diberi label beta/nonaktif yang tegas atau fungsi perlu benar-benar diintegrasikan. |
| M-04 | Sedang | Pesan foto dan voice note menyimpan `ticket.readUrl` bertanda tangan dalam konten pesan. | Media Room Global lama berisiko tidak dapat diputar setelah URL kedaluwarsa, walaupun unggahan langsung berhasil. |

## Temuan Awal: Layanan dan Riwayat Aira

| ID | Keparahan awal | Bukti | Dampak yang perlu ditindaklanjuti |
|---|---|---|---|
| A-05 | Tinggi | Panel riwayat Aira dibuat saat `historyOpen`, tetapi style `history` menetapkan `display: "none"`. | Tombol riwayat terlihat, namun daftar percakapan tidak muncul. Ini menjelaskan persepsi bahwa riwayat yang disimpan tidak ada/hilang, meskipun sinkronisasi database sudah dibuat. |
| P-03 | Sedang | Pesan Aira dan daftar riwayat dirender memakai `ScrollView` dengan `.map()`, bukan daftar tervirtualisasi. | Riwayat panjang hingga ratusan pesan/sesi dapat menyebabkan scroll berat, penggunaan memori tinggi, dan layar terasa tidak smooth. |
| A-06 | Tinggi | Client memberi timeout 45 detik dan mencoba ulang satu kali, sementara server dapat masih mencoba Gemini dan beberapa fallback berurutan. | Satu pesan dapat menunggu lama dan berpotensi membuat permintaan AI tumpang tindih, memboroskan quota/provider serta menghasilkan respons yang tidak konsisten. |
| A-07 | Sedang | Deteksi prompt video/audio menyatakan server belum menyediakan generator berkas tersebut dan hanya menawarkan naskah/prompt. | Fitur generate video/audio secara efektif belum berfungsi walau pengguna dapat mengajukannya melalui chat. UI perlu memberi batasan sebelum pengiriman atau integrasi provider yang nyata. |
| A-08 | Sedang | Retry unggahan lampiran menjadwalkan pemanggilan ulang setiap 6 detik tanpa token pembatalan yang disimpan. | Unggahan gagal dapat terus mencoba setelah pengguna membatalkan lampiran atau meninggalkan layar, sehingga menambah beban dan memunculkan status yang membingungkan. |

## Bukti Visual dari Pengguna dan Audit UI

| ID | Keparahan awal | Bukti | Dampak dan status |
|---|---|---|---|
| UI-01 | Tinggi (sebelumnya) | Dua tangkapan layar memperlihatkan kartu ucapan berada di belakang kartu cuaca atau panel gabungan salat-cuaca; satu screenshot juga memperlihatkan panah navigasi besar pada kartu. | Penyebab visualnya konsisten dengan render hero lama dan kartu rotasi aktif secara bersamaan. Perbaikan lokal saat ini telah menonaktifkan hero lama, menghapus panah, dan memakai swipe; **belum checkpoint** sesuai arahan pengguna. |
| UI-02 | Sedang | Beranda memuat sambutan, judul merek, jam, status, kartu utama, ringkasan keuangan, Room Global, dan aksi cepat sebelum tab. | Kepadatan vertikal tinggi memperbesar kesan tombol/teks tidak rapi pada layar kecil. Perlu hierarki: satu hero ringkas, satu ringkasan keuangan, lalu modul sekunder yang dapat dilipat. |
| UI-03 | Rendah | Pemindaian kode menemukan ukuran judul 25–32 pada sejumlah halaman mobile, termasuk Profil, Finance, Administrator, Pengaturan Profil, Welcome, dan beberapa layar utilitas. | Tidak semua judul besar merupakan bug, namun aplikasi belum memiliki skala tipografi konsisten. Judul panjang perlu `numberOfLines`, `ellipsizeMode`, dan batas ukuran yang seragam, bukan teks berjalan secara default. |

## Hasil Pemeriksaan Terarah

| Kelompok | Hasil | Catatan audit |
|---|---|---|
| SERVER DATABASE 2, AiraXCloud, riwayat Aira, Gemini failover | 17/17 lulus | Pengujian yang ada mengonfirmasi kontrak kode saat ini, tetapi tidak membuktikan adanya koneksi database kedua yang nyata. Audit arsitektur tetap menemukan satu `DATABASE_URL` runtime. |
| Room Global: link, swipe reply, media langsung, typing, keluar room, audio | 24/24 lulus | Regresi dasar terjaga. Hasil lulus tidak menghapus risiko polling berat, state per-gesture, URL media bertanda tangan, dan room audio internal yang belum nyata. |
| Aira: chat, composer, media, fallback, koneksi, ketersediaan, generasi | 32/33 lulus | `tests/aira-generation.test.ts` gagal karena masih mengharapkan teks status kartu mode lama (kata `aktif`) yang tidak lagi cocok setelah komponen kartu rotasi diringkas. Ini adalah regresi test yang perlu diselaraskan sebelum checkpoint, bukan bukti kegagalan provider Aira. |
| Beranda, waktu salat, kalender, grup privat, profil, navigasi finance | 33/34 lulus | `tests/minor-ux-regression.test.ts` masih mencari pemrosesan pengingat pada hero Beranda lama yang sudah dinonaktifkan untuk mengatasi kartu ganda. Test perlu diperbarui untuk memeriksa kartu rotasi baru; fungsi pengingat perlu dipastikan tetap terlihat di rotator. |
| Regresi penuh satu proses | 289/294 lulus; 5 gagal | Tiga kegagalan `finance-export.test.ts` pada ikon target ChickenIcon adalah temuan lama yang telah diketahui. Dua kegagalan baru/terkait perubahan kartu: `aira-generation.test.ts` dan `minor-ux-regression.test.ts`, keduanya masih mengunci ekspektasi kode hero Beranda lama. Tidak ada kegagalan TypeScript atau error lint. |

| TypeScript | Lulus | Pemeriksaan `tsc --noEmit` selesai tanpa error. |
| Lint | 0 error, 3 peringatan | Dua peringatan dependency hook pada Beranda dan satu pada cleanup swipe Room Global. Belum memblokir build, namun perlu dirapikan agar perubahan kalender/gesture tidak menimbulkan perilaku stale di masa depan. |

## Klarifikasi Peringatan Hook

| ID | Keparahan awal | Bukti | Dampak |
|---|---|---|---|
| C-01 | Rendah | Efek jadwal salat memakai `calendarNow` tetapi dependency hanya memakai `calendarNow.toDateString()` dan objek lokasi. | Saat ini tampak sengaja agar fetch hanya berubah per hari, tetapi bentuk dependency sulit dianalisis dan mudah rusak saat logika dikembangkan. Nilai tanggal perlu dimemoisasi eksplisit. |
| C-02 | Rendah | Timer reset swipe Room Global memanggil fungsi lokal `resetSwipeReply`, sementara fungsi tersebut tidak tercantum sebagai dependency effect. | Tidak tampak crash langsung karena fungsi memakai ref stabil, tetapi perlu `useCallback` agar cleanup gesture deterministik dan lint bersih. |
