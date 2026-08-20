import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

import { storageGetSignedUrl, storagePutExact } from "../server/storage";

type ManifestCloudFile = {
  source: "airaxCloudBackups";
  id: string;
  fileName: string;
  storageKey: string;
  expectedBytes: number;
  exportedBytes: number;
  statusExport: "ok";
};

type ManifestPhotoFile = {
  source: "manualAccounts.featuredPhotoUris";
  accountId: string;
  username: string;
  index: number;
  storagePath: string;
  exportedBytes: number;
  statusExport: "ok";
};

type ArchiveFile = ManifestCloudFile | ManifestPhotoFile;
type ArchiveManifest = { project: string; files: ArchiveFile[] };
type CloudRow = { id: number; accountId: number; fileName: string; storageKey: string; sizeBytes: number; status: string };
type AccountRow = { id: number; username: string; featuredPhotoUris: string | null };
type PreparedObject = {
  role: "cloud" | "photo";
  archiveEntry: string;
  storageKey: string;
  contentType: string;
  bytes: Buffer;
  sha256: string;
  cloudId?: number;
  accountId?: number;
  photoIndex?: number;
};

const [archivePathArg] = process.argv.slice(2);
if (!archivePathArg) {
  throw new Error("Usage: pnpm exec tsx scripts/activate-legacy-storage-recovery.ts <legacy-storage-export.zip>");
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tidak tersedia untuk aktivasi storage standby.");
}

const archivePath = path.resolve(archivePathArg);
if (!fs.existsSync(archivePath)) throw new Error(`Arsip recovery tidak ditemukan: ${archivePath}`);

