import { createContext, useContext, useMemo, type PropsWithChildren } from "react";

import { useFinance } from "@/lib/finance/finance-context";
import type { SystemLanguage } from "@/lib/finance/types";

type TranslationKey = keyof typeof INDONESIAN;

const INDONESIAN = {
  profile: "Profil",
  developerStudio: "Studio developer",
  developerOnly: "Hanya tersedia di Studio Developer",
  developerOptions: "Opsi developer",
  restartApp: "Muat ulang aplikasi",
  restartDetail: "Segarkan data dan kembali ke Beranda",
  socialFollow: "Follow media sosial saya",
  donation: "Donasi",
  supportAira: "Dukung V A I R A  A I",
  copy: "Salin",
  copied: "Nomor rekening telah disalin.",
  systemLanguage: "Bahasa sistem",
  indonesian: "Indonesia",
  english: "English",
  airaVoice: "Suara Aira",
  female: "Perempuan",
  male: "Laki-laki",
  responseMode: "Mode respons Aira",
  saveDeveloper: "Simpan konfigurasi developer",
  settings: "Pengaturan",
  home: "Beranda",
  aira: "Aira",
  finance: "Keuangan",
  plans: "Rencana",
  guestGreeting: "Selamat datang, Tamu",
  hello: "Halo",
  airaReady: "AIRA SIAP MEMBANTU",
  airaHelpDetail: "Tanya apa saja, buat catatan, atau selesaikan masalah Anda.",
  recordedBalance: "Saldo yang tercatat",
  monthlyExpense: "Pengeluaran bulan ini",
  quickActions: "Aksi cepat",
  askAira: "Tanya Aira",
  addTransaction: "Tambah transaksi",
  scanProof: "Pindai bukti",
  prayerTimes: "Waktu salat",
  calculator: "Kalkulator",
  viewReport: "Lihat laporan",
  quickPlan: "Rencana cepat",
  manage: "Kelola",
  budget: "Anggaran",
  target: "Target",
  bill: "Tagihan",
  debt: "Hutang",
  receivable: "Piutang",
  attention: "Perlu perhatian",
  noReminders: "Tidak ada pengingat aktif",
  noRemindersDetail: "Tambahkan tagihan, target, atau pengingat agar V A I R A  A I menampilkan agenda penting Anda.",
  makeReminder: "Buat pengingat",
  recentActivity: "Aktivitas terbaru",
  all: "Semua",
  noActivity: "Belum ada aktivitas. Catatan yang sudah dikonfirmasi akan muncul di sini.",
} as const;

const ENGLISH: Record<TranslationKey, string> = {
  profile: "Profile",
  developerStudio: "Developer Studio",
  developerOnly: "Available only in Developer Studio",
  developerOptions: "Developer options",
  restartApp: "Reload application",
  restartDetail: "Refresh data and return to Home",
  socialFollow: "Follow my social media",
  donation: "Donation",
  supportAira: "Support V A I R A  A I",
  copy: "Copy",
  copied: "Account number copied.",
  systemLanguage: "System language",
  indonesian: "Indonesian",
  english: "English",
  airaVoice: "Aira voice",
  female: "Female",
  male: "Male",
  responseMode: "Aira response mode",
  saveDeveloper: "Save developer settings",
  settings: "Settings",
  home: "Home",
  aira: "Aira",
  finance: "Finance",
  plans: "Plans",
  guestGreeting: "Welcome, Guest",
  hello: "Hello",
  airaReady: "AIRA IS READY TO HELP",
  airaHelpDetail: "Ask anything, make a record, or solve a problem.",
  recordedBalance: "Recorded balance",
  monthlyExpense: "Expenses this month",
  quickActions: "Quick actions",
  askAira: "Ask Aira",
  addTransaction: "Add transaction",
  scanProof: "Scan proof",
  prayerTimes: "Prayer times",
  calculator: "Calculator",
  viewReport: "View report",
  quickPlan: "Quick plan",
  manage: "Manage",
  budget: "Budget",
  target: "Goal",
  bill: "Bill",
  debt: "Debt",
  receivable: "Receivable",
  attention: "Needs attention",
  noReminders: "No active reminders",
  noRemindersDetail: "Add a bill, goal, or reminder so V A I R A  A I can show your important agenda.",
  makeReminder: "Create reminder",
  recentActivity: "Recent activity",
  all: "All",
  noActivity: "No activity yet. Confirmed records will appear here.",
};

type LanguageContextValue = {
  language: SystemLanguage;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const { state } = useFinance();
  const language = state.profile.systemLanguage ?? "id";
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    t: (key) => (language === "en" ? ENGLISH[key] : INDONESIAN[key]),
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
