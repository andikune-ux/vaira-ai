import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const chat = fs.readFileSync(path.resolve(__dirname, "../components/aira-chat-screen.tsx"), "utf8");

describe("mikrofon dan animasi Aira", () => {
  it("menjaga fase perekaman eksplisit sehingga ketukan mikrofon tidak bergantung pada polling status", () => {
    expect(chat).toContain('useState<"idle" | "starting" | "recording" | "stopping">');
    expect(chat).toContain("setRecordingPhase(\"starting\")");
    expect(chat).toContain("setRecordingPhase(\"recording\")");
    expect(chat).toContain("await recorder.stop()");
    expect(chat).toContain("allowsRecording: false");
  });

  it("membaca berkas rekaman web dan mengunggahnya lewat fetch, bukan API berkas native", () => {
    expect(chat).toContain('Platform.OS === "web"');
    expect(chat).toContain("webBlob = await source.blob()");
    expect(chat).toContain("body: webBlob");
    expect(chat).toContain('setPending(queued)');
    expect(chat).toContain("Pratinjau audio siap");
  });

  it("menampilkan gelombang suara beranimasi saat rekaman aktif meskipun metering tidak tersedia", () => {
    expect(chat).toContain("Animated.loop");
    expect(chat).toContain("Animated.View");
    expect(chat).toContain("scaleY");
    expect(chat).toContain("Merekam ${Math.floor");
    expect(chat).toContain('const lightBlue = "#5CC8FF"');
  });
});
