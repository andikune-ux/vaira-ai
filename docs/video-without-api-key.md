# Fitur Nonton Video Tanpa API Key di VAIRA AI

## Kesimpulan

Fitur ini dapat dibuat tanpa meminta API key jika aplikasi memakai salah satu dari dua metode: memutar URL video langsung yang memang disediakan untuk publik, atau menampilkan embed resmi dari platform seperti YouTube dan Vimeo. Elemen HTML `<video>` menerima sumber seperti MP4 atau WebM dan menyediakan kontrol pemutaran bawaan; dukungan autoplay tetap dibatasi kebijakan browser, terutama jika video memiliki suara. [1]

Untuk YouTube, aplikasi dapat memakai URL embed resmi berbentuk `https://www.youtube.com/embed/VIDEO_ID` tanpa YouTube Data API key. Parameter embed dapat mengatur autoplay, kontrol, caption, loop, dan ukuran player, tetapi aplikasi tidak boleh mengunduh, menghapus branding, atau melewati pembatasan yang ditetapkan YouTube. [2] Vimeo juga menyediakan embed melalui ID atau URL video serta opsi kontrol player tanpa harus memakai API key untuk pemutaran embed standar. [3]

## Pilihan Sumber

| Metode | API key | UI custom | Kelebihan | Batasan |
|---|---:|---:|---|---|
| URL MP4/WebM/HLS langsung | Tidak | Sangat tinggi | Kontrol player dapat dibuat sendiri; cocok untuk file milik VAIRA atau sumber yang mengizinkan hotlink | Server sumber harus mengizinkan akses; CORS, token sementara, dan DRM dapat menghalangi pemutaran |
| YouTube iframe embed | Tidak | Sebagian | Cepat, legal untuk konten yang mengizinkan embed, tidak perlu mengelola file video | Player tetap berada di iframe; branding dan kebijakan YouTube tetap berlaku |
| Vimeo embed | Tidak untuk embed standar | Sebagian | Opsi player dan tampilan embed cukup fleksibel | Pengaturan pemilik video, domain restriction, dan privasi tetap berlaku |
| Halaman website sembarang | Tidak otomatis | Terbatas | Bisa membuka halaman sumber melalui WebView/browser | Tidak boleh menganggap URL halaman sebagai file video; scraping, DRM, CORS, robots, dan hak cipta dapat menghalangi |

## Rancangan UI Custom

Di Beranda dapat ditambahkan kartu **Nonton Video**. Kartu tersebut membuka halaman katalog dengan kolom **Tempel URL Video**, pilihan sumber, kartu video tersimpan, dan filter kategori. Saat URL ditempel, aplikasi mendeteksi apakah URL tersebut merupakan YouTube, Vimeo, MP4/WebM, HLS, atau hanya halaman website biasa.

Pada layar pemutar, bagian atas menampilkan tombol kembali, judul video, dan menu simpan. Area utama memakai rasio 16:9 dengan tema gelap. Untuk video langsung, kontrol custom dapat berisi play/pause, seek bar, durasi, volume, kecepatan, subtitle bila tersedia, PiP, dan fullscreen. Untuk YouTube/Vimeo, kontrol yang tidak dijamin oleh embed tidak boleh dipalsukan; kontrol custom hanya boleh mengelilingi player atau menggunakan kemampuan resmi player.

Di bawah player ditampilkan judul, domain sumber, label **Sumber eksternal**, tombol bagikan, simpan ke daftar, laporkan link, dan pesan error yang mudah dipahami. Jika URL hanya berupa halaman website, aplikasi menampilkan tombol **Buka di browser** atau **Buka dalam WebView**, bukan mencoba mengambil video secara diam-diam.

## Arsitektur yang Disarankan

Untuk Expo mobile, gunakan `expo-video` yang sudah tersedia di proyek untuk URL MP4, WebM, atau HLS langsung. Untuk YouTube dan Vimeo, gunakan WebView atau komponen iframe pada web karena sumber tersebut menyediakan player resmi berbasis halaman/embed. Parser URL sebaiknya hanya mengenali pola domain dan ID video; parser tidak boleh mengunduh stream atau menghapus pembatasan platform.

