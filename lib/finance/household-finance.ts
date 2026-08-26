import type {
  SmartFinanceCadence,
  SmartFinanceIncome,
  SmartFinanceMember,
  SmartFinancePlan,
  SmartFinanceSharedExpense,
  SmartFinanceSharedExpenseCategory,
} from "./types";

export type HouseholdAnalysisStatus = "empty" | "over" | "tight" | "healthy";

export type HouseholdBreakdownRow = {
  id: string;
  label: string;
  monthlyAmount: number;
  cadence: SmartFinanceCadence;
  amount: number;
  memberId?: string;
  category?: string;
};

export type HouseholdMemberTotal = {
  memberId: string;
  memberLabel: string;
  monthlyAmount: number;
  rows: HouseholdBreakdownRow[];
};

export type HouseholdFoodPriceRecommendation = {
  id: string;
  label: string;
  category: "vegetables" | "protein" | "spices";
  quantity?: number;
  unit?: string;
  dailyAmount: number;
  weeklyAmount: number;
  monthlyAmount: number;
  targetDailyAmount?: number;
  targetWeeklyAmount?: number;
  targetMonthlyAmount?: number;
  monthlySavings?: number;
};

export type HouseholdAnalysis = {
  periodLabel: string;
  generatedAt: string;
  status: HouseholdAnalysisStatus;
  totalIncome: number;
  totalPersonalExpense: number;
  totalSharedExpense: number;
  totalExpense: number;
  remaining: number;
  expenseRatio: number;
  incomeRows: HouseholdBreakdownRow[];
  personalByMember: HouseholdMemberTotal[];
  sharedRows: HouseholdBreakdownRow[];
  alerts: string[];
  suggestions: string[];
  pantryNotes: string[];
  foodPriceRecommendations: HouseholdFoodPriceRecommendation[];
  privacyNote: string;
  wellbeingNote: string;
};

export const CADENCE_LABEL: Record<SmartFinanceCadence, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

export const RELATION_LABEL: Record<SmartFinanceMember["relation"], string> = {
  self: "Saya",
  spouse: "Pasangan",
  child: "Anak",
  parent: "Orang tua",
  other: "Lainnya",
  husband: "Suami",
  wife: "Istri",
  nephew: "Keponakan laki-laki",
  niece: "Keponakan perempuan",
  sibling: "Saudara kandung",
  cousin: "Sepupu",
  father: "Ayah",
  mother: "Ibu",
  uncle: "Paman",
  aunt: "Bibi",
  grandfather: "Kakek",
  grandmother: "Nenek",
};

export const ACTIVITY_LABEL: Record<NonNullable<SmartFinanceMember["activity"]>, string> = {
  working: "Bekerja",
  student: "Sekolah",
  college: "Kuliah",
  home: "Di rumah",
  retired: "Pensiun",
  other: "Lainnya",
};

export const TRANSPORT_MODE_LABEL = {
  walking: "jalan kaki",
  bicycle: "sepeda",
  motorcycle: "motor",
  car: "mobil",
  public_transport: "angkutan umum",
  online_transport: "transportasi online",
  other: "transportasi lain",
} as const;

export const SHARED_EXPENSE_LABEL: Record<SmartFinanceSharedExpenseCategory, string> = {
  rice: "Beras",
  cooking_oil: "Minyak goreng",
  spices: "Bumbu dapur",
  gas: "Gas memasak",
  protein: "Lauk/protein",
  vegetables: "Sayur",
  water: "Air",
  wifi: "WiFi/internet rumah",
  electricity: "Listrik",
  tv_subscription: "TV berlangganan",
  other_bill: "Tagihan lain",
  other: "Kebutuhan bersama lain",
};

export const REQUIRED_SHARED_CATEGORIES: SmartFinanceSharedExpenseCategory[] = [
  "rice",
  "cooking_oil",
  "spices",
  "gas",
  "protein",
  "vegetables",
  "water",
  "wifi",
  "electricity",
  "tv_subscription",
  "other_bill",
];

const validAmount = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

export const toMonthlyAmount = (amount: number | undefined, cadence: SmartFinanceCadence | undefined = "monthly") => {
  const numeric = validAmount(amount);
  if (cadence === "daily") return numeric * 30;
  if (cadence === "weekly") return numeric * (52 / 12);
  return numeric;
};

