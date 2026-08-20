# Temuan Audit Navigasi Rencana

Preview runtime mengonfirmasi akar masalah. URL `/plans?sheet=smart` membuka `app/(tabs)/plans.tsx`, yaitu tab Rencana, bukan layar Smart Finance. Akibatnya parameter `sheet=smart` diabaikan dan tombol Rencana Cepat tampak tidak melakukan apa-apa.

Layar form lama berada di `app/plan-form.tsx`, sedangkan layar Keuangan Pintar berada di `app/smart-finance.tsx` setelah dipisahkan dari nama route yang konflik. Pintasan standar kini memakai `/plan-form?sheet=budget|goal|bill|debt|receivable`, dan Keuangan Pintar memakai `/smart-finance?sheet=smart`.

Verifikasi preview berhasil: `/smart-finance?sheet=smart` menampilkan panel Keuangan Pintar dan ikon auto-graph; `/plan-form?sheet=budget` menampilkan form Anggaran dan tombol-tombol rencana.
