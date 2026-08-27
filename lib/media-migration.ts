import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import type { FinanceState } from "@/lib/finance/types";

const LOCAL_MEDIA_PATTERN = /^(?:file|blob|content|ph):/i;
const MAX_MEDIA_BYTES = 200 * 1024 * 1024;

type UploadTicket = {
  uploadUrl: string;
  readUrl: string;
  storageKey?: string;
  key?: string;
  maxBytes?: number;
};

type CreateUpload = (input: { fileName: string; mimeType: string; size: number }) => Promise<UploadTicket>;
type ProfileUpload = (input: { file: string }) => Promise<{ url: string; storageKey: string }>;

type MigratedMedia = { readUrl: string; storageKey: string };

export type MediaMigrationResult = {
  state: FinanceState;
  migratedCount: number;
  failedCount: number;
};

export function isLocalMediaReference(value: string | null | undefined) {
  return Boolean(value && LOCAL_MEDIA_PATTERN.test(value));
}

function guessMimeType(uri: string, fallback = "image/jpeg") {
  const extension = uri.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic" || extension === "heif") return "image/heic";
  if (extension === "mp3") return "audio/mpeg";
  if (extension === "wav") return "audio/wav";
  if (extension === "m4a" || extension === "aac") return "audio/mp4";
  if (extension === "mp4" || extension === "mov" || extension === "webm") return "video/mp4";
  if (extension === "pdf") return "application/pdf";
  return fallback;
}

function safeFileName(uri: string, fallback: string, mimeType: string) {
  const original = uri.split(/[?#]/)[0].split("/").pop()?.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (original && original.includes(".")) return original.slice(-140);
  const extension = mimeType.split("/")[1]?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  return `${fallback.replace(/[^a-zA-Z0-9._-]/g, "_")}.${extension}`.slice(-140);
}

async function readLocalSize(uri: string) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Media lokal tidak dapat dibaca oleh browser.");
    const blob = await response.blob();
    return { size: blob.size, blob };
  }
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || !info.size) throw new Error("Media lokal tidak dapat dibaca.");
  return { size: info.size, blob: null as Blob | null };
}

async function putLocalMedia(uri: string, ticket: UploadTicket, mimeType: string, blob: Blob | null) {
  if (Platform.OS === "web") {
    const response = await fetch(ticket.uploadUrl, { method: "PUT", headers: { "Content-Type": mimeType }, body: blob });
    if (!response.ok) throw new Error("Server storage menolak media lokal.");
    return;
  }
  const result = await FileSystem.createUploadTask(ticket.uploadUrl, uri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": mimeType },
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
  }).uploadAsync();
  if (!result || result.status < 200 || result.status >= 300) throw new Error("Server storage menolak media lokal.");
}

async function migrateOne(uri: string, fallbackName: string, mimeType: string, createUpload: CreateUpload): Promise<MigratedMedia> {
  const source = await readLocalSize(uri);
  if (source.size > MAX_MEDIA_BYTES) throw new Error("Media lokal melebihi batas 200 MB.");
  const ticket = await createUpload({ fileName: safeFileName(uri, fallbackName, mimeType), mimeType, size: source.size });
  if (ticket.maxBytes && source.size > ticket.maxBytes) throw new Error("Media lokal melebihi batas storage.");
  await putLocalMedia(uri, ticket, mimeType, source.blob);
  const storageKey = ticket.storageKey ?? ticket.key;
  if (!storageKey) throw new Error("Server storage tidak mengembalikan referensi media.");
  return { readUrl: ticket.readUrl, storageKey };
}

async function toDataUrl(uri: string, mimeType: string) {
  if (Platform.OS !== "web") return `data:${mimeType};base64,${await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })}`;
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Media lokal tidak dapat dibaca oleh browser.");
  const buffer = await response.arrayBuffer();
  let binary = "";
  new Uint8Array(buffer).forEach((value) => { binary += String.fromCharCode(value); });
  return `data:${mimeType};base64,${btoa(binary)}`;
}

export async function migrateAccountLocalMedia(state: FinanceState, createUpload: CreateUpload, profileUpload: ProfileUpload): Promise<MediaMigrationResult> {
  let migratedCount = 0;
  let failedCount = 0;
  let nextState = state;
  const profile = state.profile;
  let nextAvatar = profile.userAvatarUri;
  const localAvatar = nextAvatar;
  if (typeof localAvatar === "string" && isLocalMediaReference(localAvatar)) {
    try {
      const mimeType = guessMimeType(localAvatar);
      const migrated = await profileUpload({ file: await toDataUrl(localAvatar, mimeType) });
      nextAvatar = migrated.url;
      migratedCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  const nextPhotos: string[] = [];
  for (const uri of profile.featuredPhotoUris ?? []) {
    if (!isLocalMediaReference(uri)) {
      nextPhotos.push(uri);
      continue;
    }
    try {
      const migrated = await profileUpload({ file: await toDataUrl(uri, guessMimeType(uri)) });
      nextPhotos.push(migrated.url);
      migratedCount += 1;
    } catch {
      nextPhotos.push(uri);
      failedCount += 1;
    }
  }

  const nextConversations = [];
  for (const conversation of state.conversations) {
    const nextMessages = [];
    for (const message of conversation.messages) {
      const attachment = message.attachment;
      const sourceUri = attachment?.dataUri ?? attachment?.uri;
      if (!attachment || !sourceUri || !isLocalMediaReference(sourceUri)) {
        nextMessages.push(message);
        continue;
      }
      try {
        const migrated = await migrateOne(sourceUri, attachment.label || "lampiran-aira", attachment.mimeType || guessMimeType(sourceUri), createUpload);
        nextMessages.push({
          ...message,
          attachment: { ...attachment, uri: migrated.readUrl, dataUri: migrated.readUrl, storageKey: migrated.storageKey },
        });
        migratedCount += 1;
      } catch {
        nextMessages.push(message);
        failedCount += 1;
      }
    }
    nextConversations.push(nextMessages === conversation.messages ? conversation : { ...conversation, messages: nextMessages });
  }

  if (migratedCount > 0) {
    nextState = {
      ...state,
      profile: { ...profile, userAvatarUri: nextAvatar, featuredPhotoUris: nextPhotos },
      conversations: nextConversations,
    };
  }
  return { state: nextState, migratedCount, failedCount };
}
