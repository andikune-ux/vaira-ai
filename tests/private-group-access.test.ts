import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (filePath: string) => fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
const schema = read("drizzle/schema.ts");
const groups = read("server/private-groups.ts");
const router = read("server/routers.ts");

describe("grup privat", () => {
  it("menyimpan status moderasi dan keanggotaan unik", () => {
    expect(schema).toContain('mysqlEnum("status", ["active", "frozen", "deleted"])');
    expect(schema).toContain('uniqueIndex("privateChatGroupMembers_group_account_unique")');
    expect(schema).toContain("tokenHash");
    expect(schema).not.toContain("inviteToken:");
  });

  it("membatasi keanggotaan aktif, menegakkan admin tunggal, dan mengalihkan admin ketika keluar", () => {
    expect(groups).toContain("PRIVATE_GROUP_MEMBERSHIP_LIMIT = 10");
    expect(groups).toContain("countActivePrivateGroupMemberships");
    expect(groups).toContain("group.adminAccountId !== actorAccountId");
    expect(groups).toContain("orderBy(desc(privateChatGroupMembers.joinedAt))");
    expect(groups).toContain('status: "deleted", deletedAt: new Date(), deletedBy: "system:last-member-left"');
  });

  it("mencegah chat atau join pada grup frozen dan hanya memberi link kepada admin", () => {
    expect(groups).toContain('if (group.status === "frozen") throw new Error("Grup sedang dibekukan Administrator Vaira.")');
    expect(groups).toContain('if (group.status !== "active") throw new Error("Link undangan hanya tersedia untuk grup aktif.")');
    expect(groups).toContain("joinPrivateGroupByInvite");
  });

  it("menjaga endpoint grup berbasis sesi akun dan administrator hanya memantau", () => {
    expect(router).toContain("privateGroups: router({");
    expect(router).toContain("const account = await requireManualAccount(ctx.req);");
    expect(router).toContain("administrator: router({");
    expect(router).toContain("Moderasi grup privat tanpa hak berkomentar.");
    expect(router).not.toContain("administrator.privateGroups.sendMessage");
  });
});
