import { storageGetSignedUrl } from "./storage";

export function mediaStorageKeyFromReference(reference: string | null | undefined): string | null {
  if (!reference) return null;
  const value = reference.trim();
  if (!value) return null;
  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);
      const queryKey = url.searchParams.get("path") ?? url.searchParams.get("key");
      if (queryKey) return decodeURIComponent(queryKey).replace(/^\/+/, "");
      const marker = "/manus-storage/";
      const markerIndex = url.pathname.indexOf(marker);
      return markerIndex >= 0 ? decodeURIComponent(url.pathname.slice(markerIndex + marker.length)).replace(/^\/+/, "") : null;
    }
    const marker = "/manus-storage/";
    const markerIndex = value.indexOf(marker);
    if (markerIndex >= 0) return decodeURIComponent(value.slice(markerIndex + marker.length)).replace(/^\/+/, "");
    return value.replace(/^\/+/, "");
  } catch {
    return null;
  }
}

export async function refreshMediaReference(reference: string | null | undefined): Promise<string | null> {
  const key = mediaStorageKeyFromReference(reference);
  if (!key) return reference?.trim() || null;
  try {
    return await storageGetSignedUrl(key);
  } catch {
    return reference?.trim() || null;
  }
}

export function replaceMediaReference(content: string, keyOrReference: string | null | undefined, label: string): string {
  const reference = keyOrReference?.trim();
  if (!reference) return content;
  const key = mediaStorageKeyFromReference(reference);
  if (!key) return content;
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\[${escapedLabel} (?:url|key|audio)=[^\\]]+\\]`, "i");
  const replacement = `[${label} key=${key}]`;
  return pattern.test(content) ? content.replace(pattern, replacement) : content;
}

export function storageKeyFromMarker(content: string, label: string): string | null {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`\\[${escapedLabel} (?:url|key|audio)=([^\\] ·]+)`, "i"));
  return match?.[1] ? mediaStorageKeyFromReference(match[1]) : null;
}

export async function refreshMediaMarker(content: string, label: string, keyOrReference: string | null | undefined): Promise<string> {
  const key = mediaStorageKeyFromReference(keyOrReference) ?? storageKeyFromMarker(content, label);
  if (!key) return content;
  const url = await refreshMediaReference(key);
  if (!url) return content;
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.replace(new RegExp(`\\[${escapedLabel} (?:url|key|audio)=[^\\]]+\\]`, "i"), `[${label} url=${url}]`);
}

export function storageKeyFromAiraAttachment(attachment: unknown): string | null {
  if (!attachment || typeof attachment !== "object") return null;
  const value = attachment as { storageKey?: unknown; uri?: unknown };
  return mediaStorageKeyFromReference(typeof value.storageKey === "string" ? value.storageKey : typeof value.uri === "string" ? value.uri : null);
}

export async function refreshAiraAttachment(attachment: unknown): Promise<unknown> {
  if (!attachment || typeof attachment !== "object") return attachment;
  const value = attachment as Record<string, unknown>;
  const key = storageKeyFromAiraAttachment(value);
  if (!key) return attachment;
  const uri = await refreshMediaReference(key);
  return { ...value, uri: uri ?? value.uri, storageKey: key };
}

export async function refreshAiraMessages(messages: unknown[]): Promise<unknown[]> {
  return Promise.all(messages.map(async (message) => {
    if (!message || typeof message !== "object") return message;
    const value = message as Record<string, unknown>;
    return value.attachment ? { ...value, attachment: await refreshAiraAttachment(value.attachment) } : value;
  }));
}

export function normalizeAiraAttachmentForStorage(attachment: unknown): unknown {
  if (!attachment || typeof attachment !== "object") return attachment;
  const value = attachment as Record<string, unknown>;
  const key = storageKeyFromAiraAttachment(value);
  return key ? { ...value, storageKey: key } : attachment;
}

export function normalizeAiraMessagesForStorage(messages: unknown[]): unknown[] {
  return messages.map((message) => {
    if (!message || typeof message !== "object") return message;
    const value = message as Record<string, unknown>;
    return value.attachment ? { ...value, attachment: normalizeAiraAttachmentForStorage(value.attachment) } : value;
  });
}

export function normalizeProfileMediaReference(value: string): string {
  return mediaStorageKeyFromReference(value) ?? value.trim();
}

export function normalizeProfileMediaReferences(values: string[]): string[] {
  return values.map(normalizeProfileMediaReference).filter(Boolean);
}

export function isLocalMediaReference(value: string | null | undefined): boolean {
  return Boolean(value && /^(?:file|blob|content|ph):/i.test(value));
}

export function isStableMediaReference(value: string | null | undefined): boolean {
  return Boolean(mediaStorageKeyFromReference(value));
}

export async function refreshProfileMediaReferences(values: string[]): Promise<string[]> {
  return Promise.all(values.map(async (value) => (await refreshMediaReference(value)) ?? value));
}

export async function refreshMediaReferences(values: (string | null | undefined)[]): Promise<(string | null)[]> {
  return Promise.all(values.map((value) => refreshMediaReference(value)));
}

export async function refreshMediaUrlOrNull(value: string | null | undefined): Promise<string | null> {
  return refreshMediaReference(value);
}

export async function refreshStoredMediaReference(value: string | null | undefined): Promise<string | null> {
  return refreshMediaReference(value);
}

export function safeMediaKey(value: string | null | undefined): string | null {
  const key = mediaStorageKeyFromReference(value);
  return key && !key.includes("..") ? key : null;
}

export function mediaKeyBelongsToPrefix(value: string | null | undefined, prefix: string): boolean {
  const key = safeMediaKey(value);
  return Boolean(key && key.startsWith(prefix));
}

export function mediaMarkerKey(content: string, label: string): string | null {
  return storageKeyFromMarker(content, label);
}
