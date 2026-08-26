import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AiraCard, EmptyState, PrimaryButton, SectionHeading } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { ACTIVITY_LABEL, buildHouseholdAnalysis, CADENCE_LABEL, memberDisplayName, RELATION_LABEL, SHARED_EXPENSE_LABEL } from "@/lib/finance/household-finance";
import { useFinance } from "@/lib/finance/finance-context";
import { formatCurrency } from "@/lib/finance/finance-utils";
import { exportHouseholdAnalysisPdf } from "@/lib/finance/report-export";
import { trpc } from "@/lib/trpc";
import type { SmartFinanceCadence, SmartFinanceDietPattern, SmartFinanceMember, SmartFinanceMemberActivity, SmartFinanceMemberRelation, SmartFinancePlan, SmartFinanceSharedExpenseCategory, SmartFinanceTransportMode } from "@/lib/finance/types";

const currentMonthKey = () => new Date().toISOString().slice(0, 7);
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, ""));
const optionalNumber = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};
const periodic = (amount: string, cadence: SmartFinanceCadence = "monthly") => {
  const parsed = parseAmount(amount);
  return parsed > 0 ? { amount: parsed, cadence } : undefined;
};

const relationOptions: SmartFinanceMemberRelation[] = ["husband", "wife", "child", "nephew", "niece", "sibling", "cousin", "father", "mother", "uncle", "aunt", "grandfather", "grandmother", "other"];
const activityOptions: SmartFinanceMemberActivity[] = ["working", "student", "college", "home", "retired", "other"];
const dietOptions: SmartFinanceDietPattern[] = ["seimbang", "rendah_gula", "tinggi_protein", "vegetarian", "halal", "lainnya"];
const transportOptions: { value: SmartFinanceTransportMode; label: string }[] = [
  { value: "walking", label: "Jalan kaki" },
  { value: "bicycle", label: "Sepeda" },
  { value: "motorcycle", label: "Motor" },
  { value: "car", label: "Mobil" },
  { value: "public_transport", label: "Angkutan umum" },
  { value: "online_transport", label: "Transportasi online" },
  { value: "other", label: "Lainnya" },
];
const sharedCategoryOptions: SmartFinanceSharedExpenseCategory[] = ["rice", "cooking_oil", "spices", "gas", "protein", "vegetables", "water", "wifi", "electricity", "tv_subscription", "other_bill", "other"];
const cadenceOptions: SmartFinanceCadence[] = ["daily", "weekly", "monthly"];

type MemberDraft = {
  id?: string;
  name: string;
  relation: SmartFinanceMemberRelation;
  ageYears: string;
  heightCm: string;
  weightKg: string;
  dietPattern: SmartFinanceDietPattern;
  allergies: string;
  activity: SmartFinanceMemberActivity;
  residence: "with_family" | "boarding" | "rented" | "own_home" | "other";
  residenceLabel: string;
  residenceCost: string;
  workplace: string;
  employmentStatus: "full_time" | "part_time" | "freelance" | "shift" | "other";
  shiftLabel: string;
  scheduleLabel: string;
  hoursPerDay: string;
  institution: string;
  commuteMode: SmartFinanceTransportMode;
  routeLabel: string;
  distanceKm: string;
  tripsPerDay: string;
  daysPerWeek: string;
  costPerTrip: string;
  comparisonMode: SmartFinanceTransportMode;
  comparisonCostPerTrip: string;
  fuelBudget: string;
  maintenanceBudget: string;
  lastServiceDate: string;
  nextServiceDate: string;
  parkingBudget: string;
  mealArrangement: "bring_from_home" | "buy" | "mixed" | "other";
  mealBudget: string;
  snackBudget: string;
  recurringCost: string;
  quotaGb: string;
  quotaBudget: string;
  otherCost: string;
};

const emptyMemberDraft = (): MemberDraft => ({
  name: "",
  relation: "other",
  ageYears: "",
  heightCm: "",
  weightKg: "",
  dietPattern: "seimbang",
  allergies: "Tidak ada",
  activity: "home",
  residence: "with_family",
  residenceLabel: "",
  residenceCost: "",
  workplace: "",
  employmentStatus: "full_time",
  shiftLabel: "",
  scheduleLabel: "",
  hoursPerDay: "",
  institution: "",
  commuteMode: "walking",
  routeLabel: "",
  distanceKm: "",
  tripsPerDay: "",
  daysPerWeek: "",
  costPerTrip: "",
  comparisonMode: "public_transport",
  comparisonCostPerTrip: "",
  fuelBudget: "",
  maintenanceBudget: "",
  lastServiceDate: "",
  nextServiceDate: "",
  parkingBudget: "",
  mealArrangement: "bring_from_home",
  mealBudget: "",
  snackBudget: "",
  recurringCost: "",
  quotaGb: "",
  quotaBudget: "",
  otherCost: "",
});

function planForThisMonth(plan?: SmartFinancePlan): SmartFinancePlan {
  const isCurrent = plan?.monthKey === currentMonthKey();
  const current = isCurrent ? plan : undefined;
  const legacyIncomeSources = current?.incomeSources?.length
    ? current.incomeSources
    : [
        ...(current?.income ? [{ id: "legacy-main", label: "Pemasukan utama", amount: current.income, cadence: "monthly" as const, kind: "main" as const }] : []),
        ...(current?.otherIncome ?? []).map((income) => ({ ...income, cadence: income.cadence ?? "monthly", kind: income.kind ?? "additional" as const })),
      ];
  return {
    monthKey: currentMonthKey(),
    income: current?.income ?? 0,
    otherIncome: current?.otherIncome ?? [],
    members: current?.members ?? [],
    riceSacks5kg: current?.riceSacks5kg,
    transport: current?.transport,
    items: current?.items ?? [],
    analysisVersion: 2,
    incomeSources: legacyIncomeSources,
    personalExpenses: current?.personalExpenses ?? [],
    sharedExpenses: current?.sharedExpenses ?? [],
    updatedAt: current?.updatedAt ?? new Date().toISOString(),
  };
}

function cadenceLabel(value: SmartFinanceCadence) {
  return CADENCE_LABEL[value];
}

function selectionLabel(value: string) {
  return value === "with_family" ? "Bersama keluarga" : value === "boarding" ? "Kos/kamar" : value === "rented" ? "Kontrakan" : value === "own_home" ? "Rumah sendiri" : value === "full_time" ? "Penuh waktu" : value === "part_time" ? "Paruh waktu" : value === "freelance" ? "Freelance" : value === "shift" ? "Shift" : value === "bring_from_home" ? "Bawa dari rumah" : value === "buy" ? "Beli" : value === "mixed" ? "Campuran" : value === "other" ? "Lainnya" : value;
}

