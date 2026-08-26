// @ts-nocheck
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image as ExpoImage } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AiraCard,
  EmptyState,
  IconCircleButton,
  LoadingState,
  SectionHeading,
} from "@/components/aira-ui";
import { ChickenIcon } from "@/components/chicken-icon";
import { AiraModeStatusCard } from "@/components/aira-mode-status-card";
import { NetworkStatus } from "@/components/network-status";
import { RealtimeClock } from "@/components/realtime-clock";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getAiraModePresentation } from "@/lib/aira-mode-presentation";
import { useFinance } from "@/lib/finance/finance-context";
import {
  formatCurrency,
  getMonthlyExpense,
  getTotalBalance,
} from "@/lib/finance/finance-utils";
import { useLanguage } from "@/lib/language-provider";
import { getSpcaExtraSettings } from "@/lib/spca-extra-settings";
import { trpc } from "@/lib/trpc";
import {
  dayLabel,
  getDaysUntilEvent,
  getUpcomingEvent,
  getUpcomingEventPrompt,
} from "@/lib/calendar-data";
import type {
  GreetingCardAnimation,
  GreetingCardShareFormat,
  GreetingCardTemplate,
} from "@/lib/finance/types";
import {
  fetchPrayerTimes,
  getNextPrayer,
  type PrayerTime,
} from "@/lib/prayer-times";

