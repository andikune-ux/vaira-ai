import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AiraCard, IconCircleButton, PrimaryButton, SectionHeading } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function AiTab() {
  const colors = useColors();
  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>AIRA CONVERSATION</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Tanya AiraX</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Pendamping untuk ide, masalah, dan catatan finansial Anda.</Text>
          </View>
          <View style={[styles.brain, { backgroundColor: `${colors.primary}14` }]}>
            <MaterialIcons name="auto-awesome" size={25} color={colors.primary} />
          </View>
        </View>

        <AiraCard style={styles.chatPreview}>
          <View style={styles.botRow}>
            <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}><MaterialIcons name="auto-awesome" size={17} color="#FFFFFF" /></View>
            <View style={[styles.bubble, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.bubbleText, { color: colors.foreground }]}>Halo, saya Aira. Ceritakan yang ingin Anda selesaikan atau catat hari ini.</Text>
            </View>
          </View>
          <PrimaryButton label="Mulai percakapan" icon="chat" onPress={() => router.push("/chat")} />
        </AiraCard>

        <SectionHeading title="Aksi cerdas" />
        <View style={styles.quickGrid}>
          <IconCircleButton label="Analisis foto" icon="image-search" onPress={() => router.push("/chat?mode=image")} />
          <IconCircleButton label="Catat lewat suara" icon="keyboard-voice" tone="success" onPress={() => router.push("/chat?mode=voice")} />
          <IconCircleButton label="Video & layar" icon="videocam" tone="warning" onPress={() => router.push("/media-hub" as never)} />
          <IconCircleButton label="Bantuan masalah" icon="lightbulb" onPress={() => router.push("/chat?mode=solve")} />
        </View>

        <AiraCard style={styles.externalCard}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Buka Perchance AI di Aira AI Browser"
            onPress={() => router.push({ pathname: "/aira-browser", params: { url: "https://perchance.org/ai-text-to-image-generator" } } as never)}
            style={({ pressed }) => [styles.externalRow, pressed && { opacity: 0.72 }]}
          >
            <View style={[styles.externalIcon, { backgroundColor: `${colors.warning}16` }]}>
              <MaterialIcons name="open-in-new" size={22} color={colors.warning} />
            </View>
            <View style={styles.externalCopy}>
              <Text style={[styles.externalTitle, { color: colors.foreground }]}>Perchance AI</Text>
              <Text style={[styles.externalDetail, { color: colors.muted }]}>Generator gambar Perchance melalui Aira AI Browser · tanpa API key Aira</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>
        </AiraCard>

        <View style={[styles.notice, { backgroundColor: `${colors.success}12` }]}>

          <MaterialIcons name="verified-user" size={20} color={colors.success} />
          <Text style={[styles.noticeText, { color: colors.foreground }]}>Foto, audio, dan video di sini dianalisis untuk percakapan umum. Jika Anda menyebut transaksi, Aira tetap membuat draft yang harus dikonfirmasi sebelum masuk ke keuangan.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 18, paddingTop: 8 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 260 },
  brain: { alignItems: "center", borderRadius: 18, height: 54, justifyContent: "center", width: 54 },
  chatPreview: { gap: 16 },
  botRow: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  botAvatar: { alignItems: "center", borderRadius: 12, height: 32, justifyContent: "center", width: 32 },
  bubble: { borderRadius: 16, borderTopLeftRadius: 5, flex: 1, padding: 12 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  quickGrid: { flexDirection: "row", gap: 7, justifyContent: "space-between" },
  externalCard: { padding: 14 },
  externalRow: { alignItems: "center", flexDirection: "row", gap: 11 },
  externalIcon: { alignItems: "center", borderRadius: 13, height: 44, justifyContent: "center", width: 44 },
  externalCopy: { flex: 1 },
  externalTitle: { fontSize: 15, fontWeight: "800" },
  externalDetail: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  notice: { alignItems: "flex-start", borderRadius: 16, flexDirection: "row", gap: 10, marginTop: 24, padding: 14 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
