import { describe, expect, it } from "vitest";

import { redactDiagnosticText } from "../lib/bug-diagnostics";
import { SPCA_CACHE_WARNING_BYTES, createSafeSpcaReport, createSpcaFindings, type SpcaRuntimeSnapshot } from "../lib/spca-diagnostic-engine";

const base: SpcaRuntimeSnapshot = {
  capturedAt: "2026-08-23T00:00:00.000Z",
  network: "online",
  internetReachable: true,
  server: "healthy",
  camera: "granted",
  microphone: "granted",
  location: "granted",
  notifications: "granted",
  temporaryCacheBytes: 0,
};

describe("mesin diagnostik SPCA", () => {
  it("menemukan kondisi offline, error runtime, izin ditolak, dan cache besar dengan tindakan aman", () => {
    const findings = createSpcaFindings({ ...base, network: "offline", camera: "denied", temporaryCacheBytes: SPCA_CACHE_WARNING_BYTES, runtimeErrorAt: "2026-08-23T00:01:00.000Z" });
    expect(findings.map((item) => item.id)).toEqual(expect.arrayContaining(["network-offline", "camera-permission-denied", "runtime-error", "cache-large"]));
    expect(findings.find((item) => item.id === "cache-large")?.action?.id).toBe("clear-cache");
  });

  it("membedakan internet aktif dengan server aplikasi yang tidak merespons", () => {
    const findings = createSpcaFindings({ ...base, server: "unreachable" });
    expect(findings).toEqual(expect.arrayContaining([expect.objectContaining({ id: "server-unreachable", severity: "warning" })]));
  });

  it("menampilkan status sehat bila tidak ada gejala yang terdeteksi", () => {
    expect(createSpcaFindings(base)).toEqual([expect.objectContaining({ id: "healthy", severity: "info" })]);
  });

  it("membuat laporan hanya dari kode dan ringkasan diagnosis", () => {
    const report = createSafeSpcaReport(base, createSpcaFindings({ ...base, microphone: "denied" }));
    expect(report.codes).toEqual(["microphone-permission-denied"]);
    expect(report.summary).toContain("Izin Mikrofon ditolak");
    expect(report).not.toHaveProperty("stack");
    expect(report).not.toHaveProperty("message");
  });

  it("menyaring token, sandi, email, dan telepon dari diagnostik", () => {
    const text = redactDiagnosticText("Authorization: Bearer sk-secret-value-1234567890 password=rahasia test@example.com 081234567890");
    expect(text).not.toContain("rahasia");
    expect(text).not.toContain("test@example.com");
    expect(text).not.toContain("081234567890");
    expect(text).toContain("[DIHAPUS]");
  });
});
