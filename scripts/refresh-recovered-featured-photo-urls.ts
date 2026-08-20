import mysql from "mysql2/promise";

import { storageGetSignedUrl } from "../server/storage";

type AccountRow = { id: number; featuredPhotoUris: string | null };

const expectedPhotos = new Map<number, Array<{ key: string; bytes: number }>>([
  [1, [
    { key: "legacy-recovery/profiles/1/featured-1.png", bytes: 148609 },
    { key: "legacy-recovery/profiles/1/featured-2.png", bytes: 2569319 },
  ]],
  [30001, [
    { key: "legacy-recovery/profiles/30001/featured-1.jpg", bytes: 192327 },
    { key: "legacy-recovery/profiles/30001/featured-2.jpg", bytes: 207328 },
    { key: "legacy-recovery/profiles/30001/featured-3.jpg", bytes: 217729 },
    { key: "legacy-recovery/profiles/30001/featured-4.jpg", bytes: 117377 },
  ]],
]);

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL tidak tersedia untuk perbaikan URL foto standby.");

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [accounts] = await connection.query<AccountRow[]>(
      "SELECT id, featuredPhotoUris FROM `manualAccounts` WHERE id IN (?, ?)",
      [...expectedPhotos.keys()],
    );
    if (accounts.length !== expectedPhotos.size) throw new Error("Akun foto pemulihan tidak lengkap.");

    const updates: Array<{ id: number; originalJson: string; refreshedUris: string[] }> = [];
    for (const account of accounts) {
      const photos = expectedPhotos.get(account.id);
      if (!photos || !account.featuredPhotoUris) throw new Error(`Foto akun ${account.id} tidak dapat diverifikasi.`);
      const stored: unknown = JSON.parse(account.featuredPhotoUris);
      if (!Array.isArray(stored) || stored.length !== photos.length || !stored.every((value) => typeof value === "string")) {
        throw new Error(`Referensi foto akun ${account.id} tidak memiliki jumlah yang cocok.`);
      }

      const refreshedUris: string[] = [];
      for (const [index, photo] of photos.entries()) {
        const current = stored[index] as string;
        if (new URL(current).pathname !== `/manus-storage/${photo.key}`) {
          throw new Error(`Referensi foto akun ${account.id} bukan URL proxy sementara yang diharapkan.`);
        }
        const signedUrl = await storageGetSignedUrl(photo.key);
        const response = await fetch(signedUrl);
        if (!response.ok) throw new Error(`Foto standby ${photo.key} tidak dapat dibaca (${response.status}).`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.byteLength !== photo.bytes) throw new Error(`Ukuran foto standby ${photo.key} tidak cocok.`);
        refreshedUris.push(signedUrl);
      }
      updates.push({ id: account.id, originalJson: account.featuredPhotoUris, refreshedUris });
    }

    await connection.beginTransaction();
    try {
      for (const update of updates) {
        const [result] = await connection.query<mysql.ResultSetHeader>(
          "UPDATE `manualAccounts` SET `featuredPhotoUris` = ? WHERE `id` = ? AND `featuredPhotoUris` = ?",
          [JSON.stringify(update.refreshedUris), update.id, update.originalJson],
        );
        if (result.affectedRows !== 1) throw new Error(`Referensi foto akun ${update.id} berubah sebelum URL standby diperbaiki.`);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    console.log(JSON.stringify({ success: true, legacyServerTouched: false, accountsUpdated: updates.length, photoUrlsRefreshed: updates.reduce((total, update) => total + update.refreshedUris.length, 0) }, null, 2));
  } finally {
    await connection.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
