import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { createSessionToken, hashSecret, hashSessionToken, verifySecret } from "../server/manual-auth";

const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf-8");

describe("autentikasi manual V A I R A  A I", () => {
  it("menghash kata sandi dan token cadangan tanpa menyimpan teks terbuka", async () => {
    const hash = await hashSecret("RahasiaV A I R A  A I2026");
    expect(hash).not.toContain("RahasiaV A I R A  A I2026");
    await expect(verifySecret("RahasiaV A I R A  A I2026", hash)).resolves.toBe(true);
    await expect(verifySecret("salah", hash)).resolves.toBe(false);
  });

  it("membuat token sesi acak dan hanya mengirim hash ke database", () => {
    const first = createSessionToken();
    const second = createSessionToken();
    expect(first).not.toBe(second);
    expect(hashSessionToken(first)).toHaveLength(64);
  });

  it("menyediakan registrasi, blokir tiga kegagalan, pemulihan, dan penutupan akun", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("manualAccount: router");
    expect(router).toContain("failedLoginAttempts >= 3");
    expect(router).toContain("loginCooldownUntil");
    expect(router).toContain("recoveryTokenHash");
    expect(router).toContain("requestManualAccountClosure");
  });

  it("membatasi tindakan administrator tanpa menampilkan kata sandi dan membatalkan sesi saat akses berubah", () => {
    const router = read("server/routers.ts");
    const db = read("server/db.ts");
    expect(router).toContain('"disabled"');
    expect(router).toContain("findManualAccountIdentifierConflict");
    expect(router).toContain("revokeManualAccountSessions");
    expect(router).toContain("passwordHash: await hashSecret(input.newPassword)");
    expect(db).toContain("revokeManualAccountSessions");
  });

  it("mengunci layanan Aira dari Mode Guest tetapi membuka Pindai Bukti tanpa token", () => {
    const router = read("server/routers.ts");
    const chat = read("components/aira-chat-screen.tsx");
    const scanner = read("app/scan-receipt.tsx");
    expect(router.match(/await requireManualAccount\(ctx\.req\)/g)?.length).toBeGreaterThanOrEqual(4);
    expect(chat).toContain("Aira AI terkunci");
    expect(scanner).not.toContain("Pindai bukti terkunci");
    const receiptRouter = router.slice(router.indexOf("analyzeReceipt:"), router.indexOf("generateAsset:"));
    expect(receiptRouter).not.toContain("requireManualAccount(ctx.req)");
  });

  it("mengekspor identitas akun tanpa kata sandi maupun token cadangan", () => {
    const exporter = read("lib/finance/report-export.ts");
    const segment = exporter.slice(exporter.indexOf("exportExcelAdministratorAccounts"));
    expect(segment).not.toContain("passwordHash");
    expect(segment).not.toContain("recoveryTokenHash");
    expect(segment).toContain("Username");
  });
});
