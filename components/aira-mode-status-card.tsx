import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { Alert, Animated, Easing, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captureRef } from "react-native-view-shot";

import { useColors } from "@/hooks/use-colors";
import { getAiraModePresentation } from "@/lib/aira-mode-presentation";
import { dayLabel, getDaysUntilEvent, getUpcomingEvent } from "@/lib/calendar-data";
import { loadCalendarReminders, type CalendarReminder } from "@/lib/calendar-reminders";
import { useFinance } from "@/lib/finance/finance-context";
import { fetchPrayerTimes, getNextPrayer, type PrayerTime } from "@/lib/prayer-times";

type WeatherSnapshot = { temperature: number; apparentTemperature: number; weatherCode: number };
type HeroCardKind = "aira" | "greeting" | "reminder" | "prayer" | "weather";

const weatherCondition = (code: number) => code === 0 ? { label: "Cerah", icon: "wb-sunny" as const } : [1, 2, 3].includes(code) ? { label: "Berawan", icon: "cloud" as const } : [45, 48].includes(code) ? { label: "Berkabut", icon: "foggy" as const } : [51, 53, 55, 56, 57].includes(code) ? { label: "Gerimis", icon: "grain" as const } : [61, 63, 65, 66, 67, 80, 81, 82].includes(code) ? { label: "Hujan", icon: "umbrella" as const } : { label: "Badai", icon: "thunderstorm" as const };
const eventCountdown = (days: number | null) => days === null ? "" : days === 0 ? "Hari ini" : days === 1 ? "1 hari lagi" : `${days} hari lagi`;
const reminderDate = (reminder: CalendarReminder) => new Date(`${reminder.date}T${reminder.time || "00:00"}:00`);
const reminderCountdown = (date: Date, now: Date) => { const remaining = Math.max(0, date.getTime() - now.getTime()); const days = Math.floor(remaining / 86_400_000); const hours = Math.floor((remaining % 86_400_000) / 3_600_000); const minutes = Math.floor((remaining % 3_600_000) / 60_000); return days > 0 ? `${days} hari ${hours} jam lagi` : hours > 0 ? `${hours} jam ${minutes} menit lagi` : `${minutes} menit lagi`; };
const eventSuggestion = (title: string) => { const value = title.toLowerCase(); return ["ramadan", "idul", "maulid", "muharam", "nuzul", "isra"].some((item) => value.includes(item)) ? "Siapkan doa dan kartu ucapan." : ["kemerdekaan", "pancasila", "kartini", "batik", "pahlawan", "sumpah", "guru", "pendidikan", "ibu", "anak", "lingkungan"].some((item) => value.includes(item)) ? "Bagikan kartu ucapan bertema hari ini." : "Buka kalender untuk menyiapkan agenda."; };
const eventPalette = (title?: string) => { const value = title?.toLowerCase() ?? ""; return value.includes("ramadan") || value.includes("idul") || value.includes("maulid") || value.includes("muharam") ? { background: "#17443D", accent: "#E6C563" } : value.includes("kemerdekaan") || value.includes("pancasila") || value.includes("kartini") ? { background: "#A51D2D", accent: "#FFE4E6" } : value.includes("batik") ? { background: "#5B3A29", accent: "#FDE8C8" } : { background: "#253A71", accent: "#DCEBFF" }; };

