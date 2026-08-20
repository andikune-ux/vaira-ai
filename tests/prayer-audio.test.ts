import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const config = fs.readFileSync(path.join(root, "app.config.ts"), "utf8");
const reminders = fs.readFileSync(path.join(root, "lib/reminders.ts"), "utf8");

describe("audio adzan lokal", () => {
  it("memiliki aset audio yang dapat dibundel", () => {
    expect(fs.existsSync(path.join(root, "assets/audio/adhan_beautiful.ogg"))).toBe(true);
    expect(fs.existsSync(path.join(root, "assets/audio/adhan_beautiful.mp3"))).toBe(false);
    expect(fs.existsSync(path.join(root, "assets/audio/adhan-notification.wav"))).toBe(false);
    expect(config).toContain("adhan_beautiful.ogg");
    expect("adhan_beautiful").toMatch(/^[a-z][a-z0-9_]*$/);
  });

  it("menggunakan suara adzan pada channel dan jadwal alarm salat", () => {
    expect(reminders).toContain('const PRAYER_ALARM_CHANNEL = "airax-prayer-alarms-v3"');
    expect(reminders).toContain('sound: "adhan_beautiful.ogg"');
    expect(reminders).toContain("schedulePrayerReminders");
    expect(reminders).toContain("schedulePrayerAlarmTest");
  });

  it("mempertahankan suara default untuk pengingat non-salat", () => {
    expect(reminders).toContain('const REMINDER_CHANNEL = "airax-reminders"');
    expect(reminders).toContain('sound: "default"');
  });
});