const amountForCadence = (monthlyAmount: number, cadence: SmartFinanceCadence) => {
  if (cadence === "daily") return monthlyAmount / 30;
  if (cadence === "weekly") return monthlyAmount / (52 / 12);
  return monthlyAmount;
};

export const memberDisplayName = (member: SmartFinanceMember) => member.name?.trim() || member.label.trim() || RELATION_LABEL[member.relation];

const toIncomeRows = (plan?: SmartFinancePlan): HouseholdBreakdownRow[] => {
  if (!plan) return [];
  const sources = plan.incomeSources?.length
    ? plan.incomeSources
    : [
        ...(validAmount(plan.income) ? [{ id: "legacy-main", label: "Pemasukan utama", amount: plan.income, cadence: "monthly" as const }] : []),
        ...(plan.otherIncome ?? []),
      ];
  return sources.map((source: SmartFinanceIncome) => ({
    id: source.id,
    label: source.label.trim() || "Pemasukan tanpa nama",
    amount: validAmount(source.amount),
    cadence: source.cadence ?? "monthly",
    monthlyAmount: toMonthlyAmount(source.amount, source.cadence),
    memberId: source.memberId,
    category: source.kind,
  })).filter((row) => row.monthlyAmount > 0);
};

const periodicRow = (id: string, label: string, memberId: string, category: string, value?: { amount?: number; cadence?: SmartFinanceCadence }): HouseholdBreakdownRow | null => {
  const cadence = value?.cadence ?? "monthly";
  const amount = validAmount(value?.amount);
  const monthlyAmount = toMonthlyAmount(amount, cadence);
  return monthlyAmount > 0 ? { id, label, amount, cadence, monthlyAmount, memberId, category } : null;
};

const derivedMemberPersonalRows = (member: SmartFinanceMember): HouseholdBreakdownRow[] => {
  const name = memberDisplayName(member);
  const planner = member.planner;
  if (!planner) return [];
  const work = planner.work;
  const study = planner.study;
  const commute = work?.commute ?? study?.commute;
  const rows: Array<HouseholdBreakdownRow | null> = [
    periodicRow(`derived-${member.id}-residence`, `${name} · tempat tinggal`, member.id, "residence", planner.residenceCost),
    periodicRow(`derived-${member.id}-meal`, `${name} · ${work ? "makan" : "uang makan"}`, member.id, "meal", work?.mealBudget ?? study?.mealAllowance),
    periodicRow(`derived-${member.id}-snack`, `${name} · ${work ? "jajan" : "uang jajan"}`, member.id, "snack", work?.snackBudget ?? study?.snackAllowance),
    periodicRow(`derived-${member.id}-routine`, `${name} · ${work ? "biaya kerja rutin" : "biaya pendidikan rutin"}`, member.id, work ? "work" : "education", work?.recurringWorkCost ?? study?.recurringEducationCost),
    periodicRow(`derived-${member.id}-quota`, `${name} · kuota`, member.id, "quota", work?.quotaBudget ?? study?.quotaBudget),
    periodicRow(`derived-${member.id}-other`, `${name} · biaya lain`, member.id, "other", work?.otherCost ?? study?.otherCost),
  ];
  if (commute) {
    const tripAmount = validAmount(commute.costPerTrip) * validAmount(commute.tripsPerDay) * validAmount(commute.daysPerWeek);
    if (tripAmount > 0) rows.push({
      id: `derived-${member.id}-commute-trip`,
      label: `${name} · transportasi per perjalanan`,
      amount: tripAmount,
      cadence: "weekly",
      monthlyAmount: toMonthlyAmount(tripAmount, "weekly"),
      memberId: member.id,
      category: "transport",
    });
    rows.push(
      periodicRow(`derived-${member.id}-fuel`, `${name} · bahan bakar`, member.id, "transport", commute.fuelBudget),
      periodicRow(`derived-${member.id}-maintenance`, `${name} · servis kendaraan`, member.id, "vehicle_service", commute.maintenanceBudget),
      periodicRow(`derived-${member.id}-parking`, `${name} · parkir`, member.id, "parking", commute.parkingBudget),
    );
  }
  return rows.filter((row): row is HouseholdBreakdownRow => Boolean(row));
};

