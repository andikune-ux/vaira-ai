import { describe, expect, it } from "vitest";

import { appRouter } from "../server/routers";

describe("tarik snapshot global Mode Guest", () => {
  it("dapat dipanggil tanpa konteks login dan hanya mengembalikan snapshot bila tersedia", async () => {
    const caller = appRouter.createCaller({} as never);
    const snapshot = await caller.administrator.globalTestSnapshot.pull();
    expect(snapshot === null || (typeof snapshot.payload === "string" && typeof snapshot.updatedAt === "string")).toBe(true);
  });
});
