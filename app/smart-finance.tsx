import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AiraCard,
  EmptyState,
  PrimaryButton,
  SectionHeading,
} from "@/components/aira-ui";
import { ChickenIcon } from "@/components/chicken-icon";
import { MiniDatePicker } from "@/components/mini-date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import {
  getRecommendedRiceSacks5kg,
  getSmartFinanceOfflineAdvice,
  getSmartFinanceSummary,
  monthlyEquivalent,
  cadenceLabel,
  getOfflinePurchaseComparison,
} from "@/lib/finance/smart-finance";
import type { SmartFinanceItem } from "@/lib/finance/types";
import { getSmartHealthNutritionAdvice, SMART_HEALTH_STORAGE_KEY, type SmartHealthDietPattern, type SmartHealthFood, type SmartHealthProfile } from "@/lib/finance/smart-health";
import { formatCurrency, getBudgetUsage } from "@/lib/finance/finance-utils";
import { exportExcelReport, exportPdfReport } from "@/lib/finance/report-export";

type FormMode =
  | "budget"
  | "goal"
  | "bill"
  | "debt"
  | "receivable"
  | "commitment"
  | "smart";

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, ""));
const monthKey = () => new Date().toISOString().slice(0, 7);
const createSmartId = () => `smart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const HOUSEHOLD_CATEGORY_PRESETS = ["Transportasi", "Pangan", "Gas LPG", "Listrik", "Air", "Internet", "Pulsa", "Iuran RT", "Kontrakan", "Pendidikan", "Kesehatan", "Obat", "Perlengkapan bayi", "Kebersihan rumah", "Perawatan diri", "Pakaian", "Hewan peliharaan", "Hiburan", "Hutang/cicilan", "Zakat/sedekah", "Dana darurat", "Lainnya"] as const;
const TRANSPORT_CHECKLIST_OPTIONS = ["Motor", "Mobil", "Angkot", "Ojol", "Lainnya"] as const;
const MOTOR_DETAIL_OPTIONS = ["Bensin", "Servis", "Parkir", "Pajak"] as const;
const MOBIL_DETAIL_OPTIONS = ["Bensin", "Servis", "Parkir", "Tol"] as const;
const FOOD_CHECKLIST_OPTIONS = ["Sayur", "Beras", "Bawang", "Bumbu lainnya", "Lauk/protein", "Buah", "Lainnya"] as const;
const normalizeChecklistCategory = (value: string) => value === "Pangan" ? "Pangan" : value === "Transportasi" ? "Transportasi" : "Rumah tangga";

export default function PlansScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ sheet?: FormMode }>();
  const {
    state,
    addBudget,
    addGoal,
    addCommitment,
    toggleCommitment,
    updateProfile,
  } = useFinance();
  const [mode, setMode] = useState<FormMode | null>(params.sheet ?? null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [smartIncome, setSmartIncome] = useState("");
  const [smartOtherIncome, setSmartOtherIncome] = useState("");
  const [smartOtherIncomeLabel, setSmartOtherIncomeLabel] = useState("");
  const [smartItemTitle, setSmartItemTitle] = useState("");
  const [smartItemAmount, setSmartItemAmount] = useState("");
  const [checklistCategory, setChecklistCategory] = useState("");
  const [checklistSubcategory, setChecklistSubcategory] = useState("");
  const [checklistDetail, setChecklistDetail] = useState("");
  const [checklistBrand, setChecklistBrand] = useState("");
  const [checklistQuantity, setChecklistQuantity] = useState("");
  const [checklistUnit, setChecklistUnit] = useState("");
  const [checklistPurchaseDate, setChecklistPurchaseDate] = useState("");
  const [checklistVoltage, setChecklistVoltage] = useState("");
  const [checklistMeterReading, setChecklistMeterReading] = useState("");
  const [checklistTariffType, setChecklistTariffType] = useState<"subsidi" | "non_subsidi" | "unknown">("unknown");
  const [smartCadence, setSmartCadence] =
    useState<SmartFinanceItem["cadence"]>("monthly");
  const [memberLabel, setMemberLabel] = useState("");
  const [memberAge, setMemberAge] = useState("");
  const [memberHeight, setMemberHeight] = useState("");
  const [memberWeight, setMemberWeight] = useState("");
  const [memberDietPattern, setMemberDietPattern] = useState<SmartHealthDietPattern>("seimbang");
  const [memberAllergies, setMemberAllergies] = useState("");
  const [memberRelation, setMemberRelation] = useState<
    "self" | "spouse" | "child" | "parent" | "other"
  >("other");
  const [healthProfile, setHealthProfile] = useState<SmartHealthProfile>({ people: [], foods: [], updatedAt: new Date().toISOString() });
  const [analysisRevision, setAnalysisRevision] = useState(0);

  const smartPlan = state.profile.smartFinancePlan;
  const smartSummary = useMemo(
    () => getSmartFinanceSummary(smartPlan),
    [smartPlan],
  );
  const airaAnalysis = useMemo(() => `${getSmartFinanceOfflineAdvice(smartPlan)} ${getSmartHealthNutritionAdvice(healthProfile)}${analysisRevision > 0 ? " Analisis dimuat ulang." : ""}`, [smartPlan, healthProfile, analysisRevision]);
  const comparisonPreview = useMemo(() => {
    if (!checklistCategory || !smartItemAmount) return null;
    return getOfflinePurchaseComparison({ id: "preview", title: "", category: normalizeChecklistCategory(checklistCategory), subcategory: checklistSubcategory || undefined, amount: parseAmount(smartItemAmount), cadence: smartCadence, isPaid: false, reminderEnabled: false });
  }, [checklistCategory, checklistSubcategory, smartItemAmount, smartCadence]);

  useEffect(() => {
    if (params.sheet) {
      setMode(params.sheet);
      setTitle("");
      setAmount("");
    }
  }, [params.sheet]);

  useEffect(() => {
    void AsyncStorage.getItem(SMART_HEALTH_STORAGE_KEY).then((raw) => { if (raw) { try { setHealthProfile(JSON.parse(raw) as SmartHealthProfile); } catch { /* reset invalid local health data */ } } });
  }, []);

  const saveHealthProfile = async (next: SmartHealthProfile) => { const saved = { ...next, updatedAt: new Date().toISOString() }; setHealthProfile(saved); await AsyncStorage.setItem(SMART_HEALTH_STORAGE_KEY, JSON.stringify(saved)); };
  const clearHealthData = () => Alert.alert("Hapus data sehat lokal?", "Profil dan rincian pangan lokal akan dihapus dari perangkat. Data keuangan tidak ikut terhapus.", [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: () => { void saveHealthProfile({ people: healthProfile.people, foods: [], updatedAt: new Date().toISOString() }); } }]);
  const exportAllFinanceExcel = async () => { try { await exportExcelReport(state, { periodLabel: "Seluruh laporan" }); } catch (error) { Alert.alert("Ekspor gagal", error instanceof Error ? error.message : "Laporan Excel tidak dapat dibuat."); } };
  const exportAllFinancePdf = async () => { try { await exportPdfReport(state, { periodLabel: "Seluruh laporan" }); } catch (error) { Alert.alert("Ekspor gagal", error instanceof Error ? error.message : "Laporan PDF tidak dapat dibuat."); } };


  useEffect(() => {
    setSmartIncome(
      smartPlan?.monthKey === monthKey() ? String(smartPlan.income || "") : "",
    );
  }, [smartPlan]);

  const openForm = (nextMode: FormMode) => {
    setTitle("");
    setAmount("");
    setMode(nextMode);
  };

  const save = async () => {
    const numeric = parseAmount(amount);
    if (!title.trim()) {
      Alert.alert(
        "Nama diperlukan",
        "Berikan nama kategori, target, atau komitmen.",
      );
      return;
    }
    if (
      (mode === "budget" || mode === "goal") &&
      (!Number.isFinite(numeric) || numeric <= 0)
    ) {
      Alert.alert(
        "Nominal belum valid",
        "Masukkan nominal lebih dari nol untuk anggaran atau target.",
      );
      return;
    }
    if (
      ["bill", "debt", "receivable"].includes(mode ?? "") &&
      (!Number.isFinite(numeric) || numeric <= 0)
    ) {
      Alert.alert(
        "Nominal belum valid",
        "Masukkan nominal komitmen lebih dari nol.",
      );
      return;
    }
    if (mode === "budget")
      await addBudget({
        category: title.trim(),
        limit: numeric,
        period: "monthly",
        alertAt: 0.8,
      });
    if (mode === "goal")
      await addGoal({
        title: title.trim(),
        targetAmount: numeric,
        currentAmount: 0,
        color: colors.primary,
      });
    if (["bill", "debt", "receivable", "commitment"].includes(mode ?? "")) {
      await addCommitment({
        title: title.trim(),
        amount: numeric || undefined,
        kind:
          mode === "debt"
            ? "debt"
            : mode === "receivable"
              ? "receivable"
              : mode === "bill"
                ? "bill"
                : "reminder",
        isRecurring: mode === "bill",
        recurrence: mode === "bill" ? "monthly" : undefined,
        isDone: false,
      });
    }
    Alert.alert(
      "Rencana disimpan",
      "Data telah disimpan dan dapat dilihat pada daftar rencana.",
    );
    setTitle("");
    setAmount("");
    setMode(null);
  };

  const addMember = async () => {
    const age = Number(memberAge);
    const height = memberHeight.trim() ? Number(memberHeight) : undefined;
    const weight = memberWeight.trim() ? Number(memberWeight) : undefined;
    if (!memberLabel.trim() || !Number.isFinite(age) || age < 0 || age > 120 || (height !== undefined && (!Number.isFinite(height) || height <= 0)) || (weight !== undefined && (!Number.isFinite(weight) || weight <= 0))) {
      Alert.alert("Data anggota belum valid", "Isi nama/peran dan umur. Tinggi serta berat opsional, tetapi jika diisi harus lebih dari nol.");
      return;
    }
    const members = [
      ...(smartPlan?.monthKey === monthKey() ? (smartPlan.members ?? []) : []),
      { id: createSmartId(), relation: memberRelation, label: memberLabel.trim(), ageYears: Math.floor(age), ageMonths: age < 1 ? Math.round(age * 12) : undefined },
    ];
    await updateProfile({ smartFinancePlan: { monthKey: monthKey(), income: parseAmount(smartIncome) || smartPlan?.income || 0, members, riceSacks5kg: getRecommendedRiceSacks5kg(members), transport: smartPlan?.transport, items: smartPlan?.monthKey === monthKey() ? smartPlan.items : [], updatedAt: new Date().toISOString() } });
    await saveHealthProfile({ ...healthProfile, people: members.map((member) => { const isNew = member.id === members[members.length - 1]?.id; const localPerson = isNew ? { heightCm: height, weightKg: weight, dietPattern: memberDietPattern, allergies: memberAllergies.trim() || undefined } : healthProfile.people.find((person) => person.id === member.id); return { id: member.id, name: member.label, ageYears: member.ageYears, heightCm: localPerson?.heightCm, weightKg: localPerson?.weightKg, dietPattern: localPerson?.dietPattern, allergies: localPerson?.allergies }; }) });
    setMemberLabel(""); setMemberAge(""); setMemberHeight(""); setMemberWeight(""); setMemberDietPattern("seimbang"); setMemberAllergies("");
  };

  const removeMember = async (memberId: string) => {
    if (!smartPlan) return;
    const members = (smartPlan.members ?? []).filter((member) => member.id !== memberId);
    await updateProfile({ smartFinancePlan: { ...smartPlan, members, riceSacks5kg: getRecommendedRiceSacks5kg(members), updatedAt: new Date().toISOString() } });
    await saveHealthProfile({ ...healthProfile, people: healthProfile.people.filter((person) => person.id !== memberId) });
  };

  const saveSmartIncome = async () => {
    const income = parseAmount(smartIncome);
    if (!Number.isFinite(income) || income <= 0) {
      Alert.alert(
        "Gaji belum valid",
        "Masukkan gaji atau total pemasukan bulan ini.",
      );
      return;
    }
    await updateProfile({
      smartFinancePlan: {
        monthKey: monthKey(),
        income,
        otherIncome: smartPlan?.otherIncome,
        members: smartPlan?.monthKey === monthKey() ? (smartPlan.members ?? []) : [],
        riceSacks5kg: smartPlan?.riceSacks5kg ?? getRecommendedRiceSacks5kg(smartPlan?.members),
        transport: smartPlan?.transport,
        items: smartPlan?.monthKey === monthKey() ? smartPlan.items : [],
        updatedAt: new Date().toISOString(),
      },
    });
    Alert.alert(
      "Pemasukan disimpan",
      "Keuangan Pintar siap menghitung rencana pengeluaran Anda.",
    );
  };

  const addOtherIncome = async () => {
    const numeric = parseAmount(smartOtherIncome);
    if (!smartOtherIncomeLabel.trim() || !Number.isFinite(numeric) || numeric <= 0) {
      Alert.alert("Pemasukan tambahan belum lengkap", "Isi sumber pemasukan dan nominal lebih dari nol.");
      return;
    }
    await updateProfile({ smartFinancePlan: { monthKey: monthKey(), income: parseAmount(smartIncome) || smartPlan?.income || 0, otherIncome: [...(smartPlan?.otherIncome ?? []), { id: createSmartId(), label: smartOtherIncomeLabel.trim(), amount: numeric }], members: smartPlan?.monthKey === monthKey() ? (smartPlan.members ?? []) : [], riceSacks5kg: smartPlan?.riceSacks5kg ?? getRecommendedRiceSacks5kg(smartPlan?.members), transport: smartPlan?.transport, items: smartPlan?.monthKey === monthKey() ? smartPlan.items : [], updatedAt: new Date().toISOString() } });
    setSmartOtherIncomeLabel(""); setSmartOtherIncome("");
  };

  const addSmartItem = async () => {
    const numeric = parseAmount(smartItemAmount);
    const detail = [checklistDetail.trim(), checklistBrand.trim()].filter(Boolean).join(" · ");
    const quantity = checklistQuantity.trim() ? Number(checklistQuantity) : undefined;
    const normalizedUnit = checklistUnit.trim() || undefined;
    const isElectricity = checklistCategory === "Listrik";
    const isHealthChecklist = checklistCategory === "Pangan";
    const title = smartItemTitle.trim() || [checklistSubcategory, detail].filter(Boolean).join(" · ") || checklistCategory || "Kebutuhan";
    if (!checklistCategory) {
      Alert.alert("Kategori belum dipilih", "Pilih kategori kebutuhan terlebih dahulu. Detail lainnya boleh diisi nanti atau dibiarkan kosong.");
      return;
    }
    if (isHealthChecklist) {
      const healthGroup: SmartHealthFood["group"] = checklistSubcategory === "Sayur" ? "sayur" : checklistSubcategory === "Lauk/protein" ? "lauk" : checklistSubcategory === "Beras" ? "pokok" : checklistSubcategory === "Buah" ? "buah" : checklistSubcategory === "Bawang" || checklistSubcategory === "Bumbu lainnya" ? "bumbu" : "lainnya";
      await saveHealthProfile({ ...healthProfile, foods: [...healthProfile.foods, { id: createSmartId(), group: healthGroup, name: checklistDetail.trim(), brand: checklistBrand.trim() || undefined, quantity: quantity ?? 0, unit: normalizedUnit ?? "unit", price: numeric, purchaseDate: checklistPurchaseDate.trim() || undefined, frequency: smartCadence === "daily" ? "daily" : smartCadence === "weekly" ? "weekly" : "monthly" }] });
      setSmartItemTitle(""); setSmartItemAmount(""); setChecklistCategory(""); setChecklistSubcategory(""); setChecklistDetail(""); setChecklistBrand(""); setChecklistQuantity(""); setChecklistUnit(""); setChecklistPurchaseDate("");
      Alert.alert("Data sehat tersimpan lokal", "Rincian ini tidak masuk laporan keuangan atau sinkronisasi server.");
      return;
    }
    const nextPlan = {
      monthKey: monthKey(),
      income: parseAmount(smartIncome) || smartPlan?.income || 0,
      otherIncome: smartPlan?.otherIncome,
      members: smartPlan?.monthKey === monthKey() ? (smartPlan.members ?? []) : [],
      riceSacks5kg: smartPlan?.riceSacks5kg ?? getRecommendedRiceSacks5kg(smartPlan?.members),
      transport: smartPlan?.transport,
      items: [
        ...(smartPlan?.monthKey === monthKey() ? smartPlan.items : []),
        {
          id: createSmartId(),
          title,
          category: normalizeChecklistCategory(checklistCategory),
          subcategory: checklistSubcategory || undefined,
          detail: checklistDetail.trim() || undefined,
          brand: checklistBrand.trim() || undefined,
          quantity,
          unit: normalizedUnit,
          purchaseDate: checklistPurchaseDate.trim() || undefined,
          voltage: checklistVoltage.trim() || undefined,
          meterReading: checklistMeterReading.trim() || undefined,
          tariffType: isElectricity ? checklistTariffType : undefined,
          amount: numeric,
          cadence: smartCadence,
          isPaid: false,
          reminderEnabled: true,
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    await updateProfile({ smartFinancePlan: nextPlan });
    setSmartItemTitle(""); setSmartItemAmount(""); setChecklistCategory(""); setChecklistSubcategory(""); setChecklistDetail(""); setChecklistBrand(""); setChecklistQuantity(""); setChecklistUnit(""); setChecklistPurchaseDate(""); setChecklistVoltage(""); setChecklistMeterReading(""); setChecklistTariffType("unknown");
  };

  const toggleSmartItem = async (itemId: string) => {
    if (!smartPlan) return;
    await updateProfile({
      smartFinancePlan: {
        ...smartPlan,
        items: smartPlan.items.map((item) =>
          item.id === itemId ? { ...item, isPaid: !item.isPaid } : item,
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const removeSmartItem = async (itemId: string) => {
    if (!smartPlan) return;
    await updateProfile({
      smartFinancePlan: {
        ...smartPlan,
        items: smartPlan.items.filter((item) => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const formTitle =
    mode === "budget"
      ? "Batas anggaran"
      : mode === "goal"
        ? "Target tabungan"
        : mode === "debt"
          ? "Daftar hutang"
          : mode === "bill"
            ? "Daftar tagihan"
            : mode === "receivable"
              ? "Daftar piutang"
              : "Pengingat baru";
  const smartStatusColor =
    smartSummary.status === "over"
      ? colors.error
      : smartSummary.status === "tight"
        ? colors.warning
        : colors.success;

  return (
    <ScreenContainer
      className="px-5"
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.back,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={21}
              color={colors.foreground}
            />
          </Pressable>
          <View style={styles.flex}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Rencana keuangan
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Anggaran, target, dan komitmen Anda.
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka Keuangan Pintar"
          onPress={() => openForm("smart")}
          style={({ pressed }) => [
            styles.smartBanner,
            {
              backgroundColor: `${colors.primary}12`,
              borderColor: `${colors.primary}55`,
            },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.smartIcon, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="auto-graph" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.smartTitle, { color: colors.foreground }]}>
              Keuangan Pintar
            </Text>
            <Text style={[styles.smartDetail, { color: colors.muted }]}>
              Seimbangkan pemasukan, kebutuhan, checklist, dan sisa uang.
            </Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={colors.primary}
          />
        </Pressable>
        <View style={styles.actionRow}>
          {(
            [
              ["budget", "pie-chart", "Anggaran"],
              ["goal", "chicken", "Target"],
              ["bill", "receipt", "Tagihan"],
              ["debt", "handshake", "Hutang"],
              ["receivable", "request-quote", "Piutang"],
              ["smart", "auto-graph", "Keuangan Pintar"],
            ] as const
          ).map(([entry, icon, label]) => (
            <Pressable
              key={entry}
              onPress={() => openForm(entry)}
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor:
                    mode === entry ? `${colors.primary}12` : colors.surface,
                  borderColor: mode === entry ? colors.primary : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              {icon === "chicken" ? (
                <ChickenIcon size={22} />
              ) : (
                <MaterialIcons
                  name={icon as keyof typeof MaterialIcons.glyphMap}
                  size={20}
                  color={mode === entry ? colors.primary : colors.muted}
                />
              )}
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: mode === entry ? colors.primary : colors.foreground,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        {mode === "smart" ? (
          <AiraCard style={styles.smartForm}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              Keuangan Pintar bulan ini
            </Text>
            <Text style={[styles.helper, { color: colors.muted }]}>
              Catat gaji atau total pemasukan. Perencanaan ini adalah estimasi
              offline yang dapat berbeda menurut harga dan kebiasaan keluarga.
            </Text>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Pemasukan</Text>
            <Text style={[styles.helper, { color: colors.muted }]}>Masukkan gaji terlebih dahulu. Pemasukan tambahan seperti bonus, usaha, komisi, atau bantuan keluarga bersifat opsional.</Text>
            <TextInput value={smartIncome} onChangeText={setSmartIncome} keyboardType="numeric" placeholder="Gaji/pemasukan bulan ini" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
            <PrimaryButton label="Simpan pemasukan utama" onPress={() => { void saveSmartIncome(); }} />
            <View style={styles.memberFormRow}><TextInput value={smartOtherIncomeLabel} onChangeText={setSmartOtherIncomeLabel} placeholder="Sumber lain, contoh: bonus" placeholderTextColor={colors.muted} style={[styles.input, styles.memberNameInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={smartOtherIncome} onChangeText={setSmartOtherIncome} keyboardType="numeric" placeholder="Nominal" placeholderTextColor={colors.muted} style={[styles.input, styles.memberAgeInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View>
            <Pressable onPress={() => { void addOtherIncome(); }} style={[styles.outlineButton, { borderColor: colors.primary }]}><MaterialIcons name="add-card" size={17} color={colors.primary} /><Text style={[styles.analysisButtonText, { color: colors.primary }]}>Tambah pemasukan lain</Text></Pressable>
            {(smartPlan?.otherIncome ?? []).map((incomeItem) => <View key={incomeItem.id} style={styles.memberLine}><MaterialIcons name="payments" size={18} color={colors.success} /><Text style={[styles.memberLineText, { color: colors.foreground }]}>{incomeItem.label} · {formatCurrency(incomeItem.amount)}</Text></View>)}
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Profil rumah tangga</Text>
            <Text style={[styles.helper, { color: colors.muted }]}>
              Tambahkan setiap orang dan umur. Anak bayi dapat dicatat dalam
              tahun desimal, misalnya 0,5 untuk 6 bulan.
            </Text>
            <View style={styles.memberFormRow}>
              <TextInput
                value={memberLabel}
                onChangeText={setMemberLabel}
                placeholder="Nama/peran, contoh: Anak"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  styles.memberNameInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
              <TextInput
                value={memberAge}
                onChangeText={setMemberAge}
                keyboardType="decimal-pad"
                placeholder="Umur"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  styles.memberAgeInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>
            <View style={styles.memberFormRow}>
              <TextInput value={memberHeight} onChangeText={setMemberHeight} keyboardType="decimal-pad" placeholder="Tinggi cm (opsional)" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1, color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
              <TextInput value={memberWeight} onChangeText={setMemberWeight} keyboardType="decimal-pad" placeholder="Berat kg (opsional)" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1, color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
            </View>
            <Text style={[styles.formSection, { color: colors.foreground }]}>Pola makan (opsional)</Text>
            <View style={styles.categoryGrid}>{(["seimbang", "rendah_gula", "tinggi_protein", "vegetarian", "halal", "lainnya"] as const).map((pattern) => <Pressable key={pattern} onPress={() => setMemberDietPattern(pattern)} style={[styles.categoryChip, { borderColor: memberDietPattern === pattern ? colors.primary : colors.border, backgroundColor: memberDietPattern === pattern ? `${colors.primary}12` : colors.background }]}><Text style={[styles.categoryChipText, { color: memberDietPattern === pattern ? colors.primary : colors.muted }]}>{pattern === "rendah_gula" ? "Rendah gula" : pattern === "tinggi_protein" ? "Tinggi protein" : pattern === "lainnya" ? "Lainnya" : pattern[0].toUpperCase() + pattern.slice(1)}</Text></Pressable>)}</View>
            <TextInput value={memberAllergies} onChangeText={setMemberAllergies} placeholder="Alergi/pantangan (opsional), contoh: kacang, susu" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
            <View style={styles.cadenceRow}>
              {(["self", "spouse", "child", "parent", "other"] as const).map(
                (relation) => (
                  <Pressable
                    key={relation}
                    onPress={() => setMemberRelation(relation)}
                    style={[
                      styles.cadenceButton,
                      {
                        borderColor:
                          memberRelation === relation
                            ? colors.primary
                            : colors.border,
                        backgroundColor:
                          memberRelation === relation
                            ? `${colors.primary}12`
                            : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cadenceText,
                        {
                          color:
                            memberRelation === relation
                              ? colors.primary
                              : colors.muted,
                        },
                      ]}
                    >
                      {relation === "self"
                        ? "Saya"
                        : relation === "spouse"
                          ? "Pasangan"
                          : relation === "child"
                            ? "Anak"
                            : relation === "parent"
                              ? "Orang tua"
                              : "Lainnya"}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
            <Pressable
              onPress={() => {
                void addMember();
              }}
              style={[styles.outlineButton, { borderColor: colors.primary }]}
            >
              <MaterialIcons
                name="person-add"
                size={17}
                color={colors.primary}
              />
              <Text
                style={[styles.analysisButtonText, { color: colors.primary }]}
              >
                Tambah anggota
              </Text>
            </Pressable>
            {(smartPlan?.members ?? []).map((member) => (
              <View key={member.id} style={styles.memberLine}>
                <MaterialIcons name="person" size={18} color={colors.primary} />
                <Text
                  style={[styles.memberLineText, { color: colors.foreground }]}
                >
                  {member.label} ·{" "}
                  {member.ageYears < 1 && member.ageMonths
                    ? `${member.ageMonths} bulan`
                    : `${member.ageYears} tahun`}
                </Text>
                <Pressable
                  onPress={() => {
                    void removeMember(member.id);
                  }}
                >
                  <MaterialIcons name="close" size={18} color={colors.error} />
                </Pressable>
              </View>
            ))}
            <Text style={[styles.helper, { color: colors.muted }]}>
              Rekomendasi awal: sekitar{" "}
              {getRecommendedRiceSacks5kg(smartPlan?.members)} karung beras 5 kg
              per bulan berdasarkan profil keluarga.
            </Text>
                                    <Text style={[styles.formTitle, { color: colors.foreground }]}>Tambah kebutuhan checklist</Text>
            <Text style={[styles.helper, { color: colors.muted }]}>Pilih kategori. Pertanyaan berikutnya akan berubah otomatis sesuai kebutuhan yang dipilih.</Text>
            <Text style={[styles.formSection, { color: colors.foreground }]}>1. Kategori kebutuhan</Text>
            <View style={styles.categoryGrid}>{HOUSEHOLD_CATEGORY_PRESETS.map((category) => <Pressable key={category} onPress={() => { setChecklistCategory(category); setChecklistSubcategory(""); setChecklistDetail(""); setChecklistBrand(""); setChecklistQuantity(""); setChecklistUnit(""); setChecklistPurchaseDate(""); setChecklistVoltage(""); setChecklistMeterReading(""); }} style={[styles.categoryChip, { maxWidth: "100%", borderColor: checklistCategory === category ? colors.primary : colors.border, backgroundColor: checklistCategory === category ? colors.primary + "12" : colors.background }]}><Text style={[styles.categoryChipText, { color: checklistCategory === category ? colors.primary : colors.muted }]}>{category}</Text></Pressable>)}</View>
            {checklistCategory === "Transportasi" ? <><Text style={[styles.formSection, { color: colors.foreground }]}>2. Pilih kendaraan atau layanan</Text><View style={styles.categoryGrid}>{TRANSPORT_CHECKLIST_OPTIONS.map((option) => <Pressable key={option} onPress={() => { setChecklistSubcategory(option); setChecklistDetail(""); }} style={[styles.categoryChip, { maxWidth: "100%", borderColor: checklistSubcategory === option ? colors.primary : colors.border, backgroundColor: checklistSubcategory === option ? colors.primary + "12" : colors.background }]}><Text style={[styles.categoryChipText, { color: checklistSubcategory === option ? colors.primary : colors.muted }]}>{option}</Text></Pressable>)}</View>
              {checklistSubcategory === "Motor" || checklistSubcategory === "Mobil" ? <><Text style={[styles.formSection, { color: colors.foreground }]}>3. Keperluan kendaraan</Text><View style={styles.categoryGrid}>{(checklistSubcategory === "Motor" ? MOTOR_DETAIL_OPTIONS : MOBIL_DETAIL_OPTIONS).map((option) => <Pressable key={option} onPress={() => setChecklistDetail(option)} style={[styles.categoryChip, { maxWidth: "100%", borderColor: checklistDetail === option ? colors.primary : colors.border, backgroundColor: checklistDetail === option ? colors.primary + "12" : colors.background }]}><Text style={[styles.categoryChipText, { color: checklistDetail === option ? colors.primary : colors.muted }]}>{option}</Text></Pressable>)}</View><TextInput value={checklistBrand} onChangeText={setChecklistBrand} placeholder="Merek atau catatan (opsional)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></> : checklistSubcategory ? <TextInput value={checklistDetail} onChangeText={setChecklistDetail} placeholder="Detail layanan atau tujuan" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /> : null}
              {checklistSubcategory ? <><TextInput value={checklistQuantity} onChangeText={setChecklistQuantity} keyboardType="decimal-pad" placeholder={checklistDetail === "Bensin" ? "Berapa liter" : "Jumlah perjalanan/unit"} placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistUnit} onChangeText={setChecklistUnit} placeholder={checklistDetail === "Bensin" ? "Liter" : "Unit/trip"} placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><MiniDatePicker label="Tanggal beli" value={checklistPurchaseDate} onChange={setChecklistPurchaseDate} optional /></> : null}
            </> : checklistCategory === "Pangan" ? <><Text style={[styles.formTitle, { color: colors.foreground }]}>Keuangan Sehat</Text><Text style={[styles.helper, { color: colors.muted }]}>Data nama, umur, tinggi, berat, menu, dan harga bahan hanya disimpan di perangkat ini. Tidak menjadi transaksi, laporan, atau data sinkronisasi.</Text><Text style={[styles.formSection, { color: colors.foreground }]}>1. Kelompok bahan pangan</Text><View style={styles.categoryGrid}>{FOOD_CHECKLIST_OPTIONS.map((option) => <Pressable key={option} onPress={() => { setChecklistSubcategory(option); setChecklistDetail(""); }} style={[styles.categoryChip, { maxWidth: "100%", borderColor: checklistSubcategory === option ? colors.primary : colors.border, backgroundColor: checklistSubcategory === option ? colors.primary + "12" : colors.background }]}><Text style={[styles.categoryChipText, { color: checklistSubcategory === option ? colors.primary : colors.muted }]}>{option}</Text></Pressable>)}</View>{checklistSubcategory ? <><Text style={[styles.formSection, { color: colors.foreground }]}>3. Jenis, merek, dan jumlah</Text><TextInput value={checklistDetail} onChangeText={setChecklistDetail} placeholder="Jenis apa? Contoh: beras premium, bayam" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistBrand} onChangeText={setChecklistBrand} placeholder="Merek (jika ada)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><View style={styles.memberFormRow}><TextInput value={checklistQuantity} onChangeText={setChecklistQuantity} keyboardType="decimal-pad" placeholder="Berapa kg/liter/ikat" placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistUnit} onChangeText={setChecklistUnit} placeholder="kg/liter/ikat" placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View><MiniDatePicker label="Tanggal beli" value={checklistPurchaseDate} onChange={setChecklistPurchaseDate} optional /></> : null}</> : checklistCategory === "Listrik" ? <><Text style={[styles.formSection, { color: colors.foreground }]}>2. Detail listrik</Text><View style={styles.categoryGrid}>{(["subsidi", "non_subsidi"] as const).map((tariff) => <Pressable key={tariff} onPress={() => setChecklistTariffType(tariff)} style={[styles.categoryChip, { maxWidth: "100%", borderColor: checklistTariffType === tariff ? colors.primary : colors.border, backgroundColor: checklistTariffType === tariff ? colors.primary + "12" : colors.background }]}><Text style={[styles.categoryChipText, { color: checklistTariffType === tariff ? colors.primary : colors.muted }]}>{tariff === "subsidi" ? "Subsidi" : "Non-subsidi"}</Text></Pressable>)}</View><TextInput value={checklistVoltage} onChangeText={setChecklistVoltage} placeholder="Daya meter: 900 / 1300 / lainnya" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistMeterReading} onChangeText={setChecklistMeterReading} placeholder="Angka meter/kWh saat beli" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistQuantity} onChangeText={setChecklistQuantity} keyboardType="decimal-pad" placeholder="Jumlah token/kWh" placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistUnit} onChangeText={setChecklistUnit} placeholder="kWh/token" placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><MiniDatePicker label="Tanggal beli" value={checklistPurchaseDate} onChange={setChecklistPurchaseDate} optional /></> : checklistCategory ? <><Text style={[styles.formSection, { color: colors.foreground }]}>2. Detail kebutuhan</Text><TextInput value={smartItemTitle} onChangeText={setSmartItemTitle} placeholder="Nama kebutuhan" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={checklistDetail} onChangeText={setChecklistDetail} placeholder="Detail atau merek bila perlu" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><MiniDatePicker label="Tanggal beli" value={checklistPurchaseDate} onChange={setChecklistPurchaseDate} optional /></> : null}
            {checklistCategory === "Pangan" ? <Pressable onPress={clearHealthData} style={[styles.analysisButton, { borderColor: colors.error }]}><MaterialIcons name="delete-sweep" size={18} color={colors.error} /><Text style={[styles.analysisButtonText, { color: colors.error }]}>Hapus pangan lokal</Text></Pressable> : null}
            {checklistCategory ? <><Text style={[styles.formSection, { color: colors.foreground }]}>Nominal dan periode</Text><TextInput value={smartItemAmount} onChangeText={setSmartItemAmount} keyboardType="numeric" placeholder="Harga/nominal yang dibayar" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><View style={styles.cadenceRow}>{(["monthly", "weekly", "daily"] as const).map((cadence) => <Pressable key={cadence} onPress={() => setSmartCadence(cadence)} style={[styles.cadenceButton, { flex: 1, minWidth: 0, borderColor: smartCadence === cadence ? colors.primary : colors.border, backgroundColor: smartCadence === cadence ? colors.primary + "12" : colors.background }]}><Text style={[styles.cadenceText, { color: smartCadence === cadence ? colors.primary : colors.muted }]}>{cadenceLabel(cadence)}</Text></Pressable>)}</View>{comparisonPreview ? <Text style={[styles.helper, { color: comparisonPreview.status === "high" ? colors.warning : colors.muted }]}>{comparisonPreview.text} Ini adalah estimasi offline, bukan harga pasar real-time.</Text> : null}<PrimaryButton label="Tambah ke checklist" onPress={() => { void addSmartItem(); }} /></> : null}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: `${smartStatusColor}12`,
                  borderColor: `${smartStatusColor}55`,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                Sisa uang setelah rencana
              </Text>
              <Text style={[styles.summaryValue, { color: smartStatusColor }]}>
                {formatCurrency(smartSummary.remaining)}
              </Text>
              <Text style={[styles.summaryDetail, { color: colors.muted }]}>
                Rencana bulanan: {formatCurrency(smartSummary.plannedMonthly)} ·
                Terbayar:{" "}
                {smartSummary.paid > 0
                  ? formatCurrency(smartSummary.paid)
                  : "Belum ada"}
              </Text>
              <Text style={[styles.advice, { color: colors.foreground }]}>
                {airaAnalysis}
              </Text>
            </View>
            <View style={styles.analysisRow}>
              <Pressable
                onPress={() => setAnalysisRevision((value) => value + 1)}
                style={[styles.analysisButton, { borderColor: colors.primary }]}
              >
                <MaterialIcons
                  name="psychology"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[styles.analysisButtonText, { color: colors.primary }]}
                >
                  Analisis Aira
                </Text>
              </Pressable>
              <Text style={[styles.analysisNote, { color: colors.muted }]}>
                Analisis berjalan otomatis; tombol ini memperbarui hasil.
              </Text>
            </View>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              Checklist kebutuhan
            </Text>
            {!smartPlan?.items.length ? (
              <Text style={[styles.helper, { color: colors.muted }]}>
                Belum ada kebutuhan. Tambahkan tagihan rumah tangga, transport,
                atau target harian.
              </Text>
            ) : (
              smartPlan.items.map((item) => (
                <View key={item.id} style={styles.smartItem}>
                  <Pressable
                    onPress={() => {
                      void toggleSmartItem(item.id);
                    }}
                    style={styles.smartCheck}
                  >
                    <MaterialIcons
                      name={
                        item.isPaid ? "check-circle" : "radio-button-unchecked"
                      }
                      size={22}
                      color={item.isPaid ? colors.success : colors.muted}
                    />
                  </Pressable>
                  <View style={styles.flex}>
                    <Text
                      style={[
                        styles.entryTitle,
                        {
                          color: colors.foreground,
                          textDecorationLine: item.isPaid
                            ? "line-through"
                            : "none",
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={[styles.entryDetail, { color: colors.muted }]}>
                      {item.category ? `${item.category}${item.subcategory ? ` · ${item.subcategory}` : ""}` : "Kebutuhan"} · {formatCurrency(item.amount)} · {cadenceLabel(item.cadence)} · setara {formatCurrency(monthlyEquivalent(item))}/bulan
                    </Text>
                    <Text style={[styles.entryDetail, { color: colors.muted }]}>
                      {item.detail ? `${item.detail}${item.brand ? ` · ${item.brand}` : ""}` : item.brand ?? ""}{item.quantity ? ` · ${item.quantity} ${item.unit ?? "unit"}` : ""}{item.purchaseDate ? ` · beli ${item.purchaseDate}` : ""}{item.voltage ? ` · ${item.voltage} V` : ""}{item.meterReading ? ` · meter ${item.meterReading}` : ""}
                    </Text>
                    <Text style={[styles.entryDetail, { color: getOfflinePurchaseComparison(item).status === "high" ? colors.warning : colors.muted }]}>
                      {getOfflinePurchaseComparison(item).text}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      void removeSmartItem(item.id);
                    }}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color={colors.error}
                    />
                  </Pressable>
                </View>
              ))
            )}
          </AiraCard>
        ) : mode ? (
          <AiraCard style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              {formTitle}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={
                mode === "budget"
                  ? "Contoh: Makan"
                  : mode === "goal"
                    ? "Contoh: Dana darurat"
                    : mode === "bill"
                      ? "Contoh: Listrik bulanan"
                      : mode === "debt"
                        ? "Contoh: Cicilan kendaraan"
                        : mode === "receivable"
                          ? "Contoh: Piutang dari Budi"
                          : "Contoh: Pengingat penting"
              }
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            />
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={
                mode === "budget"
                  ? "Batas bulanan"
                  : mode === "goal"
                    ? "Target tabungan"
                    : "Nominal"
              }
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            />
            <PrimaryButton
              label="Simpan rencana"
              onPress={() => {
                void save();
              }}
            />
          </AiraCard>
        ) : null}
        <SectionHeading title="Anggaran aktif" />
        {state.budgets.length === 0 ? (
          <EmptyState
            icon="pie-chart"
            title="Belum ada anggaran"
            detail="Tetapkan batas bulanan per kategori untuk memantau pengeluaran."
            actionLabel="Buat anggaran"
            onAction={() => openForm("budget")}
          />
        ) : (
          <View style={styles.list}>
            {state.budgets.map((budget) => {
              const usage = getBudgetUsage(budget, state);
              return (
                <AiraCard key={budget.id}>
                  <View style={styles.budgetHeader}>
                    <Text
                      style={[styles.entryTitle, { color: colors.foreground }]}
                    >
                      {budget.category}
                    </Text>
                    <Text
                      style={[
                        styles.entryValue,
                        {
                          color:
                            usage.ratio >= budget.alertAt
                              ? colors.warning
                              : colors.primary,
                        },
                      ]}
                    >
                      {Math.round(usage.ratio * 100)}%
                    </Text>
                  </View>
                  <Text style={[styles.entryDetail, { color: colors.muted }]}>
                    {formatCurrency(usage.spending)} dari{" "}
                    {formatCurrency(budget.limit)}
                  </Text>
                  <View
                    style={[styles.track, { backgroundColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.fill,
                        {
                          backgroundColor:
                            usage.ratio >= budget.alertAt
                              ? colors.warning
                              : colors.primary,
                          width: `${Math.min(usage.ratio * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </AiraCard>
              );
            })}
          </View>
        )}
        <SectionHeading title="Target tabungan" />
        {state.goals.length === 0 ? (
          <AiraCard style={styles.goalEmpty}>
            <ChickenIcon size={34} />
            <View style={styles.goalEmptyCopy}>
              <Text style={[styles.entryTitle, { color: colors.foreground }]}>
                Belum ada target
              </Text>
              <Text style={[styles.entryDetail, { color: colors.muted }]}>
                Buat target pembelian atau dana darurat.
              </Text>
            </View>
            <Pressable
              onPress={() => openForm("goal")}
              style={[styles.goalAction, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.goalActionText}>Buat</Text>
            </Pressable>
          </AiraCard>
        ) : (
          <View style={styles.list}>
            {state.goals.map((goal) => (
              <AiraCard key={goal.id} style={styles.goalCard}>
                <ChickenIcon size={28} />
                <View style={styles.goalCopy}>
                  <Text
                    style={[styles.entryTitle, { color: colors.foreground }]}
                  >
                    {goal.title}
                  </Text>
                  <Text style={[styles.entryDetail, { color: colors.muted }]}>
                    {formatCurrency(goal.currentAmount)} dari{" "}
                    {formatCurrency(goal.targetAmount)}
                  </Text>
                </View>
              </AiraCard>
            ))}
          </View>
        )}
        <SectionHeading title="Tagihan, hutang, piutang & pengingat" />
        {state.commitments.length === 0 ? (
          <EmptyState
            icon="notifications-none"
            title="Belum ada komitmen"
            detail="Tambahkan tagihan dan hutang untuk melihatnya di beranda serta menandainya selesai."
            actionLabel="Tambah tagihan"
            onAction={() => openForm("bill")}
          />
        ) : (
          <View style={styles.list}>
            {state.commitments.map((commitment) => (
              <Pressable
                key={commitment.id}
                onPress={() => {
                  void toggleCommitment(commitment.id);
                }}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <AiraCard style={styles.commitment}>
                  <MaterialIcons
                    name={
                      commitment.isDone
                        ? "check-circle"
                        : "notifications-active"
                    }
                    size={21}
                    color={commitment.isDone ? colors.success : colors.warning}
                  />
                  <View style={styles.flex}>
                    <Text
                      style={[
                        styles.entryTitle,
                        {
                          color: colors.foreground,
                          textDecorationLine: commitment.isDone
                            ? "line-through"
                            : "none",
                        },
                      ]}
                    >
                      {commitment.title}
                    </Text>
                    <Text style={[styles.entryDetail, { color: colors.muted }]}>
                      {commitment.amount
                        ? formatCurrency(commitment.amount)
                        : "Tanpa nominal"}{" "}
                      · {commitment.isRecurring ? "Berulang" : "Sekali"}
                    </Text>
                  </View>
                </AiraCard>
              </Pressable>
            ))}
          </View>
        )}
        <AiraCard style={styles.exportCard}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>Ekspor laporan</Text>
          <Text style={[styles.helper, { color: colors.muted }]}>Ekspor seluruh laporan keuangan yang tercatat dalam format PDF atau Excel.</Text>
          <View style={styles.analysisRow}><Pressable onPress={() => { void exportAllFinancePdf(); }} style={[styles.analysisButton, { borderColor: colors.primary }]}><MaterialIcons name="picture-as-pdf" size={18} color={colors.primary} /><Text style={[styles.analysisButtonText, { color: colors.primary }]}>Ekspor PDF</Text></Pressable><Pressable onPress={() => { void exportAllFinanceExcel(); }} style={[styles.analysisButton, { borderColor: colors.primary }]}><MaterialIcons name="table-view" size={18} color={colors.primary} /><Text style={[styles.analysisButtonText, { color: colors.primary }]}>Ekspor Excel</Text></Pressable></View>
        </AiraCard>
        </ScrollView>
      </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 22 },
  flex: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 2,
  },
  back: {
    alignItems: "center",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  title: { fontSize: 21, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  smartBanner: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  smartIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  smartTitle: { fontSize: 15, fontWeight: "900" },
  smartDetail: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, width: "100%" },
  action: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: 5,
    minHeight: 65,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  actionLabel: { fontSize: 11, fontWeight: "700" },
  form: { gap: 10 },
  smartForm: { gap: 10, maxWidth: "100%", minWidth: 0, width: "100%" },
  memberFormRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, maxWidth: "100%", minWidth: 0, width: "100%" },
  memberNameInput: { flex: 2, minWidth: 0 },
  memberAgeInput: { flex: 1, minWidth: 0 },
  outlineButton: { alignItems: "center", borderRadius: 11, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", paddingVertical: 10 },
  memberLine: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 8, paddingVertical: 7 },
  memberLineText: { flex: 1, fontSize: 13, fontWeight: "700" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, maxWidth: "100%", minWidth: 0, width: "100%" },
  categoryChip: { borderRadius: 10, borderWidth: 1, flexShrink: 1, maxWidth: "100%", paddingHorizontal: 9, paddingVertical: 7 },
  categoryChipText: { fontSize: 11, fontWeight: "700" },
  formSection: { fontSize: 12, fontWeight: "800", marginTop: 8 },
  formTitle: { fontSize: 16, fontWeight: "800" },
  helper: { fontSize: 12, lineHeight: 18 },
  input: {
    borderRadius: 13,
    borderWidth: 1,
    flexShrink: 1,
    fontSize: 14,
    minHeight: 46,
    minWidth: 0,
    paddingHorizontal: 12,
  },
  cadenceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, maxWidth: "100%", minWidth: 0, width: "100%" },
  halfInput: { flex: 1, minWidth: 120 },
  cadenceButton: {
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  cadenceText: { fontSize: 12, fontWeight: "800", textAlign: "center" },
  summaryCard: { borderRadius: 14, borderWidth: 1, gap: 4, padding: 12 },
  exportCard: { gap: 10, marginTop: 8 },
  summaryLabel: { fontSize: 12, fontWeight: "700" },
  summaryValue: { fontSize: 24, fontWeight: "900" },
  summaryDetail: { fontSize: 11, lineHeight: 17 },
  advice: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  analysisRow: { gap: 5 },
  analysisButton: {
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    paddingVertical: 10,
  },
  analysisButtonText: { fontSize: 12, fontWeight: "900" },
  analysisNote: { fontSize: 11, textAlign: "center" },
  smartItem: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  smartCheck: { padding: 2 },
  deleteButton: { padding: 5 },
  list: { gap: 9 },
  goalCard: { alignItems: "center", flexDirection: "row", gap: 10 },
  goalCopy: { flex: 1 },
  goalEmpty: { alignItems: "center", flexDirection: "row", gap: 10 },
  goalEmptyCopy: { flex: 1 },
  goalAction: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  goalActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  budgetHeader: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontSize: 14, fontWeight: "800" },
  entryValue: { fontSize: 13, fontWeight: "800" },
  entryDetail: { fontSize: 12, marginTop: 4 },
  track: { borderRadius: 5, height: 8, marginTop: 13, overflow: "hidden" },
  fill: { borderRadius: 5, height: "100%" },
  commitment: { alignItems: "center", flexDirection: "row", gap: 10 },
  pressed: { opacity: 0.7 },
});
