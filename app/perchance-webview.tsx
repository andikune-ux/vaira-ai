import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import type { ComponentType } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const PERCHANCE_URL = "https://perchance.org/ai-text-to-image-generator";

export default function PerchanceWebViewScreen() {
  const colors = useColors();
  const NativeWebView = WebView as unknown as ComponentType<any>;
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigation = (event: { canGoBack: boolean }) => setCanGoBack(event.canGoBack);
  const goBack = () => {
    if (canGoBack) webViewRef.current?.goBack();
    else router.back();
  };
  const openExternal = () => void Linking.openURL(PERCHANCE_URL);

  if (Platform.OS === "web") {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <View style={styles.fallback}>
          <MaterialIcons name="open-in-browser" size={34} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>Perchance AI</Text>
          <Text style={[styles.detail, { color: colors.muted }]}>Di pratinjau web, generator dibuka melalui browser eksternal.</Text>
          <Pressable onPress={openExternal} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={styles.primaryButtonText}>Buka Perchance</Text></Pressable>
          <Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Kembali ke Aira</Text></Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background">
      <View style={styles.container}>
        <View style={[styles.toolbar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable accessibilityLabel="Kembali dari Perchance" onPress={goBack} style={styles.toolbarButton}><MaterialIcons name="arrow-back" size={22} color={colors.foreground} /></Pressable>
          <View style={styles.toolbarCopy}><Text style={[styles.toolbarTitle, { color: colors.foreground }]}>Perchance AI</Text><Text style={[styles.toolbarDetail, { color: colors.muted }]}>Generator gambar</Text></View>
          <Pressable accessibilityLabel="Buka Perchance di browser eksternal" onPress={openExternal} style={styles.toolbarButton}><MaterialIcons name="open-in-new" size={20} color={colors.primary} /></Pressable>
        </View>
        {failed ? <View style={styles.fallback}><MaterialIcons name="cloud-off" size={34} color={colors.warning} /><Text style={[styles.title, { color: colors.foreground }]}>Perchance belum dapat dimuat</Text><Text style={[styles.detail, { color: colors.muted }]}>Periksa koneksi internet atau buka generator di browser eksternal.</Text><Pressable onPress={() => { setFailed(false); setLoading(true); webViewRef.current?.reload(); }} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={styles.primaryButtonText}>Coba lagi</Text></Pressable><Pressable onPress={openExternal} style={styles.secondaryButton}><Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Buka browser eksternal</Text></Pressable></View> : <View style={styles.webViewWrap}><NativeWebView ref={webViewRef} source={{ uri: PERCHANCE_URL }} onLoadStart={() => { setLoading(true); setFailed(false); }} onLoadEnd={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true); }} onHttpError={() => { setLoading(false); setFailed(true); }} onNavigationStateChange={handleNavigation} javaScriptEnabled domStorageEnabled setSupportMultipleWindows={false} startInLoadingState style={styles.webView} />{loading ? <View style={[styles.loader, { backgroundColor: colors.background }]}><ActivityIndicator size="small" color={colors.primary} /><Text style={[styles.loaderText, { color: colors.muted }]}>Memuat Perchance…</Text></View> : null}</View>}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webViewWrap: { flex: 1, position: "relative" },
  webView: { flex: 1 },
  toolbar: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", minHeight: 56, paddingHorizontal: 10 },
  toolbarButton: { alignItems: "center", height: 42, justifyContent: "center", width: 42 },
  toolbarCopy: { flex: 1, marginHorizontal: 4 },
  toolbarTitle: { fontSize: 16, fontWeight: "800" },
  toolbarDetail: { fontSize: 11, marginTop: 2 },
  loader: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 },
  loaderText: { fontSize: 12, marginTop: 9 },
  fallback: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  title: { fontSize: 20, fontWeight: "800", marginTop: 14, textAlign: "center" },
  detail: { fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 330, textAlign: "center" },
  primaryButton: { borderRadius: 14, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 13 },
  secondaryButtonText: { fontSize: 14, fontWeight: "700" },
});
