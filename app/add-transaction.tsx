import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import type { TransactionKind } from "@/lib/finance/types";

const CATEGORIES = ["Makan", "Transportasi", "Belanja", "Tagihan", "Kesehatan", "Hiburan", "Gaji", "Penjualan", "Lainnya"];

export default function AddTransactionScreen() {
  const colors = useColors();
  const { editId, kind: kindParam } = useLocalSearchParams<{ editId?: string; kind?: string }>();
  const { state } = useFinance();
  const existing = useMemo(() => state.transactions.find((item) => item.id === editId), [editId, state.transactions]);
  const [kind, setKind] = useState<TransactionKind>("expense");
  const [amount, setAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [category, setCategory] = useState("Makan");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!existing && kindParam === "transfer") {
      setKind("transfer");
      setCategory("Transfer dana");
    }
    if (!existing) return;
    setKind(existing.kind);
    setAmount(String(existing.amount));
    setFeeAmount(existing.feeAmount ? String(existing.feeAmount) : "");
    setCategory(existing.category);
    setWalletId(existing.walletId);
    setToWalletId(existing.toWalletId ?? "");
    setNote(existing.note);
  }, [existing, kindParam]);

  const selectedWalletId = walletId || state.wallets[0]?.id || "";
  const wallet = useMemo(() => state.wallets.find((item) => item.id === selectedWalletId), [selectedWalletId, state.wallets]);
  const destination = useMemo(() => state.wallets.find((item) => item.id === toWalletId), [toWalletId, state.wallets]);

  const selectKind = (next: TransactionKind) => {
    setKind(next);
    if (next === "transfer") setCategory("Transfer dana");
    else if (category === "Transfer dana") setCategory(next === "income" ? "Gaji" : "Makan");
  };

  const continueToConfirmation = () => {
    const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
    const numericFee = Number(feeAmount.replace(/[^0-9]/g, "")) || 0;
    if (!selectedWalletId) { Alert.alert("Pilih sumber dana", "Tambahkan atau pilih dompet terlebih dahulu agar transaksi dapat dihitung dengan benar."); return; }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) { Alert.alert("Nominal belum valid", "Masukkan nominal transaksi lebih dari nol."); return; }
    if (kind === "transfer" && !toWalletId) { Alert.alert("Pilih tujuan dana", "Pilih bank atau dompet digital tujuan transfer."); return; }
    if (kind === "transfer" && toWalletId === selectedWalletId) { Alert.alert("Tujuan belum valid", "Sumber dan tujuan transfer harus berbeda."); return; }
    router.push({
      pathname: "/confirm-transaction",
      params: {
        kind,
        amount: String(numericAmount),
        feeAmount: String(numericFee),
        category: kind === "transfer" ? "Transfer dana" : category,
        walletId: selectedWalletId,
        toWalletId: kind === "transfer" ? toWalletId : "",
        note: note.trim() || (kind === "income" ? "Pemasukan manual" : kind === "transfer" ? "Transfer dana" : "Pengeluaran manual"),
        origin: "manual",
        occurredAt: existing?.occurredAt ?? new Date().toISOString(),
        editId: existing?.id ?? "",
      },
    });
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View><Text style={[styles.title, { color: colors.foreground }]}>{existing ? "Edit transaksi" : "Catat transaksi"}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Simpan setelah Anda meninjau ringkasan.</Text></View></View>
        <View style={[styles.segment, { backgroundColor: colors.surface, borderColor: colors.border }]}>{(["expense", "income", "transfer"] as const).map((value) => <Pressable key={value} onPress={() => selectKind(value)} style={({ pressed }) => [styles.segmentItem, kind === value && { backgroundColor: value === "expense" ? `${colors.error}14` : value === "income" ? `${colors.success}14` : `${colors.primary}14` }, pressed && styles.pressed]}><Text style={[styles.segmentLabel, { color: kind === value ? (value === "expense" ? colors.error : value === "income" ? colors.success : colors.primary) : colors.muted }]}>{value === "expense" ? "Keluar" : value === "income" ? "Masuk" : "Transfer"}</Text></Pressable>)}</View>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Nominal</Text><View style={[styles.amountBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.currencyPrefix, { color: colors.muted }]}>Rp</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.amountInput, { color: colors.foreground }]} /></View>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{kind === "income" ? "Tujuan dana" : kind === "transfer" ? "Sumber dana" : "Sumber dana"}</Text>
        <WalletPicker wallets={state.wallets} selectedId={selectedWalletId} onSelect={setWalletId} colors={colors} emptyAction={() => router.push("/wallets")} />
        {wallet ? <Text style={[styles.walletHint, { color: colors.muted }]}>{kind === "transfer" ? `Dana akan keluar dari ${wallet.name}.` : `Akan dicatat pada ${wallet.name}.`}</Text> : null}
        {kind === "transfer" ? <><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tujuan dana</Text><WalletPicker wallets={state.wallets.filter((item) => item.id !== selectedWalletId)} selectedId={toWalletId} onSelect={setToWalletId} colors={colors} emptyAction={() => router.push("/wallets")} />{destination ? <Text style={[styles.walletHint, { color: colors.muted }]}>Dana akan masuk ke {destination.name}.</Text> : null}<Text style={[styles.fieldLabel, { color: colors.foreground }]}>Biaya admin tambahan (opsional)</Text><View style={[styles.feeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.feePrefix, { color: colors.muted }]}>Rp</Text><TextInput value={feeAmount} onChangeText={setFeeAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.feeInput, { color: colors.foreground }]} /></View><Text style={[styles.walletHint, { color: colors.muted }]}>Biaya admin mengurangi saldo sumber dan dicatat sebagai pengeluaran tambahan.</Text></> : null}
        {kind !== "transfer" ? <><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Kategori</Text><View style={styles.categoryGrid}>{CATEGORIES.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.categoryChip, { backgroundColor: category === item ? `${colors.primary}14` : colors.surface, borderColor: category === item ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={[styles.categoryLabel, { color: category === item ? colors.primary : colors.foreground }]}>{item}</Text></Pressable>)}</View></> : null}
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Keterangan</Text><TextInput value={note} onChangeText={setNote} placeholder={kind === "transfer" ? "Contoh: Transfer tabungan" : "Contoh: Makan siang"} placeholderTextColor={colors.muted} style={[styles.noteInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} multiline />
        <PrimaryButton label="Tinjau sebelum simpan" icon="fact-check" onPress={continueToConfirmation} />
      </ScrollView>
    </ScreenContainer>
  );
}

