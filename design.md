# Rancangan Antarmuka V A I R A  A I

## Prinsip Produk

V A I R A  A I adalah pendamping cerdas multi-bahasa yang menyatukan percakapan berbasis AI dan pencatatan keuangan personal. Antarmuka dirancang untuk layar potret 9:16, satu tangan, dan mengikuti pola iOS modern: navigasi tab yang singkat, tombol utama berada pada jangkauan ibu jari, sheet untuk tindakan kontekstual, serta konfirmasi eksplisit sebelum catatan keuangan disimpan. Mode tamu bekerja dari data perangkat, sedangkan pengguna yang masuk dapat mengaktifkan sinkronisasi cloud pada data yang mereka miliki.

## Daftar Layar

| Layar | Konten utama | Fungsi utama |
| --- | --- | --- |
| Sambutan dan akses | Ringkasan privasi, masuk dengan email, dan tombol lanjut sebagai tamu | Memilih mode penggunaan tanpa memaksa pendaftaran. |
| Beranda | Saldo total, ringkasan hari ini, pengingat aktif, dan aksi cepat | Menjadi titik masuk untuk tanya AI, mencatat transaksi, memindai bukti, dan melihat laporan. |
| Percakapan AI | Riwayat percakapan, input teks, mikrofon, lampiran media, dan tombol tindakan keuangan | Tanya jawab, pemecahan masalah, analisis gambar, serta pembuatan draft transaksi dari dialog. |
| Konfirmasi transaksi AI | Ringkasan hasil ekstraksi: jenis, sumber dana, nominal, kategori, tanggal, dan keterangan | Pengguna harus menyetujui atau memperbaiki data sebelum catatan benar-benar masuk ke keuangan. |
| Keuangan | Saldo semua dompet, daftar transaksi, penyaring periode, dan tombol tambah | Menelusuri seluruh pemasukan/pengeluaran beserta saldo berjalan. |
| Tambah transaksi | Form jumlah, jenis masuk/keluar, sumber dana, kategori, waktu, dan catatan | Mencatat transaksi manual dengan validasi dan menyimpan setelah persetujuan. |
| Pindai bukti | Kamera/galeri, hasil OCR/AI, dan field hasil ekstraksi | Membaca struk atau bukti transfer; hasilnya selalu diarahkan ke konfirmasi transaksi. |
| Dompet dan aset | Kartu bank, e-wallet, tunai, serta aset tambahan | Mengatur sumber dana, saldo awal, dan nilai aset yang dicatat. |
| Rencana keuangan | Anggaran kategori, target tabungan, tagihan, utang, piutang, dan transaksi berulang | Menjaga batas anggaran, tenggat, target, serta pembukuan komitmen. |
| Laporan | Ringkasan harian/mingguan/bulanan, komposisi kategori, tren, dan daftar ekspor | Menampilkan insight AI, grafik, serta mengekspor Excel atau PDF. |
| Pengingat | Daftar tagihan, jatuh tempo, dan pengingat pencatatan harian | Mengaktifkan notifikasi lokal dan mengelola status pengingat. |
| Profil dan pengaturan | Bahasa, suara AI, privasi, backup/sinkronisasi, knowledge pribadi, dan mode developer | Menyesuaikan pengalaman V A I R A  A I dan mengelola data pengguna. |
| Mode developer | Konfigurasi instruksi sistem, sumber knowledge, status integrasi, dan log aman | Memberikan pengaturan lanjutan tanpa mengekspos rahasia atau kredensial. |

## Alur Pengguna Utama

| Tujuan | Langkah alur |
| --- | --- |
| Memulai sebagai tamu | Sambutan → **Lanjut sebagai tamu** → Beranda → data awal disimpan lokal di perangkat. |
| Mencatat pengeluaran manual | Beranda atau Keuangan → **Tambah transaksi** → isi nominal dan detail → **Tinjau & simpan** → kartu konfirmasi → transaksi tersimpan dan saldo dompet dihitung ulang. |
| Mencatat bukti transaksi | Beranda → **Pindai bukti** → pilih kamera/galeri → AI/OCR mengusulkan data → **Konfirmasi transaksi** → transaksi tersimpan. |
| Mencatat lewat percakapan AI | Percakapan AI → pengguna menyebut transaksi → AI membuat draft → pengguna mengetuk **Tinjau transaksi** → perbaiki bila perlu → **Konfirmasi & simpan**. |
| Memantau anggaran | Rencana keuangan → pilih anggaran → tetapkan kategori dan batas → Beranda menampilkan progres → sistem memberi peringatan saat mendekati batas. |
| Membuat laporan | Laporan → pilih rentang waktu → lihat grafik dan insight → pilih format Excel/PDF → file laporan disiapkan dan dibagikan. |
| Mengaktifkan sinkronisasi | Profil → masuk dengan email → aktifkan sinkronisasi → data lokal yang disetujui pengguna disalin ke akun dan diperbarui secara aman saat daring. |

## Pilihan Warna

Palet menggabungkan karakter cerdas dan rasa aman untuk data keuangan. **Aira Navy** (`#071B33`) menjadi warna dasar yang tenang, **Pulse Blue** (`#2F80FF`) digunakan untuk tindakan utama dan identitas AI, **Mint Signal** (`#18B68A`) menandai pemasukan atau kondisi sehat, dan **Coral Guard** (`#ED6A5A`) digunakan untuk pengeluaran atau peringatan kritis. Latar terang **Cloud** (`#F6F8FC`) dan permukaan putih memberi keterbacaan tinggi; mode gelap memakai **Midnight** (`#0B1220`) serta kartu **Slate** (`#142138`). Teks menggunakan **Ink** (`#10233D`) dan sekunder **Steel** (`#66758A`).

## Struktur Data Inti

| Entitas | Field penting | Aturan penting |
| --- | --- | --- |
| Profil | mode pengguna, bahasa, suara, instruksi pribadi, sinkronisasi | Data sensitif tidak ditampilkan pada mode developer tanpa tindakan pengguna. |
| Dompet | id, nama, jenis, saldo awal, warna, status | Saldo terkini selalu dihitung dari saldo awal dan transaksi yang telah dikonfirmasi. |
| Transaksi | id, waktu, jenis, nominal, dompet, kategori, keterangan, bukti, status | Hanya transaksi dengan status `confirmed` mengubah saldo dan analitik. |
| Anggaran | kategori, batas, periode, ambang peringatan | Sistem menghitung pemakaian dari transaksi yang telah dikonfirmasi. |
| Target/komitmen | target tabungan, tagihan, utang, piutang, jadwal | Semua memiliki status dan tanggal relevan untuk reminder. |
| Knowledge pribadi | judul, isi/ringkasan, sumber, izin penggunaan | Hanya dipakai untuk konteks AI setelah pengguna menyimpan dan memberi izin. |

## Batasan Implementasi Awal

Implementasi pertama memprioritaskan alur transaksi yang dapat berjalan secara lokal/offline, lalu memperluas kemampuan server saat pengguna memilih masuk dan sinkronisasi. Analisis AI, OCR, pembangkitan media, pencarian eksternal, panggilan video, dan berbagi layar memerlukan koneksi serta persetujuan akses perangkat; antarmukanya menyediakan alur siap pakai dengan status ketersediaan yang transparan. Setiap hasil AI terkait uang selalu menjadi **draft** hingga dikonfirmasi pengguna.
