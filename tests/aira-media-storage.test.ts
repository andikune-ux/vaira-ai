import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf8");

describe("unggahan media Aira", () => {
  it("mengembalikan jalur baca storage stabil, bukan URL bertanda tangan yang kedaluwarsa", () => {
    const router = read("server/routers.ts");
    const mediaRouter = router.slice(router.indexOf("media: router"), router.indexOf("privateGroups: router"));
    expect(mediaRouter).toContain("storageCreateUploadUrl");
    expect(mediaRouter).toContain("storageGet(ticket.key)");
    expect(mediaRouter).not.toContain("storageGetSignedUrl(ticket.key)");
  });
});