function WalletPicker({ wallets, selectedId, onSelect, colors, emptyAction }: { wallets: ReturnType<typeof useFinance>["state"]["wallets"]; selectedId: string; onSelect: (id: string) => void; colors: ReturnType<typeof useColors>; emptyAction: () => void }) { if (wallets.length === 0) return <OutlineButton label="Tambah dompet terlebih dahulu" icon="account-balance-wallet" onPress={emptyAction} />; return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{wallets.map((item) => <Pressable key={item.id} onPress={() => onSelect(item.id)} style={({ pressed }) => [styles.chip, { backgroundColor: selectedId === item.id ? `${colors.primary}14` : colors.surface, borderColor: selectedId === item.id ? colors.primary : colors.border }, pressed && styles.pressed]}><View style={[styles.walletDot, { backgroundColor: item.color }]} /><Text style={[styles.chipLabel, { color: selectedId === item.id ? colors.primary : colors.foreground }]}>{item.name}</Text></Pressable>)}</ScrollView>; }
const styles = StyleSheet.create({ content: { gap: 10, paddingBottom: 24 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 8, marginTop: 2 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 }, subtitle: { fontSize: 12, marginTop: 2 }, segment: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", marginTop: 4, padding: 4 }, segmentItem: { alignItems: "center", borderRadius: 12, flex: 1, minHeight: 42, justifyContent: "center" }, segmentLabel: { fontSize: 12, fontWeight: "800" }, fieldLabel: { fontSize: 14, fontWeight: "800", marginTop: 12 }, amountBox: { alignItems: "center", borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", paddingHorizontal: 16 }, currencyPrefix: { fontSize: 22, fontWeight: "800", marginRight: 7 }, amountInput: { flex: 1, fontSize: 30, fontWeight: "800", minHeight: 64 }, feeBox: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", paddingHorizontal: 13 }, feePrefix: { fontSize: 16, fontWeight: "800", marginRight: 7 }, feeInput: { flex: 1, fontSize: 18, fontWeight: "800", minHeight: 48 }, chips: { gap: 8, paddingVertical: 1 }, chip: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 8, minHeight: 42, paddingHorizontal: 12 }, walletDot: { borderRadius: 5, height: 10, width: 10 }, chipLabel: { fontSize: 13, fontWeight: "700" }, walletHint: { fontSize: 12, marginTop: -3 }, categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, categoryChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 }, categoryLabel: { fontSize: 12, fontWeight: "700" }, noteInput: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, fontSize: 14, lineHeight: 20, minHeight: 78, padding: 13, textAlignVertical: "top" }, pressed: { opacity: 0.7 } });
