import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DonationAccount } from "@/lib/donation-accounts";

const STORAGE_KEY = "@airax/donation-confirmations/v1";

export type DonationConfirmation = {
  id: string;
  bank: string;
  number: string;
  holder: string;
  recordedAt: string;
};

export async function getDonationConfirmations(): Promise<DonationConfirmation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DonationConfirmation[];
    return Array.isArray(parsed) ? parsed.sort((left, right) => right.recordedAt.localeCompare(left.recordedAt)) : [];
  } catch {
    return [];
  }
}

export async function addDonationConfirmation(account: DonationAccount): Promise<DonationConfirmation> {
  const item: DonationConfirmation = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, bank: account.bank, number: account.number, holder: account.holder, recordedAt: new Date().toISOString() };
  const next = [item, ...(await getDonationConfirmations())].slice(0, 50);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return item;
}

export async function clearDonationConfirmations() { await AsyncStorage.removeItem(STORAGE_KEY); }
