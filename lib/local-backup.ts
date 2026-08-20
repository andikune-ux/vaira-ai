import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import { Platform } from "react-native";

import type { FinanceState } from "./finance/types";

export const BACKUP_DIRECTORY = "AiraXBackup";
const BACKUP_LOCATION_KEY = "airax-ai.backup-location.v2";
const appVersion = Constants.expoConfig?.version ?? "1.0.15";
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");

type BackupLocation = { kind: "app" | "saf"; uri: string; label: string };

function validateSnapshot(value: unknown): value is FinanceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FinanceState>;
  return candidate.version === 1 && Array.isArray(candidate.wallets) && Array.isArray(candidate.transactions) && typeof candidate.profile === "object";
}

function serializeSnapshot(state: FinanceState) {
  return JSON.stringify({ ...state, backupCreatedAt: new Date().toISOString(), backupFormat: "V A I R A  A I Backup/v2", backupVersion: appVersion }, null, 2);
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
  const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
  const parsed: unknown = JSON.parse(content);
  if (!validateSnapshot(parsed)) throw new Error("Berkas bukan cadangan V A I R A  A I yang valid.");
  return parsed;
}

export async function createLocalBackup(state: FinanceState) {
  const fileNameBase = `V A I R A  A I-Backup-v${appVersion}-${stamp()}`;
  const serialized = serializeSnapshot(state);
  if (Platform.OS === "web") {
    const blob = new Blob([serialized], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileNameBase}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    return `Unduhan browser / ${fileNameBase}.json`;
  }
  const location = await currentLocation();
  if (location.kind === "saf") {
    const uri = await FileSystem.StorageAccessFramework.createFileAsync(location.uri, fileNameBase, "application/json");
    await FileSystem.StorageAccessFramework.writeAsStringAsync(uri, serialized, { encoding: FileSystem.EncodingType.UTF8 });
    return `${location.label} / ${fileNameBase}.json`;
  }
  let suffix = 0;
  let uri = `${location.uri}/${fileNameBase}.json`;
  while ((await FileSystem.getInfoAsync(uri)).exists) { suffix += 1; uri = `${location.uri}/${fileNameBase}-${suffix}.json`; }
  await FileSystem.writeAsStringAsync(uri, serialized, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
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
