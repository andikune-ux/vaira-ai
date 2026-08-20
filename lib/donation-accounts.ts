import type MaterialIcons from "@expo/vector-icons/MaterialIcons";

export type DonationAccount = {
  bank: string;
  number: string;
  holder: string;
  primary?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const DONATION_ACCOUNTS: DonationAccount[] = [
  { bank: "BANK SINARMAS · Prioritas Utama", number: "0019605237", holder: "Andik", primary: true, icon: "account-balance" },
  { bank: "BANK BSI", number: "7202217162", holder: "Andik", icon: "account-balance" },
  { bank: "BANK BRI", number: "059401009583509", holder: "Andik", icon: "account-balance" },
  { bank: "BANK BNI", number: "1851720228", holder: "Andik", icon: "account-balance" },
  { bank: "SUPERBANK", number: "000041209743", holder: "Andik", icon: "account-balance-wallet" },
  { bank: "OVO", number: "081323233143", holder: "Andik", icon: "account-balance-wallet" },
];

/** Halaman HTML mandiri yang dapat dibuka pemindai QR tanpa bergantung pada rute aplikasi. */
export const DONATION_DETAILS_URL = "https://airaxai-6vcs6pth.manus.space/donasi.html";
