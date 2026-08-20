import * as Notifications from "expo-notifications";
import { AndroidAudioContentType, AndroidAudioUsage, AndroidImportance, AndroidNotificationVisibility } from "expo-notifications";
import { Platform } from "react-native";

import type { PrayerTime } from "./prayer-times";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_KIND = "daily-finance-reminder";
const PRAYER_KIND = "prayer-reminder";
const PLAN_KIND = "plan-reminder";
const GENERATION_KIND = "aira-generation";
export const GENERATION_NOTIFICATION_CATEGORY = "aira-generation-actions";
export const PRAYER_ALARM_NOTIFICATION_CATEGORY = "vaira-prayer-alarm-actions";
export const PRAYER_ALARM_ACTION_STOP = "prayer-stop";
export const PRAYER_ALARM_ACTION_SNOOZE = "prayer-snooze-5";
const REMINDER_CHANNEL = "airax-reminders";
// Versi v2 memaksa Android membuat channel baru; importance/suara channel lama tidak dapat dinaikkan setelah dibuat.
const PRAYER_ALARM_CHANNEL = "airax-prayer-alarms-v3";

function normalizedTestSeconds(seconds: number) {
  return Math.max(1, Math.min(300, Math.round(seconds)));
}

async function ensurePermission({ configurePrayerChannel = false, prayerAlarmVibrationEnabled = true }: { configurePrayerChannel?: boolean; prayerAlarmVibrationEnabled?: boolean } = {}) {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: "Pengingat V A I R A  A I",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 250, 150, 250],
    });
    if (configurePrayerChannel) {
      await Notifications.setNotificationChannelAsync(PRAYER_ALARM_CHANNEL, {
        name: "Alarm Salat V A I R A  A I",
        description: "Alarm waktu salat yang berbunyi pada perangkat.",
        importance: AndroidImportance.MAX,
        sound: "adhan_beautiful.ogg",
        bypassDnd: true,
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        audioAttributes: { usage: AndroidAudioUsage.ALARM, contentType: AndroidAudioContentType.SONIFICATION, flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false } },
        enableVibrate: prayerAlarmVibrationEnabled,
        vibrationPattern: prayerAlarmVibrationEnabled ? [0, 400, 180, 400, 180, 600] : [],
      });
    }
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
  return permission.status === "granted";
}

export async function requestNotificationPermission() {
  return ensurePermission();
}

export async function notifyAiraGenerationCompletion({ label, success, attachment }: { label: string; success: boolean; attachment?: { uri: string; kind: string; mimeType: string; generationPrompt?: string; generationKind?: string; generationQuality?: string } }) {
  if (!(await ensurePermission())) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: success ? "Hasil Aira sudah siap" : "Generasi Aira belum berhasil",
      body: success ? `${label} siap dilihat di percakapan dan Galeri Hasil Aira.` : `${label} belum dapat dibuat. Anda dapat mencoba ulang dari layanan Aira.`,
      data: { kind: GENERATION_KIND, url: "/chat", attachment },
      sound: "default",
      categoryIdentifier: success ? GENERATION_NOTIFICATION_CATEGORY : undefined,
    },
    trigger: null,
  });
  return true;
}

export async function configurePrayerAlarmActions() {
  if (Platform.OS === "web") return;
  await Notifications.setNotificationCategoryAsync(PRAYER_ALARM_NOTIFICATION_CATEGORY, [
    { identifier: PRAYER_ALARM_ACTION_STOP, buttonTitle: "Matikan alarm", options: { isDestructive: true, opensAppToForeground: false } },
    { identifier: PRAYER_ALARM_ACTION_SNOOZE, buttonTitle: "Ingatkan 5 menit lagi", options: { opensAppToForeground: false } },
  ], { showTitle: true, showSubtitle: true, previewPlaceholder: "Alarm waktu salat" });
}

export async function schedulePrayerAlarmSnooze(prayerLabel = "salat", prayerAlarmVibrationEnabled = true) {
  if (!(await ensurePermission({ configurePrayerChannel: true, prayerAlarmVibrationEnabled }))) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: `Pengingat ${prayerLabel}`, body: "Alarm salat ditunda selama 5 menit.", data: { kind: PRAYER_KIND, snoozed: true, url: "/prayer-times", priority: "alarm" }, sound: "adhan_beautiful.ogg", priority: "high", categoryIdentifier: PRAYER_ALARM_NOTIFICATION_CATEGORY },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 300, repeats: false, channelId: PRAYER_ALARM_CHANNEL },
  });
  return true;
}

export async function configureGenerationNotificationActions() {
  if (Platform.OS === "web") return;
  await Notifications.setNotificationCategoryAsync(GENERATION_NOTIFICATION_CATEGORY, [
    { identifier: "open", buttonTitle: "Buka hasil", options: { opensAppToForeground: true } },
    { identifier: "share", buttonTitle: "Bagikan", options: { opensAppToForeground: true } },
    { identifier: "regenerate", buttonTitle: "Generate ulang", options: { opensAppToForeground: true } },
  ]);
}

