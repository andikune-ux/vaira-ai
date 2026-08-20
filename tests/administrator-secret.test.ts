import { describe, expect, it } from "vitest";

import { appRouter } from "../server/routers";

describe("verifikasi rahasia Mode Administrator", () => {
  it("menerima kredensial administrator yang tersimpan pada backend", async () => {
    const caller = appRouter.createCaller({} as never);
    const result = await caller.administrator.verify({
      username: process.env.ADMIN_USERNAME ?? "",
      password: process.env.ADMIN_PASSWORD ?? "",
    });
    expect(result.verified).toBe(true);
  });

  it("menolak pasangan kredensial yang tidak sesuai", async () => {
    const caller = appRouter.createCaller({} as never);
    const result = await caller.administrator.verify({ username: "bukan-admin", password: "salah" });
    expect(result.verified).toBe(false);
  });
});
