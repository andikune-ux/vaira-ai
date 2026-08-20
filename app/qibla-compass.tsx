import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { calculateQiblaBearing, formatBearing, normalizeDegrees, shortestAngleDelta } from "@/lib/qibla";

const fallbackCoordinates = { latitude: -6.2088, longitude: 106.8456, label: "Kecamatan Setiabudi, Jakarta", source: "manual" };

function numberParam(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) ? parsed : null;
}

function directionLabel(degrees: number) {
  const normalized = normalizeDegrees(degrees);
  if (normalized >= 337.5 || normalized < 22.5) return "Utara";
  if (normalized < 67.5) return "Timur Laut";
  if (normalized < 112.5) return "Timur";
  if (normalized < 157.5) return "Tenggara";
  if (normalized < 202.5) return "Selatan";
  if (normalized < 247.5) return "Barat Daya";
  if (normalized < 292.5) return "Barat";
  return "Barat Laut";
}

export default function QiblaCompassScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ latitude?: string; longitude?: string; label?: string; source?: string }>();
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState("Menyiapkan kompas…");
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const latitude = numberParam(params.latitude) ?? fallbackCoordinates.latitude;
  const longitude = numberParam(params.longitude) ?? fallbackCoordinates.longitude;
  const label = params.label ?? fallbackCoordinates.label;
  const source = params.source === "gps" ? "GPS presisi" : params.source === "last_known" ? "Lokasi terakhir perangkat" : params.latitude ? "Lokasi manual" : "Lokasi contoh";
  const qiblaBearing = useMemo(() => calculateQiblaBearing(latitude, longitude), [latitude, longitude]);
  const qiblaHeading = heading === null ? null : normalizeDegrees(qiblaBearing - heading);
  const isAligned = qiblaHeading !== null && Math.abs(shortestAngleDelta(0, qiblaHeading)) <= 5;
  const sensorGuidance = heading === null
    ? "Menunggu sensor arah perangkat…"
    : isAligned
      ? "Alhamdulillah, arah kiblat sudah sejajar. Jaga perangkat tetap datar."
      : "Putar perangkat perlahan hingga penunjuk emas mengarah tepat ke atas.";

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (Platform.OS === "web") {
        setStatus("Kompas sensor tersedia di aplikasi Android/iOS.");
        return;
      }
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          if (mounted) setStatus("Izin lokasi diperlukan untuk mengaktifkan kompas.");
          return;
        }
        subscriptionRef.current = await Location.watchHeadingAsync((event) => {
          if (!mounted) return;
          setHeading(event.trueHeading >= 0 ? event.trueHeading : event.magHeading);
          setAccuracy(event.accuracy);
          setStatus(event.accuracy === Location.LocationAccuracy.High ? "Kompas aktif · akurasi tinggi" : "Kompas aktif · kalibrasi mungkin diperlukan");
        }, () => {
          if (mounted) setStatus("Sensor arah belum tersedia. Gerakkan perangkat membentuk angka delapan untuk kalibrasi.");
        });
      } catch {
        if (mounted) setStatus("Kompas belum dapat diaktifkan. Pastikan sensor arah perangkat tersedia.");
      }
    };
    void start();
    return () => { mounted = false; subscriptionRef.current?.remove(); subscriptionRef.current = null; };
  }, []);

  const compassRotation = heading === null ? 0 : -heading;
  const arrowRotation = qiblaHeading === null ? qiblaBearing : qiblaHeading;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: `${colors.primary}16`, borderColor: colors.border }]}><MaterialIcons name="explore" size={24} color={colors.primary} /></View>
        <View style={styles.copy}><Text style={[styles.title, { color: colors.foreground }]}>Kompas arah kiblat</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{label}</Text></View>
      </View>
      <View style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="location-on" size={18} color={colors.primary} /><View style={styles.copy}><Text style={[styles.locationTitle, { color: colors.foreground }]}>{source}</Text><Text style={[styles.locationDetail, { color: colors.muted }]}>Arah kiblat dihitung dari koordinat lokasi ini.</Text></View></View>
      <View style={[styles.compassCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.compassFrame}>
          <View pointerEvents="none" style={[styles.qiblaHalo, { borderColor: `${colors.warning}55` }]} />
          <View style={[styles.compassDisc, { borderColor: `${colors.primary}45`, backgroundColor: colors.background, transform: [{ rotate: `${compassRotation}deg` }] }]}> 
            <Text style={[styles.north, { color: colors.error }]}>N</Text><Text style={[styles.east, { color: colors.muted }]}>E</Text><Text style={[styles.south, { color: colors.muted }]}>S</Text><Text style={[styles.west, { color: colors.muted }]}>W</Text>
            <View style={[styles.needle, { backgroundColor: colors.error }]} /><View style={[styles.needleTail, { backgroundColor: colors.muted }]} />
          </View>
          <View style={[styles.qiblaArrow, { borderBottomColor: colors.warning, transform: [{ rotate: `${arrowRotation}deg` }] }]}><MaterialIcons name="navigation" size={34} color={colors.warning} /><View style={[styles.kaabaMarker, { backgroundColor: isAligned ? colors.success : colors.warning }]}><MaterialIcons name="mosque" size={12} color="#FFFFFF" /></View></View>
          <View style={[styles.centerDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
        </View>
        <Text style={[styles.bearing, { color: colors.foreground }]}>{formatBearing(qiblaBearing)} · {directionLabel(qiblaBearing)}</Text>
        <Text style={[styles.qiblaPlace, { color: colors.warning }]}>{"Ka'bah · Makkah al-Mukarramah"}</Text>
        <Text style={[styles.instruction, { color: colors.muted }]}>{sensorGuidance}</Text>
        <View style={[styles.compassMeta, { backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}24` }]}><MaterialIcons name={isAligned ? "verified" : "screen-rotation"} size={16} color={isAligned ? colors.success : colors.primary} /><Text style={[styles.compassMetaText, { color: isAligned ? colors.success : colors.muted }]}>{isAligned ? "Sejajar dalam toleransi 5°" : "Arah kiblat dihitung dari posisi Anda ke Ka'bah"}</Text></View>
        <View style={[styles.status, { borderColor: isAligned ? colors.success : colors.border, backgroundColor: isAligned ? `${colors.success}12` : colors.background }]}>{heading === null ? <ActivityIndicator size="small" color={colors.primary} /> : <MaterialIcons name={isAligned ? "check-circle" : "sync"} size={17} color={isAligned ? colors.success : colors.primary} />}<Text style={[styles.statusText, { color: isAligned ? colors.success : colors.muted }]}>{status}{accuracy !== null ? ` · sensor ${accuracy}` : ""}</Text></View>
      </View>
      <View style={styles.note}><MaterialIcons name="info-outline" size={17} color={colors.muted} /><Text style={[styles.noteText, { color: colors.muted }]}>Jauhkan perangkat dari magnet, casing logam, dan benda elektronik saat mengkalibrasi.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Oke, kembali ke waktu salat" onPress={() => router.back()} style={({ pressed }) => [styles.okButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.okText}>Oke</Text></Pressable>
    </View>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: 14, paddingTop: 8, paddingBottom: 8 },
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  icon: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 48, justifyContent: "center", width: 48 },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 3 },
  locationCard: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, padding: 12 },
  locationTitle: { fontSize: 12, fontWeight: "800" },
  locationDetail: { fontSize: 10, marginTop: 3 },
  compassCard: { alignItems: "center", borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, flex: 1, justifyContent: "center", minHeight: 420, padding: 18 },
  compassFrame: { alignItems: "center", height: 280, justifyContent: "center", width: 280 },
  qiblaHalo: { borderRadius: 138, borderStyle: "dashed", borderWidth: 1, height: 276, position: "absolute", width: 276 },
  compassDisc: { alignItems: "center", borderRadius: 130, borderWidth: 3, height: 260, justifyContent: "center", width: 260 },
  north: { fontSize: 22, fontWeight: "900", position: "absolute", top: 18 },
  east: { fontSize: 18, fontWeight: "800", position: "absolute", right: 23 },
  south: { bottom: 18, fontSize: 18, fontWeight: "800", position: "absolute" },
  west: { fontSize: 18, fontWeight: "800", left: 23, position: "absolute" },
  needle: { height: 96, position: "absolute", width: 3 },
  needleTail: { height: 54, position: "absolute", transform: [{ rotate: "180deg" }], width: 3 },
  qiblaArrow: { alignItems: "center", position: "absolute", top: 2 },
  kaabaMarker: { alignItems: "center", borderRadius: 10, height: 20, justifyContent: "center", marginTop: -2, width: 20 },
  centerDot: { borderRadius: 9, borderWidth: 3, height: 18, position: "absolute", width: 18 },
  bearing: { fontSize: 20, fontWeight: "900", marginTop: 8 },
  qiblaPlace: { fontSize: 10, fontWeight: "900", letterSpacing: 0.35, marginTop: 3, textTransform: "uppercase" },
  instruction: { fontSize: 12, lineHeight: 18, marginTop: 5, textAlign: "center" },
  compassMeta: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 10, paddingHorizontal: 10, paddingVertical: 7 },
  compassMetaText: { fontSize: 10, fontWeight: "800" },
  status: { alignItems: "center", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 12, paddingHorizontal: 11, paddingVertical: 7 },
  statusText: { fontSize: 10, fontWeight: "700" },
  note: { alignItems: "flex-start", flexDirection: "row", gap: 7, paddingHorizontal: 3 },
  noteText: { flex: 1, fontSize: 10, lineHeight: 15 },
  okButton: { alignItems: "center", borderRadius: 14, justifyContent: "center", minHeight: 48, paddingHorizontal: 20 },
  okText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
