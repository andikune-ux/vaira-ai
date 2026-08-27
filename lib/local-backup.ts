import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";
import { Platform } from "react-native";

import type { FinanceState } from "./finance/types";

export const BACKUP_DIRECTORY = "AiraXBackup";
const BACKUP_LOCATION_KEY = "airax-ai.backup-location.v2";
const appVersion = Constants.expoConfig?.version ?? "1.0.15";
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
const MAX_OFFLINE_BACKUP_BYTES = 200 * 1024 * 1024;
// Data URL menambah sekitar sepertiga ukuran data. Batas media ini menjaga berkas JSON fisik tetap di bawah 200 MB.
const MAX_EMBEDDED_PROOF_BYTES = Math.floor(MAX_OFFLINE_BACKUP_BYTES * 0.70);
const MAX_SINGLE_PROOF_BYTES = 7_500_000;
const BACKUP_COMPRESSION_TARGET_BYTES = 2_400_000;
const BACKUP_RECEIPT_MIN_LONG_EDGE = 2_048;
const IMAGE_DATA_URL = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i;

type BackupLocation = { kind: "app" | "saf"; uri: string; label: string };
type OfflineTransactionProof = { dataUri: string; mimeType: "image/jpeg" | "image/png" | "image/webp"; byteLength: number; compressed?: boolean };
type BackupArchiveV3 = { backupFormat: "V A I R A  A I Backup/v3"; backupVersion: string; backupCreatedAt: string; backupOwnerAccountId?: number; snapshot: FinanceState; transactionProofs: Record<string, OfflineTransactionProof> };

export type LocalBackupArchive = { snapshot: FinanceState; backupOwnerAccountId?: number; media: { includedProofCount: number; compressedProofCount: number; unavailableProofCount: number; byteLength: number }; format: "v2" | "v3" };
export type CreateLocalBackupOptions = { backupOwnerAccountId?: number; resolveProofUrl?: (proofReference: string) => Promise<string> };

function validateSnapshot(value: unknown): value is FinanceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FinanceState>;
  return candidate.version === 1 && Array.isArray(candidate.wallets) && Array.isArray(candidate.transactions) && typeof candidate.profile === "object";
}

function normalizeProofMimeType(value: string | null | undefined): OfflineTransactionProof["mimeType"] {
  const mime = value?.toLowerCase();
  return mime === "image/png" ? "image/png" : mime === "image/webp" ? "image/webp" : "image/jpeg";
}

