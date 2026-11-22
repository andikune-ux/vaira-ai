import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { Image as ExpoImage } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { captureScreen } from "react-native-view-shot";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Image as NativeImage, InteractionManager, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppToast } from "@/components/app-toast";
import { useSpcaGaze } from "@/components/spca-gaze";
import { useColors } from "@/hooks/use-colors";
import { useSpcaDiagnostics } from "@/hooks/use-spca-diagnostics";
import { getLastBugDiagnostic, type BugDiagnostic } from "@/lib/bug-diagnostics";
import { useFinance } from "@/lib/finance/finance-context";
import { clearTemporaryCache, formatCacheSize, getTemporaryCacheSize } from "@/lib/spca-cache";
import { recordSpcaPassiveHistory } from "@/lib/spca-passive-history";
import { getSpcaExtraSettings } from "@/lib/spca-extra-settings";
import { createSpcaFindings } from "@/lib/spca-diagnostic-engine";

type Mood = "happy" | "focused" | "sad" | "crying" | "laugh" | "sulky" | "confused" | "surprised" | "love" | "sleepy" | "sneeze" | "poop" | "cleanup" | "hurt" | "angry";
type ReminderBubble = { text: string; target?: string } | null;
type CaptureStage = "idle" | "capturing" | "preview" | "cropping";

