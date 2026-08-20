import { describe, expect, it } from "vitest";

import { selectActiveGlobalRoomParticipants } from "../server/db";

const at = (offsetMs: number) => new Date(1_700_000_000_000 + offsetMs);

const account = (id: number, username: string, status: "active" | "blocked" = "active", featuredPhotoUris: string | null = null) => ({
  id,
  publicId: String(100000000 + id),
  fullName: `Peserta ${id}`,
  username,
  featuredPhotoUris,
  status,
});

describe("Room Global active participants", () => {
  it("excludes participants who left or whose heartbeat expired", () => {
    const now = 1_700_000_000_000;
    const participants = selectActiveGlobalRoomParticipants([
      { accountId: 1, joinedAt: at(-1_000), lastSeenAt: at(-10_000), leftAt: null },
      { accountId: 2, joinedAt: at(-2_000), lastSeenAt: at(-10_000), leftAt: at(-1_000) },
      { accountId: 3, joinedAt: at(-3_000), lastSeenAt: at(-(2 * 60 * 1000 + 1)), leftAt: null },
    ], [account(1, "aktif"), account(2, "sudah-keluar"), account(3, "kedaluwarsa")], now);

    expect(participants.map((item) => item.accountId)).toEqual([1]);
  });

  it("orders newest heartbeat first and returns avatar and administrator role", () => {
    const now = 1_700_000_000_000;
    const participants = selectActiveGlobalRoomParticipants([
      { accountId: 1, joinedAt: at(-5_000), lastSeenAt: at(-5_000), leftAt: null },
      { accountId: 2, joinedAt: at(-2_000), lastSeenAt: at(-1_000), leftAt: null },
    ], [account(1, "andik.une", "active", JSON.stringify(["https://cdn.example/avatar.jpg"])), account(2, "peserta")], now);

    expect(participants.map((item) => item.accountId)).toEqual([2, 1]);
    expect(participants[1]).toMatchObject({ avatarUri: "https://cdn.example/avatar.jpg", role: "Administrator" });
  });

  it("excludes non-active accounts even when their presence heartbeat is fresh", () => {
    const now = 1_700_000_000_000;
    const participants = selectActiveGlobalRoomParticipants([
      { accountId: 9, joinedAt: at(-1_000), lastSeenAt: at(-500), leftAt: null },
    ], [account(9, "dibatasi", "blocked")], now);

    expect(participants).toEqual([]);
  });
});
