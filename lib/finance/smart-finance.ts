import type { SmartFinanceItem, SmartFinancePlan } from "./types";

export const cadenceLabel = (cadence: SmartFinanceItem["cadence"]) =>
  cadence === "monthly" ? "Bulanan" : cadence === "weekly" ? "Mingguan" : "Harian";

export const monthlyEquivalent = (item: Pick<SmartFinanceItem, "amount" | "cadence">) =>
  item.cadence === "monthly" ? item.amount : item.cadence === "weekly" ? item.amount * 52 / 12 : item.amount * 30;

export const getSmartFinanceSummary = (plan?: SmartFinancePlan) => {
  if (!plan) return { income: 0, plannedMonthly: 0, remaining: 0, paid: 0, unpaid: 0, ratio: 0, status: "empty" as const };
  const income = plan.income + (plan.otherIncome ?? []).reduce((total, item) => total + item.amount, 0);
  const plannedMonthly = plan.items.reduce((total, item) => total + monthlyEquivalent(item), 0);
  const paid = plan.items.filter((item) => item.isPaid).reduce((total, item) => total + monthlyEquivalent(item), 0);
  const remaining = income - plannedMonthly;
  const ratio = income > 0 ? plannedMonthly / income : 0;
  return { income, plannedMonthly, remaining, paid, unpaid: plan.items.length - plan.items.filter((item) => item.isPaid).length, ratio, status: income <= 0 ? "empty" as const : remaining < 0 ? "over" as const : ratio >= 0.8 ? "tight" as const : "healthy" as const };
};

export const getRecommendedRiceSacks5kg = (members: SmartFinancePlan["members"] = []) => {
  const adultEquivalent = members.reduce((total, member) => total + (member.ageYears >= 13 ? 1 : member.ageYears >= 2 ? 0.5 : 0), 0);
  return Math.max(1, Math.ceil(adultEquivalent));
};

export const getMonthlyTransportEstimate = (transport?: SmartFinancePlan["transport"]) => {
  if (!transport) return 0;
  return transport.costPerTrip * transport.tripsPerDay * transport.daysPerWeek * 52 / 12;
};

type OfflinePriceBand = { min: number; max: number; label: string };

const OFFLINE_PRICE_BANDS: Array<{ match: (item: SmartFinanceItem) => boolean; band: OfflinePriceBand }> = [
  { match: (item) => item.category === "Pangan" && item.subcategory === "Beras", band: { min: 60000, max: 90000, label: "beras 5 kg" } },
  { match: (item) => item.category === "Pangan" && ["Sayur", "Bawang", "Bumbu lainnya"].includes(item.subcategory ?? ""), band: { min: 5000, max: 35000, label: "bahan pangan satuan kecil" } },
  { match: (item) => item.category === "Transportasi" && item.detail === "Bensin", band: { min: 10000, max: 150000, label: "pengisian bensin" } },
  { match: (item) => item.category === "Listrik", band: { min: 20000, max: 500000, label: "pembelian/token listrik" } },
  { match: (item) => item.category === "Gas LPG", band: { min: 18000, max: 25000, label: "gas LPG rumah tangga" } },
];

export const getOfflinePurchaseComparison = (item: SmartFinanceItem) => {
  const matched = OFFLINE_PRICE_BANDS.find(({ match }) => match(item));
  if (!matched) return { status: "unknown" as const, text: "Belum ada kisaran offline untuk kategori ini; gunakan riwayat pembelian keluarga sebagai pembanding." };
  const { min, max, label } = matched.band;
  if (item.amount < min) return { status: "low" as const, text: `Harga beli ${item.amount.toLocaleString("id-ID")} rupiah berada di bawah kisaran estimasi offline ${label}: ${min.toLocaleString("id-ID")}–${max.toLocaleString("id-ID")} rupiah.` };
  if (item.amount > max) return { status: "high" as const, text: `Harga beli ${item.amount.toLocaleString("id-ID")} rupiah berada di atas kisaran estimasi offline ${label}: ${min.toLocaleString("id-ID")}–${max.toLocaleString("id-ID")} rupiah. Periksa ukuran, merek, lokasi, atau biaya tambahan.` };
  return { status: "typical" as const, text: `Harga beli berada dalam kisaran estimasi offline ${label}: ${min.toLocaleString("id-ID")}–${max.toLocaleString("id-ID")} rupiah.` };
};

export const getSmartFinanceOfflineAdvice = (plan?: SmartFinancePlan) => {
  const summary = getSmartFinanceSummary(plan);
  if (summary.status === "empty") return "Isi gaji atau pemasukan bulan ini terlebih dahulu agar Aira dapat menghitung sisa uang.";
  if (summary.status === "over") return `Target pengeluaran melebihi pemasukan sekitar ${Math.abs(summary.remaining).toLocaleString("id-ID")} rupiah. Kurangi atau atur ulang kebutuhan yang dapat ditunda.`;
  if (summary.status === "tight") return "Rencana pengeluaran cukup padat. Tandai tagihan yang sudah dibayar dan sisakan dana cadangan sebelum menambah target baru.";
  const rice = getRecommendedRiceSacks5kg(plan?.members);
  const transport = getMonthlyTransportEstimate(plan?.transport);
  const transportAdvice = transport > 0 ? ` Estimasi transportasi sekitar ${Math.round(transport).toLocaleString("id-ID")} rupiah per bulan.` : "";
  return `Rencana masih memiliki sisa sekitar ${summary.remaining.toLocaleString("id-ID")} rupiah. Untuk profil keluarga ini, estimasi awal beras sekitar ${rice} karung 5 kg per bulan.${transportAdvice} Prioritaskan kebutuhan wajib, lalu alokasikan sebagian untuk dana cadangan.`;
};
