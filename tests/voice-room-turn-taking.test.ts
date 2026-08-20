import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const room = fs.readFileSync(path.resolve(__dirname, "../app/voice-room.tsx"), "utf8");

describe("percakapan suara bergantian Aira", () => {
  it("mengaktifkan metering dan mengakhiri giliran setelah jeda bicara", () => {
    expect(room).toContain("isMeteringEnabled: true");
    expect(room).toContain("SILENCE_DELAY_MS");
    expect(room).toContain("recording.metering");
    expect(room).toContain("finishRecordingRef.current");
    expect(room).toContain("GradientWave");
    expect(room).toContain("LinearGradient");
    expect(room).not.toContain("WAVE.map");
  });

  it("menampilkan mode hybrid dan pengalihan cadangan yang dapat dihentikan", () => {
    expect(room).toContain("VoicePath = \"handsfree\" | \"fallback\"");
    expect(room).toContain("WebRTC belum aktif");
    expect(room).toContain("setVoicePath(\"fallback\")");
    expect(room).toContain("Mulai obrolan otomatis");
    expect(room).toContain("Hentikan obrolan");
    expect(room).toContain("requestRecordingPermissionsAsync");
    expect(room).toContain("setAudioModeAsync");
  });
});
