import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AiraCard, EmptyState, PrimaryButton, SectionHeading } from "@/components/aira-ui";
import { MiniDatePicker } from "@/components/mini-date-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import type { Commitment, CommitmentKind } from "@/lib/finance/types";
import { formatCurrency, formatDateTime, getBudgetUsage } from "@/lib/finance/finance-utils";
import { schedulePlanReminder } from "@/lib/reminders";

type FormMode = "budget" | "goal" | "bill" | "debt" | "receivable";
const MODES: FormMode[] = ["budget", "goal", "bill", "debt", "receivable"];
const COMMITMENT_MODES: FormMode[] = ["bill", "debt", "receivable"];

const toIso = (value: string) => {
  const date = new Date(value.trim().replace(" ", "T"));
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
};
const legacyDay = (iso?: string) => iso ? new Date(iso).getDate() : undefined;
const legacyTime = (iso?: string) => iso ? new Date(iso).toTimeString().slice(0, 5) : "";
const isMonthlyTime = (value: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(value);
const isCommitmentMode = (mode: FormMode | null) => Boolean(mode && COMMITMENT_MODES.includes(mode));
const positiveInteger = (value: string) => {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};
const labelOf = (mode: FormMode | CommitmentKind | null) => mode === "bill" ? "Tagihan" : mode === "debt" ? "Hutang" : mode === "receivable" ? "Piutang" : mode === "reminder" ? "Pengingat" : mode === "goal" ? "Target" : "Anggaran";
const modeFromKind = (kind: CommitmentKind): FormMode => kind === "debt" ? "debt" : kind === "receivable" ? "receivable" : "bill";
const commitmentKind = (mode: FormMode): CommitmentKind => mode === "debt" ? "debt" : mode === "receivable" ? "receivable" : "bill";
const tenorLabel = (item: Commitment) => {
  const remaining = item.remainingInstallmentMonths ?? item.installmentMonths;
  return remaining ? `Sisa tenor ${remaining} bulan` : null;
};

function commitmentStatus(item: Commitment) {
  if (item.isDone) return { label: "Selesai", color: "#138A4A", background: "#DCFCE7" };
  const dueDay = item.dueDayOfMonth ?? legacyDay(item.dueAt);
  if (!dueDay) return { label: "Berjalan", color: "#B45309", background: "#FEF3C7" };
  const now = new Date();
  const day = Math.min(dueDay, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
  if (now.getDate() > day) return { label: "Lewat jatuh tempo", color: "#FFFFFF", background: "#111827" };
  if (now.getDate() === day) return { label: "Jatuh tempo", color: "#B91C1C", background: "#FEE2E2" };
  return { label: "Berjalan", color: "#B45309", background: "#FEF3C7" };
}

export default function PlanFormScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ sheet?: string; draftTitle?: string; draftAmount?: string; draftCounterparty?: string }>();
  const { state, addBudget, addGoal, addCommitment, updateCommitment, removeCommitment, toggleCommitment } = useFinance();
  const initial = MODES.includes(params.sheet as FormMode) ? params.sheet as FormMode : null;
  const [mode, setMode] = useState<FormMode | null>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [remainingMonths, setRemainingMonths] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [dueTime, setDueTime] = useState("09:00");
  const [reminderDay, setReminderDay] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [dateInput, setDateInput] = useState("");
  const [dateReminderInput, setDateReminderInput] = useState("");
  const commitment = isCommitmentMode(mode);

  const reset = () => {
    setEditingId(null); setTitle(""); setAmount(""); setCounterparty(""); setRemainingMonths("");
    setDueDay(""); setDueTime("09:00"); setReminderDay(""); setReminderTime("09:00");
    setDateInput(""); setDateReminderInput("");
  };

  useEffect(() => {
    const next = MODES.includes(params.sheet as FormMode) ? params.sheet as FormMode : null;
    if (next) {
      reset(); setMode(next);
      if (params.draftTitle) setTitle(params.draftTitle.slice(0, 120));
      if (params.draftAmount) setAmount(params.draftAmount.replace(/[^0-9]/g, ""));
      if (params.draftCounterparty) setCounterparty(params.draftCounterparty.slice(0, 120));
    }
  }, [params.draftAmount, params.draftCounterparty, params.draftTitle, params.sheet]);

  const open = (next: FormMode) => { reset(); setMode(next); };
  const openEdit = (item: Commitment) => {
    reset();
    setMode(modeFromKind(item.kind));
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(String(item.amount ?? item.remainingAmount ?? ""));
    setCounterparty(item.counterparty ?? "");
    setRemainingMonths(String(item.remainingInstallmentMonths ?? item.installmentMonths ?? ""));
    setDueDay(String(item.dueDayOfMonth ?? legacyDay(item.dueAt) ?? ""));
    setDueTime(item.dueTime ?? (legacyTime(item.dueAt) || "09:00"));
    setReminderDay(String(item.reminderDayOfMonth ?? legacyDay(item.reminderAt) ?? ""));
    setReminderTime(item.reminderTime ?? (legacyTime(item.reminderAt) || "09:00"));
  };

  const save = async () => {
    const numeric = Number(amount.replace(/[^0-9]/g, ""));
    if (!mode || !title.trim()) { Alert.alert("Nama diperlukan", "Isi nama rencana terlebih dahulu."); return; }
    if (!Number.isFinite(numeric) || numeric <= 0) { Alert.alert("Nominal belum valid", "Masukkan nominal lebih dari nol."); return; }
    if (commitment) {
      const due = Number(dueDay);
      const reminder = Number(reminderDay);
      const hasTenor = Boolean(remainingMonths.trim());
      const remainingInstallmentMonths = positiveInteger(remainingMonths);
      if (!Number.isInteger(due) || due < 1 || due > 31) { Alert.alert("Tanggal jatuh tempo belum valid", "Masukkan tanggal bulanan dari 1 sampai 31."); return; }
      if (!isMonthlyTime(dueTime)) { Alert.alert("Waktu jatuh tempo belum valid", "Gunakan format HH:MM, misalnya 09:00."); return; }
      if (reminderDay && (!Number.isInteger(reminder) || reminder < 1 || reminder > 31)) { Alert.alert("Tanggal pengingat belum valid", "Masukkan tanggal bulanan dari 1 sampai 31."); return; }
      if (reminderDay && !isMonthlyTime(reminderTime)) { Alert.alert("Waktu pengingat belum valid", "Gunakan format HH:MM, misalnya 08:00."); return; }
      if (hasTenor && !remainingInstallmentMonths) { Alert.alert("Sisa tenor belum valid", "Masukkan jumlah bulan lebih dari nol, atau kosongkan jika tidak bertahap."); return; }
      const existing = editingId ? state.commitments.find((item) => item.id === editingId) : undefined;
      const input = {
        title: title.trim(), amount: numeric, remainingAmount: existing?.isDone ? 0 : numeric,
        kind: commitmentKind(mode), dueDayOfMonth: due, dueTime,
        reminderDayOfMonth: reminderDay ? reminder : undefined, reminderTime: reminderDay ? reminderTime : undefined,
        installmentMonths: existing?.installmentMonths ?? remainingInstallmentMonths,
        remainingInstallmentMonths, counterparty: counterparty.trim() || undefined,
        isRecurring: true, recurrence: "monthly" as const, isDone: existing?.isDone ?? false,
      };
      if (editingId) await updateCommitment(editingId, input); else await addCommitment(input);
      const scheduled = reminderDay ? await schedulePlanReminder({ title: title.trim(), kind: labelOf(mode), reminderDayOfMonth: reminder, reminderTime }) : true;
      Alert.alert(editingId ? "Rencana diperbarui" : "Rencana disimpan", scheduled ? "Rincian dan pengingat bulanan telah disimpan." : "Data tersimpan, tetapi notifikasi belum aktif. Periksa izin notifikasi.");
    } else {
      const targetDate = toIso(dateInput);
      const reminderAt = toIso(dateReminderInput);
      if (dateInput && !targetDate) { Alert.alert("Tanggal belum valid", "Pilih tanggal melalui kalender."); return; }
      if (dateReminderInput && !reminderAt) { Alert.alert("Pengingat belum valid", "Pilih tanggal melalui kalender."); return; }
      if (mode === "budget") await addBudget({ category: title.trim(), limit: numeric, period: "monthly", alertAt: 0.8, dueAt: targetDate, reminderAt });
      else await addGoal({ title: title.trim(), targetAmount: numeric, currentAmount: 0, color: colors.primary, targetDate, reminderAt });
      if (targetDate || reminderAt) await schedulePlanReminder({ title: title.trim(), kind: labelOf(mode), dueAt: targetDate, reminderAt });
      Alert.alert("Rencana disimpan", "Anggaran atau target disimpan dengan tanggal lengkap.");
    }
    reset(); setMode(null);
  };

  const deleteItem = (item: Commitment) => Alert.alert(`Hapus ${labelOf(item.kind).toLowerCase()}?`, `“${item.title}” akan dihapus dari daftar rencana.`, [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: () => { void removeCommitment(item.id); } },
  ]);
  const tenorInputLabel = mode === "bill" ? "Sisa tenor tagihan (bulan, opsional)" : "Sisa tenor/cicilan (bulan, opsional)";
  const partyLabel = mode === "debt" ? "Pemberi hutang (opsional)" : mode === "receivable" ? "Peminjam / pihak piutang (opsional)" : "Penyedia tagihan (opsional)";

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable>
        <View style={styles.flex}><Text style={[styles.title, { color: colors.foreground }]}>Rencana keuangan</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Anggaran, target, tagihan, hutang, dan piutang dalam satu alur.</Text></View>
      </View>
      <View style={styles.actionRow}>{([
        ["budget", "pie-chart", "Anggaran"], ["goal", "savings", "Target"], ["bill", "receipt", "Tagihan"], ["debt", "handshake", "Hutang"], ["receivable", "request-quote", "Piutang"],
      ] as const).map(([entry, icon, text]) => <Pressable key={entry} onPress={() => open(entry)} style={({ pressed }) => [styles.action, { backgroundColor: mode === entry ? `${colors.primary}12` : colors.surface, borderColor: mode === entry ? colors.primary : colors.border }, pressed && styles.pressed]}><MaterialIcons name={icon} size={20} color={mode === entry ? colors.primary : colors.muted} /><Text numberOfLines={2} style={[styles.actionLabel, { color: mode === entry ? colors.primary : colors.foreground }]}>{text}</Text></Pressable>)}</View>
      {mode ? <AiraCard style={styles.form}>
        <View style={styles.formHeader}><View><Text style={[styles.formTitle, { color: colors.foreground }]}>{editingId ? `Edit ${labelOf(mode)}` : labelOf(mode)}</Text><Text style={[styles.hint, { color: colors.muted }]}>{commitment ? "Gunakan formulir komitmen yang sama untuk Tagihan, Hutang, dan Piutang." : "Tetapkan nama, nominal, tanggal tujuan, dan pengingat bila diperlukan."}</Text></View>{editingId ? <Pressable onPress={() => { reset(); setMode(null); }} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={[styles.cancel, { color: colors.muted }]}>Batal edit</Text></Pressable> : null}</View>
        <TextInput value={title} onChangeText={setTitle} placeholder={commitment ? `Nama ${labelOf(mode).toLowerCase()}` : mode === "goal" ? "Nama target" : "Nama kategori anggaran"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder={mode === "budget" ? "Batas bulanan" : mode === "goal" ? "Target tabungan" : "Nominal per bulan / cicilan"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
        {commitment ? <>
          <Text style={[styles.formSection, { color: colors.foreground }]}>Rincian {labelOf(mode).toLowerCase()}</Text>
          <TextInput value={counterparty} onChangeText={setCounterparty} placeholder={partyLabel} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
          <TextInput value={remainingMonths} onChangeText={setRemainingMonths} keyboardType="numeric" placeholder={tenorInputLabel} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
          <Text style={[styles.hint, { color: colors.muted }]}>Isi jumlah bulan yang masih tersisa. Kosongkan jika tidak memiliki tenor atau cicilan bertahap.</Text>
          <Text style={[styles.formSection, { color: colors.foreground }]}>Jatuh tempo bulanan</Text>
          <View style={styles.split}><TextInput value={dueDay} onChangeText={setDueDay} keyboardType="numeric" maxLength={2} placeholder="Tanggal 1–31" placeholderTextColor={colors.muted} style={[styles.splitInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={dueTime} onChangeText={setDueTime} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="HH:MM" placeholderTextColor={colors.muted} style={[styles.splitInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View>
          <Text style={[styles.formSection, { color: colors.foreground }]}>Pengingat sebelum jatuh tempo</Text>
          <View style={styles.split}><TextInput value={reminderDay} onChangeText={setReminderDay} keyboardType="numeric" maxLength={2} placeholder="Tanggal (opsional)" placeholderTextColor={colors.muted} style={[styles.splitInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={reminderTime} onChangeText={setReminderTime} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="Waktu HH:MM" placeholderTextColor={colors.muted} style={[styles.splitInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View>
          <Text style={[styles.hint, { color: colors.muted }]}>Contoh: jatuh tempo tanggal 10 pukul 09:00; pengingat tanggal 8 pukul 08:00.</Text>
        </> : <>
          <MiniDatePicker label={mode === "goal" ? "Tanggal target" : "Tanggal evaluasi"} value={dateInput} onChange={setDateInput} placeholder={mode === "goal" ? "Pilih tanggal target" : "Pilih tanggal evaluasi"} optional />
          <MiniDatePicker label="Tanggal pengingat" value={dateReminderInput} onChange={setDateReminderInput} placeholder="Pilih tanggal pengingat" optional />
        </>}
        <PrimaryButton label={editingId ? "Simpan perubahan" : "Simpan rencana"} onPress={() => { void save(); }} />
      </AiraCard> : null}
      <SectionHeading title="Anggaran aktif" />
      {state.budgets.length ? <View style={styles.list}>{state.budgets.map((budget) => { const usage = getBudgetUsage(budget, state); return <AiraCard key={budget.id}><Text style={[styles.entryTitle, { color: colors.foreground }]}>{budget.category}</Text><Text style={[styles.entryDetail, { color: colors.muted }]}>{formatCurrency(usage.spending)} dari {formatCurrency(budget.limit)}{budget.dueAt ? ` · evaluasi ${formatDateTime(budget.dueAt)}` : ""}</Text></AiraCard>; })}</View> : <EmptyState icon="pie-chart" title="Belum ada anggaran" detail="Tetapkan batas bulanan per kategori." actionLabel="Buat anggaran" onAction={() => open("budget")} />}
      <SectionHeading title="Target tabungan" />
      {state.goals.length ? <View style={styles.list}>{state.goals.map((goal) => <AiraCard key={goal.id}><Text style={[styles.entryTitle, { color: colors.foreground }]}>{goal.title}</Text><Text style={[styles.entryDetail, { color: colors.muted }]}>{formatCurrency(goal.currentAmount)} dari {formatCurrency(goal.targetAmount)}{goal.targetDate ? ` · target ${formatDateTime(goal.targetDate)}` : ""}</Text></AiraCard>)}</View> : <EmptyState icon="savings" title="Belum ada target" detail="Buat target pembelian atau dana darurat." actionLabel="Buat target" onAction={() => open("goal")} />}
      <SectionHeading title="Tagihan, hutang & piutang" />
      {state.commitments.length ? <View style={styles.list}>{state.commitments.map((item) => {
        const status = commitmentStatus(item); const day = item.dueDayOfMonth ?? legacyDay(item.dueAt); const time = item.dueTime ?? legacyTime(item.dueAt); const tenor = tenorLabel(item);
        const settlementFlow = item.kind === "debt" ? "debt_payment" : item.kind === "receivable" ? "receivable_payment" : null;
        return <AiraCard key={item.id} style={[styles.commitment, { borderColor: status.color }]}><Pressable accessibilityLabel={`Tandai ${item.title} selesai`} onPress={() => { void toggleCommitment(item.id); }} style={({ pressed }) => [styles.check, pressed && styles.pressed]}><MaterialIcons name={item.isDone ? "check-circle" : "notifications-active"} size={21} color={status.color} /></Pressable><View style={styles.commitmentCopy}><View style={styles.statusRow}><View style={[styles.statusPill, { backgroundColor: status.background }]}><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View><Text style={[styles.kind, { color: colors.muted }]}>{labelOf(item.kind)}</Text></View><Text style={[styles.entryTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.entryDetail, { color: colors.muted }]}>{item.amount ? formatCurrency(item.amount) : "Tanpa nominal"}{day ? ` · tiap tgl ${day}${time ? ` ${time}` : ""}` : ""}{item.counterparty ? ` · ${item.counterparty}` : ""}</Text>{tenor ? <Text style={[styles.tenor, { color: colors.primary }]}>{tenor}</Text> : null}{settlementFlow && !item.isDone ? <View style={commitmentExtraStyles.actions}><Pressable onPress={() => router.push({ pathname: "/add-transaction", params: { commitmentFlow: settlementFlow, commitmentId: item.id } })} style={({ pressed }) => [styles.syncAction, { borderColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name={item.kind === "debt" ? "north-east" : "south-west"} size={15} color={colors.primary} /><Text style={[styles.syncText, { color: colors.primary }]}>{item.kind === "debt" ? "Catat bayar hutang" : "Catat terima piutang"}</Text></Pressable><Pressable onPress={() => router.push({ pathname: "/scan-receipt", params: { commitmentFlow: settlementFlow, commitmentId: item.id } })} style={({ pressed }) => [commitmentExtraStyles.scan, { borderColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="document-scanner" size={15} color={colors.primary} /><Text style={[styles.syncText, { color: colors.primary }]}>Pindai bukti</Text></Pressable></View> : null}</View><View style={styles.actions}><Pressable onPress={() => openEdit(item)} style={({ pressed }) => [styles.smallAction, pressed && styles.pressed]}><MaterialIcons name="edit" size={18} color={colors.primary} /><Text style={[styles.smallText, { color: colors.primary }]}>Edit</Text></Pressable><Pressable onPress={() => deleteItem(item)} style={({ pressed }) => [styles.smallAction, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={18} color={colors.error} /><Text style={[styles.smallText, { color: colors.error }]}>Hapus</Text></Pressable></View></AiraCard>;
      })}</View> : <EmptyState icon="notifications-none" title="Belum ada komitmen" detail="Tambahkan Tagihan, Hutang, atau Piutang." actionLabel="Tambah tagihan" onAction={() => open("bill")} />}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 22 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 2 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, flex: { flex: 1 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, actionRow: { flexDirection: "row", gap: 6 }, action: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: 5, minHeight: 68, justifyContent: "center", minWidth: 0, paddingHorizontal: 2 }, actionLabel: { fontSize: 10, fontWeight: "700", lineHeight: 13, textAlign: "center" }, form: { gap: 10 }, formHeader: { alignItems: "flex-start", flexDirection: "row", gap: 10, justifyContent: "space-between" }, formTitle: { fontSize: 16, fontWeight: "800" }, cancelButton: { paddingVertical: 3 }, cancel: { fontSize: 12, fontWeight: "800" }, input: { borderRadius: 13, borderWidth: 1, fontSize: 14, minHeight: 47, paddingHorizontal: 12 }, split: { flexDirection: "row", gap: 8 }, splitInput: { borderRadius: 13, borderWidth: 1, flex: 1, fontSize: 13, minHeight: 47, paddingHorizontal: 10 }, formSection: { fontSize: 12, fontWeight: "800", marginTop: 2 }, hint: { fontSize: 11, lineHeight: 16, marginTop: 2 }, list: { gap: 9 }, entryTitle: { fontSize: 14, fontWeight: "800" }, entryDetail: { fontSize: 12, lineHeight: 18, marginTop: 4 }, tenor: { fontSize: 11, fontWeight: "800", marginTop: 5 }, syncAction: { alignItems: "center", alignSelf: "flex-start", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 5, marginTop: 8, paddingHorizontal: 8, paddingVertical: 6 }, syncText: { fontSize: 10, fontWeight: "800" }, commitment: { alignItems: "center", borderWidth: 1, flexDirection: "row", gap: 8, padding: 11 }, check: { padding: 3 }, commitmentCopy: { flex: 1 }, statusRow: { alignItems: "center", flexDirection: "row", gap: 7 }, statusPill: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 }, statusText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.2 }, kind: { fontSize: 10, fontWeight: "700" }, actions: { flexDirection: "row", gap: 8 }, smallAction: { alignItems: "center", gap: 2, minWidth: 34 }, smallText: { fontSize: 9, fontWeight: "800" }, pressed: { opacity: 0.7 },
});
const commitmentExtraStyles = StyleSheet.create({ actions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 }, scan: { alignItems: "center", alignSelf: "flex-start", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 6 } });
