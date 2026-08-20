import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const contextSource = readFileSync(resolve(process.cwd(), "lib/finance/finance-context.tsx"), "utf8");
const walletsSource = readFileSync(resolve(process.cwd(), "app/wallets.tsx"), "utf8");

describe("penghapusan dompet dan sinkronisasi mutasi", () => {
  it("menghapus dompet dan mutasi yang memakai walletId atau toWalletId", () => {
    expect(contextSource).toContain("removeWallet: (id: string) => Promise<{ removedTransactions: number }>");
    expect(contextSource).toContain("previous.transactions.filter((transaction) => transaction.walletId === id || transaction.toWalletId === id).length");
    expect(contextSource).toContain("transactions: previous.transactions.filter((transaction) => transaction.walletId !== id && transaction.toWalletId !== id)");
    expect(contextSource).toContain("wallets: previous.wallets.filter((wallet) => wallet.id !== id)");
  });

  it("menyediakan konfirmasi hapus dan memperingatkan jumlah riwayat terkait", () => {
    expect(walletsSource).toContain("confirmRemoveWallet");
    expect(walletsSource).toContain("Hapus dompet");
    expect(walletsSource).toContain("termasuk transfer terkait. Dompet lain tidak akan berubah.");
    expect(walletsSource).toContain("accessibilityLabel={`Hapus ${wallet.name}`}");
  });
});
