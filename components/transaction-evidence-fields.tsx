import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { normalizeTransactionEvidence } from "@/lib/finance/transaction-evidence";
import type { TransactionEvidence, TransactionPaymentMethod } from "@/lib/finance/types";

const methods: { id: TransactionPaymentMethod; label: string }[] = [
  { id: "bank_transfer", label: "Transfer bank" },
  { id: "qris", label: "QRIS" },
  { id: "cash", label: "Tunai" },
  { id: "unknown", label: "Belum diketahui" },
];
const transferStatuses: { id: NonNullable<TransactionEvidence["transferStatus"]>; label: string }[] = [
  { id: "succeeded", label: "Berhasil" },
  { id: "pending", label: "Diproses" },
  { id: "failed", label: "Gagal" },
  { id: "unknown", label: "Belum diketahui" },
];

type Props = { value: TransactionEvidence; onChange: (value: TransactionEvidence) => void };

const statusLabel = (status?: TransactionEvidence["transferStatus"]) => status === "succeeded" ? "Transfer berhasil" : status === "pending" ? "Transfer diproses" : status === "failed" ? "Transfer gagal" : null;

export function TransactionEvidenceFields({ value, onChange }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const normalized = normalizeTransactionEvidence(value);
  const hasData = Boolean(normalized.paymentMethod && normalized.paymentMethod !== "unknown" || normalized.transferStatus && normalized.transferStatus !== "unknown" || normalized.sourceBankName || normalized.destinationBankName || normalized.senderAccountDisplay || normalized.recipientAccountDisplay || normalized.referenceNumber || normalized.transactionPurpose || normalized.sequenceNumber || normalized.merchantName);
  const summary = [
    statusLabel(normalized.transferStatus),
    normalized.sourceBankName && normalized.destinationBankName ? `${normalized.sourceBankName} → ${normalized.destinationBankName}` : normalized.sourceBankName ?? normalized.destinationBankName,
    normalized.recipientAccountName,
    normalized.recipientAccountNumber ?? normalized.recipientAccountDisplay,
  ].filter(Boolean).join(" · ");
  const update = (key: keyof TransactionEvidence, next: string | TransactionPaymentMethod) => onChange(normalizeTransactionEvidence({ ...normalized, [key]: next }));

  return <View style={[styles.wrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
    <Pressable onPress={() => setExpanded((current) => !current)} style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="fact-check" size={18} color={colors.primary} /></View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]}>Rincian hasil OCR</Text>
        <Text numberOfLines={2} style={[styles.detail, { color: colors.muted }]}>{hasData ? summary || "Detail hasil baca tersedia untuk ditinjau." : "Belum ada identitas transaksi yang terbaca."}</Text>
      </View>
      <View style={[styles.editPill, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.editPillText, { color: colors.primary }]}>{expanded ? "Selesai" : "Periksa"}</Text><MaterialIcons name={expanded ? "expand-less" : "edit"} size={16} color={colors.primary} /></View>
    </Pressable>
    {expanded ? <View style={[styles.fields, { borderTopColor: colors.border }]}>
      <Text style={[styles.sectionHint, { color: colors.muted }]}>Ubah hanya bagian yang perlu diperbaiki. Field kosong tidak wajib diisi.</Text>
      <Text style={[styles.label, { color: colors.foreground }]}>Metode pembayaran</Text>
      <View style={styles.methodRow}>{methods.map((method) => <Pressable key={method.id} onPress={() => update("paymentMethod", method.id)} style={({ pressed }) => [styles.method, { backgroundColor: normalized.paymentMethod === method.id ? `${colors.primary}14` : colors.background, borderColor: normalized.paymentMethod === method.id ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={[styles.methodText, { color: normalized.paymentMethod === method.id ? colors.primary : colors.foreground }]}>{method.label}</Text></Pressable>)}</View>
      {normalized.paymentMethod === "bank_transfer" || normalized.transferStatus ? <><Text style={[styles.label, { color: colors.foreground }]}>Status dan jalur transfer</Text><View style={styles.methodRow}>{transferStatuses.map((status) => <Pressable key={status.id} onPress={() => update("transferStatus", status.id)} style={({ pressed }) => [styles.method, { backgroundColor: normalized.transferStatus === status.id ? `${colors.success}18` : colors.background, borderColor: normalized.transferStatus === status.id ? colors.success : colors.border }, pressed && styles.pressed]}><Text style={[styles.methodText, { color: normalized.transferStatus === status.id ? colors.success : colors.foreground }]}>{status.label}</Text></Pressable>)}</View><TextInput value={normalized.transferMethodLabel ?? ""} onChangeText={(next) => update("transferMethodLabel", next)} placeholder="Jalur transfer, mis. BI Fast" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></> : null}
      <Text style={[styles.label, { color: colors.foreground }]}>Bank</Text>
      <View style={styles.row}><TextInput value={normalized.sourceBankName ?? ""} onChangeText={(next) => update("sourceBankName", next)} placeholder="Bank pengirim" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput value={normalized.destinationBankName ?? ""} onChangeText={(next) => update("destinationBankName", next)} placeholder="Bank penerima" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View>
      <Text style={[styles.label, { color: colors.foreground }]}>Pihak dan rekening</Text>
      <TextInput value={normalized.recipientAccountName ?? ""} onChangeText={(next) => update("recipientAccountName", next)} placeholder="Nama penerima / merchant" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      <TextInput value={normalized.recipientAccountNumber ?? ""} onChangeText={(next) => update("recipientAccountNumber", next)} keyboardType="numeric" placeholder="Nomor rekening penerima" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      {normalized.recipientAccountDisplay && !normalized.recipientAccountNumber ? <Text style={[styles.maskedHint, { color: colors.muted }]}>Rekening penerima terbaca sebagian: {normalized.recipientAccountDisplay}</Text> : null}
      <TextInput value={normalized.senderAccountName ?? ""} onChangeText={(next) => update("senderAccountName", next)} placeholder="Nama rekening pengirim (bila tercetak)" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      <TextInput value={normalized.senderAccountNumber ?? ""} onChangeText={(next) => update("senderAccountNumber", next)} keyboardType="numeric" placeholder="Nomor rekening pengirim (bila tercetak)" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      {normalized.senderAccountDisplay && !normalized.senderAccountNumber ? <Text style={[styles.maskedHint, { color: colors.muted }]}>Rekening pengirim terbaca sebagian: {normalized.senderAccountDisplay}</Text> : null}
      <Text style={[styles.label, { color: colors.foreground }]}>Referensi tambahan</Text>
      <TextInput value={normalized.referenceNumber ?? ""} onChangeText={(next) => update("referenceNumber", next)} placeholder="ID transaksi / nomor referensi" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      <TextInput value={normalized.transactionPurpose ?? ""} onChangeText={(next) => update("transactionPurpose", next)} placeholder="Tujuan transaksi" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      <TextInput value={normalized.sequenceNumber ?? ""} onChangeText={(next) => update("sequenceNumber", next)} placeholder="Nomor urut bukti" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} />
      {normalized.paymentMethod === "qris" ? <TextInput value={normalized.merchantName ?? ""} onChangeText={(next) => update("merchantName", next)} placeholder="Nama merchant QRIS" placeholderTextColor={colors.muted} style={[styles.fullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /> : null}
      {normalized.classificationBasis && normalized.classificationBasis !== "ocr_text" ? <Text style={[styles.localHint, { color: colors.primary }]}>Saran jenis transaksi memakai kecocokan dompet yang tersimpan lokal pada perangkat ini.</Text> : null}
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  toggle: { alignItems: "center", flexDirection: "row", gap: 10, padding: 12 },
  icon: { alignItems: "center", borderRadius: 11, height: 34, justifyContent: "center", width: 34 },
  copy: { flex: 1 },
  title: { fontSize: 13, fontWeight: "800" },
  detail: { fontSize: 11, lineHeight: 15, marginTop: 1 },
  editPill: { alignItems: "center", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 3, paddingHorizontal: 8, paddingVertical: 6 },
  editPillText: { fontSize: 10, fontWeight: "800" },
  fields: { borderTopWidth: StyleSheet.hairlineWidth, gap: 8, padding: 12 },
  sectionHint: { fontSize: 10, lineHeight: 14, marginBottom: 1 },
  label: { fontSize: 12, fontWeight: "800", marginTop: 2 },
  methodRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  method: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  methodText: { fontSize: 10, fontWeight: "800" },
  row: { flexDirection: "row", gap: 8 },
  input: { borderRadius: 11, borderWidth: 1, flex: 1, fontSize: 12, minHeight: 43, paddingHorizontal: 10 },
  fullInput: { borderRadius: 11, borderWidth: 1, fontSize: 12, minHeight: 43, paddingHorizontal: 10 },
  maskedHint: { fontSize: 10, lineHeight: 14, marginTop: -4 },
  localHint: { fontSize: 10, fontWeight: "700", lineHeight: 15, marginTop: 2 },
  pressed: { opacity: 0.72 },
});
