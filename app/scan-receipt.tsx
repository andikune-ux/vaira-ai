import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AiraCard, OutlineButton, PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { appendReceiptCounterpartyToNote, getReceiptCounterpartyLabel, getReceiptCounterpartyRole, normalizeReceiptCounterpartyName } from "@/lib/finance/receipt-counterparty";
import { formatReceiptDate, formatReceiptTime, normalizeReceiptDateInput, normalizeReceiptTimeInput, receiptDateTimeFromIso, receiptDateTimeToIso } from "@/lib/finance/receipt-date-time";
import { airaRetryMessage, nextAiraFailureCount, useOcrFallbackOnAttempt } from "@/lib/finance/receipt-scan-attempts";
import { useFinance } from "@/lib/finance/finance-context";
import type { TransactionKind, Wallet } from "@/lib/finance/types";
import { trpc } from "@/lib/trpc";

type ProofImage = { uri: string; width: number; height: number };

export default function ScanReceiptScreen() {
  const colors = useColors();
  const { state } = useFinance();
  const [proof, setProof] = useState<ProofImage | null>(null);
  const [pendingProof, setPendingProof] = useState<ProofImage | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropInset, setCropInset] = useState(0);
  const [isApplyingPreview, setIsApplyingPreview] = useState(false);
  const [amount, setAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [note, setNote] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
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
  const uri = proof?.uri ?? null;
  const cropScale = 1 / Math.max(0.25, 1 - cropInset * 2);

  const chooseKind = (nextKind: TransactionKind) => {
    setKind(nextKind);
    setCategory(nextKind === "income" ? "Pemasukan lainnya" : nextKind === "transfer" ? "Transfer dana" : "Lainnya");
    if (nextKind !== "transfer") setToWalletId("");
  };

  const resetDraft = () => {
    setAmount("");
    setFeeAmount("");
    setNote("Bukti transaksi");
    setCounterpartyName("");
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
        const asset = result.assets[0];
        if (!asset?.uri) return;
        setPendingProof({ uri: asset.uri, width: asset.width || 1, height: asset.height || 1 });
        setCropEnabled(false);
        setCropInset(0);
        setPreviewOpen(true);
      }
    } finally {
      setIsPicking(false);
    }
  };

  const openExistingPreview = () => {
    if (!proof) return;
    setPendingProof(proof);
    setCropEnabled(false);
    setCropInset(0);
    setPreviewOpen(true);
  };

  const updateCropInset = (delta: number) => {
    setCropEnabled(true);
    setCropInset((current) => Math.max(0.03, Math.min(0.34, Number((current + delta).toFixed(2)))));
  };

  const acceptPreview = async () => {
    if (!pendingProof || isApplyingPreview) return;
    setIsApplyingPreview(true);
    try {
      let nextProof = pendingProof;
      if (cropEnabled && cropInset > 0) {
        const width = Math.max(1, Math.floor(pendingProof.width * (1 - cropInset * 2)));
        const height = Math.max(1, Math.floor(pendingProof.height * (1 - cropInset * 2)));
        const cropped = await manipulateAsync(
          pendingProof.uri,
          [{ crop: { originX: Math.floor(pendingProof.width * cropInset), originY: Math.floor(pendingProof.height * cropInset), width, height } }],
          { compress: 0.88, format: SaveFormat.JPEG },
        );
        nextProof = { uri: cropped.uri, width: cropped.width, height: cropped.height };
      }
      setProof(nextProof);
      resetDraft();
      setPreviewOpen(false);
    } catch {
      Alert.alert("Crop belum berhasil", "Foto belum diubah. Coba kembali atau gunakan foto asli.");
    } finally {
      setIsApplyingPreview(false);
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
      chooseKind(result.kind);
      setCategory(result.kind === "transfer" ? "Transfer dana" : result.category);
      setNote(result.note);
      setCounterpartyName(normalizeReceiptCounterpartyName(getReceiptCounterpartyRole(result.kind) === "sender" ? result.senderName : result.recipientName));
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
    const normalizedCounterpartyName = normalizeReceiptCounterpartyName(counterpartyName);
    router.push({
      pathname: "/confirm-transaction",
      params: {
        kind,
        amount: String(numeric),
        feeAmount: String(fee),
        category: kind === "transfer" ? "Transfer dana" : category,
        note: appendReceiptCounterpartyToNote(note || "Bukti transaksi", kind, normalizedCounterpartyName),
        counterpartyName: normalizedCounterpartyName,
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
        {uri ? <Pressable accessibilityLabel="Tinjau ulang gambar bukti transaksi" onPress={openExistingPreview} style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}><Image source={{ uri }} contentFit="cover" style={styles.preview} /><View style={[styles.previewBadge, { backgroundColor: `${colors.background}df` }]}><MaterialIcons name="visibility" size={15} color={colors.primary} /><Text style={[styles.previewBadgeText, { color: colors.foreground }]}>Tinjau gambar</Text></View></Pressable> : <View style={[styles.previewEmpty, { backgroundColor: `${colors.primary}10` }]}><MaterialIcons name="document-scanner" size={42} color={colors.primary} /><Text style={[styles.previewTitle, { color: colors.foreground }]}>Pilih bukti transaksi</Text><Text style={[styles.previewDetail, { color: colors.muted }]}>Gunakan kamera atau galeri, lalu tinjau dan crop sebelum dipindai.</Text></View>}
        <View style={styles.captureActions}><OutlineButton label={isPicking ? "Membuka…" : "Kamera"} icon="photo-camera" onPress={() => { void pick("camera"); }} /><OutlineButton label="Galeri" icon="photo-library" onPress={() => { void pick("library"); }} /></View>
      </AiraCard>
      <View style={[styles.info, { backgroundColor: `${colors.warning}13` }]}><MaterialIcons name="payments" size={20} color={colors.warning} /><Text style={[styles.infoText, { color: colors.foreground }]}>Nominal adalah prioritas utama. Tanggal dan jam hanya pelengkap bila tercetak jelas; periksa nominal, sumber, tujuan, penerima, dan biaya sebelum menyimpan.</Text></View>
      {uri ? <>
        <PrimaryButton label={isAnalyzing ? "Menganalisis bukti…" : useOcrFallback ? "Pindai dengan OCR cadangan" : airaFailureCount ? `Pindai ulang dengan Aira (${airaFailureCount}/2)` : "Analisis bukti dengan Aira"} icon={useOcrFallback ? "document-scanner" : "auto-awesome"} disabled={isAnalyzing} onPress={() => { void analyze(); }} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Jenis transaksi</Text>
        <View style={styles.kindChoices}>
          <TransactionKindChoice kind="income" label="Uang masuk" icon="south-west" selected={kind === "income"} onPress={() => chooseKind("income")} colors={colors} />
          <TransactionKindChoice kind="expense" label="Uang keluar" icon="north-east" selected={kind === "expense"} onPress={() => chooseKind("expense")} colors={colors} />
          <TransactionKindChoice kind="transfer" label="Pindah saldo" icon="swap-horiz" selected={kind === "transfer"} onPress={() => chooseKind("transfer")} colors={colors} />
        </View>
        <Text style={[styles.hint, { color: colors.muted }]}>Hasil OCR adalah saran. Pilih jenis yang benar bila struk terbaca keliru.</Text>
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
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{getReceiptCounterpartyLabel(kind)} (opsional)</Text>
        <TextInput value={counterpartyName} onChangeText={setCounterpartyName} placeholder={kind === "income" ? "Contoh: Andi" : "Contoh: Toko atau penerima transfer"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
        <Text style={[styles.hint, { color: colors.muted }]}>Diisi otomatis bila terdeteksi dari bukti. Kosongkan atau perbaiki bila hasil OCR tidak sesuai.</Text>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Keterangan</Text>
        <TextInput value={note} onChangeText={setNote} placeholder="Keterangan tambahan bukti" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} />
        <PrimaryButton label="Tinjau transaksi" icon="fact-check" onPress={continueDraft} />
      </> : null}
    </ScrollView>
    <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => { if (!isApplyingPreview) setPreviewOpen(false); }}>
      <View style={styles.previewOverlay}>
        <View style={[styles.previewSheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.previewSheetHeader}><View style={styles.previewSheetTitleWrap}><Text style={[styles.previewSheetTitle, { color: colors.foreground }]}>Tinjau bukti transaksi</Text><Text style={[styles.previewSheetDetail, { color: colors.muted }]}>Pastikan gambar benar sebelum dikirim untuk pemindaian.</Text></View><Pressable accessibilityLabel="Tutup pratinjau" disabled={isApplyingPreview} onPress={() => setPreviewOpen(false)} style={({ pressed }) => [styles.previewClose, { backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={colors.foreground} /></Pressable></View>
          <View style={[styles.cropViewport, { backgroundColor: colors.surface, borderColor: cropEnabled ? colors.primary : colors.border }]}>{pendingProof ? <Image source={{ uri: pendingProof.uri }} contentFit="cover" style={[styles.cropImage, { transform: [{ scale: cropScale }] }]} /> : null}{cropEnabled ? <View pointerEvents="none" style={[styles.cropGuide, { borderColor: colors.primary }]}><View style={[styles.cropCorner, styles.cropTopLeft, { borderColor: colors.primary }]} /><View style={[styles.cropCorner, styles.cropTopRight, { borderColor: colors.primary }]} /><View style={[styles.cropCorner, styles.cropBottomLeft, { borderColor: colors.primary }]} /><View style={[styles.cropCorner, styles.cropBottomRight, { borderColor: colors.primary }]} /></View> : null}</View>
          <Text style={[styles.previewCaption, { color: colors.muted }]}>{cropEnabled ? "Area di dalam bingkai akan dipakai. Atur tingkat potongan lalu gunakan gambar." : "Gambar belum dikirim atau dipindai. Tekan Crop bila ingin memotong bagian tepi."}</Text>
          <View style={styles.cropActions}><OutlineButton label={cropEnabled ? "Reset crop" : "Crop"} icon="crop" onPress={() => { if (cropEnabled) { setCropEnabled(false); setCropInset(0); } else { setCropEnabled(true); setCropInset(0.08); } }} />{cropEnabled ? <><OutlineButton label="Lebih lebar" icon="unfold-more" onPress={() => updateCropInset(-0.04)} /><OutlineButton label="Lebih rapat" icon="unfold-less" onPress={() => updateCropInset(0.04)} /></> : null}</View>
          <View style={styles.previewConfirmActions}><OutlineButton label="Kembali" icon="arrow-back" onPress={() => { if (!isApplyingPreview) setPreviewOpen(false); }} /><PrimaryButton label={isApplyingPreview ? "Menyiapkan…" : "Oke, gunakan"} icon="check" disabled={isApplyingPreview} onPress={() => { void acceptPreview(); }} /></View>
        </View>
      </View>
    </Modal>
  </ScreenContainer>;
}

function WalletChips({ wallets, selectedId, onSelect, colors }: { wallets: Wallet[]; selectedId: string; onSelect: (id: string) => void; colors: ReturnType<typeof useColors> }) {
  if (wallets.length === 0) return <Text style={[styles.hint, { color: colors.error }]}>Belum ada dompet. Tambahkan dompet dari menu Keuangan.</Text>;
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{wallets.map((wallet) => <Pressable key={wallet.id} onPress={() => onSelect(wallet.id)} style={({ pressed }) => [styles.chip, { backgroundColor: selectedId === wallet.id ? `${colors.primary}14` : colors.surface, borderColor: selectedId === wallet.id ? colors.primary : colors.border }, pressed && styles.pressed]}><View style={[styles.dot, { backgroundColor: wallet.color }]} /><Text style={[styles.chipText, { color: selectedId === wallet.id ? colors.primary : colors.foreground }]}>{wallet.name}</Text></Pressable>)}</ScrollView>;
}

function TransactionKindChoice({ kind, label, icon, selected, onPress, colors }: { kind: TransactionKind; label: string; icon: "south-west" | "north-east" | "swap-horiz"; selected: boolean; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  const accent = kind === "income" ? colors.success : kind === "expense" ? colors.error : colors.primary;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.kindChoice, { backgroundColor: selected ? `${accent}15` : colors.surface, borderColor: selected ? accent : colors.border }, pressed && styles.pressed]}><MaterialIcons name={icon} size={18} color={accent} /><Text style={[styles.kindChoiceText, { color: selected ? accent : colors.foreground }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { gap: 11, paddingBottom: 22 },
  header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 3 },
  back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 },
  title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, captureCard: { gap: 13 },
  previewButton: { position: "relative" }, preview: { borderRadius: 16, height: 230, width: "100%" },
  previewBadge: { alignItems: "center", borderRadius: 10, bottom: 10, flexDirection: "row", gap: 5, paddingHorizontal: 9, paddingVertical: 6, position: "absolute", right: 10 }, previewBadgeText: { fontSize: 11, fontWeight: "800" },
  previewEmpty: { alignItems: "center", borderRadius: 16, gap: 8, minHeight: 230, justifyContent: "center", padding: 22 }, previewTitle: { fontSize: 16, fontWeight: "800", marginTop: 3 }, previewDetail: { fontSize: 12, lineHeight: 18, textAlign: "center" }, captureActions: { flexDirection: "row", gap: 9 },
  info: { alignItems: "flex-start", borderRadius: 15, flexDirection: "row", gap: 9, padding: 13 }, infoText: { flex: 1, fontSize: 12, lineHeight: 18 }, fieldLabel: { fontSize: 14, fontWeight: "800", marginTop: 5 }, detected: { fontSize: 13, fontWeight: "800", marginTop: -5 }, kindChoices: { flexDirection: "row", gap: 7 }, kindChoice: { alignItems: "center", borderRadius: 12, borderWidth: 1, flex: 1, gap: 4, minHeight: 66, justifyContent: "center", paddingHorizontal: 5 }, kindChoiceText: { fontSize: 10, fontWeight: "800", textAlign: "center" }, input: { borderRadius: 14, borderWidth: 1, fontSize: 14, minHeight: 47, paddingHorizontal: 13 }, dateTimeRow: { flexDirection: "row", gap: 9 }, dateInput: { flex: 1.35 }, timeInput: { flex: 0.8 }, hint: { fontSize: 11, lineHeight: 16, marginTop: -4 }, chips: { gap: 8, paddingVertical: 1 }, chip: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 39, paddingHorizontal: 11 }, dot: { borderRadius: 5, height: 9, width: 9 }, chipText: { fontSize: 12, fontWeight: "800" }, pressed: { opacity: 0.7 },
  previewOverlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.62)", flex: 1, justifyContent: "center", padding: 18 }, previewSheet: { borderRadius: 23, borderWidth: StyleSheet.hairlineWidth, gap: 15, maxWidth: 520, padding: 18, width: "100%" }, previewSheetHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between" }, previewSheetTitleWrap: { flex: 1 }, previewSheetTitle: { fontSize: 18, fontWeight: "800" }, previewSheetDetail: { fontSize: 12, lineHeight: 17, marginTop: 3 }, previewClose: { alignItems: "center", borderRadius: 16, height: 36, justifyContent: "center", width: 36 }, cropViewport: { borderRadius: 16, borderWidth: 2, height: 330, overflow: "hidden", position: "relative", width: "100%" }, cropImage: { height: "100%", width: "100%" }, cropGuide: { borderRadius: 13, borderWidth: 2, bottom: 21, left: 21, position: "absolute", right: 21, top: 21 }, cropCorner: { height: 17, position: "absolute", width: 17 }, cropTopLeft: { borderLeftWidth: 3, borderTopWidth: 3, left: -2, top: -2 }, cropTopRight: { borderRightWidth: 3, borderTopWidth: 3, right: -2, top: -2 }, cropBottomLeft: { borderBottomWidth: 3, borderLeftWidth: 3, bottom: -2, left: -2 }, cropBottomRight: { borderBottomWidth: 3, borderRightWidth: 3, bottom: -2, right: -2 }, previewCaption: { fontSize: 12, lineHeight: 17 }, cropActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, previewConfirmActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
});
