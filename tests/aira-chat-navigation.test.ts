import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

describe("navigasi riwayat layanan Aira", () => {
  it("menyediakan sidebar dari kiri, tombol percakapan baru di sidebar, serta folder arsip dan sampah", () => {
    const navigation = read("components/aira-chat-navigation.tsx");
    expect(navigation).toContain('accessibilityLabel="Buka riwayat obrolan"');
    expect(navigation).toContain("Mulai percakapan baru");
    expect(navigation).toContain('label="Arsip"');
    expect(navigation).toContain('label="Sampah"');
    expect(navigation).toContain("dihapus otomatis setelah 30 hari");
    expect(navigation).not.toContain('style={[styles.fab');
  });

  it("menyimpan status semat, arsip, dan penghapusan lunak pada percakapan", () => {
    const types = read("lib/finance/types.ts");
    const context = read("lib/finance/finance-context.tsx");
    expect(types).toContain("isPinned?: boolean");
    expect(types).toContain("isArchived?: boolean");
    expect(types).toContain("deletedAt?: string");
    expect(context).toContain("deletedAt: new Date().toISOString()");
    expect(context).toContain("restoreConversation");
    expect(context).toContain("permanentlyDeleteConversation");
  });

  it("menampilkan menu titik tiga sebagai bottom sheet dan membatasi kunci pada mode khusus", () => {
    const navigation = read("components/aira-chat-navigation.tsx");
    expect(navigation).toContain("Opsi percakapan");
    expect(navigation).toContain("sheetBackdrop");
    expect(navigation).toContain("Ganti nama");
    expect(navigation).toContain("Bagikan (salin teks)");
    expect(navigation).toContain("usesPrivateAiraMode ?");
  });

  it("memindahkan riwayat ke sampah dan menyediakan Pulihkan atau Hapus selamanya", () => {
    const navigation = read("components/aira-chat-navigation.tsx");
    expect(navigation).toContain("await moveToTrash(conversation.id)");
    expect(navigation).toContain("legacyHistoryMask");
    expect(navigation).toContain('accessibilityLabel={folder === "trash" ? "Opsi sampah percakapan"');
    expect(navigation).toContain('label="Pulihkan"');
    expect(navigation).toContain('label="Hapus selamanya"');
    expect(navigation).toContain("permanentlyDeleteConversation(conversation.id)");
  });
});
