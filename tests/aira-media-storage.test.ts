import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf8");

describe("unggahan media Aira", () => {
  it("mengembalikan storageKey stabil dan signed URL baca sementara", () => {
    const router = read("server/routers.ts");
    const mediaRouter = router.slice(router.indexOf("media: router"), router.indexOf("privateGroups: router"));
    expect(mediaRouter).toContain("storageCreateUploadUrl");
    expect(mediaRouter).toContain("storageGetSignedUrl(ticket.key)");
    expect(mediaRouter).not.toContain("storageGet(ticket.key)");
  });
});
