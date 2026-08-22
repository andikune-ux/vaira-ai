import { createAiraModePin, getAiraModePinStatus, verifyAiraModePin } from "@/lib/aira-mode-pin";

export type ChatPrivacyConfig = { enabled: boolean; hasPin: boolean };

export const getChatPrivacyConfig = async (): Promise<ChatPrivacyConfig> => {
  const { hasPin } = await getAiraModePinStatus();
  return { enabled: hasPin, hasPin };
};

export const setChatPrivacyPin = async (pin: string) => createAiraModePin(pin);

export const setChatPrivacyEnabled = async (enabled: boolean) => {
  if (!enabled) return;
  const { hasPin } = await getAiraModePinStatus();
  if (!hasPin) throw new Error("Buat PIN mode Aira dari tombol informasi di layanan Aira terlebih dahulu.");
};

export const verifyChatPrivacyPin = async (pin: string) => verifyAiraModePin(pin);
