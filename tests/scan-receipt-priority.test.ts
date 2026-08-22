import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("Pindai Bukti berorientasi nominal", () => {
  it("meminta AI memprioritaskan nominal dan mengekstrak pengirim/penerima meskipun waktu tidak terbaca", () => {
    const router = read("server/routers.ts");
    expect(router).toContain('"senderName": "string" | null');
    expect(router).toContain('"recipientName": "string" | null');
    expect(router).toContain("The first priority is to find the transaction amount");
    expect(router).toContain("even when occurredAt is null");
    expect(router).toContain("recipientName: typeof parsed.recipientName");
  });

  it("menampilkan kolom pengirim/penerima, meneruskan namanya, serta tidak memblokir nominal saat waktu bukti tidak ada", () => {
    const screen = read("app/scan-receipt.tsx");
    const confirm = read("app/confirm-transaction.tsx");
    expect(screen).toContain('placeholder="DD-MM-YYYY"');
    expect(screen).toContain('placeholder="HH:MM"');
    expect(screen).toContain("getReceiptCounterpartyLabel(kind)");
    expect(screen).toContain("counterpartyName: normalizedCounterpartyName");
    expect(confirm).toContain("counterpartyName,");
    expect(screen).toContain("Nominal tetap dapat ditinjau");
    expect(screen).not.toContain("Waktu bukti belum lengkap");
  });
});
