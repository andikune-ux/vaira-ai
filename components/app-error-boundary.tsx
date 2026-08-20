import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { captureBugDiagnostic } from "@/lib/bug-diagnostics";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { void captureBugDiagnostic(error, info.componentStack ?? undefined); }
  render() { if (!this.state.failed) return this.props.children; return <View style={styles.page}><Text style={styles.title}>AiraX perlu dimulai ulang</Text><Text style={styles.text}>Informasi teknis masalah telah disimpan di perangkat agar dapat dilampirkan pada laporan bug.</Text><Pressable onPress={() => router.replace("/report-bug")} style={styles.button}><Text style={styles.buttonText}>Laporkan masalah</Text></Pressable></View>; }
}
const styles = StyleSheet.create({ page: { alignItems: "center", backgroundColor: "#F7F9FC", flex: 1, justifyContent: "center", padding: 28 }, title: { color: "#0B1E33", fontSize: 22, fontWeight: "800" }, text: { color: "#546275", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center" }, button: { backgroundColor: "#1677FF", borderRadius: 12, marginTop: 20, paddingHorizontal: 18, paddingVertical: 13 }, buttonText: { color: "#FFF", fontWeight: "800" } });