function runUnzip(args: string[]): Buffer {
  const result = spawnSync("unzip", args, { encoding: "buffer", maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString("utf8") : String(result.stderr ?? "");
    throw new Error(`Pemeriksaan arsip gagal: ${stderr.trim() || "unzip mengembalikan status gagal"}`);
  }
  return Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.from(result.stdout ?? "");
}

function readArchiveEntry(entry: string) {
  return runUnzip(["-p", archivePath, entry]);
}

function sha256(data: Buffer) {
  return createHash("sha256").update(data).digest("hex");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Manifest tidak memiliki ${field} yang valid.`);
  return value;
}

function readInteger(value: unknown, field: string) {
  if (!Number.isInteger(value) || Number(value) < 0) throw new Error(`Manifest tidak memiliki ${field} yang valid.`);
  return Number(value);
}

function parseManifest(): { cloudFiles: ManifestCloudFile[]; photoFiles: ManifestPhotoFile[] } {
  const parsed: unknown = JSON.parse(readArchiveEntry("manifest.json").toString("utf8"));
  if (!isObject(parsed) || !Array.isArray(parsed.files)) throw new Error("Manifest recovery tidak memiliki daftar files yang valid.");
  const cloudFiles: ManifestCloudFile[] = [];
  const photoFiles: ManifestPhotoFile[] = [];

  for (const entry of parsed.files) {
    if (!isObject(entry)) throw new Error("Manifest memiliki item file yang tidak valid.");
    const source = readString(entry.source, "source");
    const statusExport = readString(entry.statusExport, "statusExport");
    if (statusExport !== "ok") throw new Error("Aktivasi dibatalkan karena ada object ekspor yang tidak berstatus ok.");
    if (source === "airaxCloudBackups") {
      cloudFiles.push({
        source,
        id: readString(entry.id, "id"),
        fileName: readString(entry.fileName, "fileName"),
        storageKey: readString(entry.storageKey, "storageKey"),
        expectedBytes: readInteger(entry.expectedBytes, "expectedBytes"),
        exportedBytes: readInteger(entry.exportedBytes, "exportedBytes"),
        statusExport: "ok",
      });
    } else if (source === "manualAccounts.featuredPhotoUris") {
      photoFiles.push({
        source,
        accountId: readString(entry.accountId, "accountId"),
        username: readString(entry.username, "username"),
        index: readInteger(entry.index, "index"),
        storagePath: readString(entry.storagePath, "storagePath"),
        exportedBytes: readInteger(entry.exportedBytes, "exportedBytes"),
        statusExport: "ok",
      });
    } else {
      throw new Error(`Manifest memuat sumber yang tidak diizinkan: ${source}`);
    }
  }

  if (cloudFiles.length !== 3 || photoFiles.length !== 6) {
    throw new Error("Aktivasi dibatalkan karena manifest tidak berisi tepat 3 backup cloud dan 6 foto unggulan.");
  }
  if (new Set(cloudFiles.map((file) => file.id)).size !== cloudFiles.length) throw new Error("ID metadata cloud duplikat pada manifest.");
  if (new Set(photoFiles.map((file) => `${file.accountId}:${file.index}`)).size !== photoFiles.length) throw new Error("Foto akun duplikat pada manifest.");
  return { cloudFiles, photoFiles };
}

function contentTypeFor(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".json") return "application/json";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  throw new Error(`Ekstensi recovery tidak diizinkan: ${extension || "(tanpa ekstensi)"}`);
}

function stablePhotoKey(accountId: number, index: number, extension: string) {
  return `legacy-recovery/profiles/${accountId}/featured-${index + 1}${extension}`;
}

async function signedStandbyPhotoUrl(key: string) {
  return storageGetSignedUrl(key);
}

function parseStoredPhotoUris(value: string | null, accountId: number) {
  if (!value) throw new Error(`Akun ${accountId} tidak memiliki featuredPhotoUris legacy untuk diverifikasi.`);
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string" && /^https?:\/\//i.test(item))) {
    throw new Error(`featuredPhotoUris akun ${accountId} tidak memiliki format URL legacy yang valid.`);
  }
  return parsed as string[];
}

async function findStoredObject(key: string, expectedHash: string): Promise<"missing" | "matching"> {
  const signedUrl = await storageGetSignedUrl(key);
  const response = await fetch(signedUrl);
  // Penyimpanan object mengembalikan 403 untuk key yang belum ada walau URL GET
  // sudah berhasil dibuat. Setelah PUT, cabang ini tidak dapat melewati verifikasi
  // hash sehingga object baru tetap wajib terbaca dengan byte yang sama.
  if (response.status === 404 || response.status === 403) return "missing";
  if (!response.ok) throw new Error(`Object standby ${key} tidak dapat diverifikasi (${response.status}).`);
  const stored = Buffer.from(await response.arrayBuffer());
  if (sha256(stored) !== expectedHash) throw new Error(`Object standby yang sudah ada berbeda dari arsip: ${key}`);
  return "matching";
}

async function ensureStoredObject(object: PreparedObject) {
  const existing = await findStoredObject(object.storageKey, object.sha256);
  if (existing === "matching") return { storageKey: object.storageKey, reusedExistingObject: true };
  const stored = await storagePutExact(object.storageKey, object.bytes, object.contentType);
  if (stored.key !== object.storageKey) throw new Error(`Key object recovery berubah secara tak terduga: ${object.storageKey}`);
  const verified = await findStoredObject(object.storageKey, object.sha256);
  if (verified !== "matching") throw new Error(`Object yang baru diunggah tidak dapat diverifikasi: ${object.storageKey}`);
  return { storageKey: object.storageKey, reusedExistingObject: false };
}

async function main() {
  runUnzip(["-t", archivePath]);
  const { cloudFiles, photoFiles } = parseManifest();
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
  const cloudIds = cloudFiles.map((file) => Number(file.id));
  const [cloudRows] = await connection.query<CloudRow[]>(
    "SELECT id, accountId, fileName, storageKey, sizeBytes, status FROM `airaxCloudBackups` WHERE id IN (?, ?, ?)",
    cloudIds,
  );
  if (cloudRows.length !== cloudFiles.length) throw new Error("Metadata cloud standby tidak lengkap; aktivasi dibatalkan.");
  const cloudById = new Map(cloudRows.map((row) => [row.id, row]));

  const preparedCloud: PreparedObject[] = cloudFiles.map((file) => {
    const id = Number(file.id);
    const row = cloudById.get(id);
    if (!row || row.status !== "restricted" || row.fileName !== file.fileName || row.storageKey !== file.storageKey || Number(row.sizeBytes) !== file.expectedBytes) {
      throw new Error(`Metadata standby untuk AiraXCloud ID ${file.id} tidak cocok atau tidak restricted.`);
    }
    const archiveEntry = `storage/airaxCloudBackups/${file.id}/${file.fileName}`;
    const bytes = readArchiveEntry(archiveEntry);
    if (bytes.byteLength !== file.expectedBytes || bytes.byteLength !== file.exportedBytes) throw new Error(`Ukuran object cloud tidak cocok: ${archiveEntry}`);
    JSON.parse(bytes.toString("utf8"));
    return { role: "cloud", archiveEntry, storageKey: file.storageKey, contentType: "application/json", bytes, sha256: sha256(bytes), cloudId: id };
  });

  const accountIds = [...new Set(photoFiles.map((file) => Number(file.accountId)))].sort((a, b) => a - b);
  if (accountIds.length !== 2 || accountIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error("Manifest foto tidak ditautkan ke tepat dua akun valid.");
  const [accountRows] = await connection.query<AccountRow[]>(
    "SELECT id, username, featuredPhotoUris FROM `manualAccounts` WHERE id IN (?, ?)",
    accountIds,
  );
  if (accountRows.length !== accountIds.length) throw new Error("Akun standby untuk foto pemulihan tidak lengkap.");
  const accountById = new Map(accountRows.map((row) => [row.id, row]));
  const originalPhotoJsonByAccount = new Map<number, string>();
  const nextPhotoUrisByAccount = new Map<number, string[]>();

  const preparedPhotos: PreparedObject[] = photoFiles
    .sort((a, b) => Number(a.accountId) - Number(b.accountId) || a.index - b.index)
    .map((file) => {
      const accountId = Number(file.accountId);
      const account = accountById.get(accountId);
      if (!account || account.username !== file.username) throw new Error(`Akun foto ${file.accountId} tidak cocok dengan manifest.`);
      const originalJson = originalPhotoJsonByAccount.get(accountId) ?? account.featuredPhotoUris;
      const storedUris = parseStoredPhotoUris(originalJson, accountId);
      originalPhotoJsonByAccount.set(accountId, originalJson ?? "");
      const legacyUri = storedUris[file.index];
      if (!legacyUri || new URL(legacyUri).pathname !== file.storagePath) throw new Error(`URI foto legacy akun ${accountId} indeks ${file.index} tidak cocok dengan manifest.`);

      const extension = path.extname(file.storagePath).toLowerCase();
      const archiveEntry = `storage/featuredPhotos/${accountId}/featured-${file.index + 1}${extension}`;
      const bytes = readArchiveEntry(archiveEntry);
      if (bytes.byteLength !== file.exportedBytes) throw new Error(`Ukuran foto tidak cocok: ${archiveEntry}`);
      const key = stablePhotoKey(accountId, file.index, extension);
      const nextUris = nextPhotoUrisByAccount.get(accountId) ?? [];
      nextUris[file.index] = key;
      nextPhotoUrisByAccount.set(accountId, nextUris);
      return { role: "photo", archiveEntry, storageKey: key, contentType: contentTypeFor(file.storagePath), bytes, sha256: sha256(bytes), accountId, photoIndex: file.index };
    });

  const uploaded = [] as Array<{ storageKey: string; reusedExistingObject: boolean }>;
  for (const object of [...preparedCloud, ...preparedPhotos]) uploaded.push(await ensureStoredObject(object));

  for (const object of preparedPhotos) {
    const nextUris = nextPhotoUrisByAccount.get(object.accountId ?? -1);
    if (!nextUris || object.photoIndex === undefined) throw new Error("Peta foto standby tidak lengkap.");
    nextUris[object.photoIndex] = await signedStandbyPhotoUrl(object.storageKey);
  }

  await connection.beginTransaction();
  try {
    const [activated] = await connection.query<mysql.ResultSetHeader>(
      "UPDATE `airaxCloudBackups` SET `status` = 'active' WHERE `id` IN (?, ?, ?) AND `status` = 'restricted'",
      cloudIds,
    );
    if (activated.affectedRows !== preparedCloud.length) throw new Error("Status metadata cloud standby berubah sebelum aktivasi dapat diselesaikan.");

    for (const accountId of accountIds) {
      const originalJson = originalPhotoJsonByAccount.get(accountId);
      const nextUris = nextPhotoUrisByAccount.get(accountId);
      if (!originalJson || !nextUris || nextUris.some((uri) => typeof uri !== "string")) throw new Error(`Peta foto akun ${accountId} tidak lengkap.`);
      const [updated] = await connection.query<mysql.ResultSetHeader>(
        "UPDATE `manualAccounts` SET `featuredPhotoUris` = ? WHERE `id` = ? AND `featuredPhotoUris` = ?",
        [JSON.stringify(nextUris), accountId, originalJson],
      );
      if (updated.affectedRows !== 1) throw new Error(`Referensi foto akun ${accountId} berubah sebelum pemulihan dapat diselesaikan.`);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }

  console.log(JSON.stringify({
    success: true,
    legacyServerTouched: false,
    archive: path.basename(archivePath),
    airaxCloud: { objects: preparedCloud.length, statusActivated: "active", exactStorageKeysPreserved: true },
    featuredPhotos: { objects: preparedPhotos.length, accountsUpdated: accountIds.length, signedStandbyUrls: true },
    objects: uploaded,
  }, null, 2));
  } finally {
    await connection.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
