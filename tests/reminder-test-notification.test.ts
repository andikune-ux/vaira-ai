import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("tes notifikasi dan alarm salat", () => {
  it("menjadwalkan tes pengingat dan alarm adzan dengan jeda detik yang dibatasi", () => {
    const reminders = source("lib/reminders.ts");
    expect(reminders).toContain("scheduleTestReminder");
    expect(reminders).toContain("schedulePrayerAlarmTest");
    expect(reminders).toContain("normalizedTestSeconds");
    expect(reminders).toContain("PRAYER_ALARM_CHANNEL");
    expect(reminders).toContain("AndroidImportance.MAX");
    expect(reminders).toContain("AndroidAudioUsage.ALARM");
    expect(reminders).toContain("bypassDnd: true");
    expect(reminders).toContain("priority: \"high\"");
    expect(source("app.config.ts")).toContain("SCHEDULE_EXACT_ALARM");
    expect(reminders).toContain("prayerAlarmVibrationEnabled");
    expect(reminders).toContain("TIME_INTERVAL");
    expect(reminders).toContain("PRAYER_ALARM_NOTIFICATION_CATEGORY");
    expect(reminders).toContain("PRAYER_ALARM_ACTION_STOP");
    expect(reminders).toContain("PRAYER_ALARM_ACTION_SNOOZE");
    expect(reminders).toContain("schedulePrayerAlarmSnooze");
    expect(reminders).toContain("getPrayerAlarmPermissionStatus");
  });

  it("menampilkan kontrol tes notifikasi harian dan tes alarm salat", () => {
    const settings = source("app/settings.tsx");
    const prayer = source("app/prayer-times.tsx");
    expect(settings).toContain("Tes notifikasi pengingat");
    expect(settings).toContain("Jeda tes notifikasi (detik)");
    expect(settings).toContain("Izinkan notifikasi");
    expect(prayer).toContain("Tes alarm adzan");
    expect(prayer).toContain("Jeda tes alarm (detik)");
    expect(prayer).toContain("Izinkan alarm");
    expect(prayer).toContain("Buka pengaturan alarm salat");
    expect(prayer).toContain("Buka pengaturan");
    expect(prayer).toContain("Linking.openSettings");
    expect(prayer).toContain("Audio dari penyimpanan internal");
    expect(prayer).toContain("Getar alarm");
    expect(prayer).toContain("Cek status izin");
    expect(prayer).toContain("Atur volume alarm");
    const layout = source("app/_layout.tsx");
    expect(layout).toContain("configurePrayerAlarmActions");
    expect(layout).toContain("PRAYER_ALARM_ACTION_STOP");
    expect(layout).toContain("PRAYER_ALARM_ACTION_SNOOZE");
    expect(layout).toContain("schedulePrayerAlarmSnooze");
  });
});
