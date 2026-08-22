import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAppToast } from "@/components/app-toast";
import { useColors } from "@/hooks/use-colors";
import { changeAiraModePin, createAiraModePin, getAiraModePinStatus, isValidAiraModePin, verifyAiraModePin } from "@/lib/aira-mode-pin";
import { useFinance } from "@/lib/finance/finance-context";
import type { AiraResponseMode } from "@/lib/finance/types";

type GateStep = "loading" | "create" | "verify" | "choose" | "change";

export function AiraModeSelector({ visible, onClose, onModeSelected }: { visible: boolean; onClose: () => void; onModeSelected: (mode: AiraResponseMode) => void }) {
  const colors = useColors();
  const { updateProfile } = useFinance();
  const { showToast } = useAppToast();
  const [step, setStep] = useState<GateStep>("loading");
  const [pin, setPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPin("");
    setConfirmation("");
    setStep("loading");
    void getAiraModePinStatus().then(({ hasPin }) => {
      setStep(hasPin ? "verify" : "create");
      showToast(hasPin ? "Masukkan kode PIN untuk beralih mode Aira." : "Buat kode PIN terlebih dahulu untuk membuka mode Aira.", "info");
    }).catch(() => setStep("create"));
  }, [showToast, visible]);

  const close = () => {
    setPin("");
    setConfirmation("");
    onClose();
  };

  const submit = async () => {
    try {
      setBusy(true);
      if (step === "create") {
        if (!isValidAiraModePin(pin)) throw new Error("PIN harus 4 sampai 8 angka.");
        if (pin !== confirmation) throw new Error("Konfirmasi PIN belum sama.");
        await createAiraModePin(pin);
        setPin(""); setConfirmation(""); setStep("choose");
        showToast("PIN mode Aira berhasil dibuat.", "success");
        return;
      }
      if (step === "verify") {
        if (!(await verifyAiraModePin(pin))) throw new Error("PIN tidak sesuai.");
        setPin(""); setStep("choose");
        showToast("PIN benar. Pilih mode Aira yang ingin digunakan.", "success");
        return;
      }
      if (step === "change") {
        if (!isValidAiraModePin(confirmation)) throw new Error("PIN baru harus 4 sampai 8 angka.");
        await changeAiraModePin(pin, confirmation);
        setPin(""); setConfirmation(""); setStep("choose");
        showToast("PIN mode Aira berhasil diubah.", "success");
      }
    } catch (error) {
      Alert.alert("PIN belum dapat dipakai", error instanceof Error ? error.message : "Periksa PIN lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const selectMode = async (mode: AiraResponseMode) => {
    try {
      setBusy(true);
      await updateProfile({ aiMode: mode });
      onModeSelected(mode);
      showToast(mode === "hot_pro" ? "Mode Aira Hot Pro 18+ dibuka." : mode === "scientist" ? "Mode Aira Ahli Ilmuwan dibuka." : "Aira Default digunakan kembali.", "success");
      close();
    } catch (error) {
      Alert.alert("Mode belum dapat dibuka", error instanceof Error ? error.message : "Coba pilih mode lagi.");
    } finally {
      setBusy(false);
    }
  };

  const heading = step === "create" ? "Buat PIN mode Aira" : step === "verify" ? "Masukkan PIN" : step === "change" ? "Ubah PIN mode Aira" : "Pilih mode Aira";
  const detail = step === "create" ? "PIN ini dipakai untuk membuka Aira Hot Pro 18+ dan Aira Ahli Ilmuwan pada perangkat ini." : step === "verify" ? "Masukkan PIN yang sudah Anda buat untuk melanjutkan." : step === "change" ? "Masukkan PIN lama, lalu buat PIN baru 4–8 angka." : "Mode dipisahkan beserta riwayat percakapannya.";

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}><View style={styles.backdrop}><View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.header}><View style={styles.heading}><MaterialIcons name={step === "choose" ? "tune" : "lock-outline"} size={22} color={colors.primary} /><Text style={[styles.title, { color: colors.foreground }]}>{heading}</Text></View><Pressable onPress={close} accessibilityLabel="Tutup pemilih mode Aira" style={styles.close}><MaterialIcons name="close" size={22} color={colors.muted} /></Pressable></View><Text style={[styles.detail, { color: colors.muted }]}>{detail}</Text>{step === "loading" ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={[styles.detail, { color: colors.muted }]}>Menyiapkan keamanan mode…</Text></View> : null}{step === "create" || step === "verify" || step === "change" ? <View style={styles.form}><TextInput value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 8))} keyboardType="number-pad" secureTextEntry placeholder={step === "change" ? "PIN lama" : "PIN 4–8 angka"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} />{step === "create" || step === "change" ? <TextInput value={confirmation} onChangeText={(value) => setConfirmation(value.replace(/\D/g, "").slice(0, 8))} keyboardType="number-pad" secureTextEntry placeholder={step === "change" ? "PIN baru 4–8 angka" : "Ulangi PIN"} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /> : null}<Pressable disabled={busy} onPress={() => { void submit(); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, (pressed || busy) && styles.pressed]}><Text style={styles.primaryText}>{busy ? "Memeriksa…" : step === "create" ? "Simpan PIN" : step === "change" ? "Ubah PIN" : "Buka pilihan mode"}</Text></Pressable></View> : null}{step === "choose" ? <View style={styles.choices}><ModeRow icon="favorite" title="Aira Hot Pro 18+" detail="Mode percakapan privat dan lebih personal." color="#DB2777" onPress={() => { void selectMode("hot_pro"); }} /><ModeRow icon="science" title="Aira Ahli Ilmuwan" detail="Mode analisis dengan tim ahli sesuai topik." color="#15803D" onPress={() => { void selectMode("scientist"); }} /><ModeRow icon="chat-bubble-outline" title="Aira Default" detail="Kembali ke layanan Aira biasa." color={colors.primary} onPress={() => { void selectMode("aira"); }} /><Pressable onPress={() => { setPin(""); setConfirmation(""); setStep("change"); }} style={styles.change}><MaterialIcons name="key" size={16} color={colors.primary} /><Text style={[styles.changeText, { color: colors.primary }]}>Ubah PIN</Text></Pressable></View> : null}</View></View></Modal>;
}

