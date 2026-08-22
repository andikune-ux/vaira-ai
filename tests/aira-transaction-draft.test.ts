import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("draft transaksi dari Aira", () => {
  it("membatasi saran transaksi pada Aira Default dan menerima jenis transfer", () => {
    const router = read("server/routers.ts");
    expect(router).toContain('const validSuggested = input.aiMode === "aira"');
    expect(router).toContain('suggested.kind === "income" || suggested.kind === "expense" || suggested.kind === "transfer"');
    expect(router).toContain('counterpartyName: typeof suggested.counterpartyName');
    expect(router).toContain("Aira Hot Pro and Aira Ahli Ilmuwan must always return suggestedTransaction null.");
  });

  it("menampilkan pilihan eksplisit untuk meninjau atau menunda, bukan menyimpan otomatis", () => {
    const chat = read("components/aira-chat-screen.tsx");
    expect(chat).toContain('"Usulan catatan keuangan"');
    expect(chat).toContain('text: "Tidak sekarang"');
    expect(chat).toContain('text: "Tinjau draft"');
    expect(chat).toContain('pathname: "/add-transaction"');
    expect(chat).toContain('origin: "ai_chat"');
    expect(chat).not.toContain("addConfirmedTransaction");
  });

  it("meneruskan draft ke formulir yang tetap membuka konfirmasi sebelum data disimpan", () => {
    const form = read("app/add-transaction.tsx");
    expect(form).toContain("amount: amountParam");
    expect(form).toContain("counterpartyName: counterpartyNameParam");
    expect(form).toContain('pathname: "/confirm-transaction"');
    expect(form).toContain('origin: originParam === "ai_chat"');
    expect(form).toContain("Tinjau sebelum simpan");
  });
});
