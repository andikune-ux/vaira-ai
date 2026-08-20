# Audit ulang logo resmi dan ikon Target

## Temuan logo

Katalog saat ini sudah memiliki pemetaan domain resmi, tetapi pemuatan `https://domain/favicon.ico` belum dapat dianggap sebagai validasi logo resmi. Pemeriksaan sampel menunjukkan BCA dan Mandiri merespons 200, BNI dan BRI mengarahkan ulang 302, OCBC merespons 200, sedangkan CIMB Niaga merespons 404, Danamon dan beberapa domain merespons 000 karena timeout, dan Permata merespons 403. Artinya favicon domain tidak konsisten dan tidak selalu merupakan logo brand yang benar.

Situs resmi yang menyediakan halaman brand asset yang jelas antara lain BCA, Mandiri, dan GoPay. Beberapa situs resmi lain hanya menyediakan favicon atau melindungi aset melalui CDN/robots sehingga perlu pencarian halaman media kit, press room, brand guideline, atau file logo resmi spesifik. Logo tidak boleh dianggap valid hanya karena domain dapat dibuka.

## Temuan ikon Target

Widget Target terdekat di `components/aira-mode-status-card.tsx` sudah memakai `ChickenIcon`. Namun audit menunjukkan halaman Rencana masih menampilkan `EmptyState icon="egg"` pada keadaan target kosong, dan daftar target belum menampilkan ikon ayam pada setiap kartu target. Karena itu pernyataan “ikon ayam sudah terpasang di semua tempat Target” belum benar.

## Saran sebelum implementasi

Pertama, ganti pemuatan favicon dengan manifest aset eksplisit per brand: URL logo resmi, sumber halaman brand, varian terang/gelap, dan fallback lokal. Kedua, jangan mengubah logo resmi; gunakan `Image` dengan `contain`, latar putih bila diperlukan, dan sumber lokal yang telah diverifikasi. Ketiga, buat `TargetIcon` atau gunakan `ChickenIcon` pada EmptyState target, kartu daftar target, widget Beranda, aksi cepat, dan halaman detail target. Keempat, tambahkan test yang memastikan tidak ada `savings`, `egg`, atau ikon wallet pada konteks Target.
