import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export type CalendarReminder = { id: string; title: string; note: string; date: string; time: string; createdAt: string; notificationId?: string };
const STORAGE_KEY = "vaira.calendar.reminders.v1";

export async function loadCalendarReminders(): Promise<CalendarReminder[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export async function saveCalendarReminders(reminders: CalendarReminder[]) { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)); }

export async function scheduleCalendarReminder(reminder: CalendarReminder) {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== "granted") return null;
  }
  const [year, month, day] = reminder.date.split("-").map(Number);
  const [hour, minute] = reminder.time.split(":").map(Number);
  const triggerDate = new Date(year, month - 1, day, hour, minute, 0);
  if (triggerDate.getTime() <= Date.now()) return null;
  return Notifications.scheduleNotificationAsync({ content: { title: reminder.title, body: reminder.note || "Pengingat dari kalender V A I R A  A I", sound: "default", data: { reminderId: reminder.id } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate } });
}

export async function cancelCalendarReminder(reminder: CalendarReminder) { if (reminder.notificationId) await Notifications.cancelScheduledNotificationAsync(reminder.notificationId); }
