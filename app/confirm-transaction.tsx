import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AiraCard, OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { formatCurrency, formatDateTime, getWalletBalance } from "@/lib/finance/finance-utils";
import type { TransactionKind, TransactionOrigin } from "@/lib/finance/types";

export default function ConfirmTransactionScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ kind: TransactionKind; amount: string; feeAmount?: string; category: string; walletId: string; toWalletId?: string; note: string; counterpartyName?: string; origin?: TransactionOrigin; proofUri?: string; occurredAt?: string; editId?: string }>();
  const { state, addConfirmedTransaction, updateConfirmedTransaction, addCommitment } = useFinance();
  const [saving, setSaving] = useState(false);
  const wallet = state.wallets.find((item) => item.id === params.walletId);
  const destination = state.wallets.find((item) => item.id === params.toWalletId);
  const amount = Number(params.amount ?? 0);
  const feeAmount = Number(params.feeAmount ?? 0) || 0;
  const occurredAt = params.occurredAt || new Date().toISOString();
  const isTransfer = params.kind === "transfer";
  const counterpartyName = params.counterpartyName?.trim().slice(0, 120) || undefined;
  const counterpartyLabel = params.kind === "income" ? "Pengirim" : params.kind === "transfer" ? "Penerima / tujuan" : "Penerima";
  const currentBalance = wallet ? getWalletBalance(wallet, state.transactions) : 0;
  const destinationBalance = destination ? getWalletBalance(destination, state.transactions) : 0;
  const nextBalance = !wallet ? 0 : params.kind === "income" ? currentBalance + amount : currentBalance - amount - (isTransfer ? feeAmount : 0);

  const confirm = async () => {
    if (!wallet || !params.kind || !amount || (isTransfer && !destination)) return;
    setSaving(true);
    const payload = {
      kind: params.kind,
      amount,
      feeAmount: isTransfer ? feeAmount : undefined,
      walletId: wallet.id,
      toWalletId: isTransfer ? destination?.id : undefined,
      category: params.category || "Lainnya",
      note: params.note || "Catatan transaksi",
      counterpartyName,
      occurredAt,
      origin: params.origin ?? "manual",
      proofUri: params.proofUri,
    };
    try {
      if (params.editId) await updateConfirmedTransaction(params.editId, payload);
      else {
        await addConfirmedTransaction(payload);
        const normalizedNote = params.note.toLowerCase();
        const plannedKind = params.origin === "ocr" && params.kind === "income" && /\b(hutang|utang)\b/.test(normalizedNote)
          ? "debt"
          : params.origin === "ocr" && params.kind === "expense" && /\bpiutang\b/.test(normalizedNote)
            ? "receivable"
            : null;
        if (plannedKind) {
          const counterparty = normalizedNote.match(/(?:dari|ke)\s+([\p{L}\p{N}\s.'-]{2,60})/iu)?.[1]?.trim();
          await addCommitment({
            title: plannedKind === "debt" ? `Hutang ${counterparty ? `dari ${counterparty}` : "dari bukti transaksi"}` : `Piutang ${counterparty ? `ke ${counterparty}` : "dari bukti transaksi"}`,
            amount,
            remainingAmount: amount,
            kind: plannedKind,
            counterparty,
            isRecurring: false,
            isDone: false,
          });
        }
      }
      Alert.alert(
        params.editId ? "Transaksi diperbarui" : "Transaksi tersimpan",
        params.editId ? "Perubahan mutasi telah diterapkan ke data keuangan." : "Catatan telah dikonfirmasi dan sudah masuk ke data keuangan Anda.",
        [{ text: "Lihat keuangan", onPress: () => router.replace("/(tabs)/finance") }],
      );
    } finally {
      setSaving(false);
    }
  };

  if (!wallet || !params.kind || amount <= 0 || (isTransfer && !destination)) {
    return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><View style={styles.center}><MaterialIcons name="error-outline" size={36} color={colors.error} /><Text style={[styles.errorTitle, { color: colors.foreground }]}>Draft transaksi tidak lengkap</Text><OutlineButton label="Kembali ke form" onPress={() => router.replace("/add-transaction")} /></View></ScreenContainer>;
  }

  return (
    <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.successIcon, { backgroundColor: `${colors.success}18` }]}><MaterialIcons name="fact-check" size={33} color={colors.success} /></View>
        <Text style={[styles.title, { color: colors.foreground }]}>{params.editId ? "Konfirmasi perubahan" : "Konfirmasi catatan"}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Periksa rincian berikut. Saldo hanya berubah setelah Anda menyimpan catatan ini.</Text>
        <AiraCard style={styles.summaryCard}>
          <SummaryRow label="Jenis" value={isTransfer ? "Pindah dana" : params.kind === "income" ? "Pemasukan" : "Pengeluaran"} valueColor={params.kind === "income" ? colors.success : params.kind === "expense" ? colors.error : colors.primary} />
          <Divider color={colors.border} /><SummaryRow label="Nominal" value={formatCurrency(amount)} strong />
          <Divider color={colors.border} /><SummaryRow label={isTransfer ? "Dari" : "Sumber dana"} value={wallet.name} />
          {isTransfer ? <><Divider color={colors.border} /><SummaryRow label="Ke" value={destination?.name ?? "Tujuan dana"} /><Divider color={colors.border} /><SummaryRow label="Biaya admin" value={feeAmount > 0 ? formatCurrency(feeAmount) : "Tidak ada"} valueColor={feeAmount > 0 ? colors.error : undefined} /></> : null}
          <Divider color={colors.border} /><SummaryRow label="Kategori" value={params.category || "Lainnya"} />
          {counterpartyName ? <><Divider color={colors.border} /><SummaryRow label={counterpartyLabel} value={counterpartyName} /></> : null}
          <Divider color={colors.border} /><SummaryRow label="Waktu" value={formatDateTime(occurredAt)} />
          <Divider color={colors.border} /><SummaryRow label="Keterangan" value={params.note || "—"} />
        </AiraCard>
        <View style={[styles.balanceNote, { backgroundColor: `${colors.primary}10` }]}>
          <MaterialIcons name="account-balance-wallet" size={20} color={colors.primary} />
          <View style={styles.balanceText}><Text style={[styles.balanceLabel, { color: colors.muted }]}>Saldo {wallet.name} setelah disimpan</Text><Text style={[styles.balanceValue, { color: colors.foreground }]}>{formatCurrency(nextBalance)}</Text>{isTransfer ? <Text style={[styles.destinationText, { color: colors.success }]}>{destination?.name ?? "Tujuan dana"}: {formatCurrency(destinationBalance + amount)}</Text> : null}</View>
        </View>
        <PrimaryButton label={saving ? "Menyimpan…" : params.editId ? "Simpan perubahan" : "Konfirmasi & simpan"} icon="check-circle" disabled={saving} onPress={confirm} />
        <OutlineButton label="Ubah catatan" onPress={() => router.back()} />
      </ScrollView>
    </ScreenContainer>
  );
}

