import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const chat = readFileSync(resolve(process.cwd(), "app/global-room-chat.tsx"), "utf8");
const room = readFileSync(resolve(process.cwd(), "app/global-room.tsx"), "utf8");

describe("Room Global automatic leave", () => {
  it("leaves from chat unmount and guards duplicate leave requests", () => {
    expect(chat).toContain("leaveRequestedRef");
    expect(chat).toContain("activeRef.current");
    expect(chat).toContain("leaveRoomMutateRef.current().catch");
    expect(chat).toContain("leaveRequestedRef.current = true");
  });

  it("leaves from the room screen back action before navigating", () => {
    expect(room).toContain("leaveRoom.mutateAsync().finally(() => router.back())");
    expect(room).toContain("leaveRoomMutateRef.current().catch");
    expect(room).toContain("leaveRequestedRef.current");
  });
});
