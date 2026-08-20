import { describe, expect, it } from "vitest";
import { getUserFacingError } from "../lib/user-facing-error";

describe("user-facing errors", () => {
  it("menjelaskan validasi username tanpa kode teknis", () => {
    expect(getUserFacingError(new Error("Invalid username format"))).toContain("Username tidak valid");
  });

  it("menjelaskan konflik data dengan bahasa sederhana", () => {
    expect(getUserFacingError(new Error("Username already used"))).toContain("sudah digunakan");
  });

  it("menyembunyikan payload JSON mentah", () => {
    expect(getUserFacingError(new Error('{"code":"BAD_REQUEST","path":"adminUpdate"}'), "Data belum valid.")).toBe("Data belum valid.");
  });

  it("memberi fallback koneksi yang dapat dipahami", () => {
    expect(getUserFacingError(new Error("fetch failed"))).toContain("Server atau koneksi");
  });

  it("menyembunyikan error parse ketika API mengirim HTML", () => {
    expect(getUserFacingError(new Error("JSON Parse error: Unexpected character: <"))).toContain("respons yang tidak valid");
  });
});