const toPersonalRows = (plan?: SmartFinancePlan): HouseholdBreakdownRow[] => [
  ...(plan?.members ?? []).flatMap(derivedMemberPersonalRows),
  ...(plan?.personalExpenses ?? []).map((expense) => ({
    id: expense.id,
    label: expense.title.trim() || "Pengeluaran pribadi",
    amount: validAmount(expense.amount),
    cadence: expense.cadence,
    monthlyAmount: toMonthlyAmount(expense.amount, expense.cadence),
    memberId: expense.memberId,
    category: expense.category,
  })),
].filter((row) => row.monthlyAmount > 0);

const toSharedRows = (plan?: SmartFinancePlan): HouseholdBreakdownRow[] => (plan?.sharedExpenses ?? []).map((expense: SmartFinanceSharedExpense) => ({
  id: expense.id,
  label: expense.title.trim() || SHARED_EXPENSE_LABEL[expense.category],
  amount: validAmount(expense.amount),
  cadence: expense.cadence,
  monthlyAmount: toMonthlyAmount(expense.amount, expense.cadence),
  category: expense.category,
})).filter((row) => row.monthlyAmount > 0);

const profileAlerts = (members: SmartFinanceMember[]) => members.flatMap((member) => {
  const name = memberDisplayName(member);
  const incomplete = !name || !member.relation || !Number.isFinite(member.ageYears) || member.ageYears < 0 || !validAmount(member.heightCm) || !validAmount(member.weightKg) || !member.dietPattern || !member.allergies?.trim();
  const messages: string[] = [];
  if (incomplete) messages.push(`${name || "Satu anggota keluarga"}: lengkapi nama, peran, umur, tinggi, berat, dan pola makan sebelum memakai analisis keluarga secara penuh.`);
  if ((member.activity === "working" || member.activity === "student" || member.activity === "college") && ["motorcycle", "car"].includes(member.planner?.work?.commute?.mode ?? member.planner?.study?.commute?.mode ?? "")) {
    const commute = member.planner?.work?.commute ?? member.planner?.study?.commute;
    if (!commute?.lastServiceDate) messages.push(`${name}: tanggal servis kendaraan belum dicatat. Catat tanggal terakhir sebagai pengingat administratif, bukan prediksi kondisi kendaraan.`);
    if (commute?.nextServiceDate) messages.push(`${name}: jadwal servis berikutnya dicatat ${commute.nextServiceDate}. Pantau kembali sesuai buku kendaraan atau bengkel tepercaya.`);
  }
  return messages;
});

const isFoodPriceItem = (expense: SmartFinanceSharedExpense) => expense.category === "vegetables" || expense.category === "protein" || expense.category === "spices" || (expense.category === "other" && /bumbu|rempah|cabai|bawang/i.test(expense.title));

const priceCategory = (expense: SmartFinanceSharedExpense): HouseholdFoodPriceRecommendation["category"] => expense.category === "protein" ? "protein" : expense.category === "spices" || /bumbu|rempah|cabai|bawang/i.test(expense.title) ? "spices" : "vegetables";

const getFoodPriceRecommendations = (plan?: SmartFinancePlan): HouseholdFoodPriceRecommendation[] => (plan?.sharedExpenses ?? [])
  .filter((expense) => isFoodPriceItem(expense) && validAmount(expense.amount) > 0)
  .map((expense) => {
    const monthlyAmount = toMonthlyAmount(expense.amount, expense.cadence);
    const targetMonthlyAmount = validAmount(expense.targetAmount) > 0 ? toMonthlyAmount(expense.targetAmount, expense.cadence) : undefined;
    return {
      id: expense.id,
      label: expense.title.trim() || SHARED_EXPENSE_LABEL[expense.category],
      category: priceCategory(expense),
      quantity: expense.quantity,
      unit: expense.unit,
      dailyAmount: amountForCadence(monthlyAmount, "daily"),
      weeklyAmount: amountForCadence(monthlyAmount, "weekly"),
      monthlyAmount,
      ...(targetMonthlyAmount ? {
        targetDailyAmount: amountForCadence(targetMonthlyAmount, "daily"),
        targetWeeklyAmount: amountForCadence(targetMonthlyAmount, "weekly"),
        targetMonthlyAmount,
        monthlySavings: monthlyAmount - targetMonthlyAmount,
      } : {}),
    };
  });

