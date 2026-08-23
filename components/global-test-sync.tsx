/**
 * Kompatibilitas untuk proyek lama. Sinkronisasi snapshot lintas pengguna
 * sengaja dinonaktifkan: data keuangan hanya boleh memakai sinkronisasi akun
 * pribadi yang terautentikasi.
 */
export function GlobalTestSync() {
  return null;
}
