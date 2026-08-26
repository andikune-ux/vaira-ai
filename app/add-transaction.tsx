import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { TransactionDatePicker } from "@/components/transaction-date-picker";
import { TransactionEvidenceFields } from "@/components/transaction-evidence-fields";
import { useColors } from "@/hooks/use-colors";
import { commitmentFlowDetails, isCommitmentTransactionFlow, isSettlementCommitmentFlow } from "@/lib/finance/commitment-sync";
import { appendReceiptCounterpartyToNote, getReceiptCounterpartyLabel } from "@/lib/finance/receipt-counterparty";
import { formatReceiptDate, formatReceiptTime, isReceiptDateTimeInputValid, normalizeReceiptDateInput, normalizeReceiptTimeInput, receiptDateTimeFromIso, receiptDateTimeToIso } from "@/lib/finance/receipt-date-time";
import { useFinance } from "@/lib/finance/finance-context";
import { parseTransactionEvidence, serializeTransactionEvidence } from "@/lib/finance/transaction-evidence";
import type { CommitmentTransactionFlow, TransactionEvidence, TransactionKind, TransactionOrigin } from "@/lib/finance/types";

const CATEGORIES = ["Makan", "Transportasi", "Belanja", "Tagihan", "Kesehatan", "Hiburan", "Gaji", "Penjualan", "Lainnya"];