const getPantryNotes = (plan?: SmartFinancePlan, foodPriceRecommendations: HouseholdFoodPriceRecommendation[] = []) => {
  const shared = plan?.sharedExpenses ?? [];
  const categories = new Set(shared.map((item) => item.category));
  const notes: string[] = [];
  const rice = shared.find((item) => item.category === "rice");
  if (rice?.quantity && rice.unit) notes.push(`Rencana beras: ${rice.quantity} ${rice.unit} setiap ${CADENCE_LABEL[rice.cadence].toLowerCase()}. Sesuaikan pembelian dengan pemakaian keluarga yang benar-benar tercatat.`);
  if (categories.has("vegetables")) notes.push("Untuk sayur dan bahan segar, rencanakan pembelian sesuai kondisi penyimpanan, label, dan kebiasaan masak keluarga; tidak ada masa simpan yang diasumsikan aplikasi.");
  if (categories.has("protein")) notes.push("Pisahkan catatan lauk/protein berdasarkan kebutuhan dan kebiasaan keluarga. Periksa label bahan ketika ada alergi atau pantangan yang dicatat.");
  if (categories.has("spices")) notes.push("Catat bumbu dapur terpisah agar pembelian kecil seperti bawang, cabai, atau rempah tidak hilang dari total belanja.");
  if (categories.has("cooking_oil") || categories.has("gas")) notes.push("Catat ukuran kemasan minyak dan tabung gas agar jumlah pembelian dapat dibandingkan dengan periode yang sama berikutnya.");
  if (foodPriceRecommendations.length) notes.push("Rekomendasi harga harian, mingguan, dan bulanan dihitung dari nominal belanja yang Anda masukkan. Harga target hemat hanya ditampilkan bila Anda mengisinya; aplikasi tidak mengambil atau mengarang harga pasar.");
  return notes;
};

