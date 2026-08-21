import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Location from "expo-location";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useRef, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AiraCard, EmptyState, LoadingState, OutlineButton } from "@/components/aira-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFinance } from "@/lib/finance/finance-context";
import { getNextPrayer, type PrayerTime, fetchPrayerTimes } from "@/lib/prayer-times";
import { disablePrayerReminders, getPrayerAlarmPermissionStatus, requestPrayerAlarmPermission, schedulePrayerAlarmTest, schedulePrayerReminders } from "@/lib/reminders";

type AlarmToneMode = "device_default" | "custom_audio";
type ManualLocation = { label: string; latitude: number; longitude: number };
const MANUAL_LOCATIONS: ManualLocation[] = [
  { label: "Kecamatan Setiabudi, Jakarta", latitude: -6.2088, longitude: 106.8456 },
  { label: "Bandung, Jawa Barat", latitude: -6.9175, longitude: 107.6191 },
  { label: "Surabaya, Jawa Timur", latitude: -7.2575, longitude: 112.7521 },
  { label: "Yogyakarta, DI Yogyakarta", latitude: -7.7956, longitude: 110.3695 },
  { label: "Medan, Sumatera Utara", latitude: 3.5952, longitude: 98.6722 },
  { label: "Makassar, Sulawesi Selatan", latitude: -5.1477, longitude: 119.4327 },
  { label: "Denpasar, Bali", latitude: -8.6500, longitude: 115.2167 },
];
const CALCULATION_METHODS = [
  { value: 20, label: "Kementerian Agama Indonesia", detail: "Rekomendasi untuk wilayah Indonesia" },
  { value: 2, label: "Islamic Society of North America", detail: "Metode umum Amerika Utara" },
  { value: 3, label: "Muslim World League", detail: "Metode internasional" },
  { value: 4, label: "Umm Al-Qura University", detail: "Metode Arab Saudi" },
] as const;
const prayerCacheKey = (date: Date, method: number, latitude: number, longitude: number) => `vaira.prayer-cache.${date.toISOString().slice(0, 10)}.${method}.${latitude.toFixed(3)}.${longitude.toFixed(3)}`;

function delaySeconds(value: string) {
  const seconds = Number(value);
  return Number.isInteger(seconds) && seconds >= 1 && seconds <= 300 ? seconds : null;
}

const LOCATION_TIMEOUT_MS = 60_000;
const LAST_KNOWN_MAX_AGE_MS = 15 * 60_000;

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