const ROBOT_SIZE = 54;
const HIT_SIZE = 68;
const DEFAULT_POSITION = { left: 12, top: 140 };
const ROBOT_ASSET = { uri: "/manus-storage/spca-robot-transparent_36305bef.png" };
type FaceAccessory = "tears" | "tissue" | "magnifier" | "steam" | "sulky";
type FaceExpression = { accent: string; accentColor: string; accessory?: FaceAccessory; brows?: string; effect?: keyof typeof MaterialIcons.glyphMap; eyes: string; label: string; mouth: string };
const FACE: Record<Mood, FaceExpression> = {
  happy: { accent: "✦", accentColor: "#FDE68A", brows: "⌒ ⌒", eyes: "◠ ◠", label: "senang", mouth: "⌣" },
  focused: { accent: "⌁", accentColor: "#A3F8FF", accessory: "magnifier", brows: "— —", eyes: "◉ ◉", label: "menganalisis", mouth: "—" },
  sad: { accent: "…", accentColor: "#BFDBFE", accessory: "tissue", brows: "˘ ˘", eyes: "˘ ˘", label: "sedih", mouth: "⌢" },
  crying: { accent: "💧", accentColor: "#93C5FD", accessory: "tears", brows: "˘ ˘", eyes: "T T", label: "menangis", mouth: "⌢" },
  laugh: { accent: "✦", accentColor: "#FDE68A", brows: "⌒ ⌒", eyes: "^ ^", label: "tertawa", mouth: "⌣" },
  sulky: { accent: "☁", accentColor: "#CBD5E1", accessory: "sulky", brows: "╲ ╱", eyes: "¬ ¬", label: "ngambek", mouth: "⌁" },
  confused: { accent: "?", accentColor: "#DDD6FE", brows: "⌒ ~", eyes: "• •", label: "bingung", mouth: "⌒" },
  surprised: { accent: "!", accentColor: "#FECACA", brows: "⌒ ⌒", eyes: "O O", label: "terkejut", mouth: "o" },
  love: { accent: "♥", accentColor: "#FDA4AF", brows: "⌒ ⌒", eyes: "♥ ♥", label: "sayang", mouth: "⌣" },
  sleepy: { accent: "Z", accentColor: "#C4B5FD", accessory: "steam", brows: "— —", eyes: "− −", label: "lelah", mouth: "⌁" },
  sneeze: { accent: "💨", accentColor: "#BAE6FD", brows: "⌒ ⌒", effect: "air", eyes: "× ×", label: "bersin", mouth: "o" },
  poop: { accent: "💩", accentColor: "#D6A06F", brows: "× ×", eyes: "× ×", label: "ingin ke toilet", mouth: "⌢" },
  cleanup: { accent: "✦", accentColor: "#86EFAC", brows: "— —", effect: "cleaning-services", eyes: "◉ ◉", label: "membersihkan", mouth: "⌣" },
  hurt: { accent: "✚", accentColor: "#FCA5A5", brows: "╲ ╱", eyes: "× ×", label: "kesakitan", mouth: "⌢" },
  angry: { accent: "!", accentColor: "#FB7185", brows: "╲ ╱", eyes: "> <", label: "marah", mouth: "⌁" },
};
const PATROL_MOODS: Mood[] = ["happy", "laugh", "sulky", "confused", "surprised", "love", "sleepy", "sneeze", "poop", "sad"];
const FLOAT_MOTION = { subtle: { duration: 2200, glow: 0.32, lift: 3, rotate: "0.3deg", scale: 1.05 }, standard: { duration: 1750, glow: 0.55, lift: 5, rotate: "0.5deg", scale: 1.12 }, expressive: { duration: 1350, glow: 0.78, lift: 8, rotate: "0.9deg", scale: 1.2 } } as const;
const AURA_COLORS = { cyan: "#4DDFFF", violet: "#A78BFA", rose: "#FB7185", gold: "#FBBF24" } as const;
const SCANNER_COLORS = { blue: "#4DDFFF", violet: "#A78BFA", green: "#4ADE80", gold: "#FBBF24" } as const;
const ANIMATION_SPEED = { slow: 1.35, normal: 1, fast: 0.7 } as const;
type AnimatedPoint = { x: Animated.Value; y: Animated.Value };
const setAnimatedPoint = (point: AnimatedPoint, x: number, y: number) => { point.x.setValue(x); point.y.setValue(y); };
const stopAnimatedPoint = (point: AnimatedPoint) => { point.x.stopAnimation(); point.y.stopAnimation(); };
const animatedPointTransform = (point: AnimatedPoint) => [{ translateX: point.x }, { translateY: point.y }];
const animatePointTo = (point: AnimatedPoint, x: number, y: number, duration: number) => Animated.parallel([
  Animated.timing(point.x, { toValue: x, duration, useNativeDriver: true }),
  Animated.timing(point.y, { toValue: y, duration, useNativeDriver: true }),
]);
const pause = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function SpcaOverlay() {
  const colors = useColors();
  const { state, updateProfile } = useFinance();
  const { showToast } = useAppToast();
  const { gaze } = useSpcaGaze();
  const activeDiagnostics = useSpcaDiagnostics();
  const { width, height } = useWindowDimensions();
  const safeArea = useSafeAreaInsets();
  const preferences = state.profile.uiPreferences;
  const savedPosition = preferences.spcaPosition ?? DEFAULT_POSITION;
  const scalePercent = Math.max(0, Math.min(100, preferences.spcaScalePercent ?? 25));
  const transparency = Math.max(0, Math.min(100, preferences.spcaTransparencyPercent ?? 100)) / 100;
  const iconSize = Math.max(24, Math.round(42 + scalePercent * 0.48));
  const hitSize = Math.max(HIT_SIZE, iconSize + 14);
  const faceScale = iconSize / ROBOT_SIZE;
  const floatMotion = FLOAT_MOTION[preferences.spcaFloatIntensity ?? "standard"];
  const auraColor = AURA_COLORS[preferences.spcaAuraColor ?? "cyan"];
  const animationSpeed = ANIMATION_SPEED[preferences.spcaAnimationSpeed ?? "normal"];
  const robotInset = (hitSize - iconSize) / 2;
  const [position, setPosition] = useState(savedPosition);
  const [visible, setVisible] = useState(false);
  const [mood, setMood] = useState<Mood>("happy");
  const [diagnostic, setDiagnostic] = useState<BugDiagnostic | null>(null);
  const [analysis, setAnalysis] = useState("SPCA siap memindai diagnostik aplikasi secara aman.");
  const [reportDraft, setReportDraft] = useState("SPCA — Sistem Patroli Cyber Aira\n\nMenunggu pemindaian.");
  const [analyzing, setAnalyzing] = useState(false);
  const [scanPercent, setScanPercent] = useState(0);
  const [scannerColor, setScannerColor] = useState<keyof typeof SCANNER_COLORS>("blue");
  const [cacheSize, setCacheSize] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [captureStage, setCaptureStage] = useState<CaptureStage>("idle");
  const [bubble, setBubble] = useState<ReminderBubble>(null);
  const positionRef = useRef(position);
  const gestureStart = useRef(position);
  const patrol = { x: useRef(new Animated.Value(0)).current, y: useRef(new Animated.Value(0)).current };
  const dragTail = { x: useRef(new Animated.Value(0)).current, y: useRef(new Animated.Value(0)).current };
  const stretch = useRef(new Animated.Value(0)).current;
  const radar = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const scanPatrol = { x: useRef(new Animated.Value(0)).current, y: useRef(new Animated.Value(0)).current };
  const bubbleMotion = useRef(new Animated.Value(0)).current;
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announcedFinding = useRef<string | null>(null);
  const scannerAccent = SCANNER_COLORS[scannerColor];
  const scanInFlight = useRef(false);
  const captureInFlight = useRef(false);

  const clamp = useCallback((left: number, top: number) => {
    // Position is the outer hitbox origin, but its bounds are calculated from
    // the visible robot body. Radar, aura, and wave effects may extend beyond it.
    const bodyInset = (hitSize - iconSize) / 2;
    const minLeft = -bodyInset;
    const maxLeft = Math.max(minLeft, width - iconSize - bodyInset);
    const minTop = Math.max(safeArea.top - bodyInset, -bodyInset);
    const bottomReserve = Math.max(74, safeArea.bottom + 56);
    const maxTop = Math.max(minTop, height - bottomReserve - iconSize - bodyInset);
    return {
      left: Math.max(minLeft, Math.min(left, maxLeft)),
      top: Math.max(minTop, Math.min(top, maxTop)),
    };
  }, [height, hitSize, iconSize, safeArea.bottom, safeArea.top, width]);

  useEffect(() => { const next = clamp(savedPosition.left, savedPosition.top); positionRef.current = next; setPosition(next); }, [clamp, savedPosition]);
  useEffect(() => { void getSpcaExtraSettings().then((settings) => setScannerColor(settings.scannerColor)); }, []);

  const dismissBubble = useCallback(() => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); bubbleTimer.current = null; if (!preferences.spcaBubbleAnimationEnabled) { setBubble(null); return; } Animated.timing(bubbleMotion, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => setBubble(null)); }, [bubbleMotion, preferences.spcaBubbleAnimationEnabled]);
  const showBubble = useCallback((next: ReminderBubble) => { if (!next) return; if (bubbleTimer.current) clearTimeout(bubbleTimer.current); bubbleMotion.setValue(preferences.spcaBubbleAnimationEnabled ? 0 : 1); setBubble(next); if (preferences.spcaBubbleAnimationEnabled) setTimeout(() => { void Animated.timing(bubbleMotion, { toValue: 1, duration: 180, useNativeDriver: true }).start(); }, 0); bubbleTimer.current = setTimeout(dismissBubble, Math.max(1, preferences.spcaBubbleDurationSeconds) * 1000); }, [bubbleMotion, dismissBubble, preferences.spcaBubbleAnimationEnabled, preferences.spcaBubbleDurationSeconds]);

  const showReminderBubble = useCallback(() => {
    if (!preferences.spcaReminderBubbleEnabled) return;
    const commitment = state.commitments.find((item) => !item.isDone && item.kind !== "reminder");
    const next = commitment ? { text: `Ingat ${commitment.title}${commitment.dueDayOfMonth ? ` pada tanggal ${commitment.dueDayOfMonth}` : ""}.`, target: "/plans" } : state.profile.prayerReminderEnabled ? { text: "Periksa waktu salat berikutnya.", target: "/prayer-times" } : { text: "SPCA aktif. Tekan saya untuk memindai tampilan.", target: undefined };
    showBubble(next);
  }, [preferences.spcaReminderBubbleEnabled, showBubble, state.commitments, state.profile.prayerReminderEnabled]);

  useEffect(() => {
    if (!preferences.spcaEnabled || !preferences.spcaReminderBubbleEnabled) return;
    const initial = setTimeout(showReminderBubble, 1200);
    const repeat = setInterval(showReminderBubble, Math.max(1, preferences.spcaBubbleRepeatMinutes) * 60_000);
    return () => { clearTimeout(initial); clearInterval(repeat); };
  }, [preferences.spcaBubbleRepeatMinutes, preferences.spcaEnabled, preferences.spcaReminderBubbleEnabled, showReminderBubble]);
  useEffect(() => {
    if (!preferences.spcaEnabled || activeDiagnostics.isScanning) return;
    const finding = activeDiagnostics.findings.find((item) => item.id !== "healthy" && item.severity !== "info");
    if (!finding) { announcedFinding.current = null; return; }
    if (announcedFinding.current === finding.id) return;
    announcedFinding.current = finding.id;
    setMood(finding.severity === "critical" ? "crying" : "focused");
    showBubble({ text: `SPCA menemukan: ${finding.title}. Tekan untuk solusi.`, target: "/spca-diagnostics" });
  }, [activeDiagnostics.findings, activeDiagnostics.isScanning, preferences.spcaEnabled, showBubble]);
  useEffect(() => () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); }, []);
  useEffect(() => {
    if (!preferences.spcaEnabled) return;
    const duration = Math.round(floatMotion.duration * animationSpeed);
    const floating = Animated.loop(Animated.sequence([Animated.timing(float, { toValue: 1, duration, useNativeDriver: true }), Animated.timing(float, { toValue: 0, duration, useNativeDriver: true })]));
    floating.start();
    return () => { floating.stop(); float.stopAnimation(); float.setValue(0); };
  }, [animationSpeed, float, floatMotion.duration, preferences.spcaEnabled]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
    onPanResponderGrant: () => { gestureStart.current = positionRef.current; stretch.setValue(1); },
    onPanResponderMove: (_, gesture) => {
      const next = clamp(gestureStart.current.left + gesture.dx, gestureStart.current.top + gesture.dy);
      positionRef.current = next;
      setPosition(next);
      const horizontalTravel = next.left - gestureStart.current.left;
      const verticalTravel = next.top - gestureStart.current.top;
      setAnimatedPoint(dragTail, -horizontalTravel * 0.18, -verticalTravel * 0.18);
    },
    onPanResponderRelease: () => {
      const next = positionRef.current;
      void updateProfile({ uiPreferences: { ...preferences, spcaPosition: next } });
      Animated.parallel([animatePointTo(dragTail, 0, 0, 260), Animated.timing(stretch, { toValue: 0, duration: 230, useNativeDriver: true })]).start();
      showToast("Posisi Robot SPCA disimpan.", "info");
    },
  }), [clamp, dragTail.x, dragTail.y, preferences, showToast, stretch, updateProfile]);

  useEffect(() => {
    if (!preferences.spcaEnabled || !preferences.spcaAutoPatrol) return;
    const interval = setInterval(() => {
      const origin = positionRef.current;
      const corners = [clamp(8, 104), clamp(width - hitSize - 8, 104), clamp(8, height - 190), clamp(width - hitSize - 8, height - 190), clamp(Math.random() * (width - hitSize), 120 + Math.random() * Math.max(40, height - 300))];
      const target = corners[Math.floor(Math.random() * corners.length)];
      const duration = Math.max(2, preferences.spcaPatrolDurationSeconds) * 1000;
      setMood(PATROL_MOODS[Math.floor(Math.random() * PATROL_MOODS.length)]);
      Animated.sequence([animatePointTo(patrol, target.left - origin.left, target.top - origin.top, duration / 2), animatePointTo(patrol, 0, 0, duration / 2)]).start(() => setMood("happy"));
    }, Math.max(5, preferences.spcaPatrolIntervalSeconds) * 1000);
    return () => { clearInterval(interval); stopAnimatedPoint(patrol); setAnimatedPoint(patrol, 0, 0); };
  }, [clamp, height, hitSize, patrol.x, patrol.y, preferences.spcaAutoPatrol, preferences.spcaEnabled, preferences.spcaPatrolDurationSeconds, preferences.spcaPatrolIntervalSeconds, width]);

  const refreshDiagnostic = useCallback(async () => { const [last, cache] = await Promise.all([getLastBugDiagnostic(), getTemporaryCacheSize()]); setDiagnostic(last); setCacheSize(cache); return { last, cache }; }, []);
  const scan = useCallback(async () => {
    if (scanInFlight.current) return;
    scanInFlight.current = true;
    setAnalyzing(true); setScanPercent(0); setMood("focused"); radar.setValue(0);
    const scanStartedAt = Date.now();
    const progressTimer = setInterval(() => setScanPercent(Math.min(97, Math.round(((Date.now() - scanStartedAt) / 1550) * 100))), 90);
    const rotation = Animated.loop(Animated.timing(radar, { toValue: 1, duration: 720, useNativeDriver: true })); rotation.start();
    setAnimatedPoint(scanPatrol, 0, 0);
    const freeScan = Animated.loop(Animated.sequence([animatePointTo(scanPatrol, 54, -32, 320), animatePointTo(scanPatrol, -42, 18, 380), animatePointTo(scanPatrol, 28, 44, 330), animatePointTo(scanPatrol, -22, -22, 350), animatePointTo(scanPatrol, 0, 0, 280)]));
    freeScan.start();
    const { last, cache } = await refreshDiagnostic(); const runtime = await activeDiagnostics.scan(); await pause(1550); clearInterval(progressTimer); setScanPercent(100); rotation.stop(); freeScan.stop(); setAnimatedPoint(scanPatrol, 0, 0);
    const findings = runtime ? createSpcaFindings(runtime) : activeDiagnostics.findings;
    const details = findings.length ? findings.map((item) => `${item.title}: ${item.summary}`).join("\n") : last ? `SPCA menemukan ringkasan kesalahan runtime pada ${new Date(last.createdAt).toLocaleString("id-ID")}. Isi teknis telah disaring demi privasi.` : previewUri ? "Tidak ada crash JavaScript tersimpan. Tangkapan layar telah dibuat dan siap Anda tinjau secara visual." : "Tidak ada masalah utama yang tercatat. Status cache dan izin perangkat diperiksa tanpa mengubah data.";
    const result = `${details}\nCache sementara: ${formatCacheSize(cache)}.\nTindakan aman tersedia di Pusat SPCA: coba ulang, periksa izin, bersihkan cache, atau buat laporan aman untuk Administrator.`;
    setAnalysis(result); setReportDraft(`SPCA — Laporan Pemindaian\nWaktu: ${new Date().toLocaleString("id-ID")}\n\n${result}`); setMood(last ? "crying" : "happy"); setAnalyzing(false); scanInFlight.current = false;
  }, [activeDiagnostics, previewUri, radar, refreshDiagnostic, scanPatrol.x, scanPatrol.y]);
  const openAssistant = () => {
    setVisible(true);
    void scan().catch(() => {
      scanInFlight.current = false;
      setAnalyzing(false);
      setMood("crying");
      setAnalysis("SPCA tidak dapat memulai pemindaian saat ini. Aplikasi tetap aman; coba lagi beberapa saat.");
      showToast("Pemindaian SPCA gagal dimulai.", "info");
    });
  };

  const capture = async () => {
    if (Platform.OS === "web") { Alert.alert("Gunakan perangkat", "Tangkapan layar langsung tersedia pada Android atau iOS. Pratinjau web tidak membuka galeri sebagai pengganti."); return; }
    if (captureInFlight.current || scanInFlight.current) return;
    captureInFlight.current = true;
    try {
      setCaptureStage("capturing");
      setVisible(false);
      setMood("focused");
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
      });
      await pause(180);
      const uri = await captureScreen({ format: "jpg", quality: 0.76, result: "tmpfile" });
      setPreviewUri(uri);
      setCaptureStage("preview");
      setVisible(true);
      setMood("happy");
      showToast("Layar perangkat berhasil ditangkap.");
      void scan().catch(() => { setAnalyzing(false); setMood("crying"); showToast("Pemindaian SPCA gagal dimulai.", "info"); });
    } catch {
      setCaptureStage("idle");
      setVisible(true);
      setMood("crying");
      Alert.alert("Tangkapan layar belum tersedia", "Coba lagi setelah tampilan selesai dimuat.");
    } finally {
      captureInFlight.current = false;
    }
  };

  const cropPreview = async () => {
    if (!previewUri) return; setCaptureStage("cropping");
    try {
      const size = await new Promise<{ width: number; height: number }>((resolve, reject) => NativeImage.getSize(previewUri, (imageWidth, imageHeight) => resolve({ width: imageWidth, height: imageHeight }), reject));
      const side = Math.min(size.width, size.height);
      const cropped = await ImageManipulator.manipulateAsync(previewUri, [{ crop: { originX: Math.floor((size.width - side) / 2), originY: Math.floor((size.height - side) / 2), width: side, height: side } }], { compress: 0.94, format: ImageManipulator.SaveFormat.JPEG });
      setPreviewUri(cropped.uri); setCaptureStage("preview"); showToast("Crop tengah selesai. Anda dapat menyimpannya.");
    } catch { setCaptureStage("preview"); Alert.alert("Crop belum berhasil", "Coba ulangi tangkapan layar lalu lakukan crop kembali."); }
  };

  const savePreview = async () => { if (!previewUri) return; const permission = await MediaLibrary.requestPermissionsAsync(); if (!permission.granted) { Alert.alert("Izin galeri diperlukan", "Izinkan akses galeri untuk menyimpan tangkapan layar."); return; } await MediaLibrary.saveToLibraryAsync(previewUri); showToast("Tangkapan layar disimpan ke galeri."); };
  const clearCache = () => Alert.alert("Hapus cache sementara?", "Data keuangan, chat, pengaturan, dan cadangan tidak akan dihapus.", [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: () => { void (async () => { setMood("cleanup"); const released = await clearTemporaryCache(); await refreshDiagnostic(); setMood("laugh"); showToast(released ? `${formatCacheSize(released)} cache sementara dihapus.` : "Tidak ada cache sementara yang perlu dihapus."); })(); } }]);

  const face = FACE[mood]; const eyeX = Math.max(-1.4, Math.min(1.4, (gaze.x - (position.left + hitSize / 2)) / 58)); const eyeY = Math.max(-1.4, Math.min(1.4, (gaze.y - (position.top + hitSize / 2)) / 58));
  const showBubbleRight = preferences.spcaBubblePosition === "right" || (preferences.spcaBubblePosition !== "left" && position.left < width / 2 - 96);
  if (!preferences.spcaEnabled) return preferences.spcaPassivePatrolEnabled === false ? null : <PassiveSpcaPatrol />;

  return <>
    <Animated.View {...panResponder.panHandlers} style={[styles.floatingArea, { height: hitSize, left: position.left, opacity: transparency, top: position.top, transform: [...animatedPointTransform(patrol), ...animatedPointTransform(scanPatrol)], width: hitSize }]}><Animated.View pointerEvents="box-none" style={[styles.floatLayer, { height: hitSize, transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -floatMotion.lift] }) }, { rotate: float.interpolate({ inputRange: [0, 1], outputRange: [`-${floatMotion.rotate}`, floatMotion.rotate] }) }], width: hitSize }]}>{preferences.spcaAuraEnabled !== false ? <Animated.View pointerEvents="none" style={[styles.floatGlow, { borderColor: `${auraColor}78`, height: iconSize + 12, opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.18, floatMotion.glow] }), transform: [{ scale: float.interpolate({ inputRange: [0, 1], outputRange: [0.9, floatMotion.scale] }) }], width: iconSize + 12 }]} /> : null}
      {bubble || analyzing ? (
        <Animated.View style={[
          bubbleMotionStyles.container,
          {
            opacity: analyzing ? 1 : bubbleMotion,
            transform: [{ scale: analyzing ? 1 : bubbleMotion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
          },
          showBubbleRight ? { left: hitSize + 4 } : { right: hitSize + 4 },
        ]}>
          <Pressable onPress={() => { if (analyzing) return; dismissBubble(); if (bubble?.target) router.push(bubble.target as never); else openAssistant(); }} style={[styles.bubble, { backgroundColor: colors.foreground }]}>
            {analyzing ? (
              <View style={styles.miniScannerBubble}>
                <View style={[styles.miniScanner, { borderColor: `${scannerAccent}A8` }]}>
                  <View style={[styles.miniScannerGrid, { backgroundColor: `${scannerAccent}1F` }]}>
                    <Animated.View style={[styles.miniScannerLine, { backgroundColor: scannerAccent, transform: [{ translateY: radar.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] }) }] }]} />
                  </View>
                  <MaterialIcons name="radar" size={18} color={scannerAccent} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.miniScannerTitleRow}>
                    <Text style={[styles.miniScannerTitle, { color: colors.background }]}>Memindai layar</Text>
                    <Text style={[styles.miniScannerPercent, { color: scannerAccent }]}>{scanPercent}%</Text>
                  </View>
                  <Text style={[styles.miniScannerDetail, { color: `${colors.background}B8` }]}>Radar SPCA aktif</Text>
                </View>
              </View>
            ) : <Text numberOfLines={3} style={[styles.bubbleText, { color: colors.background }]}>{bubble?.text}</Text>}
          </Pressable>
        </Animated.View>
      ) : null}
      <Animated.View pointerEvents="none" style={[styles.ghost, { height: hitSize, transform: animatedPointTransform(dragTail), width: hitSize, opacity: stretch.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }) }]}><ExpoImage source={ROBOT_ASSET} contentFit="contain" style={[styles.robotImage, { height: iconSize, width: iconSize }]} /></Animated.View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Buka Robot SPCA dengan ekspresi ${face.label} dan mulai analisis`} accessibilityHint="Ketuk untuk membuka pemeriksaan SPCA. Geser untuk memindahkan robot." disabled={captureStage === "capturing"} hitSlop={12} onPress={openAssistant} style={({ pressed }) => [styles.robotButton, { height: hitSize, width: hitSize }, pressed && styles.pressed]}>
        <ExpoImage source={ROBOT_ASSET} contentFit="contain" style={[styles.robotImage, { height: iconSize, width: iconSize }]} />
        <View pointerEvents="none" style={[styles.faceScreen, { borderRadius: 7 * faceScale, height: 19 * faceScale, left: robotInset + 13 * faceScale, top: robotInset + 15 * faceScale, width: 30 * faceScale }]}>{face.brows ? <Text style={[styles.faceBrows, { fontSize: 5.5 * faceScale, lineHeight: 5.5 * faceScale }]}>{face.brows}</Text> : null}<Text style={[styles.faceEyes, { fontSize: (analyzing ? 10 : 7) * faceScale, lineHeight: (analyzing ? 10 : 7) * faceScale, top: analyzing ? 3 * faceScale : 5 * faceScale, transform: [{ translateX: eyeX }, { translateY: eyeY }] }]}>{face.eyes}</Text><Text style={[styles.faceMouth, { fontSize: 8 * faceScale, lineHeight: 8 * faceScale, top: 11 * faceScale }]}>{face.mouth}</Text></View>
        <View pointerEvents="none" accessibilityLabel={`Simbol emosi ${face.label}`} style={[styles.emotionBadge, { height: Math.max(16, 20 * faceScale), right: robotInset - 3 * faceScale, top: robotInset - 5 * faceScale, width: Math.max(16, 20 * faceScale) }]}><Text style={[styles.emotionSymbol, { color: face.accentColor, fontSize: Math.max(10, 12 * faceScale) }]}>{face.accent}</Text></View>
        <ExpressionAccessory accessory={face.accessory} scale={faceScale} inset={robotInset} emphasis={analyzing} />
        {face.effect ? <MaterialIcons pointerEvents="none" name={face.effect} size={Math.max(11, 14 * faceScale)} color="#D9F8FF" style={[styles.faceEffect, { right: robotInset + 1 * faceScale, top: robotInset + 24 * faceScale }]} /> : null}
      </Pressable>
    </Animated.View></Animated.View>
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}><View style={styles.scrim}><View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.sheetHeader}><View style={styles.robotPreview}><ExpoImage source={ROBOT_ASSET} contentFit="contain" style={styles.robotPreviewImage} /></View><View style={styles.sheetHeading}><Text style={[styles.title, { color: colors.foreground }]}>SPCA aktif</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{analyzing ? "Radar sedang memindai…" : "Laporan aman dan dapat diedit"}</Text></View><Pressable onPress={() => setVisible(false)} style={styles.close}><MaterialIcons name="close" size={22} color={colors.muted} /></Pressable></View>
      <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.analysisCard, { backgroundColor: `${colors.primary}10` }]}>{analyzing ? <Animated.View style={[styles.radar, { borderColor: colors.primary, transform: [{ rotate: radar.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}><View style={[styles.radarBeam, { backgroundColor: colors.primary }]} /></Animated.View> : <MaterialIcons name={diagnostic ? "bug-report" : "verified-user"} size={20} color={diagnostic ? colors.warning : colors.primary} />}<View style={styles.flex}><Text style={[styles.analysisTitle, { color: colors.foreground }]}>{analyzing ? "SPCA sedang memeriksa" : "Hasil pemindaian SPCA"}</Text><Text style={[styles.analysisText, { color: colors.muted }]}>{analysis}</Text></View></View>
        {captureStage === "capturing" ? <View style={styles.captureProgress}><MaterialIcons name="screenshot-monitor" size={24} color={colors.primary} /><Text style={[styles.captureText, { color: colors.foreground }]}>SPCA sedang menangkap layar…</Text></View> : null}
        {previewUri ? <View style={[styles.previewCard, { borderColor: colors.border }]}><ExpoImage source={{ uri: previewUri }} contentFit="contain" style={styles.preview} /><View style={styles.previewActions}><Action label="Batal" icon="close" color={colors.error} onPress={() => { setPreviewUri(null); setCaptureStage("idle"); }} /><Action label={captureStage === "cropping" ? "Memotong…" : "Crop tengah"} icon="crop" color={colors.warning} onPress={() => { void cropPreview(); }} /><Action label="Simpan" icon="save-alt" color={colors.success} onPress={() => { void savePreview(); }} /></View></View> : <View style={styles.actionGrid}><Action label="Analisis ulang" icon="radar" color={colors.primary} onPress={() => { void scan().catch(() => { setAnalyzing(false); setMood("crying"); showToast("Pemindaian SPCA gagal dimulai.", "info"); }); }} /><Action label="Tangkap layar" icon="screenshot-monitor" color={colors.success} onPress={() => { if (!captureInFlight.current && !analyzing) void capture(); }} /><Action label="Hapus cache" icon="cleaning-services" color={colors.warning} onPress={clearCache} /><Action label="Nonaktifkan SPCA" icon="power-settings-new" color={colors.error} onPress={() => { void updateProfile({ uiPreferences: { ...preferences, spcaEnabled: false } }); setVisible(false); showToast("SPCA dinonaktifkan. Aktifkan kembali dari Studio Developer."); }} /></View>}
        <Text style={[styles.cacheLabel, { color: colors.muted }]}>Cache sementara terdeteksi: {formatCacheSize(cacheSize)}</Text>
        <Text style={[styles.reportLabel, { color: colors.foreground }]}>Laporan pemindaian — dapat diedit</Text><TextInput value={reportDraft} onChangeText={setReportDraft} multiline placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]} /><Action label="Salin laporan" icon="content-copy" color={colors.primary} onPress={() => { void Clipboard.setStringAsync(reportDraft); showToast("Laporan SPCA disalin."); }} />
        <Pressable onPress={() => router.push("/spca-diagnostics" as never)} style={[styles.linkRow, { borderColor: colors.border }]}><MaterialIcons name="health-and-safety" size={18} color={colors.primary} /><Text style={[styles.linkText, { color: colors.foreground }]}>Buka Pusat SPCA aktif</Text><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>
        <Pressable onPress={() => router.push("/cache-maintenance" as never)} style={[styles.linkRow, { borderColor: colors.border }]}><MaterialIcons name="settings" size={18} color={colors.primary} /><Text style={[styles.linkText, { color: colors.foreground }]}>Buka pengelolaan cache lengkap</Text><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>
      </ScrollView>
    </View></View></Modal>
  </>;
}

function PassiveSpcaPatrol() {
  const colors = useColors();
  const { state } = useFinance();
  const { width } = useWindowDimensions();
  const preferences = state.profile.uiPreferences;
  const [visible, setVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [mood, setMood] = useState<"focused" | "hurt" | "angry">("focused");
  const [evasive, setEvasive] = useState(false);
  const [sessionLimit, setSessionLimit] = useState(3);
  const patrol = { x: useRef(new Animated.Value(-56)).current, y: useRef(new Animated.Value(0)).current };
  const bob = useRef(new Animated.Value(0)).current;
  const radarTrail = useRef(new Animated.Value(0)).current;
  const radarSweep = useRef(new Animated.Value(0)).current;
  const evasionAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const patrolAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appearanceCount = useRef(0);
  const visibleRef = useRef(false);
  const [radarSettings, setRadarSettings] = useState({ enabled: true, color: "blue" as keyof typeof SCANNER_COLORS });
  const intervalSeconds = preferences.spcaPassiveIntervalSeconds ?? 60;
  const durationSeconds = preferences.spcaPassiveDurationSeconds ?? 15;
  const messages = preferences.spcaPassiveMessages ?? ["Ga nyampe lama", "Bentar doang", "Udah di usilin aja\n-_-"];
  const radarColor = SCANNER_COLORS[radarSettings.color];

  const startPatrol = useCallback(() => {
    patrolAnimation.current?.stop();
    const farLeft = -Math.min(280, Math.max(150, width * 0.72));
    patrolAnimation.current = Animated.loop(Animated.sequence([
      animatePointTo(patrol, farLeft, -Math.min(210, Math.max(110, width * 0.42)), 1350),
      animatePointTo(patrol, Math.min(26, width * 0.08), -Math.min(210, Math.max(110, width * 0.42)), 1250),
      animatePointTo(patrol, -Math.min(220, Math.max(120, width * 0.55)), -Math.min(72, Math.max(32, width * 0.16)), 1200),
      animatePointTo(patrol, Math.min(24, width * 0.08), -Math.min(72, Math.max(32, width * 0.16)), 1100),
      animatePointTo(patrol, farLeft, Math.min(40, width * 0.12), 1250),
      animatePointTo(patrol, Math.min(24, width * 0.08), Math.min(40, width * 0.12), 1250),
    ]));
    patrolAnimation.current.start();
  }, [patrol.x, patrol.y, width]);
  const clearBubbleResumeTimer = useCallback(() => {
    if (bubbleResumeTimer.current) clearTimeout(bubbleResumeTimer.current);
    bubbleResumeTimer.current = null;
  }, []);
  const dismiss = useCallback((immediate = false) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    clearBubbleResumeTimer();
    evasionAnimation.current?.stop(); evasionAnimation.current = null;
    patrolAnimation.current?.stop(); patrolAnimation.current = null;
    setBubble(null); setEvasive(false); setMood("focused");
    const finish = () => { visibleRef.current = false; setVisible(false); setTapCount(0); setAnimatedPoint(patrol, 0, 12); };
    if (immediate || !visibleRef.current) { finish(); return; }
    animatePointTo(patrol, 30, 24, 460).start(finish);
  }, [clearBubbleResumeTimer, patrol.x, patrol.y]);
  const appear = useCallback(() => {
    if (visibleRef.current || intervalSeconds <= 0 || durationSeconds <= 0 || (sessionLimit > 0 && appearanceCount.current >= sessionLimit)) return;
    appearanceCount.current += 1;
    void recordSpcaPassiveHistory("appearance", `Patroli pasif muncul (${appearanceCount.current}${sessionLimit > 0 ? `/${sessionLimit}` : ""}).`);
    visibleRef.current = true;
    setVisible(true); setTapCount(0); setEvasive(false); setMood("focused"); setBubble("Memeriksa layar…");
    setAnimatedPoint(patrol, 0, 12);
    patrolAnimation.current?.stop();
    clearBubbleResumeTimer();
    Animated.sequence([
      animatePointTo(patrol, 0, 0, 320),
      Animated.delay(260),
    ]).start(({ finished }) => {
      if (!finished || !visibleRef.current) return;
      bubbleResumeTimer.current = setTimeout(() => {
        bubbleResumeTimer.current = null;
        if (!visibleRef.current) return;
        setBubble(null);
        startPatrol();
      }, 1500);
    });
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (!visibleRef.current) return; setBubble("Pemindaian layar selesai · tidak ada kejanggalan visual yang terdeteksi."); void recordSpcaPassiveHistory("scan-report", "Patroli zigzag selesai; pemeriksaan visual pasif tidak menemukan kejanggalan pada tampilan."); setTimeout(() => dismiss(), 1400); }, durationSeconds * 1000);
  }, [clearBubbleResumeTimer, dismiss, durationSeconds, intervalSeconds, patrol.x, patrol.y, sessionLimit, startPatrol]);

  useEffect(() => { void getSpcaExtraSettings().then((settings) => { setSessionLimit(settings.passiveMaxAppearances); setRadarSettings({ enabled: settings.radarTrailEnabled, color: settings.radarTrailColor }); }); }, []);

  useEffect(() => {
    if (intervalSeconds <= 0 || durationSeconds <= 0) return;
    const first = setTimeout(appear, intervalSeconds * 1000);
    const repeat = setInterval(appear, intervalSeconds * 1000);
    return () => { clearTimeout(first); clearInterval(repeat); dismiss(true); };
  }, [appear, dismiss, durationSeconds, intervalSeconds]);
  useEffect(() => { const animation = Animated.loop(Animated.sequence([Animated.timing(bob, { toValue: 1, duration: 1100, useNativeDriver: true }), Animated.timing(bob, { toValue: 0, duration: 1100, useNativeDriver: true })])); animation.start(); return () => { animation.stop(); bob.setValue(0); clearBubbleResumeTimer(); }; }, [bob, clearBubbleResumeTimer]);
  useEffect(() => {
    if (!visible) { radarTrail.stopAnimation(); radarTrail.setValue(0); return; }
    const animation = Animated.loop(Animated.timing(radarTrail, { toValue: 1, duration: 1550, useNativeDriver: true }));
    animation.start();
    return () => { animation.stop(); radarTrail.setValue(0); };
  }, [radarTrail, visible]);
  useEffect(() => {
    if (!visible || !radarSettings.enabled) { radarSweep.stopAnimation(); radarSweep.setValue(0); return; }
    const animation = Animated.loop(Animated.timing(radarSweep, { toValue: 1, duration: 1200, useNativeDriver: true }));
    animation.start();
    return () => { animation.stop(); radarSweep.setValue(0); };
  }, [radarSettings.enabled, radarSweep, visible]);

  const evadeOnce = (next: number) => {
    clearBubbleResumeTimer();
    setEvasive(true); patrolAnimation.current?.stop();
    const farLeft = -Math.min(250, Math.max(142, width * 0.64));
    evasionAnimation.current = Animated.sequence([
      animatePointTo(patrol, farLeft, next % 2 ? -30 : 18, 260),
      animatePointTo(patrol, -Math.min(92, Math.max(54, width * 0.2)), next % 2 ? 12 : -28, 290),
    ]);
    evasionAnimation.current.start(() => { setEvasive(false); setBubble(null); if (visibleRef.current) startPatrol(); });
  };
  const onPress = () => {
    const next = tapCount + 1;
    setTapCount(next);
    const message = next === 1 ? "Aduh sakit" : next === 2 ? "Sakit Woyy" : next === 3 ? "Z#*z:!#" : messages[(next - 4) % messages.length];
    patrolAnimation.current?.stop();
    evasionAnimation.current?.stop();
    clearBubbleResumeTimer();
    setEvasive(false);
    setMood(next >= 3 ? "angry" : "hurt");
    setBubble(message);
    void recordSpcaPassiveHistory(next >= 4 ? "evasion" : "tap", `Ketukan ${next}: Robot menampilkan gelembung, menunggu agar terbaca, lalu mengelak sebelum melanjutkan patroli.`);
    bubbleResumeTimer.current = setTimeout(() => {
      bubbleResumeTimer.current = null;
      if (visibleRef.current) evadeOnce(next);
    }, 1500);
  };

  if (!visible) return null;
  const face = mood === "angry" ? { brows: "╲ ╱", eyes: "> <", mouth: "⌁" } : mood === "hurt" ? { brows: "╲ ╱", eyes: "× ×", mouth: "⌢" } : { brows: "— —", eyes: "◉ ◉", mouth: "—" };
  return <Animated.View pointerEvents="auto" style={[passiveStyles.container, evasive && passiveStyles.evasiveRobot, { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }, ...animatedPointTransform(patrol)] }]}> 
    {radarSettings.enabled ? <><Animated.View pointerEvents="none" style={[passiveStyles.radarTrail, { borderColor: `${radarColor}D0`, opacity: radarTrail.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0.3, 0.1, 0] }), transform: [{ scale: radarTrail.interpolate({ inputRange: [0, 1], outputRange: [0.64, 1.55] }) }] }]} /><Animated.View pointerEvents="none" style={[passiveStyles.radarTrailInner, { borderColor: `${radarColor}A8`, opacity: radarTrail.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.22, 0.06, 0] }), transform: [{ scale: radarTrail.interpolate({ inputRange: [0, 1], outputRange: [0.44, 1.08] }) }] }]} /><Animated.View pointerEvents="none" style={[passiveStyles.radarSweepLine, { backgroundColor: radarColor, transform: [{ rotate: radarSweep.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]} /></> : null}
    {bubble ? <View pointerEvents="none" style={[passiveStyles.bubble, { backgroundColor: colors.foreground }]}><Text style={[passiveStyles.bubbleText, { color: colors.background }]}>{bubble}</Text></View> : null}
    <Pressable accessibilityRole="button" accessibilityLabel="Buka Pusat SPCA aktif" accessibilityHint="Ketuk untuk membuka pemeriksaan dan solusi SPCA. Tekan tahan untuk reaksi robot." delayLongPress={420} hitSlop={14} onLongPress={onPress} onPress={() => router.push("/spca-diagnostics" as never)} style={passiveStyles.robotButton}><ExpoImage source={ROBOT_ASSET} contentFit="contain" style={passiveStyles.robotImage} /><View pointerEvents="none" style={passiveStyles.faceScreen}><Text style={passiveStyles.faceBrows}>{face.brows}</Text><Text style={passiveStyles.faceEyes}>{face.eyes}</Text><Text style={passiveStyles.faceMouth}>{face.mouth}</Text></View><MaterialIcons pointerEvents="none" name="search" size={34} color="#A3F8FF" style={passiveStyles.magnifier} /></Pressable>
  </Animated.View>;
}

function Action({ label, icon, color, onPress }: { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: `${color}12` }, pressed && styles.pressed]}><MaterialIcons name={icon} size={19} color={color} /><Text numberOfLines={2} style={[styles.actionLabel, { color }]}>{label}</Text></Pressable>; }

function ExpressionAccessory({ accessory, scale, inset, emphasis = false }: { accessory?: FaceAccessory; scale: number; inset: number; emphasis?: boolean }) {
  if (accessory === "tears") return <><MaterialIcons pointerEvents="none" name="water-drop" size={Math.max(9, 11 * scale)} color="#61D6FF" style={[styles.tearsLeft, { left: inset + 17 * scale, top: inset + 30 * scale }]} /><MaterialIcons pointerEvents="none" name="water-drop" size={Math.max(9, 11 * scale)} color="#61D6FF" style={[styles.tearsRight, { right: inset + 17 * scale, top: inset + 30 * scale }]} /></>;
  if (accessory === "tissue") return <Text pointerEvents="none" accessibilityLabel="Tisu diarahkan ke hidung Robot SPCA" style={[styles.tissue, { fontSize: Math.max(12, 15 * scale), right: inset + 5 * scale, top: inset + 28 * scale }]}>🧻</Text>;
  if (accessory === "magnifier") return <MaterialIcons pointerEvents="none" accessibilityLabel="Kaca pembesar mengarah ke mata Robot SPCA" name="search" size={Math.max(emphasis ? 23 : 13, (emphasis ? 28 : 17) * scale)} color="#A3F8FF" style={[styles.magnifier, { left: inset + (emphasis ? 20 : 27) * scale, top: inset + (emphasis ? 8 : 15) * scale }]} />;
  if (accessory === "steam") return <View pointerEvents="none" accessibilityLabel="Asap lelah di atas kepala Robot SPCA" style={[styles.steam, { left: inset + 19 * scale, top: inset - 8 * scale }]}><Text style={[styles.steamPuff, { fontSize: Math.max(8, 10 * scale) }]}>☁</Text><Text style={[styles.steamPuffSmall, { fontSize: Math.max(6, 8 * scale) }]}>☁</Text></View>;
  if (accessory === "sulky") return <Text pointerEvents="none" accessibilityLabel="Awan kecil ekspresi ngambek Robot SPCA" style={[styles.sulkyMark, { fontSize: Math.max(10, 13 * scale), right: inset + 1 * scale, top: inset + 8 * scale }]}>☁</Text>;
  return null;
}

const styles = StyleSheet.create({
  floatingArea: { elevation: 50, height: HIT_SIZE, position: "absolute", width: HIT_SIZE, zIndex: 50 }, floatLayer: { alignItems: "center", justifyContent: "center" }, floatGlow: { borderRadius: 999, borderWidth: 1, position: "absolute" }, ghost: { height: HIT_SIZE, left: 0, position: "absolute", top: 0, width: HIT_SIZE }, robotButton: { alignItems: "center", elevation: 51, height: HIT_SIZE, justifyContent: "center", width: HIT_SIZE, zIndex: 52 }, robotImage: { height: ROBOT_SIZE, width: ROBOT_SIZE }, faceScreen: { alignItems: "center", backgroundColor: "rgba(2,12,25,.9)", borderColor: "rgba(99,225,255,.9)", borderRadius: 7, borderWidth: 0.7, height: 19, justifyContent: "center", left: 21, overflow: "hidden", position: "absolute", top: 23, width: 30 }, faceBrows: { color: "#7CE7F3", fontSize: 5.5, fontWeight: "900", lineHeight: 5.5, position: "absolute", top: 0 }, faceEyes: { color: "#C5FAFF", fontSize: 7, fontWeight: "900", lineHeight: 7, position: "absolute", top: 5 }, faceMouth: { color: "#A3F8FF", fontSize: 8, fontWeight: "900", lineHeight: 8, position: "absolute", top: 11 }, emotionBadge: { alignItems: "center", justifyContent: "center", position: "absolute", zIndex: 3 }, emotionSymbol: { fontWeight: "900", includeFontPadding: false, textAlign: "center", textShadowColor: "rgba(2,12,25,.45)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 2 }, tearsLeft: { position: "absolute", zIndex: 3 }, tearsRight: { position: "absolute", zIndex: 3 }, tissue: { position: "absolute", transform: [{ rotate: "-22deg" }], zIndex: 3 }, magnifier: { position: "absolute", transform: [{ rotate: "-22deg" }], zIndex: 3 }, steam: { flexDirection: "row", position: "absolute", zIndex: 3 }, steamPuff: { color: "#CBD5E1", marginRight: -3, opacity: 0.9 }, steamPuffSmall: { color: "#CBD5E1", marginTop: -4, opacity: 0.7 }, sulkyMark: { color: "#94A3B8", position: "absolute", zIndex: 3 }, faceEffect: { position: "absolute", zIndex: 2 }, bubble: { borderRadius: 14, maxWidth: 184, paddingHorizontal: 11, paddingVertical: 9, position: "absolute", zIndex: 49 }, bubbleText: { fontSize: 11, fontWeight: "700", lineHeight: 16 }, miniScannerBubble: { alignItems: "center", flexDirection: "row", gap: 8, minWidth: 142 }, miniScanner: { alignItems: "center", borderRadius: 9, borderWidth: 1, height: 34, justifyContent: "center", overflow: "hidden", width: 34 }, miniScannerGrid: { height: "100%", position: "absolute", width: "100%" }, miniScannerLine: { height: 1.5, left: 2, position: "absolute", right: 2 }, miniScannerTitleRow: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "space-between" }, miniScannerTitle: { fontSize: 11, fontWeight: "900" }, miniScannerPercent: { fontSize: 10, fontWeight: "900" }, miniScannerDetail: { fontSize: 9, marginTop: 1 }, pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] }, scrim: { alignItems: "center", backgroundColor: "rgba(3,13,25,.48)", flex: 1, justifyContent: "center", padding: 18 }, sheet: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, maxHeight: "86%", maxWidth: 500, padding: 17, width: "100%" }, sheetHeader: { alignItems: "center", flexDirection: "row", gap: 10 }, robotPreview: { height: 54, width: 54 }, robotPreviewImage: { height: "100%", width: "100%" }, sheetHeading: { flex: 1, minWidth: 0 }, title: { fontSize: 17, fontWeight: "800" }, subtitle: { fontSize: 11, marginTop: 2 }, close: { alignItems: "center", height: 36, justifyContent: "center", width: 36 }, sheetContent: { gap: 11, paddingTop: 14 }, analysisCard: { alignItems: "flex-start", borderRadius: 14, flexDirection: "row", gap: 9, padding: 11 }, radar: { alignItems: "center", borderRadius: 12, borderWidth: 1.5, height: 24, justifyContent: "center", width: 24 }, radarBeam: { borderRadius: 3, height: 8, position: "absolute", right: 1, top: 1, width: 2 }, flex: { flex: 1, minWidth: 0 }, analysisTitle: { fontSize: 13, fontWeight: "800" }, analysisText: { fontSize: 11, lineHeight: 16, marginTop: 3 }, captureProgress: { alignItems: "center", borderRadius: 13, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 66 }, captureText: { fontSize: 13, fontWeight: "800" }, actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, action: { alignItems: "center", borderRadius: 12, flexGrow: 1, minHeight: 62, padding: 8, width: "46%" }, actionLabel: { fontSize: 11, fontWeight: "800", lineHeight: 14, marginTop: 5, textAlign: "center" }, cacheLabel: { fontSize: 11, fontWeight: "700", textAlign: "center" }, previewCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" }, preview: { backgroundColor: "#101828", height: 260, width: "100%" }, previewActions: { flexDirection: "row", gap: 7, padding: 8 }, reportLabel: { fontSize: 12, fontWeight: "800" }, input: { borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, fontSize: 12, lineHeight: 17, minHeight: 120, padding: 11, textAlignVertical: "top" }, linkRow: { alignItems: "center", borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, minHeight: 48, paddingHorizontal: 11 }, linkText: { flex: 1, fontSize: 12, fontWeight: "700" },
});

const passiveStyles = StyleSheet.create({
  container: { bottom: 76, elevation: 52, height: 72, position: "absolute", right: -38, width: 72, zIndex: 80 },
  evasiveRobot: { opacity: 0.92 },
  radarTrail: { borderRadius: 999, borderWidth: 1, height: 68, left: 2, position: "absolute", top: 3, width: 68 },
  radarTrailInner: { borderRadius: 999, borderWidth: 1, height: 52, left: 10, position: "absolute", top: 11, width: 52 },
  radarSweepLine: { height: 1.5, left: 36, position: "absolute", top: 35, transformOrigin: "0% 50%", width: 29 },
  robotButton: { alignItems: "center", elevation: 53, height: 72, justifyContent: "center", width: 72, zIndex: 81 },
  robotImage: { height: 54, width: 54 },
  faceScreen: { alignItems: "center", backgroundColor: "rgba(2,12,25,.9)", borderColor: "rgba(99,225,255,.9)", borderRadius: 6, borderWidth: 0.7, height: 18, justifyContent: "center", left: 21, position: "absolute", top: 27, width: 29 },
  faceBrows: { color: "#7CE7F3", fontSize: 5.5, fontWeight: "900", lineHeight: 5.5, position: "absolute", top: 0 },
  faceEyes: { color: "#D9F8FF", fontSize: 8, fontWeight: "900", includeFontPadding: false, lineHeight: 8, position: "absolute", top: 4 },
  faceMouth: { color: "#A3F8FF", fontSize: 8, fontWeight: "900", includeFontPadding: false, lineHeight: 8, position: "absolute", top: 10 },
  magnifier: { left: 32, position: "absolute", top: 22, transform: [{ rotate: "-25deg" }] },
  bubble: { borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, position: "absolute", right: 52, top: -15, width: 224 },
  bubbleText: { fontSize: 12, fontWeight: "800", lineHeight: 17, textAlign: "left" },
});
const bubbleMotionStyles = StyleSheet.create({ container: { position: "absolute", top: -6, zIndex: 49 } });