function ModeRow({ icon, title, detail, color, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string; color: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.modeRow, pressed && styles.pressed]}><View style={[styles.modeIcon, { backgroundColor: `${color}18` }]}><MaterialIcons name={icon} size={20} color={color} /></View><View style={styles.modeCopy}><Text style={styles.modeTitle}>{title}</Text><Text style={styles.modeDetail}>{detail}</Text></View><MaterialIcons name="chevron-right" size={21} color="#7A8495" /></Pressable>;
}

const styles = StyleSheet.create({ backdrop: { alignItems: "center", backgroundColor: "rgba(10, 18, 33, 0.55)", flex: 1, justifyContent: "center", padding: 22 }, card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, maxWidth: 440, padding: 20, width: "100%" }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, heading: { alignItems: "center", flexDirection: "row", gap: 9 }, title: { fontSize: 19, fontWeight: "800" }, close: { alignItems: "center", height: 36, justifyContent: "center", width: 36 }, detail: { fontSize: 13, lineHeight: 19, marginTop: 12 }, loading: { alignItems: "center", gap: 10, paddingVertical: 28 }, form: { gap: 10, marginTop: 18 }, input: { borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13 }, primaryButton: { alignItems: "center", borderRadius: 13, marginTop: 2, minHeight: 48, justifyContent: "center" }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, choices: { gap: 4, marginTop: 16 }, modeRow: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 70, paddingHorizontal: 4 }, modeIcon: { alignItems: "center", borderRadius: 14, height: 42, justifyContent: "center", width: 42 }, modeCopy: { flex: 1, minWidth: 0 }, modeTitle: { color: "#14213D", fontSize: 14, fontWeight: "800" }, modeDetail: { color: "#6B7280", fontSize: 11, lineHeight: 16, marginTop: 2 }, change: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 6, marginTop: 10, minHeight: 36 }, changeText: { fontSize: 13, fontWeight: "800" }, pressed: { opacity: 0.68 } });