function SummaryRow({ label, value, strong = false, valueColor }: { label: string; value: string; strong?: boolean; valueColor?: string }) { const colors = useColors(); return <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.muted }]}>{label}</Text><Text numberOfLines={2} style={[styles.summaryValue, { color: valueColor ?? colors.foreground }, strong && styles.strong]}>{value}</Text></View>; }
function Divider({ color }: { color: string }) { return <View style={[styles.divider, { backgroundColor: color }]} />; }
const styles = StyleSheet.create({ content: { alignItems: "center", gap: 16, paddingBottom: 18, paddingTop: 16 }, successIcon: { alignItems: "center", borderRadius: 24, height: 62, justifyContent: "center", width: 62 }, title: { fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }, subtitle: { fontSize: 13, lineHeight: 19, maxWidth: 310, textAlign: "center" }, summaryCard: { alignSelf: "stretch", paddingVertical: 7 }, summaryRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", minHeight: 44, paddingVertical: 9 }, summaryLabel: { flex: 0.43, fontSize: 13 }, summaryValue: { flex: 0.57, fontSize: 13, fontWeight: "700", textAlign: "right" }, strong: { fontSize: 16, fontWeight: "800" }, divider: { height: StyleSheet.hairlineWidth }, balanceNote: { alignItems: "center", alignSelf: "stretch", borderRadius: 16, flexDirection: "row", gap: 11, padding: 14 }, balanceText: { flex: 1 }, balanceLabel: { fontSize: 12 }, balanceValue: { fontSize: 17, fontWeight: "800", marginTop: 2 }, destinationText: { fontSize: 12, fontWeight: "800", marginTop: 4 }, center: { alignItems: "center", flex: 1, gap: 14, justifyContent: "center" }, errorTitle: { fontSize: 18, fontWeight: "800" } });
