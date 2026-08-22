import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("sandi sementara yang ditentukan administrator", () => {
  it("menandai akun untuk wajib ganti sandi dan mencabut sesi lama saat reset admin", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("mustChangePassword: true");
    expect(router).toContain("revokeManualAccountSessions(account.id)");
    expect(router).toContain("changeTemporaryPassword");
  });

  it("memblokir layanan akun sampai pengguna mengganti sandi sementara", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("if (account.mustChangePassword)");
    expect(router).toContain("Ganti sandi sementara Anda terlebih dahulu");
  });

  it("mengarahkan login sementara ke layar sandi pribadi lalu membersihkan statusnya", () => {
    const login = read("app/login.tsx");
    const changeScreen = read("app/change-temporary-password.tsx");
    const router = read("server/routers.ts");
    expect(login).toContain("result.account.mustChangePassword");
    expect(login).toContain('router.replace("/change-temporary-password"');
    expect(changeScreen).toContain("temporaryPassword, newPassword");
    expect(changeScreen).toContain("Simpan sandi pribadi");
    expect(router).toContain("mustChangePassword: false");
  });
});
