import * as Network from "expo-network";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

export function NetworkStatus() {
  const colors = useColors();
  const state = Network.useNetworkState();
  const connection = state.isConnected;
  const reachable = state.isInternetReachable;
  const status = connection === false
    ? { label: "Offline", color: "#1F2937", background: "#1F293714" }
    : reachable === false
      ? { label: "Sinyal putus", color: colors.error, background: `${colors.error}14` }
      : connection == null || reachable == null
        ? { label: "Menghubungkan", color: colors.warning, background: `${colors.warning}16` }
        : { label: "Online", color: colors.success, background: `${colors.success}14` };
  return <View accessibilityLabel={`Status jaringan: ${status.label}`} style={[styles.badge, { backgroundColor: status.background }]}><View style={[styles.dot, { backgroundColor: status.color }]} /><Text numberOfLines={1} style={[styles.label, { color: status.color }]}>{status.label}</Text></View>;
}
const styles = StyleSheet.create({ badge: { alignItems: "center", borderRadius: 10, flexDirection: "row", flexShrink: 0, gap: 5, maxWidth: 116, paddingHorizontal: 9, paddingVertical: 6 }, dot: { borderRadius: 4, flexShrink: 0, height: 7, width: 7 }, label: { flexShrink: 1, fontSize: 10, fontWeight: "800" } });
