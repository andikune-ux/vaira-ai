import { describe, expect, it, vi } from "vitest";

import { connectWithFailover } from "../lib/global-room-provider-failover";

describe("Global Room provider failover", () => {
  it("uses Daily first and falls back to LiveKit", async () => {
    const dailyJoin = vi.fn().mockRejectedValue(new Error("Daily unavailable"));
    const livekitJoin = vi.fn().mockResolvedValue(undefined);
    const result = await connectWithFailover([
      { provider: "daily", healthCheck: vi.fn().mockResolvedValue(true), join: dailyJoin, leave: vi.fn() },
      { provider: "livekit", healthCheck: vi.fn().mockResolvedValue(true), join: livekitJoin, leave: vi.fn() },
    ]);
    expect(result.provider).toBe("livekit");
    expect(result.mode).toBe("audio");
    expect(dailyJoin).toHaveBeenCalledOnce();
    expect(livekitJoin).toHaveBeenCalledOnce();
  });

  it("returns polling when no provider is configured", async () => {
    const result = await connectWithFailover([]);
    expect(result.provider).toBeNull();
    expect(result.mode).toBe("polling");
    expect(result.attempts.map((attempt) => attempt.provider)).toEqual(["daily", "livekit", "twilio"]);
  });
});