function estimateBase64Bytes(value: string) {
  const payload = value.split(",", 2)[1] ?? "";
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.floor((payload.length * 3) / 4) - padding;
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

function isRemoteReference(value: string) {
  return /^https?:/i.test(value) || value.includes("/manus-storage/") || !/^(?:file|content|ph|data|blob):/i.test(value);
}

async function proofToDataUri(reference: string, resolveProofUrl?: CreateLocalBackupOptions["resolveProofUrl"]): Promise<OfflineTransactionProof> {
  const inline = reference.match(IMAGE_DATA_URL);
  if (inline) {
    const byteLength = estimateBase64Bytes(reference);
    if (byteLength > MAX_SINGLE_PROOF_BYTES) throw new Error("Ukuran foto bukti melebihi 7,5 MB.");
    return { dataUri: reference, mimeType: normalizeProofMimeType(inline[1]), byteLength };
  }

  let sourceUri = reference;
  if (isRemoteReference(sourceUri) && !/^https?:/i.test(sourceUri)) {
    if (!resolveProofUrl) throw new Error("Foto bukti server memerlukan sesi akun yang aktif.");
    sourceUri = await resolveProofUrl(sourceUri);
  }
  if (/^ph:/i.test(sourceUri)) {
    const assetId = sourceUri.replace(/^ph:\/\//i, "");
    const asset = await MediaLibrary.getAssetInfoAsync(assetId);
    sourceUri = asset.localUri ?? asset.uri ?? sourceUri;
  }

  if (Platform.OS === "web" || /^https?:/i.test(sourceUri)) {
    const response = await fetch(sourceUri);
    if (!response.ok) throw new Error("Foto bukti tidak dapat dibaca.");
    const byteLength = Number(response.headers.get("content-length")) || (await response.clone().arrayBuffer()).byteLength;
    if (byteLength > MAX_SINGLE_PROOF_BYTES) throw new Error("Ukuran foto bukti melebihi 7,5 MB.");
    const buffer = await response.arrayBuffer();
    return { dataUri: `data:${normalizeProofMimeType(response.headers.get("content-type")?.split(";", 1)[0])};base64,${toBase64(buffer)}`, mimeType: normalizeProofMimeType(response.headers.get("content-type")?.split(";", 1)[0]), byteLength: buffer.byteLength };
  }

  const info = await FileSystem.getInfoAsync(sourceUri);
  if (!info.exists || !info.size) throw new Error("Foto bukti lokal tidak lagi tersedia.");
  if (info.size > MAX_SINGLE_PROOF_BYTES) throw new Error("Ukuran foto bukti melebihi 7,5 MB.");
  const mimeType = normalizeProofMimeType(sourceUri.toLowerCase().endsWith(".png") ? "image/png" : sourceUri.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg");
  const encoded = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
  return { dataUri: `data:${mimeType};base64,${encoded}`, mimeType, byteLength: info.size };
}

/** Mengecilkan arsip tanpa crop; sisi terpanjang tidak pernah turun di bawah 2048 px agar tulisan struk tetap terbaca. */
async function compressProofForBackup(proof: OfflineTransactionProof): Promise<OfflineTransactionProof> {
  try {
    const measured = await manipulateAsync(proof.dataUri, [], { format: SaveFormat.JPEG });
    const longEdge = Math.max(measured.width, measured.height);
    const preferredLongEdge = proof.byteLength > BACKUP_COMPRESSION_TARGET_BYTES ? BACKUP_RECEIPT_MIN_LONG_EDGE : 2_560;
    const targetLongEdge = Math.max(BACKUP_RECEIPT_MIN_LONG_EDGE, Math.min(preferredLongEdge, longEdge));
    const result = await manipulateAsync(
      proof.dataUri,
      longEdge > targetLongEdge ? [measured.width >= measured.height ? { resize: { width: targetLongEdge } } : { resize: { height: targetLongEdge } }] : [],
      { base64: true, compress: 0.86, format: SaveFormat.JPEG },
    );
    if (!result.base64) return proof;
    const dataUri = `data:image/jpeg;base64,${result.base64}`;
    const byteLength = estimateBase64Bytes(dataUri);
    return byteLength < proof.byteLength ? { dataUri, mimeType: "image/jpeg", byteLength, compressed: true } : proof;
  } catch {
    // Foto asli tetap dipakai bila perangkat tidak dapat memproses kompresi; data tidak boleh hilang karena optimasi.
    return proof;
  }
}

function archiveFromUnknown(value: unknown): LocalBackupArchive {
  if (!value || typeof value !== "object") throw new Error("Berkas bukan cadangan V A I R A  A I yang valid.");
  const candidate = value as Partial<BackupArchiveV3>;
  if (candidate.backupFormat === "V A I R A  A I Backup/v3" && validateSnapshot(candidate.snapshot)) {
    const transactionIds = new Set(candidate.snapshot.transactions.map((transaction) => transaction.id));
    const proofs = candidate.transactionProofs && typeof candidate.transactionProofs === "object" ? candidate.transactionProofs : {};
    let byteLength = 0;
    const validProofs: Record<string, OfflineTransactionProof> = {};
    for (const [transactionId, proof] of Object.entries(proofs)) {
      if (!transactionIds.has(transactionId) || !proof || typeof proof !== "object") continue;
      const dataUri = (proof as OfflineTransactionProof).dataUri;
      const match = typeof dataUri === "string" ? dataUri.match(IMAGE_DATA_URL) : null;
      if (!match) throw new Error("Paket foto bukti dalam cadangan tidak valid.");
      const size = estimateBase64Bytes(dataUri);
      if (size > MAX_SINGLE_PROOF_BYTES) throw new Error("Satu foto bukti dalam cadangan melebihi batas 7,5 MB.");
      byteLength += size;
      if (byteLength > MAX_EMBEDDED_PROOF_BYTES) throw new Error("Total foto bukti dalam cadangan melebihi batas aman 30 MB.");
      validProofs[transactionId] = { dataUri, mimeType: normalizeProofMimeType(match[1]), byteLength: size, compressed: Boolean((proof as OfflineTransactionProof).compressed) };
    }
    return {
      snapshot: { ...candidate.snapshot, transactions: candidate.snapshot.transactions.map((transaction) => validProofs[transaction.id] ? { ...transaction, proofUri: validProofs[transaction.id].dataUri } : transaction) },
      backupOwnerAccountId: Number.isInteger(candidate.backupOwnerAccountId) ? candidate.backupOwnerAccountId : undefined,
      media: { includedProofCount: Object.keys(validProofs).length, compressedProofCount: Object.values(validProofs).filter((proof) => proof.compressed).length, unavailableProofCount: 0, byteLength },
      format: "v3",
    };
  }
  if (validateSnapshot(value)) return { snapshot: value, media: { includedProofCount: 0, compressedProofCount: 0, unavailableProofCount: 0, byteLength: 0 }, format: "v2" };
  throw new Error("Berkas bukan cadangan V A I R A  A I yang valid.");
}

async function appLocation(): Promise<BackupLocation> {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) throw new Error("Brankas file perangkat tidak tersedia.");
  const uri = `${documentDirectory}${BACKUP_DIRECTORY}`;
  await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  return { kind: "app", uri, label: `Brankas aplikasi / ${BACKUP_DIRECTORY}` };
}

async function savedLocation(): Promise<BackupLocation | null> {
  try {
    const saved = await AsyncStorage.getItem(BACKUP_LOCATION_KEY);
    return saved ? JSON.parse(saved) as BackupLocation : null;
  } catch { return null; }
}

async function currentLocation(): Promise<BackupLocation> {
  if (Platform.OS === "android") {
    const saved = await savedLocation();
    if (saved?.kind === "saf") return saved;
  }
  return appLocation();
}

export async function getBackupLocationLabel() { return (await currentLocation()).label; }

/** Meminta folder Android; pemilih sistem diarahkan ke AiraXBackup pada penyimpanan perangkat bila tersedia. */
export async function chooseBackupFolder() {
  if (Platform.OS !== "android") return appLocation();
  const initialUri = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(BACKUP_DIRECTORY);
  const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);
  if (!permission.granted) return null;
  let uri = permission.directoryUri;
  if (!uri.toLowerCase().includes(BACKUP_DIRECTORY.toLowerCase())) {
    try { uri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(uri, BACKUP_DIRECTORY); } catch { /* Folder mungkin sudah tersedia. */ }
  }
  const location: BackupLocation = { kind: "saf", uri, label: `Penyimpanan perangkat / ${BACKUP_DIRECTORY}` };
  await AsyncStorage.setItem(BACKUP_LOCATION_KEY, JSON.stringify(location));
  return location;
}

export async function resetBackupFolder() {
  await AsyncStorage.removeItem(BACKUP_LOCATION_KEY);
  return getBackupLocationLabel();
}

async function parseBackupFromUri(uri: string) {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_OFFLINE_BACKUP_BYTES) throw new Error("Berkas AiraXBackup melebihi batas maksimal 200 MB.");
  const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
  return archiveFromUnknown(JSON.parse(content) as unknown);
}