export default function AddTransactionScreen() {
  const colors = useColors();
  const { editId, kind: kindParam, amount: amountParam, category: categoryParam, note: noteParam, counterpartyName: counterpartyNameParam, origin: originParam, proofUri: proofUriParam, occurredAt: occurredAtParam, commitmentFlow: commitmentFlowParam, commitmentId: commitmentIdParam, evidenceJson: evidenceJsonParam } = useLocalSearchParams<{ editId?: string; kind?: string; amount?: string; category?: string; note?: string; counterpartyName?: string; origin?: TransactionOrigin; proofUri?: string; occurredAt?: string; commitmentFlow?: CommitmentTransactionFlow; commitmentId?: string; evidenceJson?: string }>();
  const { state } = useFinance();
  const existing = useMemo(() => state.transactions.find((item) => item.id === editId), [editId, state.transactions]);
  const commitmentFlow = !existing && isCommitmentTransactionFlow(commitmentFlowParam) ? commitmentFlowParam : undefined;
  const commitmentDetails = commitmentFlow ? commitmentFlowDetails(commitmentFlow) : undefined;
  const linkedCommitment = state.commitments.find((item) => item.id === commitmentIdParam);
  const [kind, setKind] = useState<TransactionKind>("expense");
  const [amount, setAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [category, setCategory] = useState("Makan");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [note, setNote] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [evidence, setEvidence] = useState<TransactionEvidence>({});
  const [proofUri, setProofUri] = useState<string | undefined>();
  const [fullProofPreviewOpen, setFullProofPreviewOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(() => formatReceiptDate());
  const [transactionTime, setTransactionTime] = useState(() => formatReceiptTime());

  useEffect(() => {
    if (!existing) {
      if (commitmentDetails) {
        setKind(commitmentDetails.kind);
        setCategory(commitmentDetails.category);
        if (linkedCommitment) {
          setAmount(String(linkedCommitment.remainingAmount ?? linkedCommitment.amount ?? ""));
          setCounterpartyName(linkedCommitment.counterparty ?? "");
          setNote(commitmentDetails.label);
        }
      }
      if (kindParam === "income" || kindParam === "expense" || kindParam === "transfer") setKind(kindParam);
      if (amountParam) setAmount(amountParam.replace(/[^0-9]/g, ""));
      if (categoryParam) setCategory(categoryParam);
      else if (kindParam === "transfer") setCategory("Transfer dana");
      if (noteParam) setNote(noteParam);
      if (counterpartyNameParam) setCounterpartyName(counterpartyNameParam.slice(0, 120));
      setEvidence(parseTransactionEvidence(evidenceJsonParam));
      setProofUri(proofUriParam || undefined);
      if (occurredAtParam) {
        const occurred = receiptDateTimeFromIso(occurredAtParam);
        setTransactionDate(occurred.date);
        setTransactionTime(occurred.time);
      }
      return;
    }
    if (!existing) return;
    setKind(existing.kind);
    setAmount(String(existing.amount));
    setFeeAmount(existing.feeAmount ? String(existing.feeAmount) : "");
    setCategory(existing.category);
    setWalletId(existing.walletId);
    setToWalletId(existing.toWalletId ?? "");
    setNote(existing.note);
    setCounterpartyName(existing.counterpartyName ?? "");
    setEvidence(existing.evidence ?? {});
    setProofUri(existing.proofUri);
    const occurred = receiptDateTimeFromIso(existing.occurredAt);
    setTransactionDate(occurred.date);
    setTransactionTime(occurred.time);
  }, [amountParam, categoryParam, commitmentDetails, counterpartyNameParam, evidenceJsonParam, existing, kindParam, linkedCommitment, noteParam, occurredAtParam, proofUriParam]);

  const selectedWalletId = walletId || state.wallets[0]?.id || "";
  const wallet = useMemo(() => state.wallets.find((item) => item.id === selectedWalletId), [selectedWalletId, state.wallets]);
  const destination = useMemo(() => state.wallets.find((item) => item.id === toWalletId), [toWalletId, state.wallets]);

  const selectKind = (next: TransactionKind) => {
    if (commitmentDetails) { Alert.alert("Jenis dikunci", "Jenis transaksi mengikuti hubungan hutang atau piutang yang dipilih. Kembali ke daftar untuk memilih hubungan lain."); return; }
    setKind(next);
    if (next === "transfer") setCategory("Transfer dana");
    else if (category === "Transfer dana") setCategory(next === "income" ? "Gaji" : "Makan");
  };

  const pickManualProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.75 });
    if (!result.canceled && result.assets[0]?.uri) setProofUri(result.assets[0].uri);
  };

  const continueToConfirmation = () => {
    const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
    const numericFee = Number(feeAmount.replace(/[^0-9]/g, "")) || 0;
    const normalizedCounterpartyName = counterpartyName.trim().slice(0, 120);
    if (!selectedWalletId) { Alert.alert("Pilih sumber dana", "Tambahkan atau pilih dompet terlebih dahulu agar transaksi dapat dihitung dengan benar."); return; }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) { Alert.alert("Nominal belum valid", "Masukkan nominal transaksi lebih dari nol."); return; }
    if (!isReceiptDateTimeInputValid(transactionDate, transactionTime)) { Alert.alert("Tanggal atau jam belum valid", "Gunakan format tanggal DD-MM-YYYY dan jam HH:MM sebelum melanjutkan."); return; }
    if (kind === "transfer" && !toWalletId) { Alert.alert("Pilih tujuan dana", "Pilih bank atau dompet digital tujuan transfer."); return; }
    if (kind === "transfer" && toWalletId === selectedWalletId) { Alert.alert("Tujuan belum valid", "Sumber dan tujuan transfer harus berbeda."); return; }
    if (commitmentFlow && (!commitmentDetails || commitmentDetails.kind !== kind)) { Alert.alert("Hubungan belum valid", "Pilih kembali pembayaran hutang atau penerimaan piutang dari daftar rencana."); return; }
    if (commitmentFlow && isSettlementCommitmentFlow(commitmentFlow) && !linkedCommitment) { Alert.alert("Daftar terkait belum ditemukan", "Pilih kembali hutang atau piutang dari daftar rencana."); return; }
    router.push({
      pathname: "/confirm-transaction",
      params: {
        kind,
        amount: String(numericAmount),
        feeAmount: String(numericFee),
        category: kind === "transfer" ? "Transfer dana" : category,
        walletId: selectedWalletId,
        toWalletId: kind === "transfer" ? toWalletId : "",
        note: appendReceiptCounterpartyToNote(note || (kind === "income" ? "Pemasukan manual" : kind === "transfer" ? "Transfer dana" : "Pengeluaran manual"), kind, normalizedCounterpartyName),
        counterpartyName: normalizedCounterpartyName,
        origin: originParam === "ai_chat" || originParam === "ocr" || originParam === "voice" ? originParam : "manual",
        proofUri,
        evidenceJson: serializeTransactionEvidence(evidence),
        occurredAt: receiptDateTimeToIso(transactionDate, transactionTime, existing ? new Date(existing.occurredAt) : new Date()),
        editId: existing?.id ?? "",
        commitmentFlow: commitmentFlow ?? "",
        commitmentId: commitmentFlow && isSettlementCommitmentFlow(commitmentFlow) ? linkedCommitment?.id ?? "" : "",
      },
    });
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View><Text style={[styles.title, { color: colors.foreground }]}>{existing ? "Edit transaksi" : "Catat transaksi"}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Simpan setelah Anda meninjau ringkasan.</Text></View></View>
        {commitmentDetails ? <View style={[styles.commitmentNotice, { backgroundColor: `${colors.primary}10` }]}><MaterialIcons name="sync-alt" size={20} color={colors.primary} /><View style={styles.commitmentNoticeCopy}><Text style={[styles.commitmentNoticeTitle, { color: colors.foreground }]}>{commitmentDetails.label}</Text><Text style={[styles.commitmentNoticeDetail, { color: colors.muted }]}>{linkedCommitment ? `Terhubung ke ${linkedCommitment.title}. Saldo dan sisa nominal diperbarui setelah konfirmasi.` : "Hubungan akan diterapkan setelah konfirmasi."}</Text></View></View> : null}
        <View style={[styles.segment, { backgroundColor: colors.surface, borderColor: colors.border }]}>{(["expense", "income", "transfer"] as const).map((value) => <Pressable key={value} onPress={() => selectKind(value)} style={({ pressed }) => [styles.segmentItem, kind === value && { backgroundColor: value === "expense" ? `${colors.error}14` : value === "income" ? `${colors.success}14` : `${colors.primary}14` }, pressed && styles.pressed]}><Text style={[styles.segmentLabel, { color: kind === value ? (value === "expense" ? colors.error : value === "income" ? colors.success : colors.primary) : colors.muted }]}>{value === "expense" ? "Keluar" : value === "income" ? "Masuk" : "Transfer"}</Text></Pressable>)}</View>
        <View style={photoStyles.actions}><OutlineButton label="Pindai bukti" icon="document-scanner" onPress={() => router.push("/scan-receipt")} /><OutlineButton label={proofUri ? "Ganti foto bukti" : "Pilih foto bukti"} icon="photo-library" onPress={() => { void pickManualProof(); }} /></View>
        {proofUri ? <View style={[photoStyles.preview, { borderColor: colors.border, backgroundColor: colors.surface }]}><Pressable accessibilityLabel="Buka pratinjau penuh foto bukti" onPress={() => setFullProofPreviewOpen(true)} style={({ pressed }) => [photoStyles.previewTap, pressed && styles.pressed]}><Image source={{ uri: proofUri }} contentFit="contain" style={photoStyles.image} /><View style={photoStyles.copy}><Text style={[photoStyles.title, { color: colors.foreground }]}>Foto bukti terpasang</Text><Text style={[photoStyles.detail, { color: colors.muted }]}>Ketuk untuk melihat penuh. Foto ini tersimpan bersama transaksi setelah konfirmasi.</Text></View><MaterialIcons name="visibility" size={20} color={colors.primary} /></Pressable><Pressable accessibilityLabel="Hapus foto bukti" onPress={() => setProofUri(undefined)} style={({ pressed }) => [photoStyles.remove, pressed && styles.pressed]}><Text style={[photoStyles.removeText, { color: colors.error }]}>Hapus foto</Text></Pressable></View> : null}
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tanggal dan jam transaksi</Text>
        <View style={styles.dateTimeRow}><TextInput value={transactionDate} onChangeText={(value) => setTransactionDate(normalizeReceiptDateInput(value))} keyboardType="numbers-and-punctuation" maxLength={10} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} style={[styles.dateInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /><TextInput value={transactionTime} onChangeText={(value) => setTransactionTime(normalizeReceiptTimeInput(value))} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="HH:MM" placeholderTextColor={colors.muted} style={[styles.timeInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /></View>
        <TransactionDatePicker value={transactionDate} onChange={setTransactionDate} />
        <Text style={[styles.walletHint, { color: colors.muted }]}>Tanggal dan jam selalu dapat diubah untuk transaksi yang baru dilaporkan belakangan.</Text>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Nominal</Text><View style={[styles.amountBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.currencyPrefix, { color: colors.muted }]}>Rp</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.amountInput, { color: colors.foreground }]} /></View>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{kind === "income" ? "Tujuan dana" : kind === "transfer" ? "Sumber dana" : "Sumber dana"}</Text>
        <WalletPicker wallets={state.wallets} selectedId={selectedWalletId} onSelect={setWalletId} colors={colors} emptyAction={() => router.push("/wallets")} />
        {wallet ? <Text style={[styles.walletHint, { color: colors.muted }]}>{kind === "transfer" ? `Dana akan keluar dari ${wallet.name}.` : `Akan dicatat pada ${wallet.name}.`}</Text> : null}
        {kind === "transfer" ? <><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tujuan dana</Text><WalletPicker wallets={state.wallets.filter((item) => item.id !== selectedWalletId)} selectedId={toWalletId} onSelect={setToWalletId} colors={colors} emptyAction={() => router.push("/wallets")} />{destination ? <Text style={[styles.walletHint, { color: colors.muted }]}>Dana akan masuk ke {destination.name}.</Text> : null}<Text style={[styles.fieldLabel, { color: colors.foreground }]}>Biaya admin tambahan (opsional)</Text><View style={[styles.feeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.feePrefix, { color: colors.muted }]}>Rp</Text><TextInput value={feeAmount} onChangeText={setFeeAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.feeInput, { color: colors.foreground }]} /></View><Text style={[styles.walletHint, { color: colors.muted }]}>Biaya admin mengurangi saldo sumber dan dicatat sebagai pengeluaran tambahan.</Text></> : null}
        {kind !== "transfer" ? <><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Kategori</Text><View style={styles.categoryGrid}>{CATEGORIES.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.categoryChip, { backgroundColor: category === item ? `${colors.primary}14` : colors.surface, borderColor: category === item ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={[styles.categoryLabel, { color: category === item ? colors.primary : colors.foreground }]}>{item}</Text></Pressable>)}</View></> : null}
        <TransactionEvidenceFields value={evidence} onChange={setEvidence} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{getReceiptCounterpartyLabel(kind)} (opsional)</Text><TextInput value={counterpartyName} onChangeText={setCounterpartyName} placeholder={kind === "income" ? "Contoh: Andi" : "Contoh: Toko atau penerima transfer"} placeholderTextColor={colors.muted} style={[styles.noteInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border, minHeight: 46 }]} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Keterangan</Text><TextInput value={note} onChangeText={setNote} placeholder={kind === "transfer" ? "Contoh: Transfer tabungan" : "Contoh: Makan siang"} placeholderTextColor={colors.muted} style={[styles.noteInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} multiline />
        <PrimaryButton label="Tinjau sebelum simpan" icon="fact-check" onPress={continueToConfirmation} />
      </ScrollView>
      <Modal visible={fullProofPreviewOpen} transparent animationType="fade" onRequestClose={() => setFullProofPreviewOpen(false)}><View style={photoStyles.overlay}><View style={[photoStyles.fullSheet, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={photoStyles.fullHeader}><Text style={[photoStyles.fullTitle, { color: colors.foreground }]}>Pratinjau foto bukti</Text><Pressable accessibilityLabel="Tutup pratinjau foto" onPress={() => setFullProofPreviewOpen(false)} style={({ pressed }) => [photoStyles.close, { backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={colors.foreground} /></Pressable></View>{proofUri ? <Image source={{ uri: proofUri }} contentFit="contain" style={photoStyles.fullImage} /> : null}<OutlineButton label="Tutup" icon="close" onPress={() => setFullProofPreviewOpen(false)} /></View></View></Modal>
    </ScreenContainer>
  );
}

function WalletPicker({ wallets, selectedId, onSelect, colors, emptyAction }: { wallets: ReturnType<typeof useFinance>["state"]["wallets"]; selectedId: string; onSelect: (id: string) => void; colors: ReturnType<typeof useColors>; emptyAction: () => void }) { if (wallets.length === 0) return <OutlineButton label="Tambah dompet terlebih dahulu" icon="account-balance-wallet" onPress={emptyAction} />; return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{wallets.map((item) => <Pressable key={item.id} onPress={() => onSelect(item.id)} style={({ pressed }) => [styles.chip, { backgroundColor: selectedId === item.id ? `${colors.primary}14` : colors.surface, borderColor: selectedId === item.id ? colors.primary : colors.border }, pressed && styles.pressed]}><View style={[styles.walletDot, { backgroundColor: item.color }]} /><Text style={[styles.chipLabel, { color: selectedId === item.id ? colors.primary : colors.foreground }]}>{item.name}</Text></Pressable>)}</ScrollView>; }
const styles = StyleSheet.create({ content: { gap: 10, paddingBottom: 24 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 8, marginTop: 2 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 }, subtitle: { fontSize: 12, marginTop: 2 }, commitmentNotice: { alignItems: "flex-start", borderRadius: 15, flexDirection: "row", gap: 10, padding: 13 }, commitmentNoticeCopy: { flex: 1 }, commitmentNoticeTitle: { fontSize: 13, fontWeight: "800" }, commitmentNoticeDetail: { fontSize: 11, lineHeight: 16, marginTop: 2 }, segment: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", marginTop: 4, padding: 4 }, segmentItem: { alignItems: "center", borderRadius: 12, flex: 1, minHeight: 42, justifyContent: "center" }, segmentLabel: { fontSize: 12, fontWeight: "800" }, fieldLabel: { fontSize: 14, fontWeight: "800", marginTop: 12 }, amountBox: { alignItems: "center", borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", paddingHorizontal: 16 }, currencyPrefix: { fontSize: 22, fontWeight: "800", marginRight: 7 }, amountInput: { flex: 1, fontSize: 30, fontWeight: "800", minHeight: 64 }, feeBox: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", paddingHorizontal: 13 }, feePrefix: { fontSize: 16, fontWeight: "800", marginRight: 7 }, feeInput: { flex: 1, fontSize: 18, fontWeight: "800", minHeight: 48 }, chips: { gap: 8, paddingVertical: 1 }, chip: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 8, minHeight: 42, paddingHorizontal: 12 }, walletDot: { borderRadius: 5, height: 10, width: 10 }, chipLabel: { fontSize: 13, fontWeight: "700" }, walletHint: { fontSize: 12, marginTop: -3 }, categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, categoryChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 }, categoryLabel: { fontSize: 12, fontWeight: "700" }, dateTimeRow: { flexDirection: "row", gap: 9 }, dateInput: { flex: 1.35, minHeight: 48, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, fontSize: 14, paddingHorizontal: 13 }, timeInput: { flex: 0.8, minHeight: 48, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, fontSize: 14, paddingHorizontal: 13 }, noteInput: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, fontSize: 14, lineHeight: 20, minHeight: 78, padding: 13, textAlignVertical: "top" }, pressed: { opacity: 0.7 } });
const photoStyles = StyleSheet.create({ actions: { flexDirection: "row", gap: 8 }, preview: { borderRadius: 14, borderWidth: 1, padding: 10 }, previewTap: { alignItems: "center", flexDirection: "row", gap: 10 }, image: { borderRadius: 10, height: 62, width: 62 }, copy: { flex: 1 }, title: { fontSize: 12, fontWeight: "800" }, detail: { fontSize: 10, lineHeight: 15, marginTop: 2 }, remove: { alignSelf: "flex-end", marginTop: 6 }, removeText: { fontSize: 10, fontWeight: "800" }, overlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.78)", flex: 1, justifyContent: "center", padding: 14 }, fullSheet: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, gap: 12, height: "86%", maxWidth: 620, padding: 16, width: "100%" }, fullHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, fullTitle: { fontSize: 18, fontWeight: "800" }, close: { alignItems: "center", borderRadius: 16, height: 36, justifyContent: "center", width: 36 }, fullImage: { flex: 1, minHeight: 220, width: "100%" } });
