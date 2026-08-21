import { useLocalSearchParams } from "expo-router";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { GROUP_DOWNLOAD_URL, createPrivateGroupInviteUrl } from "@/lib/private-group-links";

export default function DownloadScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const inviteUrl = token ? createPrivateGroupInviteUrl(token) : null;

  const openDownload = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = GROUP_DOWNLOAD_URL;
      return;
    }
    void Linking.openURL(GROUP_DOWNLOAD_URL);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black">
      <View style={styles.container}>
        <Text style={styles.eyebrow}>V A I R A  A I</Text>
        <Text style={styles.title}>Pasang aplikasi untuk bergabung</Text>
        <Text style={styles.body}>
          Link grup privat ini aman dan siap digunakan. Pasang aplikasi resmi terlebih dahulu, lalu buka kembali link undangan yang sama untuk melanjutkan proses bergabung.
        </Text>
        <Pressable accessibilityRole="button" onPress={openDownload} style={styles.primary}>
          <Text style={styles.primaryText}>Buka halaman unduhan</Text>
        </Pressable>
        {inviteUrl ? (
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(inviteUrl)} style={styles.secondary}>
            <Text style={styles.secondaryText}>Buka kembali link grup setelah terpasang</Text>
          </Pressable>
        ) : null}
        <Text style={styles.note}>Pemasangan tetap memerlukan persetujuan pengguna dan tidak dilakukan secara diam-diam oleh sistem.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center", padding: 26 },
  eyebrow: { color: "#36B7FF", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#F1F6FF", fontSize: 26, fontWeight: "900", textAlign: "center" },
  body: { color: "#A6B9D3", fontSize: 14, lineHeight: 21, maxWidth: 520, textAlign: "center" },
  primary: { alignItems: "center", backgroundColor: "#36B7FF", borderRadius: 12, minHeight: 48, justifyContent: "center", paddingHorizontal: 22 },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  secondary: { alignItems: "center", borderColor: "#36B7FF", borderRadius: 12, borderWidth: 1, minHeight: 44, justifyContent: "center", paddingHorizontal: 18 },
  secondaryText: { color: "#8DEBFF", fontSize: 13, fontWeight: "800", textAlign: "center" },
  note: { color: "#7185A4", fontSize: 11, lineHeight: 17, maxWidth: 460, textAlign: "center" },
});