export function AiraModeStatusCard() {
  const base = useColors();
  const { state } = useFinance();
  const preferences = state.profile.uiPreferences;
  const presentation = getAiraModePresentation(state.profile.aiMode, base, preferences.modeAccentColors?.[state.profile.aiMode]);
  const colors = presentation.palette;
  const location = state.profile.prayerLocation;
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [cardIndex, setCardIndex] = useState(0);
  const [greetingPreviewVisible, setGreetingPreviewVisible] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const transition = useRef(new Animated.Value(1)).current;
  const greetingMotion = useRef(new Animated.Value(0)).current;
  const greetingPreviewRef = useRef<View>(null);
  const pauseUntil = useRef(0);
  const showAira = preferences.showAiraHeroCard ?? true;
  const showGreeting = preferences.showGreetingHeroCard ?? true;
  const showReminder = preferences.showReminderHeroCard ?? true;
  const showPrayer = (preferences.showPrayerHeroCard ?? true) && (preferences.prayerTimesVisible ?? true);
  const showWeather = preferences.showWeatherHeroCard ?? true;
  const greetingEnabled = preferences.greetingCardEnabled ?? true;
  const intervalSeconds = Math.max(5, Math.min(60, preferences.greetingCardIntervalSeconds ?? 10));

  const refreshWeather = useCallback(async () => {
    if (!location) { setWeather(null); setWeatherUnavailable(false); return; }
    setWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Cuaca belum tersedia.");
      const payload = await response.json() as { current?: { temperature_2m?: number; apparent_temperature?: number; weather_code?: number } };
      const current = payload.current;
      if (typeof current?.temperature_2m !== "number" || typeof current.apparent_temperature !== "number" || typeof current.weather_code !== "number") throw new Error("Data cuaca belum lengkap.");
      setWeather({ temperature: current.temperature_2m, apparentTemperature: current.apparent_temperature, weatherCode: current.weather_code });
      setWeatherUnavailable(false);
    } catch { setWeather(null); setWeatherUnavailable(true); } finally { setWeatherLoading(false); }
  }, [location]);

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(timer); }, []);
  useEffect(() => { let active = true; const refresh = () => { void loadCalendarReminders().then((items) => { if (active) setReminders(items); }); }; refresh(); const timer = setInterval(refresh, 30_000); return () => { active = false; clearInterval(timer); }; }, []);
  useEffect(() => { void refreshWeather(); let active = true; if (!location) { setPrayerTimes([]); return () => { active = false; }; } void fetchPrayerTimes(location.latitude, location.longitude, new Date(), state.profile.prayerCalculationMethod ?? 20).then((items) => { if (active) setPrayerTimes(items); }).catch(() => { if (active) setPrayerTimes([]); }); return () => { active = false; }; }, [location, refreshWeather, state.profile.prayerCalculationMethod]);
  useEffect(() => { const loop = Animated.loop(Animated.sequence([Animated.timing(greetingMotion, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(greetingMotion, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])); loop.start(); return () => loop.stop(); }, [greetingMotion]);

  const upcomingReminders = useMemo(() => reminders.map((reminder) => ({ reminder, date: reminderDate(reminder) })).filter((item) => item.date.getTime() >= now.getTime()).sort((left, right) => left.date.getTime() - right.date.getTime()), [now, reminders]);
  const upcomingReminder = upcomingReminders[0];
  const isUrgentReminder = Boolean(upcomingReminder && upcomingReminder.date.getTime() - now.getTime() <= 86_400_000);
  const agendaToday = upcomingReminders.filter((item) => item.date.toDateString() === now.toDateString()).length;
  const cards = useMemo<HeroCardKind[]>(() => {
    const list: HeroCardKind[] = [];
    if (showReminder && upcomingReminder && isUrgentReminder) list.push("reminder");
    if (showAira) list.push("aira");
    if (showGreeting) list.push("greeting");
    if (showReminder && upcomingReminder && !isUrgentReminder) list.push("reminder");
    if (showPrayer) list.push("prayer");
    if (showWeather) list.push("weather");
    return list.length ? list : ["aira"];
  }, [isUrgentReminder, showAira, showGreeting, showPrayer, showReminder, showWeather, upcomingReminder]);
  useEffect(() => { setCardIndex((current) => Math.min(current, cards.length - 1)); }, [cards.length]);

  const advanceCard = useCallback((direction: 1 | -1, pause = true) => { if (pause) pauseUntil.current = Date.now() + 12_000; transition.setValue(0); setCardIndex((current) => (current + direction + cards.length) % cards.length); Animated.timing(transition, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [cards.length, transition]);
  useEffect(() => { if (!greetingEnabled || cards.length < 2) return; const timer = setInterval(() => { if (Date.now() >= pauseUntil.current) advanceCard(1, false); }, intervalSeconds * 1_000); return () => clearInterval(timer); }, [advanceCard, cards.length, greetingEnabled, intervalSeconds]);

  const kind = cards[cardIndex] ?? "aira";
  const nextPrayer = getNextPrayer(prayerTimes, now);
  const remaining = nextPrayer ? Math.max(0, nextPrayer.date.getTime() - now.getTime()) : 0;
  const prayerCountdown = nextPrayer ? `${Math.floor(remaining / 3_600_000)} jam ${Math.floor((remaining % 3_600_000) / 60_000)} menit lagi` : null;
  const event = getUpcomingEvent(now);
  const eventDays = event ? getDaysUntilEvent(event, now) : null;
  const greetingTitle = event ? `Selamat ${event.title}` : "Selamat beraktivitas hari ini";
  const greetingDetail = event ? `${eventCountdown(eventDays)} · Saran Aira: ${eventSuggestion(event.title)}` : "Saran Aira: buat agenda sederhana agar hari lebih terarah.";
  const eventTheme = eventPalette(event?.title);
  const weatherVisual = weather ? weatherCondition(weather.weatherCode) : null;
  const motion = { opacity: transition, transform: [{ translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] };
  const greetingStyle = { transform: [{ scale: greetingMotion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }], opacity: greetingMotion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) };
  const openGreetingPreview = () => { pauseUntil.current = Date.now() + 12_000; setMessageDraft(event ? `Semoga ${event.title} membawa kedamaian, kebahagiaan, dan keberkahan untuk kita semua.` : "Semoga hari Anda dipenuhi kelancaran dan kebahagiaan."); setGreetingPreviewVisible(true); };
  const saveGreetingImage = async () => { try { if (!greetingPreviewRef.current) return; const uri = await captureRef(greetingPreviewRef, { format: "png", quality: 1, result: "tmpfile" }); const permission = await MediaLibrary.requestPermissionsAsync(); if (!permission.granted) { Alert.alert("Izin penyimpanan diperlukan", "Izinkan akses foto agar kartu dapat disimpan ke galeri."); return; } await MediaLibrary.saveToLibraryAsync(uri); Alert.alert("Kartu tersimpan", "Kartu ucapan telah disimpan ke galeri."); } catch { Alert.alert("Kartu belum tersimpan", "Coba simpan kembali dari pratinjau."); } };
  const shareGreetingImage = async () => { try { if (!greetingPreviewRef.current) return; const uri = await captureRef(greetingPreviewRef, { format: "png", quality: 1, result: "tmpfile" }); if (!(await Sharing.isAvailableAsync())) { Alert.alert("Berbagi belum tersedia", "Fitur berbagi tidak tersedia pada perangkat ini."); return; } await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Bagikan kartu ucapan" }); } catch { Alert.alert("Kartu belum dibagikan", "Coba kembali dari pratinjau."); } };
  const card = kind === "greeting" ? { kicker: "KARTU UCAPAN", title: greetingTitle, detail: greetingDetail, icon: "celebration" as const, background: eventTheme.background, accent: eventTheme.accent, actionLabel: "Edit & bagikan", action: openGreetingPreview } : kind === "reminder" && upcomingReminder ? { kicker: isUrgentReminder ? "PENGINGAT MENDEKAT" : "PENGINGAT KALENDER", title: upcomingReminder.reminder.title, detail: `${reminderCountdown(upcomingReminder.date, now)} · ${agendaToday > 1 ? `${agendaToday} agenda hari ini · ` : ""}Saran Aira: cek detail kalender.`, icon: "notifications-active" as const, background: isUrgentReminder ? "#B45309" : "#6D28D9", accent: "#F3E8FF", actionLabel: "Buka kalender", action: () => router.push("/finance" as never) } : kind === "prayer" ? { kicker: "WAKTU SALAT", title: nextPrayer ? `${nextPrayer.label} · ${nextPrayer.time}` : "Jadwal salat belum tersedia", detail: nextPrayer && prayerCountdown ? `${prayerCountdown} · Atur lokasi untuk jadwal yang lebih presisi.` : "Pilih lokasi agar jadwal salat dapat dihitung.", icon: "mosque" as const, background: "#0F766E", accent: "#CFFAFE", actionLabel: "Buka Waktu Salat", action: () => router.push("/prayer-times" as never) } : kind === "weather" ? { kicker: "CUACA HARI INI", title: weather ? `${Math.round(weather.temperature)}°C · ${weatherVisual?.label}` : weatherLoading ? "Memperbarui cuaca…" : weatherUnavailable ? "Cuaca belum tersedia" : "Lokasi cuaca belum dipilih", detail: weather ? `Terasa ${Math.round(weather.apparentTemperature)}°C · ${location?.label ?? "Lokasi tersimpan"}` : weatherUnavailable ? "Tekan refresh untuk mencoba lagi." : "Pilih lokasi cuaca agar suhu dan kondisi hari ini dapat ditampilkan.", icon: weatherVisual?.icon ?? (weatherLoading ? "sync" : weatherUnavailable ? "cloud-off" : "location-searching"), background: "#0369A1", accent: "#DFF7FF", actionLabel: weatherLoading ? "Memuat…" : "Refresh cuaca", action: () => { pauseUntil.current = Date.now() + 12_000; void refreshWeather(); } } : { kicker: "AIRA SIAP MEMBANTU", title: preferences.homeHeadline, detail: state.profile.aiMode === "scientist" ? "Tim ahli Aira siap menganalisis pertanyaan Anda." : state.profile.aiMode === "hot_pro" ? "Aira Hot Pro siap menemani percakapan Anda." : "Tanya apa saja, buat catatan, atau selesaikan masalah Anda.", icon: state.profile.aiMode === "scientist" ? "science" as const : state.profile.aiMode === "hot_pro" ? "favorite" as const : "psychology" as const, background: colors.primary, accent: "#DFF7FF", actionLabel: "Tanya Aira", action: () => router.push("/chat" as never) };

  return <><View style={styles.wrap}><Animated.View style={motion}><View style={[styles.card, { backgroundColor: card.background, borderColor: card.accent }]}><Pressable accessibilityRole="button" accessibilityLabel={`Buka ${card.kicker}`} onPress={card.action} style={styles.cardBody}><Animated.View style={[styles.copy, kind === "greeting" && greetingStyle]}><Text style={[styles.kicker, { color: card.accent }]}>{card.kicker}</Text><Text numberOfLines={2} style={styles.title}>{card.title}</Text><Text numberOfLines={2} style={[styles.detail, { color: card.accent }]}>{card.detail}</Text><Text style={[styles.actionHint, { color: card.accent }]}>{card.actionLabel}</Text><View style={styles.dots}>{cards.map((entry, index) => <View key={`${entry}-${index}`} style={[styles.dot, { backgroundColor: index === cardIndex ? card.accent : "#FFFFFF55" }]} />)}</View></Animated.View><View style={[styles.icon, { backgroundColor: `${card.accent}24` }]}><MaterialIcons name={card.icon as keyof typeof MaterialIcons.glyphMap} size={25} color={card.accent} /></View></Pressable><View style={styles.manualNavigation}><Pressable accessibilityRole="button" accessibilityLabel="Kartu sebelumnya" onPress={() => advanceCard(-1)} style={styles.navButton}><MaterialIcons name="chevron-left" size={22} color="#FFFFFF" /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Kartu berikutnya" onPress={() => advanceCard(1)} style={styles.navButton}><MaterialIcons name="chevron-right" size={22} color="#FFFFFF" /></Pressable></View></View></Animated.View></View><Modal visible={greetingPreviewVisible} transparent animationType="fade" onRequestClose={() => setGreetingPreviewVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: base.background }]}><View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: base.foreground }]}>Edit kartu ucapan</Text><Pressable accessibilityLabel="Tutup editor kartu ucapan" onPress={() => setGreetingPreviewVisible(false)}><MaterialIcons name="close" size={24} color={base.foreground} /></Pressable></View><TextInput value={messageDraft} onChangeText={setMessageDraft} multiline maxLength={320} placeholder="Tulis kata-kata kartu ucapan" placeholderTextColor={base.muted} style={[styles.editor, { color: base.foreground, borderColor: base.border }]} /><View ref={greetingPreviewRef} collapsable={false} style={[styles.imageCard, { backgroundColor: eventTheme.background, borderColor: eventTheme.accent }]}><Animated.View style={greetingStyle}><Text style={[styles.imageKicker, { color: eventTheme.accent }]}>KARTU UCAPAN VAIRA AI</Text><Text style={[styles.imageOrnament, { color: eventTheme.accent }]}>✦  ☾  ✦</Text><Text style={styles.imageTitle}>{greetingTitle}</Text><Text style={[styles.imageDetail, { color: eventTheme.accent }]}>{event ? `${event.detail} · ${dayLabel(event.dateObject)}` : "Semoga hari Anda dipenuhi kebaikan."}</Text><Text style={[styles.imageMessage, { color: "#FFFFFF" }]}>{messageDraft}</Text><Text style={[styles.imageCountdown, { color: eventTheme.accent }]}>{eventCountdown(eventDays)}</Text><Text style={[styles.imageFooter, { color: eventTheme.accent }]}>Dibuat oleh V A I R A AI</Text></Animated.View></View><View style={styles.modalActions}><Pressable accessibilityRole="button" onPress={() => { void saveGreetingImage(); }} style={[styles.modalButton, { borderColor: base.border }]}><MaterialIcons name="download" size={20} color={base.primary} /><Text style={[styles.modalButtonText, { color: base.foreground }]}>Simpan</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { void shareGreetingImage(); }} style={[styles.modalButton, styles.shareButton]}><MaterialIcons name="share" size={20} color="#FFFFFF" /><Text style={styles.shareButtonText}>Bagikan</Text></Pressable></View></View></View></Modal></>;
}

const styles = StyleSheet.create({ wrap: { marginTop: -116, position: "relative", zIndex: 3 }, card: { borderRadius: 18, borderWidth: 2, minHeight: 122, overflow: "hidden", shadowColor: "#0A1F36", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10 }, cardBody: { alignItems: "center", flexDirection: "row", minHeight: 122, paddingHorizontal: 17, paddingRight: 61, paddingVertical: 14 }, copy: { flex: 1, minWidth: 0 }, kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 1.05 }, title: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", lineHeight: 23, marginTop: 5 }, detail: { fontSize: 10, lineHeight: 14, marginTop: 4 }, actionHint: { fontSize: 10, fontWeight: "900", marginTop: 5 }, icon: { alignItems: "center", borderRadius: 20, height: 42, justifyContent: "center", marginLeft: 10, width: 42 }, dots: { flexDirection: "row", gap: 5, marginTop: 8 }, dot: { borderRadius: 4, height: 5, width: 5 }, manualNavigation: { gap: 4, position: "absolute", right: 8, top: 8 }, navButton: { alignItems: "center", backgroundColor: "#00000026", borderColor: "#FFFFFF42", borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, height: 30, justifyContent: "center", width: 30 }, modalBackdrop: { alignItems: "center", backgroundColor: "#071221B8", flex: 1, justifyContent: "center", padding: 20 }, modalCard: { borderRadius: 20, gap: 14, maxWidth: 430, padding: 17, width: "100%" }, modalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, modalTitle: { fontSize: 16, fontWeight: "900" }, editor: { borderRadius: 13, borderWidth: 1, fontSize: 13, lineHeight: 19, minHeight: 84, padding: 11, textAlignVertical: "top" }, imageCard: { borderRadius: 17, borderWidth: 2, minHeight: 330, overflow: "hidden", padding: 24 }, imageKicker: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textAlign: "center" }, imageOrnament: { fontSize: 24, marginTop: 18, textAlign: "center" }, imageTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", lineHeight: 32, marginTop: 16, textAlign: "center" }, imageDetail: { fontSize: 13, lineHeight: 20, marginTop: 13, textAlign: "center" }, imageMessage: { fontSize: 16, fontWeight: "700", lineHeight: 24, marginTop: 20, textAlign: "center" }, imageCountdown: { fontSize: 17, fontWeight: "900", marginTop: 18, textAlign: "center" }, imageFooter: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 30, textAlign: "center" }, modalActions: { flexDirection: "row", gap: 10 }, modalButton: { alignItems: "center", borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 46 }, modalButtonText: { fontSize: 13, fontWeight: "900" }, shareButton: { backgroundColor: "#0A7EA4", borderColor: "#0A7EA4" }, shareButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" } });
