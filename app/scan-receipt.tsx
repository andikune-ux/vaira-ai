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
import { useFinance } from "@/lib/finance/finance-context";
import type { TransactionKind, Wallet } from "@/lib/finance/types";
import { trpc } from "@/lib/trpc";

const toLocalInput = (iso: string) => iso.slice(0, 16).replace("T", " ");
const toIso = (value: string) => {
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(normalized.length === 16 ? `${normalized}:00` : normalized);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

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
  const [occurredAtInput, setOccurredAtInput] = useState("");
  const [isPicking, setIsPicking] = useState(false);
  const receiptAi = trpc.ai.analyzeReceipt.useMutation();
  const sourceWalletId = walletId || state.wallets[0]?.id || "";

  const pick = async (source: "camera" | "library") => {
    setIsPicking(true);
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { Alert.alert("Izin kamera diperlukan", "Izinkan akses kamera untuk mengambil foto struk atau bukti transfer."); return; }
      }
      const result = source === "camera" ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
      if (!result.canceled) {
        setUri(result.assets[0]?.uri ?? null); setAmount(""); setFeeAmount(""); setNote("Bukti transaksi"); setCategory("Lainnya"); setOccurredAtInput(""); setKind("expense");
      }
    } finally { setIsPicking(false); }
  };

  const analyze = async () => {
    if (!uri) return;
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      if (base64.length > 7_500_000) { Alert.alert("Berkas terlalu besar", "Pilih foto bukti yang lebih kecil agar dapat dianalisis."); return; }
      const suffix = uri.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      const result = await receiptAi.mutateAsync({ imageDataUrl: `data:image/${suffix};base64,${base64}` });
      if (result.amount) setAmount(String(result.amount));
      setKind(result.kind); setCategory(result.kind === "transfer" ? "Transfer dana" : result.category); setNote(result.note);
      if (result.occurredAt) setOccurredAtInput(toLocalInput(result.occurredAt));
      else Alert.alert("Waktu bukti perlu ditinjau", "Tanggal atau jam pada bukti belum terbaca dengan jelas. Masukkan waktu transaksi secara manual sebelum menyimpan.");
    } catch { Alert.alert("Analisis belum tersedia", "Periksa koneksi dan coba lagi. Anda tetap dapat mengisi hasil bukti secara manual."); }
  };

  const continueDraft = () => {
    const numeric = Number(amount.replace(/[^0-9]/g, ""));
    const fee = Number(feeAmount.replace(/[^0-9]/g, "")) || 0;
    const occurredAt = toIso(occurredAtInput);
    if (!sourceWalletId) { Alert.alert("Tambahkan sumber dana", "Buat dompet terlebih dahulu agar bukti dapat menjadi catatan transaksi.", [{ text: "Ke dompet", onPress: () => router.push("/wallets") }]); return; }
    if (!numeric) { Alert.alert("Nominal diperlukan", "Masukkan atau perbaiki nominal hasil baca bukti sebelum meneruskan ke konfirmasi."); return; }
    if (!occurredAt) { Alert.alert("Waktu bukti belum lengkap", "Isi tanggal dan jam pada bukti dengan format YYYY-MM-DD HH:MM, misalnya 2026-08-13 17:30."); return; }
    if (kind === "transfer" && !toWalletId) { Alert.alert("Tujuan dana diperlukan", "Pilih bank atau dompet digital tujuan transfer sebelum melanjutkan."); return; }
    if (kind === "transfer" && toWalletId === sourceWalletId) { Alert.alert("Tujuan belum valid", "Sumber dan tujuan transfer harus berbeda."); return; }
    router.push({ pathname: "/confirm-transaction", params: { kind, amount: String(numeric), feeAmount: String(fee), category: kind === "transfer" ? "Transfer dana" : category, note: note.trim() || "Bukti transaksi", walletId: sourceWalletId, toWalletId: kind === "transfer" ? toWalletId : "", origin: "ocr", proofUri: uri, occurredAt } });
  };

  if (state.profile.mode === "guest") return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><View style={styles.lockedPage}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={[styles.lockedIcon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="lock" size={37} color={colors.primary} /></View><Text style={[styles.lockedTitle, { color: colors.foreground }]}>Pindai bukti terkunci</Text><Text style={[styles.lockedDetail, { color: colors.muted }]}>Masuk atau daftar akun AiraX untuk memakai kamera dan analisis AI pada struk atau bukti transfer.</Text><Pressable onPress={() => router.push("/login" as never)} style={[styles.lockedButton, { backgroundColor: colors.primary }]}><MaterialIcons name="login" size={19} color="#fff" /><Text style={styles.lockedButtonText}>Masuk atau daftar</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View><Text style={[styles.title, { color: colors.foreground }]}>Pindai bukti</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Foto struk atau bukti transfer untuk dijadikan draft.</Text></View></View><AiraCard style={styles.captureCard}>{uri ? <Image source={{ uri }} contentFit="cover" style={styles.preview} /> : <View style={[styles.previewEmpty, { backgroundColor: `${colors.primary}10` }]}><MaterialIcons name="document-scanner" size={42} color={colors.primary} /><Text style={[styles.previewTitle, { color: colors.foreground }]}>Pilih bukti transaksi</Text><Text style={[styles.previewDetail, { color: colors.muted }]}>Gunakan kamera atau galeri untuk membaca struk dan transfer dengan AI.</Text></View>}<View style={styles.captureActions}><OutlineButton label={isPicking ? "Membuka…" : "Kamera"} icon="photo-camera" onPress={() => { void pick("camera"); }} /><OutlineButton label="Galeri" icon="photo-library" onPress={() => { void pick("library"); }} /></View></AiraCard><View style={[styles.info, { backgroundColor: `${colors.warning}13` }]}><MaterialIcons name="privacy-tip" size={20} color={colors.warning} /><Text style={[styles.infoText, { color: colors.foreground }]}>Hasil OCR adalah usulan. Periksa nominal, waktu bukti, sumber, tujuan, dan biaya sebelum catatan masuk ke keuangan.</Text></View>{uri ? <><PrimaryButton label={receiptAi.isPending ? "Menganalisis bukti…" : "Analisis bukti dengan AI"} icon="auto-awesome" disabled={receiptAi.isPending} onPress={() => { void analyze(); }} /><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Jenis & kategori hasil baca</Text><Text style={[styles.detected, { color: kind === "income" ? colors.success : kind === "transfer" ? colors.primary : colors.error }]}>{kind === "income" ? "Pemasukan" : kind === "transfer" ? "Transfer" : "Pengeluaran"} · {category}</Text><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Nominal hasil baca</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Contoh: 75000" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /><Text style={[styles.fieldLabel, { color: colors.foreground }]}>{kind === "income" ? "Tujuan dana" : "Sumber dana"}</Text><WalletChips wallets={state.wallets} selectedId={sourceWalletId} onSelect={setWalletId} colors={colors} />{kind === "transfer" ? <><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tujuan transfer</Text><WalletChips wallets={state.wallets.filter((item) => item.id !== sourceWalletId)} selectedId={toWalletId} onSelect={setToWalletId} colors={colors} /><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Biaya admin (opsional)</Text><TextInput value={feeAmount} onChangeText={setFeeAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /></> : null}<Text style={[styles.fieldLabel, { color: colors.foreground }]}>Waktu pada bukti</Text><TextInput value={occurredAtInput} onChangeText={setOccurredAtInput} placeholder="YYYY-MM-DD HH:MM" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /><Text style={[styles.hint, { color: colors.muted }]}>Gunakan waktu yang tercetak pada bukti. Jika AI tidak menemukannya, masukkan manual.</Text><Text style={[styles.fieldLabel, { color: colors.foreground }]}>Keterangan</Text><TextInput value={note} onChangeText={setNote} placeholder="Keterangan bukti" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /><PrimaryButton label="Tinjau transaksi" icon="fact-check" onPress={continueDraft} /></> : null}</ScrollView></ScreenContainer>;
}

function WalletChips({ wallets, selectedId, onSelect, colors }: { wallets: Wallet[]; selectedId: string; onSelect: (id: string) => void; colors: ReturnType<typeof useColors> }) { if (wallets.length === 0) return <Text style={[styles.hint, { color: colors.error }]}>Belum ada dompet. Tambahkan dompet dari menu Keuangan.</Text>; return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{wallets.map((wallet) => <Pressable key={wallet.id} onPress={() => onSelect(wallet.id)} style={({ pressed }) => [styles.chip, { backgroundColor: selectedId === wallet.id ? `${colors.primary}14` : colors.surface, borderColor: selectedId === wallet.id ? colors.primary : colors.border }, pressed && styles.pressed]}><View style={[styles.dot, { backgroundColor: wallet.color }]} /><Text style={[styles.chipText, { color: selectedId === wallet.id ? colors.primary : colors.foreground }]}>{wallet.name}</Text></Pressable>)}</ScrollView>; }
const styles = StyleSheet.create({ content: { gap: 11, paddingBottom: 22 }, lockedPage: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 18 }, lockedIcon: { alignItems: "center", borderRadius: 25, height: 78, justifyContent: "center", width: 78 }, lockedTitle: { fontSize: 25, fontWeight: "800", marginTop: 19 }, lockedDetail: { fontSize: 13, lineHeight: 20, marginTop: 8, textAlign: "center" }, lockedButton: { alignItems: "center", borderRadius: 13, flexDirection: "row", gap: 7, marginTop: 24, paddingHorizontal: 18, paddingVertical: 13 }, lockedButtonText: { color: "#fff", fontSize: 13, fontWeight: "800" }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 3 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, captureCard: { gap: 13 }, preview: { borderRadius: 16, height: 230, width: "100%" }, previewEmpty: { alignItems: "center", borderRadius: 16, gap: 8, minHeight: 230, justifyContent: "center", padding: 22 }, previewTitle: { fontSize: 16, fontWeight: "800", marginTop: 3 }, previewDetail: { fontSize: 12, lineHeight: 18, textAlign: "center" }, captureActions: { flexDirection: "row", gap: 9 }, info: { alignItems: "flex-start", borderRadius: 15, flexDirection: "row", gap: 9, padding: 13 }, infoText: { flex: 1, fontSize: 12, lineHeight: 18 }, fieldLabel: { fontSize: 14, fontWeight: "800", marginTop: 5 }, detected: { fontSize: 13, fontWeight: "800", marginTop: -5 }, input: { borderRadius: 14, borderWidth: 1, fontSize: 14, minHeight: 47, paddingHorizontal: 13 }, hint: { fontSize: 11, lineHeight: 16, marginTop: -4 }, chips: { gap: 8, paddingVertical: 1 }, chip: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 39, paddingHorizontal: 11 }, dot: { borderRadius: 5, height: 9, width: 9 }, chipText: { fontSize: 12, fontWeight: "800" }, pressed: { opacity: 0.7 } });
