import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAppToast } from "@/components/app-toast";
import { saveNativeCrashDiagnostic } from "@/lib/bug-diagnostics";
import { clearPendingNativeCrashLog, getPendingNativeCrashLog } from "@/lib/native-crash-log";

export function NativeCrashPrompt() {
  const [log, setLog] = useState<string | null>(null);
  const { showToast } = useAppToast();

  useEffect(() => {
    if (Platform.OS !== "android") return;
    let active = true;
    void getPendingNativeCrashLog().then(async (pending) => {
      if (!pending) return;
      await saveNativeCrashDiagnostic(pending);
      await clearPendingNativeCrashLog();
      if (active) setLog(pending);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!log) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setLog(null)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Aplikasi mengalami crash</Text>
          <Text style={styles.description}>Log Android sudah disimpan dan juga dilampirkan ke menu Laporkan Bug.</Text>
          <ScrollView style={styles.logBox} contentContainerStyle={styles.logContent}>
            <Text selectable style={styles.log}>{log}</Text>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.copy]} onPress={() => {
              void Clipboard.setStringAsync(log).then(() => showToast("Log crash berhasil disalin."));
            }}><Text style={styles.buttonText}>Salin Log</Text></Pressable>
            <Pressable style={[styles.button, styles.close]} onPress={() => setLog(null)}>
              <Text style={styles.buttonText}>Kembali</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.68)", justifyContent: "center", alignItems: "center", padding: 18 },
  card: { width: "100%", maxHeight: "88%", backgroundColor: "#101B2B", borderColor: "#36506D", borderWidth: 1, borderRadius: 20, padding: 18 },
  title: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  description: { color: "#C4D0DF", fontSize: 13, lineHeight: 19, marginTop: 8 },
  logBox: { maxHeight: 330, marginTop: 14, backgroundColor: "#07111F", borderRadius: 12 },
  logContent: { padding: 12 },
  log: { color: "#D6E2F0", fontFamily: "monospace", fontSize: 10, lineHeight: 15 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  button: { flex: 1, alignItems: "center", paddingVertical: 13, borderRadius: 12 },
  copy: { backgroundColor: "#3B82F6" },
  close: { backgroundColor: "#26384E" },
  buttonText: { color: "#FFF", fontSize: 14, fontWeight: "800" }
});
