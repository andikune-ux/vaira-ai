import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "app/global-room-chat.tsx"), "utf8");
const audioFiles = ["ui-send.wav", "ui-sent.wav", "ui-typing.wav", "ui-typing-stop.wav", "ui-error.wav"];

describe("Room Global UI sound effects", () => {
  it("ships local sound assets for each message state", () => {
    for (const file of audioFiles) expect(existsSync(resolve(process.cwd(), "assets", "audio", file))).toBe(true);
  });

  it("maps sounds to send, success, typing start/stop, and failure", () => {
    expect(source).toContain("ui-send.wav");
    expect(source).toContain("ui-sent.wav");
    expect(source).toContain("ui-typing.wav");
    expect(source).toContain("ui-typing-stop.wav");
    expect(source).toContain("ui-error.wav");
    expect(source).toContain("playUiSound(sendSound)");
    expect(source).toContain("playUiSound(sentSound)");
    expect(source).toContain("playUiSound(errorSound)");
  });

  it("plays typing start only on the transition into typing", () => {
    expect(source).toContain("const wasTyping = typingActive");
    expect(source).toContain("if (!wasTyping) playUiSound(typingSound)");
    expect(source).toContain("playUiSound(typingStopSound)");
  });
});
