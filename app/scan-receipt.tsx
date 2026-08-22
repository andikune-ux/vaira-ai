import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AiraCard, OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatReceiptDate, formatReceiptTime, normalizeReceiptDateInput, normalizeReceiptTimeInput, receiptDateTimeFromIso, receiptDateTimeToIso } from "@/lib/finance/receipt-date-time";
import { airaRetryMessage, nextAiraFailureCount, useOcrFallbackOnAttempt } from "@/lib/finance/receipt-scan-attempts";
import { useFinance } from "@/lib/finance/finance-context";
import type { TransactionKind, Wallet } from "@/lib/finance/types";
import { trpc } from "@/lib/trpc";

const noteWithRecipient = (note: string, recipientName: string | null) => recipientName ? `Penerima: ${recipientName}${note.trim() ? ` · ${note.trim()}` : ""}`.slice(0, 240) : note;

export default function ScanReceiptScreen() {
  const colors = useColors();
  const { state } = useFinance();
  const [uri, setUri] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Lainnya");
  const [kind, setKind] = useState<TransactionKind>("expense");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => formatReceiptDate());
  const [transactionTime, setTransactionTime] = useState(() => formatReceiptTime());
  const [timeDetected, setTimeDetected] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [airaFailureCount, setAiraFailureCount] = useState(0);
  const receiptAi = trpc.ai.analyzeReceipt.useMutation();
  const receiptOcr = trpc.ai.analyzeReceiptOcr.useMutation();
  const sourceWalletId = walletId || state.wallets[0]?.id || "";
  const useOcrFallback = useOcrFallbackOnAttempt(airaFailureCount);
  const isAnalyzing = receiptAi.isPending || receiptOcr.isPending;

  const resetDraft = () => {
    setAmount("");
    setFeeAmount("");
    setNote("Bukti transaksi");
    setCategory("Lainnya");
    setTransactionDate(formatReceiptDate());
    setTransactionTime(formatReceiptTime());
    setTimeDetected(false);
    setKind("expense");
    setAiraFailureCount(0);
  };

  const pick = async (source: "camera" | "library") => {
    setIsPicking(true);
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Izin kamera diperlukan", "Izinkan akses kamera untuk mengambil foto struk atau bukti transfer.");
          return;
        }
      }
      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
      if (!result.canceled) {
        setUri(result.assets[0]?.uri ?? null);
        resetDraft();
      }
    } finally {
      setIsPicking(false);
    }
  };

  const analyze = async () => {
    if (!uri) return;
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      if (base64.length > 7_500_000) {
        Alert.alert("Berkas terlalu besar", "Pilih foto bukti yang lebih kecil agar dapat dianalisis.");
        return;
      }
      const suffix = uri.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      const imageDataUrl = `data:image/${suffix};base64,${base64}`;
      const result = useOcrFallback
        ? await receiptOcr.mutateAsync({ imageDataUrl })
        : await receiptAi.mutateAsync({ imageDataUrl });
      if (!useOcrFallback) setAiraFailureCount((current) => nextAiraFailureCount(current, result.amount));
      if (result.amount) setAmount(String(result.amount));
      setKind(result.kind);
      setCategory(result.kind === "transfer" ? "Transfer dana" : result.category);
      setNote(noteWithRecipient(result.note, result.recipientName));
      if (result.occurredAt) {
        const detected = receiptDateTimeFromIso(result.occurredAt);
        setTransactionDate(detected.date);
        setTransactionTime(detected.time);
        setTimeDetected(true);
      } else {
        setTimeDetected(false);
        Alert.alert(
          result.provider === "ocr_space" ? "OCR cadangan digunakan" : "Nominal tetap dapat ditinjau",
          result.amount
            ? `${result.provider === "ocr_space" ? "OCR online membaca teks bukti. " : ""}Tanggal atau jam belum terbaca. Nominal sudah diisi; tanggal dan jam saat ini dipakai sebagai nilai sementara dan dapat Anda ubah.`
            : `${result.provider === "ocr_space" ? "OCR online tidak menemukan nominal yang meyakinkan. " : airaRetryMessage(nextAiraFailureCount(airaFailureCount, result.amount))} Isi nominal terlebih dahulu; tanggal dan jam saat ini dapat Anda ubah bila diperlukan.`,
        );
      }
    } catch {
      if (useOcrFallback) Alert.alert("OCR cadangan belum tersedia", "Periksa koneksi dan coba lagi. Anda tetap dapat mengisi nominal dan keterangan secara manual.");
      else setAiraFailureCount((current) => { const next = nextAiraFailureCount(current, null); Alert.alert("Aira belum tersedia", `${airaRetryMessage(next)} Anda tetap dapat mengisi transaksi secara manual.`); return next; });
    }
  };

  const continueDraft = () => {
    const numeric = Number(amount.replace(/[^0-9]/g, ""));
    const fee = Number(feeAmount.replace(/[^0-9]/g, "")) || 0;
    if (!sourceWalletId) {
      Alert.alert("Tambahkan sumber dana", "Buat dompet terlebih dahulu agar bukti dapat menjadi catatan transaksi.", [{ text: "Ke dompet", onPress: () => router.push("/wallets") }]);
      return;
    }
    if (!numeric) {
      Alert.alert("Nominal diperlukan", "Masukkan atau perbaiki nominal hasil baca bukti sebelum meneruskan ke konfirmasi.");
      return;
    }
    if (kind === "transfer" && !toWalletId) {
      Alert.alert("Tujuan dana diperlukan", "Pilih bank atau dompet digital tujuan transfer sebelum melanjutkan.");
      return;
    }
    if (kind === "transfer" && toWalletId === sourceWalletId) {
      Alert.alert("Tujuan belum valid", "Sumber dan tujuan transfer harus berbeda.");
      return;
    }
    router.push({
      pathname: "/confirm-transaction",
      params: {
        kind,
        amount: String(numeric),
        feeAmount: String(fee),
        category: kind === "transfer" ? "Transfer dana" : category,
        note: note.trim() || "Bukti transaksi",
        walletId: sourceWalletId,
        toWalletId: kind === "transfer" ? toWalletId : "",
        origin: "ocr",
        proofUri: uri,
        occurredAt: receiptDateTimeToIso(transactionDate, transactionTime),
      },
    });
  };

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable>
        <View><Text style={[styles.title, { color: colors.foreground }]}>Pindai bukti</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Foto struk atau bukti transfer untuk dijadikan draft.</Text></View>
      </View>
      <AiraCard style={styles.captureCard}>
        {uri ? <Image source={{ uri }} contentFit="cover" style={styles.preview} /> : <View style={[styles.previewEmpty, { backgroundColor: `${colors.primary}10` }]}><MaterialIcons name="document-scanner" size={42} color={colors.primary} /><Text style={[styles.previewTitle, { color: colors.foreground }]}>Pilih bukti transaksi</Text><Text style={[styles.previewDetail, { color: colors.muted }]}>Gunakan kamera atau galeri untuk membaca struk dan transfer dengan AI.</Text></View>}
        <View style={styles.captureActions}><OutlineButton label={isPicking ? "Membuka…" : "Kamera"} icon="photo-camera" onPress={() => { void pick("camera"); }} /><OutlineButton label="Galeri" icon="photo-library" onPress={() => { void pick("library"); }} /></View>
      </AiraCard>
      <View style={[styles.info, { backgroundColor: `${colors.warning}13` }]}><MaterialIcons name="payments" size={20} color={colors.warning} /><Text style={[styles.infoText, { color: colors.foreground }]}>Nominal adalah prioritas utama. Tanggal dan jam hanya pelengkap bila tercetak jelas; periksa nominal, sumber, tujuan, penerima, dan biaya sebelum menyimpan.</Text></View>
      {uri ? <>
        <PrimaryButton label={isAnalyzing ? "Menganalisis bukti…" : useOcrFallback ? "Pindai dengan OCR cadangan" : airaFailureCount ? `Pindai ulang dengan Aira (${airaFailureCount}/2)` : "Analisis bukti dengan Aira"} icon={useOcrFallback ? "document-scanner" : "auto-awesome"} disabled={isAnalyzing} onPress={() => { void analyze(); }} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Jenis & kategori hasil baca</Text>
        <Text style={[styles.detected, { color: kind === "income" ? colors.success : kind === "transfer" ? colors.primary : colors.error }]}>{kind === "income" ? "Pemasukan" : kind === "transfer" ? "Transfer" : "Pengeluaran"} · {category}</Text>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Nominal hasil baca</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Contoh: 75000" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{kind === "income" ? "Tujuan dana" : "Sumber dana"}</Text>
        <WalletChips wallets={state.wallets} selectedId={sourceWalletId} onSelect={setWalletId} colors={colors} />
        {kind === "transfer" ? <>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tujuan transfer</Text>
          <WalletChips wallets={state.wallets.filter((item) => item.id !== sourceWalletId)} selectedId={toWalletId} onSelect={setToWalletId} colors={colors} />
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Biaya admin (opsional)</Text>
          <TextInput value={feeAmount} onChangeText={setFeeAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
        </> : null}
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tanggal transaksi</Text>
        <View style={styles.dateTimeRow}>
          <TextInput value={transactionDate} onChangeText={(value) => setTransactionDate(normalizeReceiptDateInput(value))} keyboardType="numbers-and-punctuation" maxLength={10} placeholder="DD-MM-YYYY" placeholderTextColor={colors.muted} style={[styles.input, styles.dateInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
          <TextInput value={transactionTime} onChangeText={(value) => setTransactionTime(normalizeReceiptTimeInput(value))} keyboardType="numbers-and-punctuation" maxLength={5} placeholder="HH:MM" placeholderTextColor={colors.muted} style={[styles.input, styles.timeInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
        </View>
        <Text style={[styles.hint, { color: colors.muted }]}>{timeDetected ? "Tanggal dan jam terdeteksi dari bukti. Anda dapat memperbaikinya bila perlu." : "Tanggal atau jam tidak terbaca; nominal tetap dapat diproses. Nilai sementara memakai waktu saat ini dan dapat Anda ubah."}</Text>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Keterangan</Text>
        <TextInput value={note} onChangeText={setNote} placeholder="Keterangan bukti atau nama penerima" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
        <PrimaryButton label="Tinjau transaksi" icon="fact-check" onPress={continueDraft} />
      </> : null}
    </ScrollView>
  </ScreenContainer>;
}

function WalletChips({ wallets, selectedId, onSelect, colors }: { wallets: Wallet[]; selectedId: string; onSelect: (id: string) => void; colors: ReturnType<typeof useColors> }) {
  if (wallets.length === 0) return <Text style={[styles.hint, { color: colors.error }]}>Belum ada dompet. Tambahkan dompet dari menu Keuangan.</Text>;
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{wallets.map((wallet) => <Pressable key={wallet.id} onPress={() => onSelect(wallet.id)} style={({ pressed }) => [styles.chip, { backgroundColor: selectedId === wallet.id ? `${colors.primary}14` : colors.surface, borderColor: selectedId === wallet.id ? colors.primary : colors.border }, pressed && styles.pressed]}><View style={[styles.dot, { backgroundColor: wallet.color }]} /><Text style={[styles.chipText, { color: selectedId === wallet.id ? colors.primary : colors.foreground }]}>{wallet.name}</Text></Pressable>)}</ScrollView>;
}

const styles = StyleSheet.create({ content: { gap: 11, paddingBottom: 22 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 3 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, captureCard: { gap: 13 }, preview: { borderRadius: 16, height: 230, width: "100%" }, previewEmpty: { alignItems: "center", borderRadius: 16, gap: 8, minHeight: 230, justifyContent: "center", padding: 22 }, previewTitle: { fontSize: 16, fontWeight: "800", marginTop: 3 }, previewDetail: { fontSize: 12, lineHeight: 18, textAlign: "center" }, captureActions: { flexDirection: "row", gap: 9 }, info: { alignItems: "flex-start", borderRadius: 15, flexDirection: "row", gap: 9, padding: 13 }, infoText: { flex: 1, fontSize: 12, lineHeight: 18 }, fieldLabel: { fontSize: 14, fontWeight: "800", marginTop: 5 }, detected: { fontSize: 13, fontWeight: "800", marginTop: -5 }, input: { borderRadius: 14, borderWidth: 1, fontSize: 14, minHeight: 47, paddingHorizontal: 13 }, dateTimeRow: { flexDirection: "row", gap: 9 }, dateInput: { flex: 1.35 }, timeInput: { flex: 0.8 }, hint: { fontSize: 11, lineHeight: 16, marginTop: -4 }, chips: { gap: 8, paddingVertical: 1 }, chip: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 39, paddingHorizontal: 11 }, dot: { borderRadius: 5, height: 9, width: 9 }, chipText: { fontSize: 12, fontWeight: "800" }, pressed: { opacity: 0.7 } });
