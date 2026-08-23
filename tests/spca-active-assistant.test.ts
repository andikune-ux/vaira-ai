import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("antarmuka dan kontrak SPCA aktif", () => {
  it("menyediakan pusat diagnosis, tindakan pemulihan, dan penjelasan privasi", () => {
    const screen = read("app/spca-diagnostics.tsx");
    expect(screen).toContain("SPCA · PUSAT DIAGNOSTIK");
    expect(screen).toContain("Bersihkan cache");
    expect(screen).toContain("Laporan privat Administrator");
    expect(screen).toContain("submitDiagnostic");
  });

  it("menghubungkan robot aktif ke pusat diagnosis, bukan hanya animasi", () => {
    const overlay = read("components/spca-overlay.tsx");
    const hook = read("hooks/use-spca-diagnostics.ts");
    expect(overlay).toContain("useSpcaDiagnostics");
    expect(overlay).toContain('router.push("/spca-diagnostics"');
    expect(overlay).toContain("createSpcaFindings(runtime)");
    expect(overlay).toContain("SPCA menemukan:");
    expect(hook).toContain("120_000");
  });

  it("membatasi laporan ke akun pengirim dan Administrator terverifikasi", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("submitDiagnostic");
    expect(router).toContain("const account = await requireManualAccount(ctx.req)");
    expect(router).toContain("adminResolve");
    expect(router).toContain("verifyAdministratorCredentials(input.username, input.password)");
    expect(router).toContain("createSpcaDiagnosticReport");
  });
});
