import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getUserInfo } from "@/lib/_core/auth";

export type ChatPrivacyConfig = { enabled: boolean; hasPin: boolean };
type StoredConfig = { pin: string; enabled: boolean };
const keyForScope = async () => {
  const user = await getUserInfo();
  const scope = user?.openId || user?.email || "guest";
  return `airax.chat-privacy.${encodeURIComponent(scope)}`;
};
const read = async (): Promise<StoredConfig | null> => {
  const key = await keyForScope();
  const raw = Platform.OS === "web" ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key);
  try { return raw ? JSON.parse(raw) as StoredConfig : null; } catch { return null; }
};
const write = async (value: StoredConfig) => {
  const key = await keyForScope(); const raw = JSON.stringify(value);
  if (Platform.OS === "web") window.localStorage.setItem(key, raw); else await SecureStore.setItemAsync(key, raw);
};
export const getChatPrivacyConfig = async (): Promise<ChatPrivacyConfig> => { const value = await read(); return { enabled: Boolean(value?.enabled && value.pin), hasPin: Boolean(value?.pin) }; };
export const setChatPrivacyPin = async (pin: string) => { await write({ pin, enabled: true }); };
export const setChatPrivacyEnabled = async (enabled: boolean) => { const value = await read(); if (!value?.pin) throw new Error("Atur PIN terlebih dahulu."); await write({ ...value, enabled }); };
export const verifyChatPrivacyPin = async (pin: string) => (await read())?.pin === pin;