export async function createLocalBackup(state: FinanceState, options: CreateLocalBackupOptions = {}) {
  const fileNameBase = `V A I R A  A I-Backup-v${appVersion}-${stamp()}`;
  const transactionProofs: Record<string, OfflineTransactionProof> = {};
  let unavailableProofCount = 0;
  let compressedProofCount = 0;
  let byteLength = 0;
  for (const transaction of state.transactions) {
    if (!transaction.proofUri) continue;
    if (!Number.isInteger(options.backupOwnerAccountId)) {
      unavailableProofCount += 1;
      continue;
    }
    try {
      const proof = await compressProofForBackup(await proofToDataUri(transaction.proofUri, options.resolveProofUrl));
      if (byteLength + proof.byteLength > MAX_EMBEDDED_PROOF_BYTES) throw new Error("Total media foto tidak dapat dimasukkan tanpa melampaui batas berkas AiraXBackup 200 MB.");
      transactionProofs[transaction.id] = proof;
      byteLength += proof.byteLength;
      if (proof.compressed) compressedProofCount += 1;
    } catch {
      unavailableProofCount += 1;
    }
  }
  const archive: BackupArchiveV3 = { backupFormat: "V A I R A  A I Backup/v3", backupVersion: appVersion, backupCreatedAt: new Date().toISOString(), ...(Number.isInteger(options.backupOwnerAccountId) ? { backupOwnerAccountId: options.backupOwnerAccountId } : {}), snapshot: state, transactionProofs };
  const serialized = JSON.stringify(archive, null, 2);
  if (serialized.length > MAX_OFFLINE_BACKUP_BYTES) throw new Error("Arsip AiraXBackup melebihi batas maksimal 200 MB.");
  const result = { media: { includedProofCount: Object.keys(transactionProofs).length, compressedProofCount, unavailableProofCount, byteLength } };
  if (Platform.OS === "web") {
    const blob = new Blob([serialized], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileNameBase}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    return { location: `Unduhan browser / ${fileNameBase}.json`, ...result };
  }
  const location = await currentLocation();
  if (location.kind === "saf") {
    const uri = await FileSystem.StorageAccessFramework.createFileAsync(location.uri, fileNameBase, "application/json");
    await FileSystem.StorageAccessFramework.writeAsStringAsync(uri, serialized, { encoding: FileSystem.EncodingType.UTF8 });
    return { location: `${location.label} / ${fileNameBase}.json`, ...result };
  }
  let suffix = 0;
  let uri = `${location.uri}/${fileNameBase}.json`;
  while ((await FileSystem.getInfoAsync(uri)).exists) { suffix += 1; uri = `${location.uri}/${fileNameBase}-${suffix}.json`; }
  await FileSystem.writeAsStringAsync(uri, serialized, { encoding: FileSystem.EncodingType.UTF8 });
  return { location: uri, ...result };
}

/** Mencari arsip terbaru pada folder AiraXBackup yang telah diset, tanpa membuka pemilih berkas. */
export async function restoreLatestLocalBackup() {
  const location = await currentLocation();
  const files = location.kind === "saf"
    ? await FileSystem.StorageAccessFramework.readDirectoryAsync(location.uri)
    : await FileSystem.readDirectoryAsync(location.uri);
  const candidates = files.filter((uri) => uri.toLowerCase().includes("airax") && uri.toLowerCase().endsWith(".json")).sort();
  if (!candidates.length) return null;
  return parseBackupFromUri(candidates[candidates.length - 1]);
}

export async function selectLocalBackup() {
  const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/json", "text/plain"], copyToCacheDirectory: true });
  if (result.canceled) return null;
  return parseBackupFromUri(result.assets[0].uri);
}
