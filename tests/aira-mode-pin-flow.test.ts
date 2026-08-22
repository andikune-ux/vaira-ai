import { beforeEach, describe, expect, it, vi } from "vitest";

const secureValues = new Map<string, string>();

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => secureValues.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => { secureValues.set(key, value); }),
}));

vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("@/lib/_core/auth", () => ({ getUserInfo: vi.fn(async () => ({ openId: "test-aira-mode-pin" })) }));

import { changeAiraModePin, createAiraModePin, getAiraModePinStatus, isValidAiraModePin, verifyAiraModePin } from "@/lib/aira-mode-pin";

describe("alur PIN pemilih mode tersembunyi Aira", () => {
  beforeEach(() => secureValues.clear());

  it("membuat PIN pertama, memverifikasi PIN benar dan menolak PIN salah", async () => {
    await expect(getAiraModePinStatus()).resolves.toEqual({ hasPin: false });
    await expect(createAiraModePin("12ab")).rejects.toThrow("4 sampai 8 angka");
    await createAiraModePin("2468");
    await expect(getAiraModePinStatus()).resolves.toEqual({ hasPin: true });
    await expect(verifyAiraModePin("2468")).resolves.toBe(true);
    await expect(verifyAiraModePin("0000")).resolves.toBe(false);
  });

  it("mengubah PIN hanya setelah PIN lama benar dan mengganti kredensial sebelumnya", async () => {
    await createAiraModePin("2468");
    await expect(changeAiraModePin("0000", "1357")).rejects.toThrow("PIN lama tidak sesuai");
    await changeAiraModePin("2468", "1357");
    await expect(verifyAiraModePin("2468")).resolves.toBe(false);
    await expect(verifyAiraModePin("1357")).resolves.toBe(true);
  });

  it("menerima hanya PIN numerik empat sampai delapan angka", () => {
    expect(isValidAiraModePin("123")).toBe(false);
    expect(isValidAiraModePin("1234")).toBe(true);
    expect(isValidAiraModePin("12345678")).toBe(true);
    expect(isValidAiraModePin("123456789")).toBe(false);
  });
});