export default function HouseholdFinanceAnalysisScreen() {
  const colors = useColors();
  const { state, updateProfile } = useFinance();
  const [memberDraft, setMemberDraft] = useState<MemberDraft>(emptyMemberDraft);
  const [incomeLabel, setIncomeLabel] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeMemberId, setIncomeMemberId] = useState("");
  const [incomeKind, setIncomeKind] = useState<"main" | "spouse" | "additional" | "other">("main");
  const [sharedCategory, setSharedCategory] = useState<SmartFinanceSharedExpenseCategory>("rice");
  const [sharedTitle, setSharedTitle] = useState("");
  const [sharedAmount, setSharedAmount] = useState("");
  const [sharedTargetAmount, setSharedTargetAmount] = useState("");
  const [sharedCadence, setSharedCadence] = useState<SmartFinanceCadence>("monthly");
  const [sharedQuantity, setSharedQuantity] = useState("");
  const [sharedUnit, setSharedUnit] = useState("");
  const [sharedNotes, setSharedNotes] = useState("");
  const [personalMemberId, setPersonalMemberId] = useState("");
  const [personalTitle, setPersonalTitle] = useState("");
  const [personalAmount, setPersonalAmount] = useState("");
  const [personalCadence, setPersonalCadence] = useState<SmartFinanceCadence>("monthly");

  const plan = useMemo(() => planForThisMonth(state.profile.smartFinancePlan), [state.profile.smartFinancePlan]);
  const analysis = useMemo(() => buildHouseholdAnalysis(plan), [plan]);
  const canUseServerHistory = state.profile.mode === "account";
  const savedAnalysesQuery = trpc.householdFinance.listMine.useQuery(undefined, { enabled: canUseServerHistory, retry: false });
  const saveAnalysisMutation = trpc.householdFinance.saveAnalysis.useMutation({ onSuccess: () => { void savedAnalysesQuery.refetch(); } });
  const deleteAnalysisMutation = trpc.householdFinance.deleteMine.useMutation({ onSuccess: () => { void savedAnalysesQuery.refetch(); } });
  const savedAnalyses = useMemo(() => (savedAnalysesQuery.data ?? []).map((item) => {
    try {
      const payload = JSON.parse(item.resultJson) as { totalIncome?: number; totalExpense?: number; remaining?: number };
      return { ...item, totalIncome: Number(payload.totalIncome) || 0, totalExpense: Number(payload.totalExpense) || 0, remaining: Number(payload.remaining) || 0 };
    } catch {
      return { ...item, totalIncome: 0, totalExpense: 0, remaining: 0 };
    }
  }), [savedAnalysesQuery.data]);

  const savePlan = async (next: SmartFinancePlan) => {
    await updateProfile({ smartFinancePlan: { ...next, analysisVersion: 2, updatedAt: new Date().toISOString() } });
  };

  const updateDraft = <K extends keyof MemberDraft>(key: K, value: MemberDraft[K]) => setMemberDraft((previous) => ({ ...previous, [key]: value }));

  const saveMember = async () => {
    const ageYears = optionalNumber(memberDraft.ageYears);
    const heightCm = optionalNumber(memberDraft.heightCm);
    const weightKg = optionalNumber(memberDraft.weightKg);
    if (!memberDraft.name.trim() || !memberDraft.relation || !ageYears || !heightCm || !weightKg || !memberDraft.dietPattern || !memberDraft.allergies.trim()) {
      Alert.alert("Profil belum lengkap", "Nama, peran, umur, tinggi, berat, pola makan, dan alergi/pantangan wajib diisi untuk setiap anggota. Jika tidak ada alergi, tulis “Tidak ada”.");
      return;
    }
    if (ageYears > 120 || heightCm > 280 || weightKg > 450) {
      Alert.alert("Profil perlu diperiksa", "Masukkan umur, tinggi, dan berat yang masuk akal. Data ini hanya dipakai sebagai konteks perencanaan umum.");
      return;
    }
    const commute = {
      mode: memberDraft.commuteMode,
      routeLabel: memberDraft.routeLabel.trim() || undefined,
      distanceKm: optionalNumber(memberDraft.distanceKm),
      tripsPerDay: optionalNumber(memberDraft.tripsPerDay),
      daysPerWeek: optionalNumber(memberDraft.daysPerWeek),
      costPerTrip: parseAmount(memberDraft.costPerTrip) || undefined,
      comparisonMode: memberDraft.comparisonMode,
      comparisonCostPerTrip: parseAmount(memberDraft.comparisonCostPerTrip) || undefined,
      fuelBudget: periodic(memberDraft.fuelBudget),
      maintenanceBudget: periodic(memberDraft.maintenanceBudget),
      lastServiceDate: memberDraft.lastServiceDate.trim() || undefined,
      nextServiceDate: memberDraft.nextServiceDate.trim() || undefined,
      parkingBudget: periodic(memberDraft.parkingBudget),
    };
    const planner = {
      residence: memberDraft.residence,
      residenceLabel: memberDraft.residenceLabel.trim() || undefined,
      residenceCost: periodic(memberDraft.residenceCost),
      ...(memberDraft.activity === "working" ? {
        work: {
          workplace: memberDraft.workplace.trim() || undefined,
          employmentStatus: memberDraft.employmentStatus,
          shiftLabel: memberDraft.shiftLabel.trim() || undefined,
          scheduleLabel: memberDraft.scheduleLabel.trim() || undefined,
          hoursPerDay: optionalNumber(memberDraft.hoursPerDay),
          commute,
          mealArrangement: memberDraft.mealArrangement,
          mealBudget: periodic(memberDraft.mealBudget),
          snackBudget: periodic(memberDraft.snackBudget),
          recurringWorkCost: periodic(memberDraft.recurringCost),
          quotaGb: optionalNumber(memberDraft.quotaGb),
          quotaBudget: periodic(memberDraft.quotaBudget),
          otherCost: periodic(memberDraft.otherCost),
        },
      } : {}),
      ...(memberDraft.activity === "student" || memberDraft.activity === "college" ? {
        study: {
          institution: memberDraft.institution.trim() || undefined,
          educationLevel: memberDraft.activity === "college" ? "college" as const : "school" as const,
          scheduleLabel: memberDraft.scheduleLabel.trim() || undefined,
          commute,
          mealAllowance: periodic(memberDraft.mealBudget),
          snackAllowance: periodic(memberDraft.snackBudget),
          recurringEducationCost: periodic(memberDraft.recurringCost),
          quotaGb: optionalNumber(memberDraft.quotaGb),
          quotaBudget: periodic(memberDraft.quotaBudget),
          otherCost: periodic(memberDraft.otherCost),
        },
      } : {}),
    };
    const member: SmartFinanceMember = {
      id: memberDraft.id ?? createId("household-member"),
      label: memberDraft.name.trim(),
      name: memberDraft.name.trim(),
      relation: memberDraft.relation,
      ageYears,
      heightCm,
      weightKg,
      dietPattern: memberDraft.dietPattern,
      allergies: memberDraft.allergies.trim(),
      activity: memberDraft.activity,
      planner,
    };
    await savePlan({ ...plan, members: memberDraft.id ? plan.members?.map((item) => item.id === memberDraft.id ? member : item) : [...(plan.members ?? []), member] });
    setMemberDraft(emptyMemberDraft());
  };

  const editMember = (member: SmartFinanceMember) => {
    const work = member.planner?.work;
    const study = member.planner?.study;
    const commute = work?.commute ?? study?.commute;
    setMemberDraft({
      ...emptyMemberDraft(),
      id: member.id,
      name: memberDisplayName(member),
      relation: member.relation,
      ageYears: String(member.ageYears),
      heightCm: member.heightCm ? String(member.heightCm) : "",
      weightKg: member.weightKg ? String(member.weightKg) : "",
      dietPattern: member.dietPattern ?? "seimbang",
      allergies: member.allergies ?? "Tidak ada",
      activity: member.activity ?? "home",
      residence: member.planner?.residence ?? "with_family",
      residenceLabel: member.planner?.residenceLabel ?? "",
      residenceCost: member.planner?.residenceCost?.amount ? String(member.planner.residenceCost.amount) : "",
      workplace: work?.workplace ?? "",
      employmentStatus: work?.employmentStatus ?? "full_time",
      shiftLabel: work?.shiftLabel ?? "",
      scheduleLabel: work?.scheduleLabel ?? study?.scheduleLabel ?? "",
      hoursPerDay: work?.hoursPerDay ? String(work.hoursPerDay) : "",
      institution: study?.institution ?? "",
      commuteMode: commute?.mode ?? "walking",
      routeLabel: commute?.routeLabel ?? "",
      distanceKm: commute?.distanceKm ? String(commute.distanceKm) : "",
      tripsPerDay: commute?.tripsPerDay ? String(commute.tripsPerDay) : "",
      daysPerWeek: commute?.daysPerWeek ? String(commute.daysPerWeek) : "",
      costPerTrip: commute?.costPerTrip ? String(commute.costPerTrip) : "",
      comparisonMode: commute?.comparisonMode ?? "public_transport",
      comparisonCostPerTrip: commute?.comparisonCostPerTrip ? String(commute.comparisonCostPerTrip) : "",
      fuelBudget: commute?.fuelBudget?.amount ? String(commute.fuelBudget.amount) : "",
      maintenanceBudget: commute?.maintenanceBudget?.amount ? String(commute.maintenanceBudget.amount) : "",
      lastServiceDate: commute?.lastServiceDate ?? "",
      nextServiceDate: commute?.nextServiceDate ?? "",
      parkingBudget: commute?.parkingBudget?.amount ? String(commute.parkingBudget.amount) : "",
      mealArrangement: work?.mealArrangement ?? "bring_from_home",
      mealBudget: (work?.mealBudget ?? study?.mealAllowance)?.amount ? String((work?.mealBudget ?? study?.mealAllowance)?.amount) : "",
      snackBudget: (work?.snackBudget ?? study?.snackAllowance)?.amount ? String((work?.snackBudget ?? study?.snackAllowance)?.amount) : "",
      recurringCost: (work?.recurringWorkCost ?? study?.recurringEducationCost)?.amount ? String((work?.recurringWorkCost ?? study?.recurringEducationCost)?.amount) : "",
      quotaGb: (work?.quotaGb ?? study?.quotaGb) ? String(work?.quotaGb ?? study?.quotaGb) : "",
      quotaBudget: (work?.quotaBudget ?? study?.quotaBudget)?.amount ? String((work?.quotaBudget ?? study?.quotaBudget)?.amount) : "",
      otherCost: (work?.otherCost ?? study?.otherCost)?.amount ? String((work?.otherCost ?? study?.otherCost)?.amount) : "",
    });
  };

  const removeMember = (id: string) => Alert.alert("Hapus anggota?", "Profil dan pengeluaran tambahan yang terkait dengannya akan dihapus dari rencana ini.", [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: () => { void savePlan({ ...plan, members: plan.members?.filter((member) => member.id !== id), personalExpenses: plan.personalExpenses?.filter((expense) => expense.memberId !== id) }); if (memberDraft.id === id) setMemberDraft(emptyMemberDraft()); } },
  ]);

  const addIncome = async () => {
    const amount = parseAmount(incomeAmount);
    await savePlan({ ...plan, incomeSources: [...(plan.incomeSources ?? []), { id: createId("income"), label: incomeLabel.trim() || "Pemasukan tanpa nama", amount, cadence: "monthly", memberId: incomeMemberId || undefined, kind: incomeKind }] });
    setIncomeLabel("");
    setIncomeAmount("");
    setIncomeMemberId("");
    setIncomeKind("main");
  };

  const addSharedExpense = async () => {
    await savePlan({ ...plan, sharedExpenses: [...(plan.sharedExpenses ?? []), { id: createId("shared"), title: sharedTitle.trim() || SHARED_EXPENSE_LABEL[sharedCategory], category: sharedCategory, amount: parseAmount(sharedAmount), targetAmount: parseAmount(sharedTargetAmount) || undefined, cadence: sharedCadence, quantity: optionalNumber(sharedQuantity), unit: sharedUnit.trim() || undefined, notes: sharedNotes.trim() || undefined }] });
    setSharedTitle(""); setSharedAmount(""); setSharedTargetAmount(""); setSharedCadence("monthly"); setSharedQuantity(""); setSharedUnit(""); setSharedNotes("");
  };

  const addPersonalExpense = async () => {
    if (!personalMemberId) {
      Alert.alert("Pilih anggota", "Pilih anggota keluarga agar pengeluaran tambahan tetap terpisah per orang.");
      return;
    }
    await savePlan({ ...plan, personalExpenses: [...(plan.personalExpenses ?? []), { id: createId("personal"), memberId: personalMemberId, title: personalTitle.trim() || "Pengeluaran pribadi", category: "other", amount: parseAmount(personalAmount), cadence: personalCadence }] });
    setPersonalMemberId(""); setPersonalTitle(""); setPersonalAmount(""); setPersonalCadence("monthly");
  };

  const saveAnalysisToServer = async () => {
    if (!canUseServerHistory) {
      Alert.alert("Masuk diperlukan", "Hasil hanya dapat disimpan ke server pada akun yang sedang masuk. Profil keluarga mentah tetap tersimpan di perangkat.", [{ text: "Nanti", style: "cancel" }, { text: "Masuk", onPress: () => router.push("/login" as never) }]);
      return;
    }
    const safeResult = {
      version: 1,
      periodKey: analysis.periodLabel,
      generatedAt: analysis.generatedAt,
      status: analysis.status,
      totalIncome: analysis.totalIncome,
      totalPersonalExpense: analysis.totalPersonalExpense,
      totalSharedExpense: analysis.totalSharedExpense,
      totalExpense: analysis.totalExpense,
      remaining: analysis.remaining,
      incomeRows: analysis.incomeRows.map((row) => ({ label: row.label, monthlyAmount: row.monthlyAmount, cadence: row.cadence })),
      personalByMember: analysis.personalByMember.map((member) => ({ label: member.memberLabel, monthlyAmount: member.monthlyAmount, rows: member.rows.map((row) => ({ label: row.label, monthlyAmount: row.monthlyAmount })) })),
      sharedRows: analysis.sharedRows.map((row) => ({ label: row.label, monthlyAmount: row.monthlyAmount, cadence: row.cadence })),
      foodPriceRecommendations: analysis.foodPriceRecommendations,
      alerts: analysis.alerts,
      suggestions: analysis.suggestions,
      pantryNotes: analysis.pantryNotes,
      wellbeingNote: analysis.wellbeingNote,
      privacyNote: analysis.privacyNote,
    };
    try {
      await saveAnalysisMutation.mutateAsync({ title: `Analisis rumah tangga ${analysis.periodLabel}`, periodKey: analysis.periodLabel, resultJson: JSON.stringify(safeResult) });
      Alert.alert("Hasil tersimpan", "Ringkasan analisis disimpan privat pada akun ini. Tinggi, berat, alergi, dan jawaban profil mentah tidak dikirim ke server.");
    } catch (error) {
      Alert.alert("Penyimpanan gagal", error instanceof Error ? error.message : "Hasil belum dapat disimpan. Coba lagi ketika koneksi tersedia.");
    }
  };

  const exportAnalysisPdf = async () => {
    try {
      await exportHouseholdAnalysisPdf(analysis);
    } catch (error) {
      Alert.alert("Ekspor gagal", error instanceof Error ? error.message : "PDF belum dapat dibuat pada perangkat ini.");
    }
  };

  const deleteSavedAnalysis = (id: number) => Alert.alert("Hapus hasil tersimpan?", "Hasil akan dihapus dari server akun ini. Rencana lokal pada perangkat tidak ikut dihapus.", [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: () => { void deleteAnalysisMutation.mutateAsync({ id }).catch((error: unknown) => Alert.alert("Penghapusan gagal", error instanceof Error ? error.message : "Coba lagi.")); } },
  ]);

  const viewSavedAnalysis = (title: string, raw: string) => {
    try {
      const payload = JSON.parse(raw) as { periodKey?: string; totalIncome?: number; totalPersonalExpense?: number; totalSharedExpense?: number; totalExpense?: number; remaining?: number; alerts?: string[]; suggestions?: string[] };
      const notes = [...(payload.alerts ?? []), ...(payload.suggestions ?? [])].slice(0, 4);
      Alert.alert(title, [`Periode: ${payload.periodKey ?? "—"}`, `Total pendapatan: ${formatCurrency(Number(payload.totalIncome) || 0)}`, `Pengeluaran pribadi: ${formatCurrency(Number(payload.totalPersonalExpense) || 0)}`, `Pengeluaran bersama: ${formatCurrency(Number(payload.totalSharedExpense) || 0)}`, `Total pengeluaran: ${formatCurrency(Number(payload.totalExpense) || 0)}`, `Sisa dana: ${formatCurrency(Number(payload.remaining) || 0)}`, ...(notes.length ? ["", ...notes] : [])].join("\n"));
    } catch {
      Alert.alert("Hasil tersimpan", "Ringkasan lama tidak dapat dibaca sepenuhnya. Anda masih dapat menghapusnya dari daftar ini.");
    }
  };

  const sectionButton = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}14` : colors.background }, pressed && styles.pressed]}>
      <Text style={[styles.chipText, { color: selected ? colors.primary : colors.foreground }]}>{label}</Text>
    </Pressable>
  );

  const field = (label: string, value: string, onChangeText: (value: string) => void, options?: { placeholder?: string; numeric?: boolean; multiline?: boolean }) => (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={options?.placeholder ?? "Boleh dikosongkan"} placeholderTextColor={colors.muted} keyboardType={options?.numeric ? "decimal-pad" : "default"} multiline={options?.multiline} style={[styles.input, options?.multiline && styles.multilineInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
    </View>
  );

  const memberChooser = (selectedId: string, onChange: (id: string) => void) => (
    <View style={styles.chipRow}>
      {(plan.members ?? []).map((member) => sectionButton(memberDisplayName(member), selectedId === member.id, () => onChange(selectedId === member.id ? "" : member.id)))}
      {!plan.members?.length ? <Text style={[styles.helper, { color: colors.muted }]}>Tambahkan profil anggota terlebih dahulu.</Text> : null}
    </View>
  );

  const workingOrStudy = memberDraft.activity === "working" || memberDraft.activity === "student" || memberDraft.activity === "college";
  const vehicleCommute = memberDraft.commuteMode === "motorcycle" || memberDraft.commuteMode === "car";

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={20} color={colors.foreground} />
            </Pressable>
            <View style={styles.flex}>
              <Text style={[styles.title, { color: colors.foreground }]}>Perencana Rumah Tangga</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Keuangan Pintar · {analysis.periodLabel}</Text>
            </View>
          </View>

          <AiraCard style={[styles.heroCard, { borderColor: `${colors.primary}55` }]}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}><MaterialIcons name="family-restroom" size={24} color="#FFFFFF" /></View>
            <View style={styles.flex}>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>Rencana yang dipisah dengan jelas</Text>
              <Text style={[styles.helper, { color: colors.muted }]}>Pemasukan, biaya pribadi per anggota, dan kebutuhan bersama dihitung per bulan. Pertanyaan selain profil anggota boleh dikosongkan.</Text>
            </View>
          </AiraCard>

          <SectionHeading title="1. Profil anggota keluarga" />
          <Text style={[styles.sectionHelper, { color: colors.muted }]}>Wajib: nama, peran, umur, tinggi, berat, pola makan, dan alergi/pantangan.</Text>
          <AiraCard style={styles.card}>
            {field("Nama anggota", memberDraft.name, (value) => updateDraft("name", value), { placeholder: "Contoh: Andi" })}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Peran dalam keluarga</Text>
            <View style={styles.chipRow}>{relationOptions.map((relation) => sectionButton(RELATION_LABEL[relation], memberDraft.relation === relation, () => updateDraft("relation", relation)))}</View>
            <View style={styles.twoColumn}>
              <View style={styles.half}>{field("Umur (tahun)", memberDraft.ageYears, (value) => updateDraft("ageYears", value), { numeric: true, placeholder: "Wajib" })}</View>
              <View style={styles.half}>{field("Tinggi (cm)", memberDraft.heightCm, (value) => updateDraft("heightCm", value), { numeric: true, placeholder: "Wajib" })}</View>
            </View>
            <View style={styles.twoColumn}>
              <View style={styles.half}>{field("Berat (kg)", memberDraft.weightKg, (value) => updateDraft("weightKg", value), { numeric: true, placeholder: "Wajib" })}</View>
              <View style={styles.half}>{field("Alergi/pantangan", memberDraft.allergies, (value) => updateDraft("allergies", value), { placeholder: "Tulis Tidak ada bila tidak ada" })}</View>
            </View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Pola makan</Text>
            <View style={styles.chipRow}>{dietOptions.map((diet) => sectionButton(diet === "rendah_gula" ? "Rendah gula" : diet === "tinggi_protein" ? "Tinggi protein" : diet[0].toUpperCase() + diet.slice(1), memberDraft.dietPattern === diet, () => updateDraft("dietPattern", diet)))}</View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Aktivitas utama</Text>
            <View style={styles.chipRow}>{activityOptions.map((activity) => sectionButton(ACTIVITY_LABEL[activity], memberDraft.activity === activity, () => updateDraft("activity", activity)))}</View>
          </AiraCard>

          {workingOrStudy ? <>
            <SectionHeading title={memberDraft.activity === "working" ? "2. Kondisi kerja dan biaya pribadi" : "2. Kondisi sekolah/kuliah dan biaya pribadi"} />
            <Text style={[styles.sectionHelper, { color: colors.muted }]}>Semua isian berikut opsional. Isi hanya biaya yang ingin dihitung.</Text>
            <AiraCard style={styles.card}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tempat tinggal</Text>
              <View style={styles.chipRow}>{(["with_family", "boarding", "rented", "own_home", "other"] as const).map((value) => sectionButton(selectionLabel(value), memberDraft.residence === value, () => updateDraft("residence", value)))}</View>
              {field("Keterangan tempat tinggal", memberDraft.residenceLabel, (value) => updateDraft("residenceLabel", value), { placeholder: "Contoh: dekat keluarga / sewa kamar" })}
              {field("Biaya tempat tinggal per bulan", memberDraft.residenceCost, (value) => updateDraft("residenceCost", value), { numeric: true })}
              {memberDraft.activity === "working" ? <>
                {field("Tempat kerja", memberDraft.workplace, (value) => updateDraft("workplace", value), { placeholder: "Nama/lokasi kerja" })}
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Status kerja</Text>
                <View style={styles.chipRow}>{(["full_time", "part_time", "freelance", "shift", "other"] as const).map((value) => sectionButton(selectionLabel(value), memberDraft.employmentStatus === value, () => updateDraft("employmentStatus", value)))}</View>
                {field("Shift", memberDraft.shiftLabel, (value) => updateDraft("shiftLabel", value), { placeholder: "Contoh: pagi / malam" })}
                {field("Jadwal kerja", memberDraft.scheduleLabel, (value) => updateDraft("scheduleLabel", value), { placeholder: "Contoh: Senin–Jumat" })}
                {field("Jam kerja per hari", memberDraft.hoursPerDay, (value) => updateDraft("hoursPerDay", value), { numeric: true })}
              </> : <>
                {field(memberDraft.activity === "college" ? "Kampus" : "Sekolah", memberDraft.institution, (value) => updateDraft("institution", value), { placeholder: "Nama/lokasi" })}
                {field("Jadwal belajar", memberDraft.scheduleLabel, (value) => updateDraft("scheduleLabel", value), { placeholder: "Contoh: Senin–Jumat" })}
              </>}
              <Text style={[styles.formSubheading, { color: colors.foreground }]}>Transportasi</Text>
              <View style={styles.chipRow}>{transportOptions.map((item) => sectionButton(item.label, memberDraft.commuteMode === item.value, () => updateDraft("commuteMode", item.value)))}</View>
              {field("Rute/tujuan (hanya catatan Anda)", memberDraft.routeLabel, (value) => updateDraft("routeLabel", value), { placeholder: "Jangan masukkan alamat lengkap bila tidak perlu" })}
              <View style={styles.twoColumn}>
                <View style={styles.half}>{field("Jarak km", memberDraft.distanceKm, (value) => updateDraft("distanceKm", value), { numeric: true })}</View>
                <View style={styles.half}>{field("Perjalanan/hari", memberDraft.tripsPerDay, (value) => updateDraft("tripsPerDay", value), { numeric: true })}</View>
              </View>
              <View style={styles.twoColumn}>
                <View style={styles.half}>{field("Hari/minggu", memberDraft.daysPerWeek, (value) => updateDraft("daysPerWeek", value), { numeric: true })}</View>
                <View style={styles.half}>{field("Biaya/trip", memberDraft.costPerTrip, (value) => updateDraft("costPerTrip", value), { numeric: true })}</View>
              </View>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Moda pembanding (opsional)</Text>
              <View style={styles.chipRow}>{transportOptions.map((item) => sectionButton(item.label, memberDraft.comparisonMode === item.value, () => updateDraft("comparisonMode", item.value)))}</View>
              {field("Biaya/trip moda pembanding", memberDraft.comparisonCostPerTrip, (value) => updateDraft("comparisonCostPerTrip", value), { numeric: true, placeholder: "Diisi jika ingin perbandingan" })}
              {vehicleCommute ? <>
                <View style={styles.twoColumn}>
                  <View style={styles.half}>{field("Bensin/bulan", memberDraft.fuelBudget, (value) => updateDraft("fuelBudget", value), { numeric: true })}</View>
                  <View style={styles.half}>{field("Servis/bulan", memberDraft.maintenanceBudget, (value) => updateDraft("maintenanceBudget", value), { numeric: true })}</View>
                </View>
                {field("Tanggal servis terakhir", memberDraft.lastServiceDate, (value) => updateDraft("lastServiceDate", value), { placeholder: "DD-MM-YYYY, opsional" })}
                {field("Jadwal servis berikutnya", memberDraft.nextServiceDate, (value) => updateDraft("nextServiceDate", value), { placeholder: "DD-MM-YYYY, opsional" })}
                {field("Parkir/bulan", memberDraft.parkingBudget, (value) => updateDraft("parkingBudget", value), { numeric: true })}
              </> : null}
              <Text style={[styles.formSubheading, { color: colors.foreground }]}>Makan, jajan, kuota, dan biaya lain</Text>
              {memberDraft.activity === "working" ? <><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Pengaturan makan</Text><View style={styles.chipRow}>{(["bring_from_home", "buy", "mixed", "other"] as const).map((value) => sectionButton(selectionLabel(value), memberDraft.mealArrangement === value, () => updateDraft("mealArrangement", value)))}</View></> : null}
              <View style={styles.twoColumn}>
                <View style={styles.half}>{field(memberDraft.activity === "working" ? "Makan/bulan" : "Uang makan/bulan", memberDraft.mealBudget, (value) => updateDraft("mealBudget", value), { numeric: true })}</View>
                <View style={styles.half}>{field(memberDraft.activity === "working" ? "Jajan/bulan" : "Uang jajan/bulan", memberDraft.snackBudget, (value) => updateDraft("snackBudget", value), { numeric: true })}</View>
              </View>
              {field(memberDraft.activity === "working" ? "Biaya kerja rutin/bulan" : "Biaya sekolah/kuliah rutin/bulan", memberDraft.recurringCost, (value) => updateDraft("recurringCost", value), { numeric: true, placeholder: "Kas, perlengkapan, iuran, dll." })}
              <View style={styles.twoColumn}>
                <View style={styles.half}>{field("Kuota (GB)", memberDraft.quotaGb, (value) => updateDraft("quotaGb", value), { numeric: true })}</View>
                <View style={styles.half}>{field("Biaya kuota/bulan", memberDraft.quotaBudget, (value) => updateDraft("quotaBudget", value), { numeric: true })}</View>
              </View>
              {field("Biaya pribadi lain/bulan", memberDraft.otherCost, (value) => updateDraft("otherCost", value), { numeric: true })}
            </AiraCard>
          </> : null}

          <PrimaryButton label={memberDraft.id ? "Simpan perubahan anggota" : "Tambah anggota keluarga"} onPress={() => { void saveMember(); }} />
          {memberDraft.id ? <Pressable onPress={() => setMemberDraft(emptyMemberDraft())} style={({ pressed }) => [styles.secondaryAction, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.secondaryText, { color: colors.foreground }]}>Batal edit anggota</Text></Pressable> : null}

          {(plan.members ?? []).length ? <AiraCard style={styles.card}><Text style={[styles.formSubheading, { color: colors.foreground }]}>Profil tersimpan</Text>{(plan.members ?? []).map((member) => <View key={member.id} style={[styles.listRow, { borderBottomColor: colors.border }]}><View style={styles.flex}><Text style={[styles.listTitle, { color: colors.foreground }]}>{memberDisplayName(member)} · {RELATION_LABEL[member.relation]}</Text><Text style={[styles.helper, { color: colors.muted }]}>{member.ageYears} tahun · {ACTIVITY_LABEL[member.activity ?? "other"]} · {member.dietPattern ?? "Pola belum dicatat"}</Text></View><Pressable accessibilityLabel={`Ubah ${memberDisplayName(member)}`} onPress={() => editMember(member)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="edit" size={19} color={colors.primary} /></Pressable><Pressable accessibilityLabel={`Hapus ${memberDisplayName(member)}`} onPress={() => removeMember(member.id)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={20} color={colors.error} /></Pressable></View>)}</AiraCard> : null}

          <SectionHeading title="3. Pendapatan keluarga" />
          <Text style={[styles.sectionHelper, { color: colors.muted }]}>Pemasukan anggota yang bekerja, pasangan, dan sumber tambahan bersifat opsional.</Text>
          <AiraCard style={styles.card}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Jenis pemasukan</Text>
            <View style={styles.chipRow}>{(["main", "spouse", "additional", "other"] as const).map((kind) => sectionButton(kind === "main" ? "Utama" : kind === "spouse" ? "Pasangan" : kind === "additional" ? "Tambahan" : "Lainnya", incomeKind === kind, () => setIncomeKind(kind)))}</View>
            {field("Sumber pemasukan", incomeLabel, setIncomeLabel, { placeholder: "Contoh: Gaji, usaha, bonus" })}
            {field("Nominal per bulan", incomeAmount, setIncomeAmount, { numeric: true, placeholder: "Boleh kosong bila belum diketahui" })}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Kaitkan ke anggota (opsional)</Text>
            {memberChooser(incomeMemberId, setIncomeMemberId)}
            <Pressable onPress={() => { void addIncome(); }} style={({ pressed }) => [styles.outlineAction, { borderColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="add-card" size={18} color={colors.primary} /><Text style={[styles.outlineText, { color: colors.primary }]}>Tambahkan pemasukan</Text></Pressable>
            {(plan.incomeSources ?? []).map((income) => <View key={income.id} style={[styles.listRow, { borderBottomColor: colors.border }]}><View style={styles.flex}><Text style={[styles.listTitle, { color: colors.foreground }]}>{income.label}</Text><Text style={[styles.helper, { color: colors.muted }]}>{formatCurrency(income.amount)} · {cadenceLabel(income.cadence ?? "monthly")}</Text></View><Pressable onPress={() => { void savePlan({ ...plan, incomeSources: plan.incomeSources?.filter((item) => item.id !== income.id) }); }} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={colors.error} /></Pressable></View>)}
          </AiraCard>

          <SectionHeading title="4. Pengeluaran pribadi tambahan" />
          <Text style={[styles.sectionHelper, { color: colors.muted }]}>Biaya dari kuesioner kerja/sekolah dihitung otomatis; tambahkan yang belum tercakup di sini.</Text>
          <AiraCard style={styles.card}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Untuk anggota</Text>{memberChooser(personalMemberId, setPersonalMemberId)}
            {field("Nama biaya", personalTitle, setPersonalTitle, { placeholder: "Contoh: kas komunitas" })}
            <View style={styles.twoColumn}><View style={styles.half}>{field("Nominal", personalAmount, setPersonalAmount, { numeric: true })}</View><View style={styles.half}><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Periode</Text><View style={styles.chipRow}>{cadenceOptions.map((cadence) => sectionButton(cadenceLabel(cadence), personalCadence === cadence, () => setPersonalCadence(cadence)))}</View></View></View>
            <Pressable onPress={() => { void addPersonalExpense(); }} style={({ pressed }) => [styles.outlineAction, { borderColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="person-add-alt-1" size={18} color={colors.primary} /><Text style={[styles.outlineText, { color: colors.primary }]}>Tambah biaya pribadi</Text></Pressable>
            {(plan.personalExpenses ?? []).map((expense) => <View key={expense.id} style={[styles.listRow, { borderBottomColor: colors.border }]}><View style={styles.flex}><Text style={[styles.listTitle, { color: colors.foreground }]}>{expense.title}</Text><Text style={[styles.helper, { color: colors.muted }]}>{formatCurrency(expense.amount)} · {cadenceLabel(expense.cadence)}</Text></View><Pressable onPress={() => { void savePlan({ ...plan, personalExpenses: plan.personalExpenses?.filter((item) => item.id !== expense.id) }); }} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={colors.error} /></Pressable></View>)}
          </AiraCard>

          <SectionHeading title="5. Kebutuhan bersama rumah tangga" />
          <Text style={[styles.sectionHelper, { color: colors.muted }]}>Beras, minyak, gas, lauk, sayur, air, WiFi, listrik, TV, tagihan lain, serta biaya bersama lainnya.</Text>
          <AiraCard style={styles.card}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Kategori kebutuhan bersama</Text>
            <View style={styles.chipRow}>{sharedCategoryOptions.map((category) => sectionButton(SHARED_EXPENSE_LABEL[category], sharedCategory === category, () => setSharedCategory(category)))}</View>
            {field("Nama/keterangan", sharedTitle, setSharedTitle, { placeholder: SHARED_EXPENSE_LABEL[sharedCategory] })}
            <View style={styles.twoColumn}><View style={styles.half}>{field("Harga catatan", sharedAmount, setSharedAmount, { numeric: true, placeholder: "Boleh kosong dahulu" })}</View><View style={styles.half}><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Frekuensi</Text><View style={styles.chipRow}>{cadenceOptions.map((cadence) => sectionButton(cadenceLabel(cadence), sharedCadence === cadence, () => setSharedCadence(cadence)))}</View></View></View>
            <View style={styles.twoColumn}><View style={styles.half}>{field("Jumlah", sharedQuantity, setSharedQuantity, { numeric: true, placeholder: "Contoh: 5" })}</View><View style={styles.half}>{field("Satuan", sharedUnit, setSharedUnit, { placeholder: "kg, liter, tabung" })}</View></View>
            {(["vegetables", "protein", "spices"] as SmartFinanceSharedExpenseCategory[]).includes(sharedCategory) ? field("Harga target hemat (opsional)", sharedTargetAmount, setSharedTargetAmount, { numeric: true, placeholder: "Harga murah untuk jumlah dan periode yang sama" }) : null}
            {field("Catatan", sharedNotes, setSharedNotes, { placeholder: "Merek, ukuran, atau tagihan", multiline: true })}
            <Pressable onPress={() => { void addSharedExpense(); }} style={({ pressed }) => [styles.outlineAction, { borderColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="add-shopping-cart" size={18} color={colors.primary} /><Text style={[styles.outlineText, { color: colors.primary }]}>Tambahkan kebutuhan bersama</Text></Pressable>
            {(plan.sharedExpenses ?? []).map((expense) => <View key={expense.id} style={[styles.listRow, { borderBottomColor: colors.border }]}><View style={styles.flex}><Text style={[styles.listTitle, { color: colors.foreground }]}>{expense.title}</Text><Text style={[styles.helper, { color: colors.muted }]}>{formatCurrency(expense.amount)} · {cadenceLabel(expense.cadence)}{expense.quantity && expense.unit ? ` · ${expense.quantity} ${expense.unit}` : ""}{expense.targetAmount ? ` · target hemat ${formatCurrency(expense.targetAmount)}` : ""}</Text></View><Pressable onPress={() => { void savePlan({ ...plan, sharedExpenses: plan.sharedExpenses?.filter((item) => item.id !== expense.id) }); }} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={colors.error} /></Pressable></View>)}
          </AiraCard>

          <SectionHeading title="Hasil analisis" />
          <Text style={[styles.sectionHelper, { color: colors.muted }]}>Semua nominal dinormalisasi secara transparan: harian × 30, mingguan × 52/12, bulanan × 1.</Text>
          <AiraCard style={[styles.analysisCard, { borderColor: analysis.status === "over" ? `${colors.error}88` : analysis.status === "tight" ? `${colors.warning}88` : `${colors.success}88` }]}>
            <View style={styles.metricGrid}>
              <Metric label="Total pendapatan" value={formatCurrency(analysis.totalIncome)} color={colors.success} />
              <Metric label="Pribadi" value={formatCurrency(analysis.totalPersonalExpense)} color={colors.foreground} />
              <Metric label="Bersama" value={formatCurrency(analysis.totalSharedExpense)} color={colors.foreground} />
              <Metric label="Total pengeluaran" value={formatCurrency(analysis.totalExpense)} color={colors.error} />
            </View>
            <View style={[styles.remainingRow, { backgroundColor: analysis.remaining < 0 ? `${colors.error}12` : `${colors.success}12` }]}><Text style={[styles.remainingLabel, { color: colors.foreground }]}>Sisa dana rencana</Text><Text style={[styles.remainingValue, { color: analysis.remaining < 0 ? colors.error : colors.success }]}>{formatCurrency(analysis.remaining)}</Text></View>
            <AnalysisList title="Peringatan yang perlu diperiksa" messages={analysis.alerts} empty="Belum ada peringatan dari data yang tersedia." color={colors.warning} />
            <AnalysisList title="Saran berdasarkan data" messages={analysis.suggestions} empty="Tambahkan data untuk mendapatkan saran yang lebih relevan." color={colors.primary} />
            <AnalysisList title="Catatan belanja dan pangan" messages={analysis.pantryNotes} empty="Catat kebutuhan pangan bersama beserta jumlah dan satuannya untuk menampilkan ringkasan belanja." color={colors.success} />
            <FoodPriceRecommendations rows={analysis.foodPriceRecommendations} />
            <Text style={[styles.disclaimer, { color: colors.muted }]}>{analysis.wellbeingNote}</Text>
            <Text style={[styles.disclaimer, { color: colors.muted }]}>{analysis.privacyNote}</Text>
            <PrimaryButton label={saveAnalysisMutation.isPending ? "Menyimpan hasil..." : "Simpan hasil ke server"} onPress={() => { void saveAnalysisToServer(); }} />
            <Pressable onPress={() => { void exportAnalysisPdf(); }} style={({ pressed }) => [styles.outlineAction, { borderColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="picture-as-pdf" size={18} color={colors.primary} /><Text style={[styles.outlineText, { color: colors.primary }]}>Ekspor hasil ke PDF</Text></Pressable>
          </AiraCard>

          {analysis.incomeRows.length || analysis.personalByMember.length || analysis.sharedRows.length ? <><AiraCard style={styles.card}><Text style={[styles.formSubheading, { color: colors.foreground }]}>Rincian yang dihitung per bulan</Text>{analysis.incomeRows.map((row) => <BreakdownRow key={`income-${row.id}`} label={`Masuk · ${row.label}`} amount={row.monthlyAmount} color={colors.success} />)}{analysis.personalByMember.map((member) => <View key={member.memberId}><Text style={[styles.memberTotal, { color: colors.foreground }]}>{member.memberLabel} · pribadi {formatCurrency(member.monthlyAmount)}</Text>{member.rows.map((row) => <BreakdownRow key={row.id} label={row.label} amount={row.monthlyAmount} color={colors.foreground} />)}</View>)}{analysis.sharedRows.map((row) => <BreakdownRow key={`shared-${row.id}`} label={`Bersama · ${row.label}`} amount={row.monthlyAmount} color={colors.foreground} />)}</AiraCard><AiraCard style={styles.card}><Text style={[styles.formSubheading, { color: colors.foreground }]}>Total keseluruhan — setelah semua rincian</Text><BreakdownRow label="Jumlah pemasukan" amount={analysis.totalIncome} color={colors.success} /><BreakdownRow label="Jumlah pengeluaran pribadi" amount={analysis.totalPersonalExpense} color={colors.foreground} /><BreakdownRow label="Jumlah pengeluaran bersama" amount={analysis.totalSharedExpense} color={colors.foreground} /><View style={styles.totalDivider} /><BreakdownRow label="TOTAL SEMUA HARGA / BIAYA" amount={analysis.totalExpense} color={colors.error} /><View style={[styles.remainingRow, { backgroundColor: analysis.remaining < 0 ? `${colors.error}12` : `${colors.success}12` }]}><Text style={[styles.remainingLabel, { color: colors.foreground }]}>NILAI AKHIR RENCANA</Text><Text style={[styles.remainingValue, { color: analysis.remaining < 0 ? colors.error : colors.success }]}>{formatCurrency(analysis.remaining)}</Text></View></AiraCard></> : <EmptyState icon="warning" title="Belum ada angka untuk dihitung" detail="Isi pemasukan atau biaya yang ingin direncanakan. Data boleh dilengkapi bertahap." />}
          {canUseServerHistory ? <AiraCard style={styles.card}><Text style={[styles.formSubheading, { color: colors.foreground }]}>Hasil tersimpan di server akun</Text><Text style={[styles.helper, { color: colors.muted }]}>Riwayat berikut hanya terlihat setelah masuk ke akun yang sama. Tidak pernah ditampilkan di Room Global atau grup.</Text>{savedAnalysesQuery.isLoading ? <Text style={[styles.helper, { color: colors.muted }]}>Memuat riwayat tersimpan…</Text> : savedAnalyses.length ? savedAnalyses.map((item) => <View key={item.id} style={[styles.listRow, { borderBottomColor: colors.border }]}><Pressable accessibilityRole="button" accessibilityLabel={`Lihat ${item.title}`} onPress={() => viewSavedAnalysis(item.title, item.resultJson)} style={({ pressed }) => [styles.flex, pressed && styles.pressed]}><Text style={[styles.listTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.helper, { color: colors.muted }]}>{item.periodKey} · sisa {formatCurrency(item.remaining)} · disimpan {new Date(item.createdAt).toLocaleDateString("id-ID")}</Text></Pressable><Pressable accessibilityLabel={`Hapus ${item.title}`} onPress={() => deleteSavedAnalysis(item.id)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={20} color={colors.error} /></Pressable></View>) : <Text style={[styles.helper, { color: colors.muted }]}>Belum ada hasil tersimpan. Gunakan tombol Simpan hasil ke server di atas.</Text>}</AiraCard> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, { color }]} numberOfLines={2}>{value}</Text></View>;
}

function AnalysisList({ title, messages, empty, color }: { title: string; messages: string[]; empty: string; color: string }) {
  return <View style={styles.analysisList}><Text style={styles.analysisListTitle}>{title}</Text>{(messages.length ? messages : [empty]).map((message, index) => <View key={`${title}-${index}`} style={styles.analysisLine}><MaterialIcons name={messages.length ? "check-circle-outline" : "info-outline"} size={17} color={color} /><Text style={styles.analysisLineText}>{message}</Text></View>)}</View>;
}

function FoodPriceRecommendations({ rows }: { rows: ReturnType<typeof buildHouseholdAnalysis>["foodPriceRecommendations"] }) {
  if (!rows.length) return null;
  return <View style={styles.analysisList}><Text style={styles.analysisListTitle}>Rekomendasi harga pangan dari catatan Anda</Text><Text style={styles.analysisLineText}>Harian, mingguan, dan bulanan dinormalisasi dari harga yang Anda masukkan. Harga target hemat bukan harga pasar otomatis.</Text>{rows.map((item) => <View key={item.id} style={styles.priceRecommendation}><Text style={styles.listTitle}>{item.label}{item.quantity && item.unit ? ` · ${item.quantity} ${item.unit}` : ""}</Text><Text style={styles.analysisLineText}>Catatan: {formatCurrency(item.dailyAmount)}/hari · {formatCurrency(item.weeklyAmount)}/minggu · {formatCurrency(item.monthlyAmount)}/bulan</Text>{item.targetMonthlyAmount ? <Text style={styles.analysisLineText}>Target hemat: {formatCurrency(item.targetDailyAmount ?? 0)}/hari · {formatCurrency(item.targetWeeklyAmount ?? 0)}/minggu · {formatCurrency(item.targetMonthlyAmount)}/bulan{typeof item.monthlySavings === "number" && item.monthlySavings > 0 ? ` · selisih ${formatCurrency(item.monthlySavings)}/bulan` : ""}</Text> : <Text style={styles.analysisLineText}>Isi Harga target hemat pada formulir jika ingin membandingkan penawaran murah dari toko atau pasar Anda.</Text>}</View>)}</View>;
}

function BreakdownRow({ label, amount, color }: { label: string; amount: number; color: string }) {
  return <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>{label}</Text><Text style={[styles.breakdownValue, { color }]}>{formatCurrency(amount)}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 36, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.35 },
  subtitle: { fontSize: 13, marginTop: 2 },
  heroCard: { flexDirection: "row", gap: 12, padding: 14, borderWidth: 1 },
  heroIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 16, fontWeight: "800", marginBottom: 3 },
  sectionHelper: { fontSize: 12.5, lineHeight: 18, marginTop: -8 },
  card: { padding: 14, gap: 10 },
  analysisCard: { padding: 14, gap: 12, borderWidth: 1 },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  formSubheading: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  input: { minHeight: 45, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multilineInput: { minHeight: 76, textAlignVertical: "top" },
  twoColumn: { flexDirection: "row", gap: 10 },
  half: { flex: 1, minWidth: 0 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  chipText: { fontSize: 12, fontWeight: "700" },
  outlineAction: { minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 2 },
  outlineText: { fontSize: 14, fontWeight: "800" },
  secondaryAction: { minHeight: 42, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 14, fontWeight: "700" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  listTitle: { fontSize: 14, fontWeight: "700" },
  iconButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  helper: { fontSize: 12.5, lineHeight: 18 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  metric: { width: "48%", minHeight: 75, borderRadius: 12, backgroundColor: "#F3F7FC", padding: 10, justifyContent: "space-between" },
  metricLabel: { fontSize: 10.5, color: "#617083", fontWeight: "700" },
  metricValue: { fontSize: 14, fontWeight: "800", marginTop: 6 },
  remainingRow: { borderRadius: 13, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  remainingLabel: { fontSize: 13, fontWeight: "700", flex: 1 },
  remainingValue: { fontSize: 17, fontWeight: "900", textAlign: "right" },
  analysisList: { gap: 8 },
  analysisListTitle: { fontSize: 14, fontWeight: "800", color: "#172A46" },
  analysisLine: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  analysisLineText: { color: "#43546B", flex: 1, fontSize: 12.5, lineHeight: 18 },
  priceRecommendation: { gap: 4, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E3EAF3" },
  disclaimer: { fontSize: 11.5, lineHeight: 16, fontStyle: "italic" },
  memberTotal: { marginTop: 10, marginBottom: 4, fontSize: 13, fontWeight: "800" },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E3EAF3" },
  breakdownLabel: { color: "#43546B", fontSize: 12.5, flex: 1 },
  breakdownValue: { fontSize: 12.5, fontWeight: "800", textAlign: "right" },
  totalDivider: { height: 1, backgroundColor: "#9DB4D4", marginVertical: 4 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
