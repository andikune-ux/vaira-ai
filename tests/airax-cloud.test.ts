import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf-8");

describe("AiraXCloud dan AiraXBackup", () => {
  it("menyimpan metadata arsip cloud per akun dan bukan kata sandi atau token", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers.ts");
    expect(schema).toContain("airaxCloudBackups");
    expect(schema).toContain("accountId");
    expect(schema).toContain("storageKey");
    expect(router).toContain("airaxCloud: router");
    expect(router).toContain("await requireManualAccount(ctx.req)");
    expect(router.slice(router.indexOf("airaxCloud: router"), router.indexOf("ai: router"))).not.toContain("passwordHash");
  });

  it("memungkinkan administrator membatasi atau menghapus arsip tanpa membuka isi cadangan", () => {
    const router = read("server/routers.ts");
    const administrator = read("app/administrator.tsx");
    const cloudPage = read("app/administrator-cloud.tsx");
    expect(router).toContain("adminUpdate");
    expect(router).toContain("AIRAX_CLOUD_STATUS");
    expect(administrator).toContain("/administrator-cloud");
    expect(cloudPage).toContain("AiraXCloud");
    expect(cloudPage).toContain("Hapus");
    expect(cloudPage).toContain("Batasi");
  });

  it("tidak menghapus arsip otomatis dan hanya mengizinkan penghapusan setelah tindakan administrator", () => {
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    const cloudPage = read("app/administrator-cloud.tsx");
    expect(db).toContain("deleteAiraXCloudBackupPermanently");
    expect(db).not.toContain("pruneOldestAiraXCloudBackup");
    expect(router).toContain("input.status === \"deleted\"");
    expect(router).not.toContain("pruneOldestAiraXCloudBackup");
    expect(cloudPage).toContain("Hapus arsip dan riwayat?");
    expect(cloudPage).toContain("langsung hilang dari daftar");
    expect(cloudPage).toContain("Arsip tidak dihapus otomatis");
  });

  it("memulihkan AiraXCloud setelah login dan menjaga sinkronisasi global tetap dinonaktifkan", () => {
    const login = read("app/login.tsx");
    const globalSync = read("components/global-test-sync.tsx");
    expect(login).toContain("cloudRestore.refetch()");
    expect(login).toContain("effectiveState = { ...cloudState");
    expect(login).toContain("await replaceAllData(effectiveState)");
    expect(login).toContain("const localState = await refreshStorageScope");
    expect(login).toContain("featuredPhotoUris: result.account.featuredPhotoUris");
    expect(globalSync).toContain("Sinkronisasi snapshot lintas pengguna");
    expect(globalSync).toContain("sengaja dinonaktifkan");
  });

  it("menyediakan folder AiraXBackup, pencarian otomatis, dan pemulihan berkas untuk guest", () => {
    const backup = read("lib/local-backup.ts");
    const screen = read("app/local-backup.tsx");
    expect(backup).toContain('BACKUP_DIRECTORY = "AiraXBackup"');
    expect(backup).toContain("StorageAccessFramework.requestDirectoryPermissionsAsync");
    expect(backup).toContain("restoreLatestLocalBackup");
    expect(screen).toContain("Mode Guest juga dapat memulihkan berkas");
    expect(screen).toContain("Pilih berkas cadangan sendiri");
  });

  it("membundel bukti transaksi ke arsip offline v3 dan memulihkannya hanya pada akun pemilik", () => {
    const backup = read("lib/local-backup.ts");
    const screen = read("app/local-backup.tsx");
    const router = read("server/routers.ts");
    expect(backup).toContain('backupFormat: "V A I R A  A I Backup/v3"');
    expect(backup).toContain("transactionProofs");
    expect(backup).toContain("MAX_EMBEDDED_PROOF_BYTES");
    expect(backup).toContain("MAX_OFFLINE_BACKUP_BYTES = 200 * 1024 * 1024");
    expect(backup).toContain("compressProofForBackup");
    expect(backup).toContain("BACKUP_RECEIPT_MIN_LONG_EDGE = 2_048");
    expect(backup).toContain("longEdge > targetLongEdge");
    expect(backup).toContain("compress: 0.86");
    expect(backup).not.toContain("crop:");
    expect(backup).toContain("backupOwnerAccountId");
    expect(screen).toContain("Akun tidak sesuai");
    expect(screen).toContain("foto bukti akan dipulihkan");
    expect(router).toContain("getProofReadUrl");
    expect(router).toContain("finance-proofs/${account.id}/");
  });

  it("menampilkan tahap progres dan hasil proses untuk cadangan maupun pemulihan", () => {
    const progress = read("components/backup-progress.tsx");
    const cloud = read("app/airax-cloud.tsx");
    const local = read("app/local-backup.tsx");
    expect(progress).toContain("BackupProgressPanel");
    expect(progress).toContain('status: "working" | "success" | "error"');
    expect(cloud).toContain("Mengirim ke AiraXCloud");
    expect(cloud).toContain("Pemulihan AiraXCloud selesai");
    expect(local).toContain("Menulis berkas cadangan");
    expect(local).toContain("Pemulihan AiraXBackup selesai");
  });
});