export default function PrayerTimesScreen() {
  const colors = useColors();
  const { state, updateProfile } = useFinance();
  const [items, setItems] = useState<PrayerTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationElapsedSeconds, setLocationElapsedSeconds] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState(state.profile.prayerLocation?.label ?? "Lokasi belum dipilih");
  const [locationSource, setLocationSource] = useState(state.profile.prayerLocation?.source ?? "manual");
  const [accuracyMeters, setAccuracyMeters] = useState(state.profile.prayerLocation?.accuracyMeters);
  const [lastSyncAt, setLastSyncAt] = useState(state.profile.prayerLocation?.scheduleUpdatedAt);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [calculationMethod, setCalculationMethod] = useState(state.profile.prayerCalculationMethod ?? 20);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alarmTestSeconds, setAlarmTestSeconds] = useState("5");
  const [toneMode, setToneMode] = useState<AlarmToneMode>(state.profile.prayerAlarmTone);
  const [customToneUri, setCustomToneUri] = useState(state.profile.prayerAlarmCustomToneUri);
  const [customToneName, setCustomToneName] = useState(state.profile.prayerAlarmCustomToneName);
  const [vibrationEnabled, setVibrationEnabled] = useState(state.profile.prayerAlarmVibrationEnabled);
  const [permissionStatus, setPermissionStatus] = useState<{ granted: boolean; status: string; channelBlocked: boolean } | null>(null);
  const customTonePlayer = useAudioPlayer();
  const testTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (testTimer.current) clearTimeout(testTimer.current); customTonePlayer.release(); }, [customTonePlayer]);

  const refresh = async () => {
    setIsLoading(true);
    setLocationElapsedSeconds(0);
    setLocationError(null);
    const locationAttemptStartedAt = Date.now();
    const locationProgressTimer = setInterval(() => {
      setLocationElapsedSeconds(Math.min(60, Math.floor((Date.now() - locationAttemptStartedAt) / 1000)));
    }, 1_000);
    try {
      const permission = await withTimeout(Location.requestForegroundPermissionsAsync(), LOCATION_TIMEOUT_MS, "Permintaan izin lokasi terlalu lama.");
      if (permission.status !== "granted") {
        const message = "Izin lokasi belum diberikan. Aktifkan izin lokasi saat digunakan dari Pengaturan perangkat.";
        setLocationError(message);
        Alert.alert("Izin lokasi diperlukan", message);
        return;
      }
      const available = await withTimeout(Location.hasServicesEnabledAsync(), 3_000, "Pemeriksaan layanan lokasi terlalu lama.");
      if (!available) {
        const message = "Layanan lokasi perangkat sedang mati. Aktifkan GPS/lokasi, lalu tekan coba lagi.";
        setLocationError(message);
        Alert.alert("Lokasi belum aktif", message);
        return;
      }
      const provider = await withTimeout(Location.getProviderStatusAsync(), 3_000, "Status provider lokasi terlalu lama.").catch(() => null);
      if (provider && !provider.locationServicesEnabled) {
        const message = "Provider lokasi perangkat tidak aktif. Nyalakan Lokasi/GPS dari panel cepat Android, lalu coba lagi.";
        setLocationError(message);
        Alert.alert("Provider lokasi tidak aktif", message);
        return;
      }
      let result: Location.LocationObject | null = null;
      let resolvedSource: "gps" | "last_known" = "gps";
      try {
        result = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, mayShowUserSettingsDialog: true }), LOCATION_TIMEOUT_MS, "Pencarian lokasi presisi melewati batas waktu.");
      } catch {
        const lastKnown = await withTimeout(Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS, requiredAccuracy: 1_000 }), 2_000, "Lokasi terakhir tidak tersedia.").catch(() => null);
        if (lastKnown) {
          result = lastKnown;
          resolvedSource = "last_known";
          setLocationError("Lokasi presisi belum merespons. Jadwal dimuat dari lokasi terakhir perangkat; coba lagi di luar ruangan untuk memperbarui koordinat.");
        }
      }
      if (!result) {
        const message = provider?.gpsAvailable === false && provider?.networkAvailable === false
          ? "GPS dan lokasi jaringan tidak tersedia. Nyalakan Lokasi perangkat dan pastikan mode akurasi tinggi aktif, lalu coba lagi."
          : "Lokasi presisi belum diperoleh dalam 60 detik. Pastikan GPS aktif, gunakan area terbuka, dan tunggu hingga perangkat memperoleh sinyal lokasi.";
        setLocationError(message);
        Alert.alert("Lokasi belum ditemukan", message);
        return;
      }
      const source = resolvedSource;
      const schedule = await withTimeout(fetchPrayerTimes(result.coords.latitude, result.coords.longitude, new Date(), calculationMethod), LOCATION_TIMEOUT_MS, "Layanan jadwal salat terlalu lama merespons.");
      setItems(schedule);
      await AsyncStorage.setItem(prayerCacheKey(new Date(), calculationMethod, result.coords.latitude, result.coords.longitude), JSON.stringify(schedule));
      const accuracy = result.coords.accuracy ?? undefined;
      setLocationSource(source); setAccuracyMeters(accuracy); setLastSyncAt(new Date().toISOString());
      if (accuracy && accuracy > 1_000) setLocationError(`Lokasi berhasil ditemukan, tetapi akurasinya rendah (±${Math.round(accuracy)} m). Jadwal tetap dimuat; coba perbarui di area terbuka untuk hasil lebih presisi.`);
      let label = `${result.coords.latitude.toFixed(4)}, ${result.coords.longitude.toFixed(4)}`;
      try { const address = await withTimeout(Location.reverseGeocodeAsync({ latitude: result.coords.latitude, longitude: result.coords.longitude }), 3_000, "Reverse geocode terlalu lama."); const place = address[0]; label = [place?.city, place?.region].filter(Boolean).join(", ") || label; } catch { /* Koordinat tetap cukup untuk perhitungan jadwal. */ }
      setLocationLabel(label);
      const syncedAt = new Date().toISOString();
      await updateProfile({ prayerCalculationMethod: calculationMethod, prayerLocation: { latitude: result.coords.latitude, longitude: result.coords.longitude, label, updatedAt: syncedAt, source, accuracyMeters: accuracy, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, scheduleDate: new Date().toISOString().slice(0, 10), scheduleUpdatedAt: syncedAt, calculationMethod } });
    } catch (error) {
      const message = error instanceof Error && error.message.includes("jadwal") ? "Layanan jadwal salat belum merespons. Periksa koneksi lalu coba lagi." : "Lokasi belum tersedia. Periksa izin dan GPS, lalu coba lagi.";
      setLocationError(message);
      Alert.alert("Jadwal belum dapat dimuat", message);
    } finally { clearInterval(locationProgressTimer); setIsLoading(false); }
  };

  const savedPrayerLocation = state.profile.prayerLocation;
  useEffect(() => {
    if (!savedPrayerLocation) return;
    setLocationSource(savedPrayerLocation.source ?? "manual"); setAccuracyMeters(savedPrayerLocation.accuracyMeters); setLastSyncAt(savedPrayerLocation.scheduleUpdatedAt ?? savedPrayerLocation.updatedAt);
    const today = new Date();
    const loadSaved = async () => {
      const cacheKey = prayerCacheKey(today, calculationMethod, savedPrayerLocation.latitude, savedPrayerLocation.longitude);
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) setItems(JSON.parse(cached, (_key, value) => _key === "date" ? new Date(value) : value) as PrayerTime[]);
      } catch { /* Cache korup diabaikan dan jadwal akan diperbarui. */ }
      const isFresh = savedPrayerLocation.scheduleDate === today.toISOString().slice(0, 10) && savedPrayerLocation.timezone === Intl.DateTimeFormat().resolvedOptions().timeZone && (savedPrayerLocation.calculationMethod ?? calculationMethod) === calculationMethod && Date.now() - new Date(savedPrayerLocation.scheduleUpdatedAt ?? savedPrayerLocation.updatedAt).getTime() < 30 * 60_000;
      if (isFresh) return;
      try { const schedule = await fetchPrayerTimes(savedPrayerLocation.latitude, savedPrayerLocation.longitude, today, calculationMethod); setItems(schedule); await AsyncStorage.setItem(cacheKey, JSON.stringify(schedule)); } catch { /* Jadwal cache tetap tampil ketika offline. */ }
    };
    void loadSaved();
  }, [calculationMethod, savedPrayerLocation]);

  const chooseManualLocation = async (location: ManualLocation) => {
    setManualOpen(false); setIsLoading(true); setLocationError(null);
    try {
      const today = new Date();
      const schedule = await withTimeout(fetchPrayerTimes(location.latitude, location.longitude, today, calculationMethod), LOCATION_TIMEOUT_MS, "Layanan jadwal salat terlalu lama merespons.");
      const syncedAt = new Date().toISOString();
      setItems(schedule); setLocationLabel(location.label); setLocationSource("manual"); setAccuracyMeters(undefined); setLastSyncAt(syncedAt);
      await AsyncStorage.setItem(prayerCacheKey(today, calculationMethod, location.latitude, location.longitude), JSON.stringify(schedule));
      await updateProfile({ prayerCalculationMethod: calculationMethod, prayerLocation: { latitude: location.latitude, longitude: location.longitude, label: location.label, updatedAt: syncedAt, scheduleUpdatedAt: syncedAt, scheduleDate: today.toISOString().slice(0, 10), source: "manual", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, calculationMethod } });
    } catch { const message = "Lokasi manual dipilih, tetapi jadwal belum dapat dimuat. Periksa koneksi lalu coba lagi."; setLocationError(message); Alert.alert("Jadwal belum tersedia", message); } finally { setIsLoading(false); }
  };

  const filteredManualLocations = MANUAL_LOCATIONS.filter((item) => item.label.toLowerCase().includes(manualQuery.trim().toLowerCase()));

  const toggleAlarm = async (value: boolean) => {
    if (!value) { await disablePrayerReminders(); await updateProfile({ prayerReminderEnabled: false }); return; }
    if (items.length === 0) { Alert.alert("Muat jadwal terlebih dahulu", "Aktifkan lokasi presisi agar jadwal hari ini tersedia sebelum alarm dinyalakan."); return; }
    const enabled = await schedulePrayerReminders(items, vibrationEnabled);
    if (enabled) { await updateProfile({ prayerReminderEnabled: true }); Alert.alert("Alarm diaktifkan", "Pengingat salat tersisa hari ini sudah dijadwalkan dengan prioritas alarm, bunyi, dan getar sesuai pengaturan perangkat."); } else Alert.alert("Izin sistem diperlukan", "Aktifkan notifikasi dan izin alarm terjadwal untuk V A I R A  A I di Pengaturan sistem, lalu coba kembali.", [{ text: "Nanti", style: "cancel" }, { text: "Buka pengaturan", onPress: () => { void Linking.openSettings(); } }]);
  };

  const persistAlarmSettings = async (patch: { tone?: AlarmToneMode; toneUri?: string; toneName?: string; vibration?: boolean }) => {
    const nextTone = patch.tone ?? toneMode;
    const nextUri = patch.toneUri ?? customToneUri;
    const nextName = patch.toneName ?? customToneName;
    const nextVibration = patch.vibration ?? vibrationEnabled;
    setToneMode(nextTone); setCustomToneUri(nextUri); setCustomToneName(nextName); setVibrationEnabled(nextVibration);
    await updateProfile({ prayerAlarmTone: nextTone, prayerAlarmCustomToneUri: nextUri, prayerAlarmCustomToneName: nextName, prayerAlarmVibrationEnabled: nextVibration });
    if (Platform.OS !== "web") await requestPrayerAlarmPermission(nextVibration);
    if (state.profile.prayerReminderEnabled && items.length) await schedulePrayerReminders(items, nextVibration);
  };

  const chooseCustomTone = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["audio/*"], copyToCacheDirectory: true });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset?.uri) return;
      if (asset.size && asset.size > 25 * 1024 * 1024) { Alert.alert("Audio terlalu besar", "Gunakan file audio maksimal 25 MB untuk tes alarm."); return; }
      let persistentUri = asset.uri;
      if (Platform.OS !== "web" && FileSystem.documentDirectory) {
        const extension = asset.name?.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "audio";
        persistentUri = `${FileSystem.documentDirectory}prayer-alarm-tone-${Date.now()}.${extension}`;
        await FileSystem.copyAsync({ from: asset.uri, to: persistentUri });
      }
      await persistAlarmSettings({ tone: "custom_audio", toneUri: persistentUri, toneName: asset.name || "Audio pilihan" });
      Alert.alert("Nada khusus dipilih", "Nada akan diputar saat tes alarm ketika aplikasi terbuka. Alarm terjadwal di latar belakang tetap menggunakan nada default perangkat karena batasan sistem operasi.");
    } catch { Alert.alert("Audio belum dipilih", "Buka penyimpanan internal lalu pilih file audio yang dapat diputar."); }
  };

  const refreshPrayerAlarmStatus = async () => {
    const status = await getPrayerAlarmPermissionStatus();
    setPermissionStatus(status);
    return status;
  };

  const checkPrayerAlarmStatus = async () => {
    const status = await refreshPrayerAlarmStatus();
    if (status.status === "granted" && !status.channelBlocked) Alert.alert("Izin alarm aktif", "Notifikasi alarm adzan diizinkan dan channel prioritas belum diblokir.");
    else Alert.alert("Izin alarm perlu diperiksa", status.channelBlocked ? "Channel alarm adzan diblokir dari pengaturan Android." : "Notifikasi atau izin alarm terjadwal belum aktif.", [{ text: "Nanti", style: "cancel" }, { text: "Buka pengaturan", onPress: () => { void Linking.openSettings(); } }]);
  };

  const openAlarmVolumeSettings = () => { Alert.alert("Volume alarm diatur sistem", "Volume alarm adzan mengikuti volume Alarm perangkat, bukan volume media. Buka pengaturan sistem untuk menaikkan atau menurunkan volumenya.", [{ text: "Batal", style: "cancel" }, { text: "Buka pengaturan", onPress: () => { void Linking.openSettings(); } }]); };

  const allowPrayerAlarm = async () => {
    const allowed = await requestPrayerAlarmPermission(vibrationEnabled);
    Alert.alert(allowed ? "Alarm salat diizinkan" : "Izin belum tersedia", allowed ? "Notifikasi alarm salat memakai prioritas alarm, suara, dan getar perangkat." : "Aktifkan notifikasi serta izin alarm terjadwal V A I R A  A I dari pengaturan sistem, lalu coba kembali.", allowed ? [{ text: "Oke" }] : [{ text: "Nanti", style: "cancel" }, { text: "Buka pengaturan", onPress: () => { void Linking.openSettings(); } }]);
  };

  const testPrayerAlarm = async () => {
    const seconds = delaySeconds(alarmTestSeconds);
    if (!seconds) { Alert.alert("Jeda tes belum valid", "Masukkan 1 sampai 300 detik."); return; }
    const scheduled = await schedulePrayerAlarmTest(seconds, vibrationEnabled);
    if (!scheduled) { Alert.alert("Tes belum dapat dijalankan", "Izinkan notifikasi pada perangkat terlebih dahulu. Tes alarm tidak tersedia pada pratinjau web."); return; }
    if (testTimer.current) clearTimeout(testTimer.current);
    if (toneMode === "custom_audio" && customToneUri) {
      testTimer.current = setTimeout(() => { void setAudioModeAsync({ playsInSilentMode: true }).then(() => { customTonePlayer.replace(customToneUri); customTonePlayer.play(); }); }, seconds * 1000);
    }
    Alert.alert("Tes alarm dijadwalkan", toneMode === "custom_audio" && customToneUri ? `Dalam ${seconds} detik, alarm notifikasi dan pratinjau audio khusus akan diputar saat aplikasi terbuka.` : `Alarm salat akan berbunyi dalam ${seconds} detik menggunakan nada default perangkat.`);
  };

  const next = getNextPrayer(items);
  const openQiblaCompass = () => {
    const location = state.profile.prayerLocation;
    router.push({ pathname: "/qibla-compass", params: location ? { latitude: String(location.latitude), longitude: String(location.longitude), label: location.label, source: location.source } : { label: locationLabel } });
  };
  const locationSearchLabel = isLoading ? `Mencari lokasi presisi… ${Math.min(60, locationElapsedSeconds)}/60 dtk` : "Gunakan lokasi presisi";

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={21} color={colors.foreground} /></Pressable><View style={styles.headerCopy}><Text style={[styles.title, { color: colors.foreground }]}>Waktu salat</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{locationLabel}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Buka kompas arah kiblat" onPress={openQiblaCompass} style={({ pressed }) => [styles.gear, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="explore" size={21} color={colors.success} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Buka pengaturan alarm salat" onPress={() => { setSettingsOpen(true); void refreshPrayerAlarmStatus(); }} style={({ pressed }) => [styles.gear, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="settings" size={21} color={colors.primary} /></Pressable></View>
    <AiraCard style={[styles.nextCard, { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={styles.nextCaption}>Waktu salat berikutnya</Text><Text style={styles.nextTitle}>{next ? `${next.label} · ${next.time}` : "Pilih lokasi untuk memuat jadwal"}</Text><Text style={styles.nextDetail}>Jadwal dihitung dari koordinat lokasi saat Anda memperbaruinya.</Text></AiraCard>
    <View style={[styles.alarmRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.alarmLeft}><View style={[styles.alarmIcon, { backgroundColor: `${colors.warning}16` }]}><MaterialIcons name="alarm" size={21} color={colors.warning} /></View><View style={styles.headerCopy}><Text style={[styles.alarmTitle, { color: colors.foreground }]}>Alarm waktu salat</Text><Text style={[styles.alarmDetail, { color: colors.muted }]}>Berdering untuk jadwal tersisa hari ini</Text></View></View><Switch value={state.profile.prayerReminderEnabled} onValueChange={(value) => { void toggleAlarm(value); }} trackColor={{ false: colors.border, true: `${colors.primary}80` }} thumbColor={state.profile.prayerReminderEnabled ? colors.primary : "#FFFFFF"} /></View>
    <OutlineButton label="Buka kompas arah kiblat" icon="explore" onPress={openQiblaCompass} />
    <OutlineButton label={locationSearchLabel} icon="my-location" onPress={() => { if (!isLoading) void refresh(); }} />
    <OutlineButton label="Pilih lokasi manual" icon="map" onPress={() => { setManualQuery(""); setManualOpen(true); }} />
    {locationSource ? <View style={[styles.locationMeta, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.locationMetaTitle, { color: colors.foreground }]}>{locationSource === "gps" ? "GPS presisi" : locationSource === "last_known" ? "Lokasi terakhir perangkat" : "Lokasi manual"}{accuracyMeters ? ` · akurasi ±${Math.round(accuracyMeters)} m` : ""}</Text><Text style={[styles.locationMetaDetail, { color: colors.muted }]}>{lastSyncAt ? `Sinkron terakhir ${new Date(lastSyncAt).toLocaleString("id-ID")}` : "Belum pernah disinkronkan"}</Text></View> : null}
    {isLoading ? <LoadingState /> : items.length === 0 ? <EmptyState icon={locationError ? "location-off" : "mosque"} title={locationError ? "Lokasi belum siap" : "Jadwal belum tersedia"} detail={locationError ?? "Tekan “Gunakan lokasi presisi” untuk menghitung Subuh, Dzuhur, Ashar, Maghrib, dan Isya sesuai lokasi Anda."} /> : <View style={styles.list}>{items.map((item) => <AiraCard key={item.key} style={styles.prayerRow}><View style={[styles.prayerDot, { backgroundColor: next?.key === item.key ? colors.primary : `${colors.primary}16` }]}><MaterialIcons name={next?.key === item.key ? "schedule" : "brightness-2"} size={18} color={next?.key === item.key ? "#FFFFFF" : colors.primary} /></View><Text style={[styles.prayerLabel, { color: colors.foreground }]}>{item.label}</Text><Text style={[styles.prayerTime, { color: next?.key === item.key ? colors.primary : colors.foreground }]}>{item.time}</Text></AiraCard>)}</View>}
  </ScrollView>
  <Modal transparent visible={manualOpen} animationType="fade" onRequestClose={() => setManualOpen(false)}><View style={styles.scrim}><View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.sheetHeader}><View style={[styles.sheetIcon, { backgroundColor: `${colors.primary}16` }]}><MaterialIcons name="map" size={21} color={colors.primary} /></View><View style={styles.headerCopy}><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Pilih lokasi manual</Text><Text style={[styles.sheetSubtitle, { color: colors.muted }]}>Gunakan saat GPS sulit diperoleh.</Text></View><Pressable accessibilityLabel="Tutup pilihan lokasi manual" onPress={() => setManualOpen(false)} style={styles.close}><MaterialIcons name="close" size={22} color={colors.muted} /></Pressable></View><TextInput value={manualQuery} onChangeText={setManualQuery} placeholder="Cari kota atau kecamatan" placeholderTextColor={colors.muted} style={[styles.testInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /><ScrollView contentContainerStyle={styles.sheetContent}>{filteredManualLocations.map((item) => <Pressable key={item.label} onPress={() => { void chooseManualLocation(item); }} style={({ pressed }) => [styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="location-city" size={20} color={colors.primary} /><View style={styles.headerCopy}><Text style={[styles.toneTitle, { color: colors.foreground }]}>{item.label}</Text><Text style={[styles.toneDetail, { color: colors.muted }]}>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text></View><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>)}</ScrollView></View></View></Modal><Modal transparent visible={settingsOpen} animationType="fade" onRequestClose={() => setSettingsOpen(false)}><View style={styles.scrim}><View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.sheetHeader}><View style={[styles.sheetIcon, { backgroundColor: `${colors.warning}16` }]}><MaterialIcons name="settings" size={21} color={colors.warning} /></View><View style={styles.headerCopy}><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Pengaturan alarm salat</Text><Text style={[styles.sheetSubtitle, { color: colors.muted }]}>Atur nada, getar, izin, dan tes alarm.</Text></View><Pressable accessibilityLabel="Tutup pengaturan alarm" onPress={() => setSettingsOpen(false)} style={styles.close}><MaterialIcons name="close" size={22} color={colors.muted} /></Pressable></View><ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Tampilan Waktu Salat</Text><View style={[styles.settingRow, { borderColor: colors.border }]}><View style={styles.headerCopy}><Text style={[styles.toneTitle, { color: colors.foreground }]}>Tampilkan di Beranda</Text><Text style={[styles.toneDetail, { color: colors.muted }]}>Aktif secara default. Saat dimatikan, pintasan Waktu Salat disembunyikan dari Beranda tanpa menghapus jadwal, lokasi, atau alarm.</Text></View><Switch value={state.profile.uiPreferences.prayerTimesVisible ?? true} onValueChange={(value) => { void updateProfile({ uiPreferences: { ...state.profile.uiPreferences, prayerTimesVisible: value } }); }} trackColor={{ false: colors.border, true: `${colors.primary}80` }} thumbColor={(state.profile.uiPreferences.prayerTimesVisible ?? true) ? colors.primary : "#FFFFFF"} /></View>
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Jadwal</Text><View style={[styles.testPanel, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.testHint, { color: colors.muted }]}>Jadwal salat dihitung dari lokasi presisi. Sakelar Alarm waktu salat di halaman utama mengaktifkan atau menonaktifkan jadwal hari ini.</Text></View>
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Metode perhitungan jadwal</Text><View style={[styles.testPanel, { borderColor: colors.border, backgroundColor: colors.surface }]}>{CALCULATION_METHODS.map((method) => <Pressable key={method.value} onPress={() => { setCalculationMethod(method.value); void updateProfile({ prayerCalculationMethod: method.value }); }} style={({ pressed }) => [styles.toneChoice, { backgroundColor: calculationMethod === method.value ? `${colors.primary}12` : colors.surface, borderColor: calculationMethod === method.value ? colors.primary : colors.border }, pressed && styles.pressed]}><MaterialIcons name={calculationMethod === method.value ? "check-circle" : "radio-button-unchecked"} size={20} color={calculationMethod === method.value ? colors.primary : colors.muted} /><View style={styles.headerCopy}><Text style={[styles.toneTitle, { color: colors.foreground }]}>{method.label}</Text><Text style={[styles.toneDetail, { color: colors.muted }]}>{method.detail}</Text></View></Pressable>)}</View><OutlineButton label="Buka pengaturan lokasi perangkat" icon="settings" onPress={() => { void Linking.openSettings(); }} />
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Nada alarm</Text>
    <Pressable onPress={() => { void persistAlarmSettings({ tone: "device_default" }); }} style={({ pressed }) => [styles.toneChoice, { backgroundColor: toneMode === "device_default" ? `${colors.primary}12` : colors.surface, borderColor: toneMode === "device_default" ? colors.primary : colors.border }, pressed && styles.pressed]}><MaterialIcons name="notifications-active" size={20} color={toneMode === "device_default" ? colors.primary : colors.muted} /><View style={styles.headerCopy}><Text style={[styles.toneTitle, { color: colors.foreground }]}>Nada bawaan perangkat</Text><Text style={[styles.toneDetail, { color: colors.muted }]}>Digunakan untuk alarm terjadwal saat aplikasi di latar belakang.</Text></View>{toneMode === "device_default" ? <MaterialIcons name="check-circle" size={20} color={colors.primary} /> : null}</Pressable>
    <Pressable onPress={() => { void chooseCustomTone(); }} style={({ pressed }) => [styles.toneChoice, { backgroundColor: toneMode === "custom_audio" ? `${colors.primary}12` : colors.surface, borderColor: toneMode === "custom_audio" ? colors.primary : colors.border }, pressed && styles.pressed]}><MaterialIcons name="audiotrack" size={20} color={toneMode === "custom_audio" ? colors.primary : colors.muted} /><View style={styles.headerCopy}><Text style={[styles.toneTitle, { color: colors.foreground }]}>Audio dari penyimpanan internal</Text><Text numberOfLines={2} style={[styles.toneDetail, { color: colors.muted }]}>{customToneName ? `Dipilih: ${customToneName}` : "Pilih file audio untuk pratinjau tes saat aplikasi terbuka."}</Text></View>{toneMode === "custom_audio" ? <MaterialIcons name="check-circle" size={20} color={colors.primary} /> : null}</Pressable>
    {toneMode === "custom_audio" ? <OutlineButton label="Ganti audio pilihan" icon="folder-open" onPress={() => { void chooseCustomTone(); }} /> : null}
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Izin sistem</Text><View style={[styles.testPanel, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.testHint, { color: colors.muted }]}>Status di bawah ini berasal dari perangkat. Jika belum aktif, buka Pengaturan sistem lalu perbarui status. Agar alarm tetap tepat waktu, izinkan aktivitas latar belakang dan kecualikan V A I R A  A I dari penghemat baterai jika perangkat menundanya.</Text><View style={styles.permissionRow}><MaterialIcons name={permissionStatus?.granted ? "check-circle" : "radio-button-unchecked"} size={18} color={permissionStatus?.granted ? colors.success : colors.muted} /><Text style={[styles.toneDetail, { color: colors.foreground }]}>Notifikasi {permissionStatus?.granted ? "diizinkan" : "belum diperiksa"}</Text></View><View style={styles.permissionRow}><MaterialIcons name={permissionStatus?.channelBlocked ? "error" : permissionStatus?.granted ? "check-circle" : "radio-button-unchecked"} size={18} color={permissionStatus?.channelBlocked ? colors.error : permissionStatus?.granted ? colors.success : colors.muted} /><Text style={[styles.toneDetail, { color: colors.foreground }]}>{permissionStatus?.channelBlocked ? "Channel alarm diblokir" : "Channel alarm prioritas siap atau belum diperiksa"}</Text></View><OutlineButton label="Perbarui status izin" icon="refresh" onPress={() => { void refreshPrayerAlarmStatus(); }} /></View>
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Suara & getar</Text>
    <View style={[styles.settingRow, { borderColor: colors.border }]}><View style={styles.headerCopy}><Text style={[styles.toneTitle, { color: colors.foreground }]}>Getar alarm</Text><Text style={[styles.toneDetail, { color: colors.muted }]}>Getar mengikuti alarm salat dan tes alarm pada perangkat.</Text></View><Switch value={vibrationEnabled} onValueChange={(value) => { void persistAlarmSettings({ vibration: value }); }} trackColor={{ false: colors.border, true: `${colors.primary}80` }} thumbColor={vibrationEnabled ? colors.primary : "#FFFFFF"} /></View>
    <View style={[styles.testPanel, { borderColor: colors.border, backgroundColor: `${colors.warning}09` }]}><Text style={[styles.testTitle, { color: colors.foreground }]}>Tes alarm adzan</Text><Text style={[styles.testHint, { color: colors.muted }]}>Masukkan 1–300 detik. Nada khusus diputar pada tes ketika aplikasi terbuka; alarm terjadwal di latar belakang mengikuti aturan dan nada default sistem.</Text><Text style={[styles.testLabel, { color: colors.foreground }]}>Jeda tes alarm (detik)</Text><TextInput value={alarmTestSeconds} onChangeText={setAlarmTestSeconds} keyboardType="number-pad" maxLength={3} placeholder="5" placeholderTextColor={colors.muted} style={[styles.testInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /><View style={styles.testActions}><OutlineButton label="Cek status izin" icon="verified-user" onPress={() => { void checkPrayerAlarmStatus(); }} /><OutlineButton label="Izinkan alarm" icon="notifications-active" onPress={() => { void allowPrayerAlarm(); }} /><OutlineButton label="Atur volume alarm" icon="volume-up" onPress={openAlarmVolumeSettings} /><OutlineButton label="Tes alarm" icon="alarm-on" onPress={() => { void testPrayerAlarm(); }} /></View></View>
  </ScrollView></View></View></Modal>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { gap: 13, paddingBottom: 24 }, locationMeta: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 13, paddingVertical: 10 }, locationMetaTitle: { fontSize: 11, fontWeight: "800" }, locationMetaDetail: { fontSize: 10, marginTop: 3 }, header: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 2 }, headerCopy: { flex: 1, minWidth: 0 }, back: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, gear: { alignItems: "center", borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, height: 44, justifyContent: "center", width: 44 }, title: { fontSize: 21, fontWeight: "800" }, subtitle: { fontSize: 12, marginTop: 2 }, nextCard: { padding: 19 }, nextCaption: { color: "#DCEAFF", fontSize: 12, fontWeight: "700" }, nextTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "800", marginTop: 5 }, nextDetail: { color: "#DCEAFF", fontSize: 12, lineHeight: 18, marginTop: 5 }, alarmRow: { alignItems: "center", borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", padding: 14 }, alarmLeft: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10, minWidth: 0 }, alarmIcon: { alignItems: "center", borderRadius: 13, height: 40, justifyContent: "center", width: 40 }, alarmTitle: { fontSize: 14, fontWeight: "800" }, alarmDetail: { fontSize: 11, marginTop: 2 }, list: { gap: 9 }, prayerRow: { alignItems: "center", flexDirection: "row", gap: 11, padding: 13 }, prayerDot: { alignItems: "center", borderRadius: 13, height: 38, justifyContent: "center", width: 38 }, prayerLabel: { flex: 1, fontSize: 14, fontWeight: "800" }, prayerTime: { fontSize: 16, fontWeight: "800" }, scrim: { alignItems: "center", backgroundColor: "rgba(3,13,25,.48)", flex: 1, justifyContent: "center", padding: 18 }, sheet: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, maxHeight: "86%", maxWidth: 500, padding: 17, width: "100%" }, sheetHeader: { alignItems: "center", flexDirection: "row", gap: 10 }, sheetIcon: { alignItems: "center", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, sheetTitle: { fontSize: 16, fontWeight: "800" }, sheetSubtitle: { fontSize: 11, marginTop: 2 }, close: { alignItems: "center", height: 36, justifyContent: "center", width: 36 }, sheetContent: { gap: 10, paddingTop: 14 }, sectionLabel: { fontSize: 12, fontWeight: "900" }, toneChoice: { alignItems: "center", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 68, padding: 11 }, toneTitle: { fontSize: 13, fontWeight: "800" }, toneDetail: { fontSize: 11, lineHeight: 16, marginTop: 2 }, settingRow: { alignItems: "center", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, minHeight: 68, padding: 11 }, permissionRow: { alignItems: "center", flexDirection: "row", gap: 8, minHeight: 28 }, testPanel: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 8, padding: 11 }, testTitle: { fontSize: 13, fontWeight: "800" }, testHint: { fontSize: 11, lineHeight: 16 }, testLabel: { fontSize: 11, fontWeight: "800", marginTop: 2 }, testInput: { borderRadius: 13, borderWidth: 1, fontSize: 14, minHeight: 46, paddingHorizontal: 12 }, testActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, pressed: { opacity: 0.7 },
});
