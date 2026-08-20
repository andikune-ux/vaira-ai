import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (filePath: string) => fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
const storage = read("server/storage.ts");
const activation = read("scripts/activate-legacy-storage-recovery.ts");
const photoRefresh = read("scripts/refresh-recovered-featured-photo-urls.ts");

describe("aktivasi storage legacy pada SERVER DATABASE 2", () => {
  it("menyediakan unggahan exact-key khusus pemulihan tanpa mengubah perilaku unggahan normal", () => {
    expect(storage).toContain("export async function storagePut(");
    expect(storage).toContain("appendHashSuffix(normalizeKey(relKey))");
    expect(storage).toContain("export async function storagePutExact(");
    expect(storage).toContain("const key = normalizeKey(relKey);");
  });

  it("mengaktifkan cloud hanya setelah manifest, metadata restricted, byte, JSON, dan object storage tervalidasi", () => {
    expect(activation).toContain("runUnzip([\"-t\", archivePath])");
    expect(activation).toContain("row.status !== \"restricted\"");
    expect(activation).toContain("bytes.byteLength !== file.expectedBytes");
    expect(activation).toContain("JSON.parse(bytes.toString(\"utf8\"))");
    expect(activation).toContain("await ensureStoredObject(object)");
    expect(activation).toContain("UPDATE `airaxCloudBackups` SET `status` = 'active'");
  });

  it("memperbarui foto hanya bila URI legacy cocok, lalu memakai URL bertanda tangan dari storage standby", () => {
    expect(activation).toContain("new URL(legacyUri).pathname !== file.storagePath");
    expect(activation).toContain("signedStandbyPhotoUrl(object.storageKey)");
    expect(activation).toContain("return storageGetSignedUrl(key);");
    expect(activation).toContain("UPDATE `manualAccounts` SET `featuredPhotoUris`");
  });

  it("memperbaiki URL proxy sementara hanya setelah object foto standby dapat dibaca dengan ukuran yang cocok", () => {
    expect(photoRefresh).toContain("new URL(current).pathname !== `/manus-storage/${photo.key}`");
    expect(photoRefresh).toContain("const signedUrl = await storageGetSignedUrl(photo.key);");
    expect(photoRefresh).toContain("bytes.byteLength !== photo.bytes");
    expect(photoRefresh).toContain("AND `featuredPhotoUris` = ?");
  });

  it("tidak menjalankan sinkronisasi otomatis atau menulis ke server legacy", () => {
    expect(activation).toContain("legacyServerTouched: false");
    expect(activation).not.toContain("legacyServerUrl");
    expect(activation).not.toContain("autoSync");
  });
});
