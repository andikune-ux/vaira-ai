import { describe, expect, it } from "vitest";

describe("status konfigurasi database primary", () => {
  it("memanggil endpoint ringan tanpa pernah mengembalikan nilai PRIMARY_DATABASE_URL", async () => {
    const response = await fetch("http://127.0.0.1:3000/api/health/primary-config");
    expect(response.ok).toBe(true);
    const body = await response.json() as { ok: boolean; source: string; mode: string; configured: boolean; backupConfigured: boolean };
    expect(body).toMatchObject({ ok: true, source: "legacy-primary", mode: "manual" });
    expect(typeof body.configured).toBe("boolean");
    expect(typeof body.backupConfigured).toBe("boolean");
    expect(JSON.stringify(body)).not.toContain("mysql://");
  });
});
