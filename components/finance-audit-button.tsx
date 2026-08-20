import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { readFinanceSyncErrors } from "@/lib/finance/sync-history";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { getWalletBalance } from "@/lib/finance/finance-utils";

export function FinanceAuditButton({ label = "Aira analisis saldo" }: { label?: string }) {
  const colors = useColors();
  const { state } = useFinance();
  const analyze = () => {
    const opening = state.wallets.reduce((sum, wallet) => sum + wallet.openingBalance, 0);
    const income = state.transactions.filter((item) => item.status === "confirmed" && item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = state.transactions.filter((item) => item.status === "confirmed" && item.kind === "expense").reduce((sum, item) => sum + item.amount + (item.feeAmount ?? 0), 0);
    const recorded = state.wallets.reduce((sum, wallet) => sum + getWalletBalance(wallet, state.transactions), 0);
    const expected = opening + income - expense;
    const difference = recorded - expected;
    const detail = Math.abs(difference) < 1 ? "Saldo tercatat sinkron dengan saldo awal, pemasukan, dan pengeluaran." : `Ada selisih ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.abs(difference))}. Periksa transaksi transfer, biaya, atau transaksi yang belum dikonfirmasi.`;
    const summary = `Analisis saldo keuangan: ${detail} Saldo awal ${format(opening)}, pemasukan ${format(income)}, pengeluaran ${format(expense)}, saldo tercatat ${format(recorded)}. Tolong jelaskan kemungkinan penyebabnya dan langkah pemeriksaan berikutnya.`; Alert.alert("Aira · Analisis saldo", `${detail}\n\nSaldo awal: ${format(opening)}\nPemasukan: ${format(income)}\nPengeluaran: ${format(expense)}\nSaldo tercatat: ${format(recorded)}`, [{ text: "Tutup", style: "cancel" }, { text: "Buka chat Aira", onPress: () => router.push({ pathname: "/chat", params: { prefill: summary } }) }]);
  };
  const showSyncHistory = async () => { const entries = await readFinanceSyncErrors(); if (!entries.length) { Alert.alert("Riwayat sinkronisasi", "Belum ada catatan kesalahan sinkronisasi data."); return; } Alert.alert("Riwayat kesalahan sinkronisasi", entries.slice(0, 8).map((entry) => `${new Date(entry.createdAt).toLocaleString("id-ID")} · ${entry.source}\n${entry.message}`).join("\n\n")); };
  return <><Pressable accessibilityLabel={label} onPress={analyze} style={({ pressed }) => [styles.button, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` }, pressed && styles.pressed]}><MaterialIcons name="auto-awesome" size={17} color={colors.primary} /><Text style={[styles.text, { color: colors.primary }]}>{label}</Text></Pressable><Pressable accessibilityLabel="Riwayat kesalahan sinkronisasi" onPress={() => { void showSyncHistory(); }} style={({ pressed }) => [styles.button, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}35` }, pressed && styles.pressed]}><MaterialIcons name="sync-problem" size={17} color={colors.warning} /><Text style={[styles.text, { color: colors.warning }]}>Riwayat sinkronisasi</Text></Pressable></>;
}

const format = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const styles = StyleSheet.create({ button: { alignItems: "center", borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 6, paddingHorizontal: 10, paddingVertical: 8 }, text: { fontSize: 11, fontWeight: "800" }, pressed: { opacity: 0.7 } });
