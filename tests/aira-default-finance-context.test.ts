import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildDefaultAiraFinanceContext } from "@/lib/finance/aira-finance-context";
import { EMPTY_FINANCE_STATE, type FinanceState } from "@/lib/finance/types";

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("konteks catatan keuangan Aira Default", () => {
  it("meringkas saldo dan transaksi terbatas tanpa nomor rekening atau URI bukti", () => {
    const state: FinanceState = {
      ...EMPTY_FINANCE_STATE,
      wallets: [{ id: "wallet_1", name: "Kas Utama", kind: "cash", openingBalance: 100000, accountNumber: "1234567890", color: "#123456", createdAt: "2026-08-01T00:00:00.000Z" }],
      transactions: [{ id: "tx_1", kind: "expense", amount: 25000, walletId: "wallet_1", category: "Makan", note: "Makan siang", counterpartyName: "Warung Sari", occurredAt: "2026-08-20T09:00:00.000Z", origin: "manual", status: "confirmed", proofUri: "file://rahasia.jpg", createdAt: "2026-08-20T09:00:00.000Z" }],
    };

    const context = buildDefaultAiraFinanceContext(state, new Date("2026-08-22T00:00:00.000Z"));
    expect(context).toContain("KONTEKS KEUANGAN PRIBADI TERBATAS");
    expect(context).toContain("Kas Utama");
    expect(context).toContain("Warung Sari");
    expect(context).not.toContain("1234567890");
    expect(context).not.toContain("file://rahasia.jpg");
  });

  it("mengirim konteks hanya dari Aira Default dan menolaknya lagi di sisi server untuk mode khusus", () => {
    const screen = read("components/aira-chat-screen.tsx");
    const router = read("server/routers.ts");
    expect(screen).toContain('payload.aiMode === "aira" ? buildDefaultAiraFinanceContext(state) : undefined');
    expect(router).toContain('const defaultFinanceContext = input.aiMode === "aira" ? input.financeContext?.trim() : "";');
    expect(router).toContain("You do not have access to the user's financial records or financial context.");
  });
});
