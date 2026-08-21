import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { FinanceProvider } from "@/lib/finance/finance-context";
import { LanguageProvider } from "@/lib/language-provider";
import { ToastProvider } from "@/components/app-toast";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { SpcaOverlay } from "@/components/spca-overlay";
import { SpcaGazeProvider } from "@/components/spca-gaze";
import { GlobalTestSync } from "@/components/global-test-sync";
import { AppUpdatePrompt } from "@/components/app-update-prompt";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { requestAiraGenerationPanelCommand } from "@/lib/aira-chat-navigation";
import { shareGeneratedResult } from "@/lib/aira-generated-result-actions";
import { configureGenerationNotificationActions, configurePrayerAlarmActions, PRAYER_ALARM_ACTION_SNOOZE, PRAYER_ALARM_ACTION_STOP, PRAYER_ALARM_NOTIFICATION_CATEGORY, schedulePrayerAlarmSnooze } from "@/lib/reminders";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    void configureGenerationNotificationActions();
    void configurePrayerAlarmActions();
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as { kind?: string; prayer?: string; attachment?: { uri?: string; kind?: "image" | "document"; mimeType?: string; generationPrompt?: string; generationKind?: "image" | "pdf" | "word" | "powerpoint" | "excel" | "markdown" | "text"; generationQuality?: "medium" | "high" } };
      if (data.kind === "prayer-reminder") {
        if (response.notification.request.content.categoryIdentifier !== PRAYER_ALARM_NOTIFICATION_CATEGORY) return;
        if (response.actionIdentifier === PRAYER_ALARM_ACTION_STOP) { void Notifications.dismissNotificationAsync(response.notification.request.identifier); return; }
        if (response.actionIdentifier === PRAYER_ALARM_ACTION_SNOOZE) { void schedulePrayerAlarmSnooze(data.prayer ?? "salat"); void Notifications.dismissNotificationAsync(response.notification.request.identifier); return; }
        router.push("/prayer-times" as never);
        return;
      }
      if (data.kind !== "aira-generation" || !data.attachment) return;
      const attachment = data.attachment;
      if (!attachment.uri) return;
      if (response.actionIdentifier === "share" && attachment.kind && attachment.mimeType) { void shareGeneratedResult({ uri: attachment.uri, mimeType: attachment.mimeType, label: "Hasil Aira" }); return; }
      if (response.actionIdentifier === "regenerate" && attachment.generationPrompt && attachment.generationKind) requestAiraGenerationPanelCommand({ type: "regenerate", prompt: attachment.generationPrompt, kind: attachment.generationKind, quality: attachment.generationQuality });
      else requestAiraGenerationPanelCommand({ type: "open-gallery" });
      router.push("/chat" as never);
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    void Notifications.getLastNotificationResponseAsync().then((response) => { if (response) handleResponse(response); });
    return () => subscription.remove();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("open") !== "donation-details") return;
    const timer = setTimeout(() => router.replace("/donation-details" as never), 0);
    return () => clearTimeout(timer);
  }, []);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SpcaGazeProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="recover" />
            <Stack.Screen name="account-issue" />
            <Stack.Screen name="account-close" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="aira-setting" />
            <Stack.Screen name="scan-receipt" />
            <Stack.Screen name="add-transaction" />
            <Stack.Screen name="confirm-transaction" />
            <Stack.Screen name="transactions" />
            <Stack.Screen name="wallets" />
            <Stack.Screen name="plans" />
            <Stack.Screen name="plan-form" />
            <Stack.Screen name="report" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="prayer-times" />
            <Stack.Screen name="calculator" />
            <Stack.Screen name="developer-pin" />
            <Stack.Screen name="developer-studio" />
            <Stack.Screen name="donation-details" />
            <Stack.Screen name="administrator" />
            <Stack.Screen name="airax-cloud" />
            <Stack.Screen name="local-backup" />
            <Stack.Screen name="factory-reset" />
            <Stack.Screen name="media-hub" />
            <Stack.Screen name="voice-room" />
            <Stack.Screen name="chat-privacy" />
            <Stack.Screen name="report-bug" />
            <Stack.Screen name="cache-maintenance" />
          </Stack>
          <SpcaOverlay />
          <GlobalTestSync />
          <AppUpdatePrompt />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
      </SpcaGazeProvider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <FinanceProvider>
          <LanguageProvider><ToastProvider>
            <SafeAreaProvider initialMetrics={providerInitialMetrics}><AppErrorBoundary>
              <SafeAreaFrameContext.Provider value={frame}>
                <SafeAreaInsetsContext.Provider value={insets}>
                  {content}
                </SafeAreaInsetsContext.Provider>
              </SafeAreaFrameContext.Provider>
            </AppErrorBoundary></SafeAreaProvider>
          </ToastProvider></LanguageProvider>
        </FinanceProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <FinanceProvider>
        <LanguageProvider><ToastProvider>
          <SafeAreaProvider initialMetrics={providerInitialMetrics}><AppErrorBoundary>{content}</AppErrorBoundary></SafeAreaProvider>
        </ToastProvider></LanguageProvider>
      </FinanceProvider>
    </ThemeProvider>
  );
}