export function buildHouseholdAnalysis(plan?: SmartFinancePlan, now = new Date()): HouseholdAnalysis {
  const members = plan?.members ?? [];
  const incomeRows = toIncomeRows(plan);
  const personalRows = toPersonalRows(plan);
  const sharedRows = toSharedRows(plan);
  const totalIncome = incomeRows.reduce((total, row) => total + row.monthlyAmount, 0);
  const totalPersonalExpense = personalRows.reduce((total, row) => total + row.monthlyAmount, 0);
  const totalSharedExpense = sharedRows.reduce((total, row) => total + row.monthlyAmount, 0);
  const totalExpense = totalPersonalExpense + totalSharedExpense;
  const foodPriceRecommendations = getFoodPriceRecommendations(plan);
  const remaining = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 0;
  const status: HouseholdAnalysisStatus = totalIncome <= 0 ? "empty" : remaining < 0 ? "over" : expenseRatio >= 0.8 ? "tight" : "healthy";
  const personalByMember = members.map((member) => {
    const rows = personalRows.filter((row) => row.memberId === member.id);
    return { memberId: member.id, memberLabel: memberDisplayName(member), monthlyAmount: rows.reduce((total, row) => total + row.monthlyAmount, 0), rows };
  }).filter((member) => member.rows.length > 0);
  const uncategorizedPersonal = personalRows.filter((row) => !members.some((member) => member.id === row.memberId));
  if (uncategorizedPersonal.length) personalByMember.push({ memberId: "unknown", memberLabel: "Belum dikaitkan ke anggota", monthlyAmount: uncategorizedPersonal.reduce((total, row) => total + row.monthlyAmount, 0), rows: uncategorizedPersonal });

  const alerts = [
    ...(totalIncome <= 0 ? ["Belum ada pemasukan yang bernilai. Isi pemasukan anggota yang bekerja atau sumber tambahan agar sisa dana dapat dihitung."] : []),
    ...(remaining < 0 ? [`Total rencana melebihi pemasukan sebesar Rp${Math.round(Math.abs(remaining)).toLocaleString("id-ID")}. Tinjau nominal dan kebutuhan yang dapat dijadwal ulang.`] : []),
    ...(totalIncome > 0 && expenseRatio >= 0.8 && remaining >= 0 ? ["Rencana memakai sedikitnya 80% pemasukan. Sisakan ruang untuk kebutuhan yang belum tercatat dan perubahan harga."] : []),
    ...profileAlerts(members),
  ];

  const sharedCategories = new Set((plan?.sharedExpenses ?? []).map((expense) => expense.category));
  const missingShared = REQUIRED_SHARED_CATEGORIES.filter((category) => !sharedCategories.has(category)).map((category) => SHARED_EXPENSE_LABEL[category]);
  const transportComparisons = members.flatMap((member) => {
    const commute = member.planner?.work?.commute ?? member.planner?.study?.commute;
    if (!commute?.mode || !commute.comparisonMode || !validAmount(commute.costPerTrip) || !validAmount(commute.comparisonCostPerTrip) || !validAmount(commute.tripsPerDay) || !validAmount(commute.daysPerWeek)) return [];
    const activeMonthly = toMonthlyAmount(validAmount(commute.costPerTrip) * validAmount(commute.tripsPerDay) * validAmount(commute.daysPerWeek), "weekly");
    const comparisonMonthly = toMonthlyAmount(validAmount(commute.comparisonCostPerTrip) * validAmount(commute.tripsPerDay) * validAmount(commute.daysPerWeek), "weekly");
    const difference = comparisonMonthly - activeMonthly;
    const direction = difference > 0 ? "lebih rendah" : difference < 0 ? "lebih tinggi" : "sama";
    return [`Perbandingan ${memberDisplayName(member)} berdasarkan nominal Anda: ${TRANSPORT_MODE_LABEL[commute.mode]} sekitar Rp${Math.round(activeMonthly).toLocaleString("id-ID")}/bulan dibanding ${TRANSPORT_MODE_LABEL[commute.comparisonMode]} sekitar Rp${Math.round(comparisonMonthly).toLocaleString("id-ID")}/bulan; biaya moda pertama ${direction} Rp${Math.round(Math.abs(difference)).toLocaleString("id-ID")}. Ini bukan tarif transportasi real-time.`];
  });
  const suggestions = [
    ...(missingShared.length ? [`Kategori bersama yang belum dicatat: ${missingShared.join(", ")}. Kosong dapat berarti belum ada biaya atau belum dicatat; periksa sebelum menyimpulkan anggaran cukup.`] : []),
    ...(members.filter((member) => member.activity === "working" && member.planner?.work?.mealArrangement === "buy" && !member.planner.work.mealBudget?.amount).map((member) => `${memberDisplayName(member)} memilih makan beli, tetapi anggaran makan belum diisi. Tambahkan hanya jika ingin dihitung.`)),
    ...(members.filter((member) => member.activity === "student" || member.activity === "college").map((member) => `${memberDisplayName(member)} memiliki aktivitas ${ACTIVITY_LABEL[member.activity ?? "other"].toLowerCase()}; pastikan transportasi, uang makan/jajan, kas, dan biaya pendidikan dicatat bila berlaku.`)),
    ...transportComparisons,
    ...foodPriceRecommendations.filter((item) => typeof item.monthlySavings === "number" && item.monthlySavings > 0).map((item) => `Untuk ${item.label}, harga target hemat yang Anda masukkan dapat menurunkan rencana sekitar Rp${Math.round(item.monthlySavings ?? 0).toLocaleString("id-ID")} per bulan pada jumlah dan frekuensi yang sama.`),
    ...(totalIncome > 0 && remaining > 0 ? [`Sisa rencana Rp${Math.round(remaining).toLocaleString("id-ID")} belum otomatis dialokasikan. Tentukan sendiri prioritas, misalnya dana cadangan atau target yang sudah ada.`] : []),
  ];

  return {
    periodLabel: plan?.monthKey || now.toISOString().slice(0, 7),
    generatedAt: now.toISOString(),
    status,
    totalIncome,
    totalPersonalExpense,
    totalSharedExpense,
    totalExpense,
    remaining,
    expenseRatio,
    incomeRows,
    personalByMember,
    sharedRows,
    alerts,
    suggestions,
    pantryNotes: getPantryNotes(plan, foodPriceRecommendations),
    foodPriceRecommendations,
    privacyNote: "Profil dan perencanaan keluarga bersifat privat. Hasil tidak dikirim ke Room Global, grup, atau profil publik.",
    wellbeingNote: "Catatan pangan dan alergi hanya untuk perencanaan umum, bukan diagnosis atau pengaturan porsi medis. Untuk kebutuhan kesehatan penting, libatkan orang tua/wali dan tenaga kesehatan yang sesuai.",
  };
}
