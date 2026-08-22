import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { getUserInfo } from "@/lib/_core/auth";

type StoredAiraModePin = { pin: string };

const keyForScope = async () => {
  const user = await getUserInfo();
  const scope = user?.openId || user?.email || "guest";
  return `airax.aira-mode-pin.${encodeURIComponent(scope)}`;
};

const read = async (): Promise<StoredAiraModePin | null> => {
  const key = await keyForScope();
  const raw = Platform.OS === "web" ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key);
  try {
    return raw ? (JSON.parse(raw) as StoredAiraModePin) : null;
  } catch {
    return null;
  }
};

const write = async (value: StoredAiraModePin) => {
  const key = await keyForScope();
  const raw = JSON.stringify(value);
  if (Platform.OS === "web") window.localStorage.setItem(key, raw);
  else await SecureStore.setItemAsync(key, raw);
};

export const isValidAiraModePin = (pin: string) => /^\d{4,8}$/.test(pin);

export const getAiraModePinStatus = async () => ({ hasPin: Boolean((await read())?.pin) });

export const createAiraModePin = async (pin: string) => {
  if (!isValidAiraModePin(pin)) throw new Error("PIN harus terdiri dari 4 sampai 8 angka.");
  await write({ pin });
};

export const verifyAiraModePin = async (pin: string) => (await read())?.pin === pin;

export const changeAiraModePin = async (currentPin: string, nextPin: string) => {
  if (!(await verifyAiraModePin(currentPin))) throw new Error("PIN lama tidak sesuai.");
  await createAiraModePin(nextPin);
};
