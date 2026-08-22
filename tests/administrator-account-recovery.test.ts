import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("Kelola Akun administrator", () => {
  it("menyediakan reset sandi sementara yang melewati endpoint admin terlindungi", () => {
    const screen = read("app/administrator-account-edit.tsx");
    const router = read("server/routers.ts");
    expect(screen).toContain("RESET SANDI SEMENTARA");
    expect(screen).toContain("newPassword: temporaryPassword");
    expect(screen).toContain("temporaryPassword.length < 8");
    expect(screen).toContain("Reset sandi sementara");
    expect(router).toContain("newPassword: MANUAL_PASSWORD.optional()");
    expect(router).toContain("passwordHash: await hashSecret(input.newPassword)");
    expect(router).toContain("revokeManualAccountSessions(account.id)");
  });

  it("menyimpan pembaruan profil ke server dan menyegarkan data administrator", () => {
    const screen = read("app/administrator-account-edit.tsx");
    expect(screen).toContain("Data akun diperbarui dan disimpan ke server.");
    expect(screen).toContain("await accounts.refetch()");
    expect(screen).toContain("accountUsername: accountUsername.trim().toLowerCase()");
  });
});