type Shortcut = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone?: "primary" | "success" | "warning";
  onPress: () => void;
  assetUri?: string;
  chicken?: boolean;
};
const GREETING_FONTS = [
  { id: "sans-serif", label: "Modern" },
  { id: "serif", label: "Elegan" },
  { id: "sans-serif-condensed", label: "Ramping" },
  { id: "monospace", label: "Klasik" },
] as const;
type GreetingFont = (typeof GREETING_FONTS)[number]["id"];
const ordered = <T extends { id: string }>(items: T[], ids: string[]) => [
  ...ids
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is T => Boolean(item)),
  ...items.filter((item) => !ids.includes(item.id)),
];
function ScrapbookDecorations({
  accent,
  foreground,
  isIslamic,
  animationStyle,
}: {
  accent: string;
  foreground: string;
  isIslamic: boolean;
  animationStyle: any;
}) {
  return (
    <View pointerEvents="none" style={styles.scrapbookLayer}>
      <Animated.View
        style={[
          styles.scrapbookArc,
          styles.scrapbookArcTop,
          { borderColor: accent },
          animationStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.scrapbookArc,
          styles.scrapbookArcBottom,
          { borderColor: accent },
          animationStyle,
        ]}
      />
      <View
        style={[
          styles.scrapbookLeafCluster,
          styles.scrapbookLeafTop,
          { borderColor: accent },
        ]}
      >
        <Text style={[styles.scrapbookLeaf, { color: accent }]}>
          {isIslamic ? "❧  ❧" : "❦  ❦"}
        </Text>
        <Text style={[styles.scrapbookSpark, { color: foreground }]}>
          {isIslamic ? "☾" : "✦"}
        </Text>
      </View>
      <View
        style={[
          styles.scrapbookLeafCluster,
          styles.scrapbookLeafBottom,
          { borderColor: accent },
        ]}
      >
        <Text style={[styles.scrapbookLeaf, { color: accent }]}>
          {isIslamic ? "🏮  ❧" : "🇮🇩  ❦"}
        </Text>
        <Text style={[styles.scrapbookSpark, { color: foreground }]}>
          {isIslamic ? "✧" : "🎈"}
        </Text>
      </View>
      <View style={[styles.scrapbookRibbon, { backgroundColor: accent }]}>
        <Text style={[styles.scrapbookRibbonText, { color: foreground }]}>
          {isIslamic ? "SALAM & DOA" : "MERDEKA"}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { state, isHydrated, updateProfile } = useFinance();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerTime[]>([]);
  const { width, height } = useWindowDimensions();
  const [calendarNow, setCalendarNow] = useState(() => new Date());
  const [greetingMessageDraft, setGreetingMessageDraft] = useState("");
  const [greetingFont, setGreetingFont] = useState<GreetingFont>("sans-serif");
  const greetingOrnamentPulse = useRef(new Animated.Value(0)).current;
  const [greetingPreviewVisible, setGreetingPreviewVisible] = useState(false);
  const greetingPreviewRef = useRef<View>(null);
  const [manualOrientation, setManualOrientation] = useState<
    "portrait" | "landscape"
  >("portrait");
  const [heroCardMode, setHeroCardMode] = useState<"aira" | "greeting">("aira");
  const heroCardRef = useRef<View>(null);
  const heroCardSpin = useRef(new Animated.Value(0)).current;
  const [mentionSince, setMentionSince] = useState<string | null>(null);
  const globalRoomStatus = trpc.globalRoom.status.useQuery(undefined, {
    enabled: state.profile.mode === "account",
    retry: false,
    refetchInterval: 10000,
  });
  const participantCount = globalRoomStatus.data?.participantCount ?? 0;
  const widgetConnection =
    state.profile.mode !== "account"
      ? { label: "Login diperlukan", color: "#94A3B8" }
      : globalRoomStatus.isError
        ? { label: "Terputus", color: "#F87171" }
        : globalRoomStatus.isLoading || !globalRoomStatus.data
          ? { label: "Menghubungkan", color: "#FBBF24" }
          : { label: "Online", color: "#4ADE80" };
  const widgetPressScale = useRef(new Animated.Value(1)).current;
  const widgetParticipantPulse = useRef(new Animated.Value(0)).current;
  const widgetIconPulse = useRef(new Animated.Value(0)).current;
  const previousParticipantCount = useRef<number | null>(null);
  useFocusEffect(
    useCallback(() => {
      void getSpcaExtraSettings().then((settings) =>
        setManualOrientation(settings.manualOrientation),
      );
    }, []),
  );
  useEffect(() => {
    const refreshClock = () => setCalendarNow(new Date());
    refreshClock();
    const timer = setInterval(refreshClock, 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    if (state.profile.mode !== "account") {
      setMentionSince(null);
      return () => {
        active = false;
      };
    }
    void AsyncStorage.getItem(
      `vaira.global-room.mention-read.${state.profile.username || "account"}`,
    ).then((stored) => {
      if (active) setMentionSince(stored || new Date().toISOString());
    });
    return () => {
      active = false;
    };
  }, [state.profile.mode, state.profile.username]);
  useEffect(() => {
    if (
      previousParticipantCount.current !== null &&
      previousParticipantCount.current !== participantCount
    ) {
      widgetParticipantPulse.setValue(0);
      widgetIconPulse.setValue(0);
      Animated.parallel([
        Animated.timing(widgetParticipantPulse, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(widgetIconPulse, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(widgetParticipantPulse, {
            toValue: 0,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(widgetIconPulse, {
            toValue: 0,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
    previousParticipantCount.current = participantCount;
  }, [participantCount, widgetParticipantPulse, widgetIconPulse]);
  const mentionSummary = trpc.globalRoom.mentionSummary.useQuery(
    { since: mentionSince },
    {
      enabled: state.profile.mode === "account" && mentionSince !== null,
      retry: false,
      refetchInterval: 10000,
    },
  );
  const unreadMentionCount = mentionSummary.data?.count ?? 0;
  const openGlobalRoom = () => {
    const now = new Date().toISOString();
    setMentionSince(now);
    void AsyncStorage.setItem(
      `vaira.global-room.mention-read.${state.profile.username || "account"}`,
      now,
    );
    router.push("/global-room" as never);
  };
  const isLandscape =
    manualOrientation === "landscape" ||
    (width > height && manualOrientation !== "portrait");
  const presentation = getAiraModePresentation(
    state.profile.aiMode,
    colors,
    state.profile.uiPreferences.modeAccentColors?.[state.profile.aiMode],
  );
  const upcomingEvent = getUpcomingEvent(calendarNow);
  const upcomingEventDays = upcomingEvent
    ? getDaysUntilEvent(upcomingEvent, calendarNow)
    : null;
  const greetingTitle = upcomingEvent
    ? `Selamat ${upcomingEvent.title}`
    : "Selamat beraktivitas hari ini";
  const greetingDetail = upcomingEvent
    ? `${upcomingEvent.detail} · ${dayLabel(upcomingEvent.dateObject)}`
    : "Semoga hari Anda berjalan lancar.";
  const greetingPrompt = upcomingEvent
    ? getUpcomingEventPrompt(upcomingEvent)
    : "Belum ada event terdekat · Buat kartu ucapan kapan saja.";
  const greetingFinalMessage = upcomingEvent
    ? `Semoga peringatan ${upcomingEvent.title} membawa kedamaian, keberkahan, dan kebahagiaan bagi kita semua.`
    : "Semoga hari Anda dipenuhi kesehatan, kelancaran, dan kebahagiaan.";
  const prayerTimesVisible =
    state.profile.uiPreferences.prayerTimesVisible ?? true;
  const nextPrayer = getNextPrayer(prayerSchedule, calendarNow);
  const prayerRemainingMs = nextPrayer
    ? Math.max(0, nextPrayer.date.getTime() - calendarNow.getTime())
    : 0;
  const prayerCountdown = nextPrayer
    ? `${Math.floor(prayerRemainingMs / 3_600_000)} jam ${Math.floor((prayerRemainingMs % 3_600_000) / 60_000)} menit lagi`
    : null;
  const greetingCardEnabled =
    state.profile.uiPreferences.greetingCardEnabled ?? true;
  const greetingCardIntervalSeconds = Math.max(
    5,
    Math.min(60, state.profile.uiPreferences.greetingCardIntervalSeconds ?? 10),
  );
  const greetingCardEffect =
    state.profile.uiPreferences.greetingCardEffect ?? "text";
  const greetingAnimation: GreetingCardAnimation =
    state.profile.uiPreferences.greetingCardAnimation ?? "slide";
  const greetingShareFormat: GreetingCardShareFormat =
    state.profile.uiPreferences.greetingCardShareFormat ?? "story";
  const greetingTemplate: GreetingCardTemplate =
    state.profile.uiPreferences.greetingCardTemplate ?? "royal";
  const greetingTemplateStyle =
    greetingTemplate === "champagne"
      ? {
          backgroundColor: "#7A5136",
          accent: "#F5D6A1",
          foreground: "#FFF5E6",
          detail: "#FFE8C7",
          ornament: "✦",
        }
      : greetingTemplate === "midnight"
        ? {
            backgroundColor: "#111827",
            accent: "#D4AF37",
            foreground: "#FFF7D6",
            detail: "#FDE68A",
            ornament: "✦",
          }
        : greetingTemplate === "pearl"
          ? {
              backgroundColor: "#F5F0E8",
              accent: "#9A6B3F",
              foreground: "#2D2118",
              detail: "#6B4F3A",
              ornament: "✦",
            }
          : {
              backgroundColor: "#173B35",
              accent: "#D4AF37",
              foreground: "#FFF8D6",
              detail: "#FDE68A",
              ornament: "✦",
            };
  const eventTheme = upcomingEvent?.title.toLowerCase().includes("fitri")
    ? {
        backgroundColor: "#0B5D3B",
        accent: "#F4C95D",
        foreground: "#FFF8E1",
        detail: "#D1FAE5",
        ornament: "◇  ketupat  ◇",
      }
    : upcomingEvent?.title.toLowerCase().includes("kemerdekaan") ||
        upcomingEvent?.title.toLowerCase().includes("hut ri")
      ? {
          backgroundColor: "#B91C1C",
          accent: "#FFFFFF",
          foreground: "#FFFFFF",
          detail: "#FFE4E6",
          ornament: "MERDEKA",
        }
      : null;
  const greetingVisual = eventTheme ?? greetingTemplateStyle;
  const greetingOrnamentStyle = {
    opacity: greetingOrnamentPulse.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.72, 1, 0.72],
    }),
    transform: [
      {
        rotate: greetingOrnamentPulse.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ["-4deg", "4deg", "-4deg"],
        }),
      },
      {
        scale: greetingOrnamentPulse.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.96, 1.04, 0.96],
        }),
      },
    ],
  };
  const greetingDecorativeLine =
    upcomingEvent?.title.toLowerCase().includes("maulid") ||
    upcomingEvent?.title.toLowerCase().includes("nabi")
      ? "☾  ✦  🏮  ✦  ☽"
      : upcomingEvent?.title.toLowerCase().includes("kemerdekaan") ||
          upcomingEvent?.title.toLowerCase().includes("hut ri")
        ? "🇮🇩  ✦  🎈  🏃  🏆  🪁  ✦  🇮🇩"
        : "✦  ◇  ✦";
  const greetingShareFormatStyle =
    greetingShareFormat === "square"
      ? { aspectRatio: 1 }
      : greetingShareFormat === "portrait"
        ? { aspectRatio: 0.8 }
        : { aspectRatio: 0.5625 };
  const heroAnimationStyle =
    greetingAnimation === "fade"
      ? {
          opacity: heroCardSpin.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.25, 1],
          }),
        }
      : greetingAnimation === "slide"
        ? {
            transform: [
              {
                translateX: heroCardSpin.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 26, 0],
                }),
              },
            ],
          }
        : greetingAnimation === "zoom"
          ? {
              transform: [
                {
                  scale: heroCardSpin.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.08, 1],
                  }),
                },
              ],
            }
          : greetingAnimation === "flip"
            ? {
                transform: [
                  {
                    rotateY: heroCardSpin.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ["0deg", "90deg", "0deg"],
                    }),
                  },
                ],
              }
            : greetingAnimation === "bounce"
              ? {
                  transform: [
                    {
                      translateY: heroCardSpin.interpolate({
                        inputRange: [0, 0.25, 0.55, 1],
                        outputRange: [0, -9, 3, 0],
                      }),
                    },
                  ],
                }
              : greetingAnimation === "wipe"
                ? {
                    transform: [
                      {
                        translateX: heroCardSpin.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [-22, 22, 0],
                        }),
                      },
                    ],
                  }
                : greetingAnimation === "pulse"
                  ? {
                      transform: [
                        {
                          scale: heroCardSpin.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.04, 1],
                          }),
                        },
                      ],
                    }
                  : greetingAnimation === "tilt"
                    ? {
                        transform: [
                          {
                            rotate: heroCardSpin.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: ["0deg", "4deg", "0deg"],
                            }),
                          },
                        ],
                      }
                    : greetingAnimation === "blur"
                      ? {
                          opacity: heroCardSpin.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 0.45, 1],
                          }),
                          transform: [
                            {
                              scale: heroCardSpin.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 0.98, 1],
                              }),
                            },
                          ],
                        }
                      : {
                          transform: [
                            {
                              rotateY: heroCardSpin.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "360deg"],
                              }),
                            },
                          ],
                        };
  const total = getTotalBalance(state);
  const spent = getMonthlyExpense(state);
  const pending = state.commitments.filter((item) => !item.isDone);
  const generationQueue = state.generationQueue ?? [];
  const latestTransactions = state.transactions
    .filter((item) => item.status === "confirmed")
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, 3);
  const heroDetails = state.profile.uiPreferences.modeHeroDetails ?? {};
  const legacyHeroVisible = false; // Digantikan oleh AiraModeStatusCard agar hanya satu kartu hero tampil.
  const hero =
    state.profile.aiMode === "hot_pro"
      ? {
          kicker: "AIRA HOT PRO 18+",
          title: "Mau ngobrol apa kita hari ini?",
          detail:
            heroDetails.hot_pro?.trim() ||
            "Aira Hot Pro siap menemani percakapan Anda.",
          icon: "favorite" as const,
        }
      : state.profile.aiMode === "scientist"
        ? {
            kicker: "AIRA AHLI ILMUAN",
            title: "Apa yang mau ditanyakan?",
            detail:
              heroDetails.scientist?.trim() ||
              "Tim ahli Aira siap menganalisis pertanyaan Anda.",
            icon: "science" as const,
          }
        : {
            kicker: "AIRA SIAP MEMBANTU",
            title: state.profile.uiPreferences.homeHeadline,
            detail: heroDetails.aira?.trim() || t("airaHelpDetail"),
            icon: "psychology" as const,
          };
  const quickActions: Shortcut[] = useMemo(() => {
    const actions: Shortcut[] = [
      {
        id: "chat",
        label: t("askAira"),
        icon: "chat",
        onPress: () => router.push("/chat"),
      },
      {
        id: "add",
        label: t("addTransaction"),
        icon: "add-circle",
        tone: "success",
        onPress: () => router.push("/add-transaction"),
      },
      {
        id: "scan",
        label: t("scanProof"),
        icon: "document-scanner",
        tone: "warning",
        onPress: () => router.push("/scan-receipt"),
      },
      {
        id: "prayer",
        label: t("prayerTimes"),
        icon: "access-time",
        onPress: () => router.push("/prayer-times" as never),
      },
      {
        id: "calculator",
        label: t("calculator"),
        icon: "calculate",
        onPress: () => router.push("/calculator" as never),
      },
      {
        id: "report",
        label: t("viewReport"),
        icon: "insights",
        onPress: () => router.push("/report"),
      },
    ];
    return prayerTimesVisible
      ? actions
      : actions.filter((action) => action.id !== "prayer");
  }, [prayerTimesVisible, t]);
  const quickPlans: Shortcut[] = useMemo(
    () => [
      {
        id: "browser",
        label: "Aira AI Browser",
        icon: "language",
        tone: "primary",
        onPress: () => router.push("/aira-browser" as never),
      },
      {
        id: "budget",
        label: t("budget"),
        icon: "pie-chart",
        onPress: () =>
          router.push({
            pathname: "/plan-form",
            params: { sheet: "budget" },
          } as never),
      },
      {
        id: "goal",
        label: t("target"),
        icon: "pets",
        tone: "success",
        chicken: true,
        onPress: () =>
          router.push({
            pathname: "/plan-form",
            params: { sheet: "goal" },
          } as never),
      },
      {
        id: "bill",
        label: t("bill"),
        icon: "receipt",
        tone: "warning",
        onPress: () =>
          router.push({
            pathname: "/plan-form",
            params: { sheet: "bill" },
          } as never),
      },
      {
        id: "debt",
        label: t("debt"),
        icon: "handshake",
        onPress: () =>
          router.push({
            pathname: "/plan-form",
            params: { sheet: "debt" },
          } as never),
      },
      {
        id: "receivable",
        label: t("receivable"),
        icon: "request-quote",
        tone: "success",
        onPress: () =>
          router.push({
            pathname: "/plan-form",
            params: { sheet: "receivable" },
          } as never),
      },
      {
        id: "smart",
        label: "Keuangan Pintar",
        icon: "auto-graph",
        tone: "warning",
        onPress: () => router.push("/household-finance-analysis" as never),
      },
    ],
    [t],
  );
  const actionItems = ordered(
    quickActions,
    state.profile.uiPreferences.quickActionOrder,
  );
  const planItems = ordered(
    quickPlans,
    state.profile.uiPreferences.quickPlanOrder,
  );
  const toggleHeroCard = useCallback(() => {
    heroCardSpin.setValue(0);
    Animated.timing(heroCardSpin, {
      toValue: 1,
      duration: 520,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setHeroCardMode((current) => (current === "aira" ? "greeting" : "aira"));
  }, [heroCardSpin]);
  const captureGreetingCard = async () => {
    if (!greetingPreviewRef.current) return null;
    return captureRef(greetingPreviewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
  };
  const saveGreetingCard = async () => {
    try {
      const uri = await captureGreetingCard();
      if (!uri) return;
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Izin penyimpanan diperlukan",
          "Izinkan akses foto agar kartu dapat disimpan ke galeri.",
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Kartu tersimpan", "Kartu ucapan sudah disimpan ke galeri.");
    } catch {
      Alert.alert(
        "Kartu belum tersimpan",
        "Coba simpan kembali dari pratinjau kartu ucapan.",
      );
    }
  };
  const shareGreetingCard = async () => {
    try {
      const uri = await captureGreetingCard();
      if (!uri) return;
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Berbagi belum tersedia",
          "Kartu ucapan sudah dibuat di perangkat ini, tetapi fitur berbagi belum tersedia pada platform sekarang.",
        );
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Bagikan kartu ucapan · ${greetingShareFormat === "square" ? "Persegi 1:1" : greetingShareFormat === "portrait" ? "Portrait 4:5" : "Story 9:16"}`,
      });
    } catch {
      Alert.alert(
        "Kartu belum dibagikan",
        "Kartu ucapan offline belum dapat dibagikan. Coba lagi dari perangkat Anda.",
      );
    }
  };
  const prayerScheduleDay = calendarNow.toDateString();
  useEffect(() => {
    let active = true;
    const location = state.profile.prayerLocation;
    if (!prayerTimesVisible || !location) {
      setPrayerSchedule([]);
      return () => {
        active = false;
      };
    }
    void fetchPrayerTimes(
      location.latitude,
      location.longitude,
      new Date(prayerScheduleDay),
      state.profile.prayerCalculationMethod ?? location.calculationMethod ?? 20,
    )
      .then((items) => {
        if (active) setPrayerSchedule(items);
      })
      .catch(() => {
        if (active) setPrayerSchedule([]);
      });
    return () => {
      active = false;
    };
  }, [
    prayerScheduleDay,
    prayerTimesVisible,
    state.profile.prayerCalculationMethod,
    state.profile.prayerLocation,
  ]);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(greetingOrnamentPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(greetingOrnamentPulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [greetingOrnamentPulse]);
  useEffect(() => {
    if (!greetingCardEnabled) return undefined;
    const timer = setInterval(
      toggleHeroCard,
      greetingCardIntervalSeconds * 1000,
    );
    return () => clearInterval(timer);
  }, [greetingCardEnabled, greetingCardIntervalSeconds, toggleHeroCard]);
  if (!isHydrated) return <LoadingState />;
  const move = (group: "action" | "plan", id: string, direction: -1 | 1) => {
    const current = group === "action" ? actionItems : planItems;
    const index = current.findIndex((item) => item.id === id);
    const destination = index + direction;
    if (destination < 0 || destination >= current.length) return;
    const next = [...current];
    [next[index], next[destination]] = [next[destination], next[index]];
    void updateProfile({
      uiPreferences: {
        ...state.profile.uiPreferences,
        quickActionOrder:
          group === "action"
            ? next.map((item) => item.id)
            : state.profile.uiPreferences.quickActionOrder,
        quickPlanOrder:
          group === "plan"
            ? next.map((item) => item.id)
            : state.profile.uiPreferences.quickPlanOrder,
      },
    });
  };
  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isLandscape && styles.contentLandscape,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, isLandscape && styles.topBarLandscape]}>
          <View
            style={[
              styles.brandBlock,
              isLandscape && styles.brandBlockLandscape,
            ]}
          >
            <Text style={[styles.greeting, { color: colors.muted }]}>
              {state.profile.mode === "guest"
                ? t("guestGreeting")
                : `${t("hello")}, ${state.profile.displayName ?? "Teman"}`}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {"V A I R A  A I"}
            </Text>
          </View>
          <View style={styles.topActions}>
            {state.profile.uiPreferences.showRealtimeClock ? (
              <RealtimeClock />
            ) : null}
            <NetworkStatus />
            <ProfileButton
              avatarUri={state.profile.avatarUri}
              colors={colors}
            />
          </View>
        </View>
        {legacyHeroVisible ? (
          <Animated.View
            style={[
              styles.heroSpinWrap,
              greetingCardEffect === "card" && heroAnimationStyle,
            ]}
          >
            <View ref={heroCardRef} collapsable={false}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  heroCardMode === "aira"
                    ? "Buka layanan Aira"
                    : "Buat kartu ucapan offline"
                }
                onPress={() => {
                  if (heroCardMode === "aira") router.push("/chat");
                  else {
                    setGreetingMessageDraft(greetingFinalMessage);
                    setGreetingPreviewVisible(true);
                  }
                }}
                style={[
                  styles.aiHero,
                  {
                    backgroundColor:
                      heroCardMode === "aira"
                        ? presentation.palette.primary
                        : greetingVisual.backgroundColor,
                    borderColor:
                      heroCardMode === "greeting"
                        ? greetingVisual.accent
                        : "transparent",
                    borderWidth: heroCardMode === "greeting" ? 2 : 0,
                  },
                  isLandscape && styles.aiHeroLandscape,
                ]}
              >
                {heroCardMode === "aira" ? (
                  <>
                    <Animated.View
                      style={[
                        styles.flex,
                        greetingCardEffect === "text" && heroAnimationStyle,
                      ]}
                    >
                      <Text style={styles.aiKicker}>{hero.kicker}</Text>
                      <Text numberOfLines={2} style={styles.aiHeroTitle}>
                        {hero.title}
                      </Text>
                      <Text numberOfLines={2} style={styles.aiHeroDetail}>
                        {hero.detail}
                      </Text>
                    </Animated.View>
                    <View style={styles.aiOrb}>
                      <MaterialIcons
                        name={hero.icon}
                        size={21}
                        color={presentation.palette.primary}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      pointerEvents="none"
                      style={styles.simpleGreetingAccent}
                    >
                      <Text
                        style={[
                          styles.simpleGreetingAccentText,
                          { color: greetingVisual.accent },
                        ]}
                      >
                        {greetingVisual.ornament}
                      </Text>
                    </View>
                    <Animated.View
                      style={[
                        styles.flex,
                        greetingCardEffect === "text" && heroAnimationStyle,
                      ]}
                    >
                      <View style={styles.simpleGreetingHeader}>
                        <Text
                          style={[
                            styles.simpleGreetingKicker,
                            { color: greetingVisual.accent },
                          ]}
                        >
                          KARTU UCAPAN
                        </Text>
                        <View
                          style={[
                            styles.simpleGreetingRule,
                            { backgroundColor: greetingVisual.accent },
                          ]}
                        />
                      </View>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.aiHeroTitle,
                          { color: greetingVisual.foreground },
                        ]}
                      >
                        {greetingTitle}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.aiHeroDetail,
                          { color: greetingVisual.detail },
                        ]}
                      >
                        {greetingDetail}
                      </Text>
                      {prayerTimesVisible && nextPrayer && prayerCountdown ? (
                        <View
                          style={[
                            styles.prayerCountdown,
                            {
                              borderColor: `${greetingVisual.accent}80`,
                              backgroundColor: `${greetingVisual.accent}18`,
                            },
                          ]}
                        >
                          <MaterialIcons
                            name="mosque"
                            size={15}
                            color={greetingVisual.accent}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.prayerCountdownText,
                              { color: greetingVisual.foreground },
                            ]}
                          >
                            {nextPrayer.label} · {prayerCountdown}
                          </Text>
                        </View>
                      ) : null}
                      <Text style={styles.greetingAction}>
                        {greetingPrompt}
                        {upcomingEventDays !== null
                          ? ` · ${upcomingEventDays === 0 ? "Hari ini" : `${upcomingEventDays} hari lagi`}`
                          : ""}
                      </Text>
                    </Animated.View>
                    <View
                      style={[
                        styles.aiOrb,
                        { backgroundColor: `${greetingVisual.accent}22` },
                      ]}
                    >
                      <MaterialIcons
                        name="celebration"
                        size={21}
                        color={greetingVisual.accent}
                      />
                    </View>
                  </>
                )}
              </Pressable>
            </View>
          </Animated.View>
        ) : null}
        <AiraModeStatusCard />
        {generationQueue.length ? (
          <Pressable
            onPress={() => router.push("/chat" as never)}
            style={[
              styles.queueSummary,
              {
                backgroundColor: `${colors.primary}10`,
                borderColor: `${colors.primary}40`,
              },
            ]}
          >
            <View
              style={[
                styles.queueIcon,
                { backgroundColor: `${colors.primary}18` },
              ]}
            >
              <MaterialIcons name="schedule" size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.queueTitle, { color: colors.foreground }]}>
                {generationQueue.length} generasi menunggu
              </Text>
              <Text
                style={[styles.queueDetail, { color: colors.muted }]}
                numberOfLines={1}
              >
                {generationQueue[0]?.prompt}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={21}
              color={colors.primary}
            />
          </Pressable>
        ) : null}
        <AiraCard
          style={[
            styles.balanceCard,
            isLandscape && styles.balanceCardLandscape,
          ]}
        >
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.balanceCaption, { color: colors.muted }]}>
                {t("recordedBalance")}
              </Text>
              <Text style={[styles.balanceValue, { color: colors.foreground }]}>
                {formatCurrency(total)}
              </Text>
            </View>
            <View
              style={[
                styles.balanceIcon,
                { backgroundColor: `${colors.success}15` },
              ]}
            >
              <MaterialIcons
                name="account-balance-wallet"
                size={27}
                color={colors.success}
              />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceCaption, { color: colors.muted }]}>
              {t("monthlyExpense")}
            </Text>
            <Text style={[styles.monthValue, { color: colors.error }]}>
              {formatCurrency(spent)}
            </Text>
          </View>
        </AiraCard>
        <Animated.View
          style={{
            transform: [
              {
                scale: Animated.multiply(
                  widgetPressScale,
                  widgetParticipantPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.018],
                  }),
                ),
              },
            ],
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka Room Global"
            onPress={openGlobalRoom}
            onPressIn={() => {
              if (Platform.OS !== "web")
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Animated.timing(widgetPressScale, {
                toValue: 0.975,
                duration: 90,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.timing(widgetPressScale, {
                toValue: 1,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }).start();
            }}
            style={styles.globalRoomWidget}
          >
            <Animated.View
              style={[
                styles.globalRoomIcon,
                {
                  transform: [
                    {
                      scale: widgetIconPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.12],
                      }),
                    },
                    {
                      rotate: widgetIconPulse.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: ["0deg", "-5deg", "0deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialIcons name="groups" size={21} color="#FFFFFF" />
            </Animated.View>
            <View style={styles.flex}>
              <View style={styles.globalRoomTitleRow}>
                <Text style={styles.globalRoomTitle}>Room Global</Text>
                <View style={styles.globalRoomStatus}>
                  <View
                    style={[
                      styles.globalRoomStatusDot,
                      { backgroundColor: widgetConnection.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.globalRoomStatusText,
                      { color: widgetConnection.color },
                    ]}
                  >
                    {widgetConnection.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.globalRoomDetail}>
                {participantCount > 0
                  ? `${participantCount} peserta aktif · Masuk ke obrolan publik`
                  : "Belum ada peserta aktif · Masuk ke obrolan publik"}
              </Text>
            </View>
            <View style={styles.widgetMentionWrap}>
              {unreadMentionCount > 0 ? (
                <View style={styles.widgetMentionBadge}>
                  <View style={styles.widgetMentionDot} />
                  <Text style={styles.widgetMentionText}>
                    {unreadMentionCount > 99 ? "99+" : unreadMentionCount}
                  </Text>
                </View>
              ) : null}
              <MaterialIcons name="chevron-right" size={23} color="#FFFFFF" />
            </View>
          </Pressable>
        </Animated.View>
        <SectionHeading
          title={t("quickActions")}
          action={editing ? "Selesai" : "Atur"}
          onPress={() => setEditing((value) => !value)}
        />
        <ShortcutGrid items={actionItems} columns={isLandscape ? 6 : 3} />
        <SectionHeading
          title={t("quickPlan")}
          action={editing ? "Selesai" : t("manage")}
          onPress={() =>
            editing ? setEditing(false) : router.push("/plan-form")
          }
        />
        <ShortcutGrid items={planItems} columns={isLandscape ? 5 : 4} />
        {editing ? (
          <AiraCard style={styles.orderCard}>
            <Text style={[styles.orderTitle, { color: colors.foreground }]}>
              Edit tata letak pintasan
            </Text>
            <Text style={[styles.orderHint, { color: colors.muted }]}>
              Pilih panah untuk mengubah urutan pintasan.
            </Text>
            <ShortcutOrder
              title={t("quickActions")}
              items={actionItems}
              colors={colors}
              onMove={(id, direction) => move("action", id, direction)}
            />
            <ShortcutOrder
              title={t("quickPlan")}
              items={planItems}
              colors={colors}
              onMove={(id, direction) => move("plan", id, direction)}
            />
          </AiraCard>
        ) : null}
        {!state.profile.uiPreferences.compactHome ? (
          <>
            <SectionHeading
              title={t("attention")}
              action={t("manage")}
              onPress={() => router.push("/plans")}
            />
            {pending.length === 0 ? (
              <EmptyState
                icon="notifications-none"
                title={t("noReminders")}
                detail={t("noRemindersDetail")}
                actionLabel={t("makeReminder")}
                onAction={() => router.push("/plans?sheet=commitment")}
              />
            ) : (
              <View style={styles.list}>
                {pending.slice(0, 2).map((item) => (
                  <AiraCard key={item.id} style={styles.reminder}>
                    <MaterialIcons
                      name="notifications-active"
                      size={20}
                      color={colors.warning}
                    />
                    <View style={styles.flex}>
                      <Text
                        style={[
                          styles.reminderTitle,
                          { color: colors.foreground },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.reminderDetail, { color: colors.muted }]}
                      >
                        {item.isRecurring
                          ? "Pengingat berulang"
                          : "Pengingat sekali"}
                      </Text>
                    </View>
                  </AiraCard>
                ))}
              </View>
            )}
          </>
        ) : null}
        <SectionHeading
          title={t("recentActivity")}
          action={t("all")}
          onPress={() => router.push("/transactions")}
        />
        {latestTransactions.length === 0 ? (
          <AiraCard>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {t("noActivity")}
            </Text>
          </AiraCard>
        ) : (
          <View style={styles.list}>
            {latestTransactions.map((transaction) => (
              <AiraCard key={transaction.id} style={styles.transaction}>
                <MaterialIcons
                  name={
                    transaction.kind === "income" ? "south-west" : "north-east"
                  }
                  size={19}
                  color={
                    transaction.kind === "income"
                      ? colors.success
                      : colors.error
                  }
                />
                <View style={styles.flex}>
                  <Text
                    style={[styles.reminderTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {transaction.note}
                  </Text>
                  <Text
                    style={[styles.reminderDetail, { color: colors.muted }]}
                  >
                    {transaction.category}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.monthValue,
                    {
                      color:
                        transaction.kind === "income"
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {transaction.kind === "income" ? "+" : "−"}
                  {formatCurrency(transaction.amount)}
                </Text>
              </AiraCard>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        visible={greetingPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGreetingPreviewVisible(false)}
      >
        <View style={styles.greetingModalBackdrop}>
          <View style={styles.greetingModal}>
            <View style={styles.greetingModalHeader}>
              <Text
                style={[
                  styles.greetingModalTitle,
                  { color: colors.foreground },
                ]}
              >
                Pratinjau kartu ucapan
              </Text>
              <Pressable
                accessibilityLabel="Tutup pratinjau kartu"
                onPress={() => setGreetingPreviewVisible(false)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel="Edit teks kartu ucapan"
              multiline
              value={greetingMessageDraft}
              onChangeText={setGreetingMessageDraft}
              placeholder="Tulis pesan kartu ucapan"
              placeholderTextColor={colors.muted}
              style={[
                styles.greetingEditor,
                { color: colors.foreground, borderColor: colors.border },
              ]}
            />
            <View style={styles.greetingFontRow}>
              {GREETING_FONTS.map((font) => (
                <Pressable
                  key={font.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Pilih font ${font.label}`}
                  onPress={() => setGreetingFont(font.id)}
                  style={[
                    styles.greetingFontButton,
                    {
                      borderColor:
                        greetingFont === font.id
                          ? colors.primary
                          : colors.border,
                      backgroundColor:
                        greetingFont === font.id
                          ? `${colors.primary}14`
                          : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.greetingFontButtonText,
                      {
                        color:
                          greetingFont === font.id
                            ? colors.primary
                            : colors.muted,
                        fontFamily: font.id,
                      },
                    ]}
                  >
                    {font.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View
              ref={greetingPreviewRef}
              collapsable={false}
              style={[
                styles.greetingPreviewCard,
                greetingShareFormatStyle,
                {
                  backgroundColor: greetingVisual.backgroundColor,
                  borderColor: greetingVisual.accent,
                },
              ]}
            >
              <ScrapbookDecorations
                accent={greetingVisual.accent}
                foreground={greetingVisual.foreground}
                isIslamic={Boolean(
                  upcomingEvent?.title.toLowerCase().includes("maulid") ||
                  upcomingEvent?.title.toLowerCase().includes("nabi"),
                )}
                animationStyle={greetingOrnamentStyle}
              />
              <Text
                style={[
                  styles.greetingPreviewOrnament,
                  { color: greetingVisual.accent },
                ]}
              >
                {greetingDecorativeLine}
              </Text>
              <Text
                style={[
                  styles.greetingPreviewOrnament,
                  { color: greetingVisual.accent },
                ]}
              >
                {greetingVisual.ornament}
              </Text>
              <Text
                style={[
                  styles.greetingPreviewKicker,
                  { color: greetingVisual.accent },
                ]}
              >
                KARTU UCAPAN HARI INI
              </Text>
              <Text
                style={[
                  styles.greetingPreviewTitle,
                  { color: greetingVisual.foreground },
                ]}
              >
                {greetingTitle}
              </Text>
              <Text
                style={[
                  styles.greetingPreviewDetail,
                  { color: greetingVisual.detail },
                ]}
              >
                {greetingDetail}
              </Text>
              <Text
                style={[
                  styles.greetingPreviewPrompt,
                  {
                    color: greetingVisual.foreground,
                    fontFamily: greetingFont,
                  },
                ]}
              >
                {greetingMessageDraft || greetingFinalMessage}
              </Text>
              <Text
                style={[
                  styles.greetingCopyright,
                  { color: greetingVisual.detail, fontFamily: greetingFont },
                ]}
              >
                Dibuat oleh : VAIRA AI
              </Text>
            </View>
            <View style={styles.greetingModalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void saveGreetingCard()}
                style={[
                  styles.greetingModalButton,
                  { borderColor: colors.border },
                ]}
              >
                <MaterialIcons
                  name="download"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.greetingModalButtonText,
                    { color: colors.foreground },
                  ]}
                >
                  Simpan
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void shareGreetingCard()}
                style={[
                  styles.greetingModalButton,
                  styles.greetingModalButtonPrimary,
                ]}
              >
                <MaterialIcons name="share" size={20} color="#FFFFFF" />
                <Text style={styles.greetingModalButtonPrimaryText}>
                  Bagikan
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function ProfileButton({
  avatarUri,
  colors,
}: {
  avatarUri?: string;
  colors: ReturnType<typeof useColors>;
}) {
  const { state } = useFinance();
  const resolvedAvatarUri = state.profile.userAvatarUri ?? avatarUri;
  return (
    <Pressable
      accessibilityLabel="Buka Profil"
      onPress={() => router.push("/(tabs)/profile")}
      style={[
        styles.profileButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {resolvedAvatarUri ? (
        <ExpoImage
          source={{ uri: resolvedAvatarUri }}
          contentFit="cover"
          style={styles.profileImage}
        />
      ) : (
        <MaterialIcons name="person" size={21} color={colors.primary} />
      )}
    </Pressable>
  );
}
function ShortcutGrid({
  items,
  columns,
}: {
  items: Shortcut[];
  columns: number;
}) {
  const rows = Array.from(
    { length: Math.ceil(items.length / columns) },
    (_, index) => items.slice(index * columns, (index + 1) * columns),
  );
  return (
    <View style={styles.iconGrid}>
      {rows.map((row, index) => (
        <View key={index} style={styles.iconRow}>
          {row.map((item) =>
            item.chicken || item.assetUri ? (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={item.onPress}
                style={styles.assetShortcut}
              >
                <View style={styles.assetShortcutIcon}>
                  {item.chicken ? (
                    <ChickenIcon size={31} />
                  ) : (
                    <ExpoImage
                      source={{ uri: item.assetUri }}
                      contentFit="contain"
                      style={styles.assetShortcutImage}
                    />
                  )}
                </View>
                <Text numberOfLines={2} style={styles.assetShortcutLabel}>
                  {item.label}
                </Text>
              </Pressable>
            ) : (
              <IconCircleButton
                key={item.id}
                label={item.label}
                icon={item.icon}
                tone={item.tone}
                onPress={item.onPress}
              />
            ),
          )}
          {Array.from({ length: columns - row.length }, (_, filler) => (
            <View key={`fill-${filler}`} style={styles.shortcutSpacer} />
          ))}
        </View>
      ))}
    </View>
  );
}
function ShortcutOrder({
  title,
  items,
  colors,
  onMove,
}: {
  title: string;
  items: Shortcut[];
  colors: ReturnType<typeof useColors>;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  return (
    <View style={styles.orderGroup}>
      <Text style={[styles.orderTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={[styles.orderRow, { borderColor: colors.border }]}
        >
          {item.chicken ? (
            <ChickenIcon size={22} />
          ) : item.assetUri ? (
            <ExpoImage
              source={{ uri: item.assetUri }}
              contentFit="contain"
              style={styles.assetOrderImage}
            />
          ) : (
            <MaterialIcons name={item.icon} size={18} color={colors.primary} />
          )}
          <Text style={[styles.orderLabel, { color: colors.foreground }]}>
            {item.label}
          </Text>
          <Pressable disabled={index === 0} onPress={() => onMove(item.id, -1)}>
            <MaterialIcons
              name="keyboard-arrow-up"
              size={22}
              color={index === 0 ? colors.border : colors.primary}
            />
          </Pressable>
          <Pressable
            disabled={index === items.length - 1}
            onPress={() => onMove(item.id, 1)}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={22}
              color={
                index === items.length - 1 ? colors.border : colors.primary
              }
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  content: { paddingBottom: 30 },
  contentLandscape: { alignSelf: "center", maxWidth: 920, width: "100%" },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    paddingTop: 8,
  },
  topBarLandscape: { flexWrap: "nowrap" },
  brandBlock: { minWidth: "100%" },
  brandBlockLandscape: { flex: 1, minWidth: 0 },
  greeting: { fontSize: 12, fontWeight: "600" },
  title: { flexShrink: 1, fontSize: 23, fontWeight: "800" },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 5,
    justifyContent: "flex-end",
    marginLeft: "auto",
  },
  profileButton: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    height: 42,
    justifyContent: "center",
    overflow: "hidden",
    width: 42,
  },
  profileImage: { height: "100%", width: "100%" },
  aiHero: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    minHeight: 104,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroSpinWrap: { overflow: "hidden" },
  greetingAction: {
    color: "#D9FFFF",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 5,
  },
  aiHeroLandscape: { minHeight: 116 },
  aiKicker: {
    color: "#DCEAFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  aiHeroTitle: {
    color: "#FFFFFF",
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 4,
    maxWidth: "100%",
  },
  aiHeroDetail: {
    color: "#DCEAFF",
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
    maxWidth: "100%",
  },
  aiOrb: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  queueSummary: {
    alignItems: "center",
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
    padding: 11,
  },
  queueIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 37,
    justifyContent: "center",
    width: 37,
  },
  queueTitle: { fontSize: 12, fontWeight: "900" },
  queueDetail: { fontSize: 10, marginTop: 2 },
  balanceCard: { marginTop: 12, minHeight: 145, padding: 19 },
  balanceCardLandscape: { minHeight: 136 },
  balanceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceCaption: { fontSize: 14, fontWeight: "700" },
  balanceValue: { fontSize: 31, fontWeight: "800", marginTop: 5 },
  balanceIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  globalRoomWidget: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    minHeight: 58,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  globalRoomIcon: {
    alignItems: "center",
    backgroundColor: "#263449",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  globalRoomTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  globalRoomTitleRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  globalRoomStatus: { alignItems: "center", flexDirection: "row", gap: 4 },
  globalRoomStatusDot: { borderRadius: 4, height: 7, width: 7 },
  globalRoomStatusText: { fontSize: 9, fontWeight: "800" },
  widgetMentionWrap: { alignItems: "center", flexDirection: "row", gap: 5 },
  widgetMentionBadge: {
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 10,
    flexDirection: "row",
    gap: 3,
    minHeight: 20,
    paddingHorizontal: 5,
  },
  widgetMentionDot: {
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  widgetMentionText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  globalRoomDetail: { color: "#CBD5E1", fontSize: 10, marginTop: 2 },
  widgetPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  monthValue: { fontSize: 15, fontWeight: "800" },
  iconGrid: { gap: 14 },
  iconRow: { flexDirection: "row", gap: 9 },
  shortcutSpacer: { flex: 1 },
  assetShortcut: {
    alignItems: "center",
    flex: 1,
    gap: 7,
    minHeight: 86,
    minWidth: 0,
  },
  assetShortcutIcon: {
    alignItems: "center",
    backgroundColor: "#16A67A18",
    borderRadius: 17,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  assetShortcutImage: { height: 31, width: 31 },
  assetOrderImage: { height: 22, width: 22 },
  assetShortcutLabel: {
    color: "#14243B",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    minHeight: 28,
    textAlign: "center",
  },
  orderCard: { gap: 12, marginTop: 10 },
  orderTitle: { fontSize: 14, fontWeight: "800" },
  orderHint: { fontSize: 11, lineHeight: 16 },
  orderGroup: { gap: 3 },
  orderRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
  },
  orderLabel: { flex: 1, fontSize: 12, fontWeight: "700" },
  list: { gap: 9 },
  reminder: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
    padding: 13,
  },
  reminderTitle: { fontSize: 14, fontWeight: "800" },
  reminderDetail: { fontSize: 11, marginTop: 3 },
  transaction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
    padding: 13,
  },
  greetingModalBackdrop: {
    alignItems: "center",
    backgroundColor: "#020617AA",
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  greetingModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    maxWidth: 520,
    padding: 16,
    width: "100%",
  },
  greetingModalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  greetingModalTitle: { fontSize: 17, fontWeight: "800" },
  greetingPreviewCard: {
    alignSelf: "center",
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    maxHeight: 430,
    maxWidth: 320,
    minHeight: 260,
    overflow: "hidden",
    padding: 22,
    width: "100%",
  },
  scrapbookLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 1,
  },
  scrapbookArc: {
    borderRadius: 180,
    borderWidth: 2,
    height: 170,
    position: "absolute",
    width: 270,
  },
  scrapbookArcTop: { right: -78, top: -92, transform: [{ rotate: "18deg" }] },
  scrapbookArcBottom: {
    bottom: -105,
    left: -92,
    transform: [{ rotate: "-22deg" }],
  },
  scrapbookLeafCluster: {
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: "absolute",
  },
  scrapbookLeafTop: { right: 14, top: 26, transform: [{ rotate: "12deg" }] },
  scrapbookLeafBottom: {
    bottom: 25,
    left: 14,
    transform: [{ rotate: "-14deg" }],
  },
  scrapbookLeaf: { fontSize: 17, fontWeight: "900" },
  scrapbookSpark: { fontSize: 18, marginTop: -3 },
  scrapbookRibbon: {
    borderRadius: 5,
    left: -12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    position: "absolute",
    top: 54,
    transform: [{ rotate: "-6deg" }],
  },
  scrapbookRibbonText: { fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  simpleGreetingAccent: {
    alignItems: "center",
    height: 18,
    justifyContent: "center",
    marginBottom: 1,
  },
  simpleGreetingAccentText: { fontSize: 14, fontWeight: "900" },
  simpleGreetingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginBottom: 3,
  },
  simpleGreetingKicker: { fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  simpleGreetingRule: { borderRadius: 2, height: 2, opacity: 0.8, width: 24 },
  greetingCornerDecoration: {
    alignItems: "center",
    borderRadius: 28,
    justifyContent: "center",
    opacity: 0.9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: "absolute",
    zIndex: 2,
  },
  greetingCornerTop: { right: 8, top: 8, transform: [{ rotate: "5deg" }] },
  greetingCornerBottom: {
    bottom: 8,
    left: 8,
    transform: [{ rotate: "-5deg" }],
  },
  greetingCornerText: { fontSize: 12, fontWeight: "900", textAlign: "center" },
  greetingDecoration: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 3,
    textAlign: "center",
  },
  greetingPreviewOrnament: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 14,
    textAlign: "center",
  },
  greetingPreviewKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  greetingPreviewTitle: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    marginTop: 10,
    textAlign: "center",
  },
  greetingPreviewDetail: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    textAlign: "center",
  },
  greetingEditor: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    maxHeight: 92,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  greetingFontRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 12,
  },
  greetingFontButton: {
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  greetingFontButtonText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  greetingPreviewPrompt: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 14,
    textAlign: "center",
  },
  greetingCopyright: {
    bottom: 8,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.5,
    opacity: 0.78,
    position: "absolute",
    right: 10,
    textAlign: "right",
  },
  greetingModalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  greetingModalButton: {
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
  },
  greetingModalButtonPrimary: {
    backgroundColor: "#1677FF",
    borderColor: "#1677FF",
  },
  greetingModalButtonText: { fontSize: 14, fontWeight: "800" },
  greetingModalButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyText: { fontSize: 13, lineHeight: 19 },
  flex: { flex: 1, minWidth: 0 },
});
