import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";

const DEVELOPER_PIN = "140399";

export default function DeveloperPinScreen() {
  const colors = useColors();
  const { updateProfile } = useFinance();
  const [pin, setPin] = useState("");
  const unlock = async () => {
    if (pin !== DEVELOPER_PIN) {
      Alert.alert("PIN salah", "PIN developer tidak cocok.");
      setPin("");
      return;
    }
    await updateProfile({ developerMode: true });
    router.replace("/developer-studio" as never);
  };
  return <ScreenContainer className="px-6" edges={["top", "bottom", "left", "right"]}><View style={styles.page}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={[styles.icon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="lock" size={32} color={colors.primary} /></View><Text style={[styles.title, { color: colors.foreground }]}>Akses developer</Text><Text style={[styles.detail, { color: colors.muted }]}>Masukkan PIN untuk membuka studio pengaturan UI, perilaku AI, dan diagnostik lokal.</Text><TextInput value={pin} onChangeText={(value) => setPin(value.replace(/[^0-9]/g, "").slice(0, 6))} keyboardType="number-pad" maxLength={6} secureTextEntry placeholder="6 digit PIN" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /><PrimaryButton label="Buka studio developer" icon="lock-open" onPress={() => { void unlock(); }} /></View></ScreenContainer>;
}
const styles = StyleSheet.create({ page: { flex: 1, justifyContent: "center" }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", position: "absolute", top: 0, width: 44 }, icon: { alignItems: "center", borderRadius: 20, height: 62, justifyContent: "center", width: 62 }, title: { fontSize: 27, fontWeight: "800", letterSpacing: -0.6, marginTop: 20 }, detail: { fontSize: 14, lineHeight: 21, marginTop: 8 }, input: { borderRadius: 15, borderWidth: 1, fontSize: 22, letterSpacing: 8, marginBottom: 13, marginTop: 26, minHeight: 56, paddingHorizontal: 16, textAlign: "center" }, pressed: { opacity: 0.7 } });
