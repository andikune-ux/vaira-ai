import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";

import { useColors } from "@/hooks/use-colors";
import { getAiraModePresentation } from "@/lib/aira-mode-presentation";
import { getUpcomingEvent } from "@/lib/calendar-data";
import { useFinance } from "@/lib/finance/finance-context";
import { fetchPrayerTimes, getNextPrayer, type PrayerTime } from "@/lib/prayer-times";

type WeatherSnapshot = { temperature: number; apparentTemperature: number; weatherCode: number };
type HeroCardKind = "aira" | "greeting" | "prayer" | "weather";

const weatherCondition = (code: number) => code === 0 ? { label: "Cerah", icon: "wb-sunny" as const } : [1, 2, 3].includes(code) ? { label: "Berawan", icon: "cloud" as const } : [45, 48].includes(code) ? { label: "Berkabut", icon: "foggy" as const } : [51, 53, 55, 56, 57].includes(code) ? { label: "Gerimis", icon: "grain" as const } : [61, 63, 65, 66, 67, 80, 81, 82].includes(code) ? { label: "Hujan", icon: "umbrella" as const } : { label: "Badai", icon: "thunderstorm" as const };

export function AiraModeStatusCard() {
  const base = useColors();
  const { state } = useFinance();
  const presentation = getAiraModePresentation(state.profile.aiMode, base, state.profile.uiPreferences.modeAccentColors?.[state.profile.aiMode]);
  const colors = presentation.palette;
  const location = state.profile.prayerLocation;
  const prayerVisible = state.profile.uiPreferences.prayerTimesVisible ?? true;
  const greetingEnabled = state.profile.uiPreferences.greetingCardEnabled ?? true;
  const intervalSeconds = Math.max(5, Math.min(60, state.profile.uiPreferences.greetingCardIntervalSeconds ?? 10));
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [cardIndex, setCardIndex] = useState(0);
  const transition = useRef(new Animated.Value(1)).current;
  const cards = useMemo<HeroCardKind[]>(() => ["aira", "greeting", ...(prayerVisible ? ["prayer" as const] : []), "weather"], [prayerVisible]);

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(timer); }, []);
  useEffect(() => { setCardIndex((current) => Math.min(current, cards.length - 1)); }, [cards.length]);
  useEffect(() => {
    let active = true;
    if (!location) { setWeather(null); setPrayerTimes([]); setWeatherUnavailable(false); return () => { active = false; }; }
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
    void fetch(weatherUrl).then(async (response) => {
      if (!response.ok) throw new Error("Cuaca belum tersedia.");
      const payload = await response.json() as { current?: { temperature_2m?: number; apparent_temperature?: number; weather_code?: number } };
      const current = payload.current;
      if (typeof current?.temperature_2m !== "number" || typeof current.apparent_temperature !== "number" || typeof current.weather_code !== "number") throw new Error("Data cuaca belum lengkap.");
      if (active) { setWeather({ temperature: current.temperature_2m, apparentTemperature: current.apparent_temperature, weatherCode: current.weather_code }); setWeatherUnavailable(false); }
    }).catch(() => { if (active) { setWeather(null); setWeatherUnavailable(true); } });
    void fetchPrayerTimes(location.latitude, location.longitude, new Date(), state.profile.prayerCalculationMethod ?? 20).then((items) => { if (active) setPrayerTimes(items); }).catch(() => { if (active) setPrayerTimes([]); });
    return () => { active = false; };
  }, [location, state.profile.prayerCalculationMethod]);
  useEffect(() => {
    if (!greetingEnabled) return;
    const timer = setInterval(() => {
      transition.setValue(0);
      setCardIndex((current) => (current + 1) % cards.length);
      Animated.timing(transition, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, intervalSeconds * 1_000);
    return () => clearInterval(timer);
  }, [cards.length, greetingEnabled, intervalSeconds, transition]);

  const kind = cards[cardIndex] ?? "aira";
  const nextPrayer = getNextPrayer(prayerTimes, now);
  const remaining = nextPrayer ? Math.max(0, nextPrayer.date.getTime() - now.getTime()) : 0;
  const countdown = nextPrayer ? `${Math.floor(remaining / 3_600_000)} jam ${Math.floor((remaining % 3_600_000) / 60_000)} menit lagi` : null;
  const event = getUpcomingEvent(now);
  const weatherVisual = weather ? weatherCondition(weather.weatherCode) : null;
  const motion = { opacity: transition, transform: [{ translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] };
  const card = kind === "greeting" ? { kicker: "KARTU UCAPAN", title: event ? `Selamat ${event.title}` : "Selamat beraktivitas hari ini", detail: event?.detail ?? "Semoga hari Anda dipenuhi kelancaran dan keberkahan.", icon: "celebration" as const, background: "#17443D", accent: "#E6C563", onPress: () => {} } : kind === "prayer" ? { kicker: "WAKTU SALAT", title: nextPrayer ? `${nextPrayer.label} · ${nextPrayer.time}` : "Atur lokasi salat", detail: nextPrayer && countdown ? `${countdown} lagi` : "Pilih lokasi dari menu Waktu Salat agar jadwal ditampilkan.", icon: "mosque" as const, background: "#0F766E", accent: "#CFFAFE", onPress: () => router.push("/prayer-times" as never) } : kind === "weather" ? { kicker: "CUACA HARI INI", title: weather ? `${Math.round(weather.temperature)}°C · ${weatherVisual?.label}` : weatherUnavailable ? "Cuaca belum tersedia" : location ? "Memuat cuaca…" : "Atur lokasi salat", detail: weather ? `Terasa ${Math.round(weather.apparentTemperature)}°C · ${location?.label ?? "Lokasi tersimpan"}` : "Gunakan lokasi Waktu Salat untuk menampilkan suhu hari ini.", icon: weatherVisual?.icon ?? (weatherUnavailable ? "cloud-off" : "location-searching"), background: "#0369A1", accent: "#DFF7FF", onPress: () => router.push("/prayer-times" as never) } : { kicker: "AIRA SIAP MEMBANTU", title: state.profile.uiPreferences.homeHeadline, detail: state.profile.aiMode === "scientist" ? "Tim ahli Aira siap menganalisis pertanyaan Anda." : state.profile.aiMode === "hot_pro" ? "Aira Hot Pro siap menemani percakapan Anda." : "Tanya apa saja, buat catatan, atau selesaikan masalah Anda.", icon: state.profile.aiMode === "scientist" ? "science" as const : state.profile.aiMode === "hot_pro" ? "favorite" as const : "psychology" as const, background: colors.primary, accent: "#DFF7FF", onPress: () => router.push("/chat" as never) };

  return <View style={styles.wrap}><Animated.View style={motion}><Pressable accessibilityRole="button" accessibilityLabel={`Kartu ${card.kicker}`} onPress={card.onPress} style={[styles.card, { backgroundColor: card.background, borderColor: card.accent }]}><View style={styles.copy}><Text style={[styles.kicker, { color: card.accent }]}>{card.kicker}</Text><Text numberOfLines={2} style={styles.title}>{card.title}</Text><Text numberOfLines={2} style={[styles.detail, { color: card.accent }]}>{card.detail}</Text><View style={styles.dots}>{cards.map((entry, index) => <View key={entry} style={[styles.dot, { backgroundColor: index === cardIndex ? card.accent : "#FFFFFF55" }]} />)}</View></View><View style={[styles.icon, { backgroundColor: `${card.accent}24` }]}><MaterialIcons name={card.icon as keyof typeof MaterialIcons.glyphMap} size={25} color={card.accent} /></View></Pressable></Animated.View></View>;
}

const styles = StyleSheet.create({ wrap: { marginTop: -116, position: "relative", zIndex: 3 }, card: { alignItems: "center", borderRadius: 18, borderWidth: 2, flexDirection: "row", minHeight: 116, overflow: "hidden", paddingHorizontal: 17, paddingVertical: 15, shadowColor: "#0A1F36", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10 }, copy: { flex: 1, minWidth: 0 }, kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 1.05 }, title: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", lineHeight: 23, marginTop: 5 }, detail: { fontSize: 11, lineHeight: 16, marginTop: 5 }, icon: { alignItems: "center", borderRadius: 20, height: 42, justifyContent: "center", marginLeft: 12, width: 42 }, dots: { flexDirection: "row", gap: 5, marginTop: 11 }, dot: { borderRadius: 4, height: 5, width: 5 } });