export async function requestPrayerAlarmPermission(prayerAlarmVibrationEnabled = true) {
  return ensurePermission({ configurePrayerChannel: true, prayerAlarmVibrationEnabled });
}

export async function getPrayerAlarmPermissionStatus() {
  if (Platform.OS === "web") return { granted: false, status: "unavailable", channelBlocked: false };
  const permission = await Notifications.getPermissionsAsync();
  const channel = Platform.OS === "android" ? await Notifications.getNotificationChannelAsync(PRAYER_ALARM_CHANNEL) : null;
  return { granted: permission.status === "granted", status: permission.status, channelBlocked: channel?.importance === AndroidImportance.NONE };
}

export async function enableDailyFinanceReminder(hour = 20, minute = 0) {
  if (!(await ensurePermission())) return false;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.content.data?.kind === REMINDER_KIND).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  await Notifications.scheduleNotificationAsync({
    content: { title: "V A I R A  A I", body: "Luangkan satu menit untuk mencatat transaksi hari ini.", data: { kind: REMINDER_KIND, url: "/(tabs)/finance" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: REMINDER_CHANNEL },
  });
  return true;
}

export async function disableDailyFinanceReminder() {
  if (Platform.OS === "web") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.content.data?.kind === REMINDER_KIND).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function scheduleTestReminder(seconds: number) {
  if (!(await ensurePermission())) return false;
  const delay = normalizedTestSeconds(seconds);
  await Notifications.scheduleNotificationAsync({
    content: { title: "Tes notifikasi V A I R A  A I", body: `Pengingat tes muncul setelah ${delay} detik.`, data: { kind: REMINDER_KIND, test: true }, sound: "default" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delay, repeats: false, channelId: REMINDER_CHANNEL },
  });
  return true;
}

export async function schedulePrayerReminders(items: PrayerTime[], prayerAlarmVibrationEnabled = true) {
  if (!(await ensurePermission({ configurePrayerChannel: true, prayerAlarmVibrationEnabled }))) return false;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.content.data?.kind === PRAYER_KIND).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  const now = Date.now();
  await Promise.all(items.filter((item) => item.date.getTime() > now).map((item) => Notifications.scheduleNotificationAsync({
    content: { title: `Waktu ${item.label}`, body: `Saatnya menunaikan salat ${item.label}.`, data: { kind: PRAYER_KIND, prayer: item.key, url: "/prayer-times", priority: "alarm" }, sound: "adhan_beautiful.ogg", priority: "high", categoryIdentifier: PRAYER_ALARM_NOTIFICATION_CATEGORY },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date, channelId: PRAYER_ALARM_CHANNEL },
  })));
  return true;
}

export async function disablePrayerReminders() {
  if (Platform.OS === "web") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.content.data?.kind === PRAYER_KIND).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function schedulePrayerAlarmTest(seconds: number, prayerAlarmVibrationEnabled = true) {
  if (!(await ensurePermission({ configurePrayerChannel: true, prayerAlarmVibrationEnabled }))) return false;
  const delay = normalizedTestSeconds(seconds);
  await Notifications.scheduleNotificationAsync({
    content: { title: "Tes alarm adzan V A I R A  A I", body: `Alarm salat akan berbunyi setelah ${delay} detik menggunakan nada default perangkat.`, data: { kind: PRAYER_KIND, test: true, url: "/prayer-times", priority: "alarm" }, sound: "adhan_beautiful.ogg", priority: "high", categoryIdentifier: PRAYER_ALARM_NOTIFICATION_CATEGORY },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delay, repeats: false, channelId: PRAYER_ALARM_CHANNEL },
  });
  return true;
}

export async function schedulePlanReminder({ title, kind, dueAt, reminderAt, reminderDayOfMonth, reminderTime }: { title: string; kind: string; dueAt?: string; reminderAt?: string; reminderDayOfMonth?: number; reminderTime?: string }) {
  if (!(await ensurePermission())) return false;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.content.data?.kind === PLAN_KIND && item.content.data?.planTitle === title).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  const [hourText, minuteText] = (reminderTime ?? "").split(":");
  const hour = Number(hourText); const minute = Number(minuteText);
  if (reminderDayOfMonth && reminderDayOfMonth >= 1 && reminderDayOfMonth <= 31 && Number.isInteger(hour) && hour >= 0 && hour <= 23 && Number.isInteger(minute) && minute >= 0 && minute <= 59) {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Pengingat V A I R A  A I", body: `${kind}: ${title} mendekati jatuh tempo.`, data: { kind: PLAN_KIND, planTitle: title, url: "/plans" }, sound: "default" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: reminderDayOfMonth, hour, minute, channelId: REMINDER_CHANNEL },
    });
    return true;
  }
  const triggerDate = new Date(reminderAt || dueAt || "");
  if (!Number.isFinite(triggerDate.getTime()) || triggerDate.getTime() <= Date.now()) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: "Pengingat V A I R A  A I", body: `${kind}: ${title} mendekati jatuh tempo.`, data: { kind: PLAN_KIND, planTitle: title, url: "/plans" }, sound: "default" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate, channelId: REMINDER_CHANNEL },
  });
  return true;
}
