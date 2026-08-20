import { describe, expect, it } from "vitest";

import { appRouter } from "../server/routers";

describe("verifikasi rahasia SERVER DATABASE 2", () => {
  it("menerima kredensial SERVER DATABASE 2 yang tersimpan pada backend", async () => {
    const caller = appRouter.createCaller({} as never);
    const result = await caller.administrator.database2.verify({
      username: process.env.SERVER_DATABASE_2_USERNAME ?? "",
      password: process.env.SERVER_DATABASE_2_PASSWORD ?? "",
    });
    expect(result.verified).toBe(true);
  });

  it("menolak pasangan kredensial SERVER DATABASE 2 yang tidak sesuai", async () => {
    const caller = appRouter.createCaller({} as never);
    const result = await caller.administrator.database2.verify({ username: "bukan-admin-database2", password: "salah" });
    expect(result.verified).toBe(false);
  });

  it("mengizinkan kredensial SERVER DATABASE 2 membaca status pemulihan standby tanpa mengubah data", async () => {
    const caller = appRouter.createCaller({} as never);
    const result = await caller.administrator.database2.status({
      username: process.env.SERVER_DATABASE_2_USERNAME ?? "",
      password: process.env.SERVER_DATABASE_2_PASSWORD ?? "",
    });
    expect(result.manualAccountsCount).toBeGreaterThanOrEqual(0);
    expect(result.restrictedCloudMetadataCount).toBeGreaterThanOrEqual(0);
  });
});