Alur yang aman adalah sebagai berikut. Pengguna menempel URL, aplikasi melakukan validasi format dan domain, lalu memilih adapter `direct`, `youtube`, `vimeo`, atau `webpage`. Adapter direct memakai player native, adapter YouTube/Vimeo memakai embed resmi, sedangkan adapter webpage membuka browser/WebView. Setiap adapter memiliki fallback ketika sumber tidak mengizinkan pemutaran.

## Hal yang Tidak Disarankan

Jangan mengambil video dari website secara scraping agresif, mem-bypass DRM, menghapus watermark, menyalin stream dari situs yang melarang hotlink, atau menyediakan downloader dari platform pihak ketiga. Selain tidak stabil, pendekatan tersebut dapat melanggar syarat penggunaan dan hak cipta. Untuk katalog otomatis tanpa API key, pilihan paling aman adalah daftar kurasi manual, RSS/feed publik yang memang disediakan sumber, atau video yang disimpan sendiri di storage VAIRA AI.

## Rekomendasi Implementasi Bertahap

Tahap pertama sebaiknya hanya mendukung URL video milik sendiri atau sumber yang sudah diketahui mengizinkan embed, dengan pemutar direct dan kartu URL manual. Tahap kedua menambahkan YouTube/Vimeo embed resmi dan riwayat tontonan lokal. Tahap ketiga menambahkan playlist, bookmark, subtitle, PiP, dan sinkronisasi akun apabila memang diperlukan. Fitur pencarian lintas website sebaiknya tidak menjadi tahap awal karena membutuhkan sumber metadata yang stabil serta aturan penggunaan yang berbeda-beda.

## Referensi

[1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video "MDN: video HTML embed element"

[2]: https://developers.google.com/youtube/player_parameters "Google for Developers: YouTube Embedded Players and Player Parameters"

[3]: https://developer.vimeo.com/player/sdk/embed "Vimeo Developer: Player SDK Embed Options"


## Tiga Mode yang Disepakati

VAIRA AI dapat memakai satu layar pemutar dengan tiga adapter. Adapter pertama adalah `direct`, untuk URL MP4, WebM, atau HLS yang dapat diputar langsung. Adapter kedua adalah `embed`, untuk YouTube atau Vimeo melalui embed resmi. Adapter ketiga adalah `webview`, untuk membuka halaman website biasa ketika sumber tidak menyediakan URL media langsung.

UI custom berada pada lapisan aplikasi: header, tombol kembali, judul, bookmark, riwayat, status koneksi, dan tombol buka browser. Pada mode direct, kontrol play, pause, seek, volume, fullscreen, dan kecepatan dapat dibuat sendiri. Pada mode embed, kontrol harus mengikuti kemampuan resmi player. Pada mode WebView, aplikasi tidak dapat mengendalikan isi video pihak ketiga secara penuh karena batas keamanan lintas-origin; UI custom hanya dapat mengatur container, navigasi, status loading, dan fallback.

## Penanganan Internet dan Error

Aplikasi dapat mendeteksi offline, timeout, DNS failure, HTTP 403/404, format tidak didukung, dan sumber yang menolak embed. Sistem kemudian mencoba retry terbatas dengan exponential backoff, menampilkan status yang mudah dipahami, menyediakan tombol Coba lagi dan Buka di browser, serta menyimpan riwayat URL terakhir secara lokal. Cache hanya digunakan untuk video yang dimiliki pengguna atau yang secara eksplisit mengizinkan penyimpanan.

Aplikasi tidak akan membuat proxy untuk membypass blokir negara, DRM, paywall, login, robots policy, atau pembatasan provider. Jika sumber diblokir oleh jaringan, hasil yang aman adalah fallback ke browser eksternal, menampilkan sumber alternatif yang legal, atau memberi pesan bahwa video tidak tersedia pada jaringan saat ini.
