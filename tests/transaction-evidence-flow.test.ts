import fs from "node:fs";

import { describe, expect, it } from "vitest";

const read = (path: string) => fs.readFileSync(path, "utf8");

describe("alur metadata bukti transaksi", () => {
  const scan = read("app/scan-receipt.tsx");
  const add = read("app/add-transaction.tsx");
  const confirm = read("app/confirm-transaction.tsx");
  const history = read("app/transactions.tsx");
  const plan = read("app/plan-form.tsx");
  const fields = read("components/transaction-evidence-fields.tsx");
  const walletMatch = read("lib/finance/receipt-wallet-match.ts");
  const commitmentSync = read("lib/finance/commitment-sync.ts");

  it("meneruskan metadata OCR dan dasar klasifikasi dompet lokal ke konfirmasi", () => {
    expect(scan).toContain("classifyReceiptWithWallets(result, state.wallets)");
    expect(walletMatch).toContain("classificationBasis");
    expect(scan).toContain("evidenceJson: serializeTransactionEvidence(evidence)");
    expect(confirm).toContain("const evidence = parseTransactionEvidence(params.evidenceJson)");
    expect(confirm).toContain("evidence,");
  });

  it("menampilkan dan menyunting metadata yang sama pada Pindai Bukti serta tambah-edit transaksi", () => {
    expect(scan).toContain("<TransactionEvidenceFields value={evidence} onChange={setEvidence} />");
    expect(add).toContain("<TransactionEvidenceFields value={evidence} onChange={setEvidence} />");
    expect(add).toContain("Pindai bukti");
    expect(add).toContain("Foto bukti terpasang");
    expect(add).toContain("Tanggal dan jam transaksi");
    expect(add).toContain("<TransactionDatePicker value={transactionDate} onChange={setTransactionDate} />");
    expect(add).toContain("Pratinjau foto bukti");
    expect(add).toContain("Hapus foto");
    expect(add).toContain("setEvidence(existing.evidence ?? {})");
    expect(add).toContain("setProofUri(existing.proofUri)");
    expect(history).toContain("evidenceLabel");
    expect(fields).toContain("Nomor rekening pengirim");
    expect(fields).toContain("ID transaksi / nomor referensi");
  });

  it("menjaga hasil OCR ringkas dan menyembunyikan field tambahan sampai pengguna memintanya", () => {
    expect(fields).toContain('const [expanded, setExpanded] = useState(false)');
    expect(fields).not.toContain("useEffect");
    expect(fields).toContain("Field kosong tidak wajib diisi.");
    expect(scan).toContain("showOptionalDetails");
    expect(scan).toContain("Tambah nama atau keterangan lain");
    expect(scan).toContain("Keterangan tambahan (opsional)");
  });

  it("menyaring hubungan Hutang/Piutang mengikuti jenis transaksi", () => {
    expect(scan).toContain('const visibleCommitmentOptions = kind === "transfer" ? [] : COMMITMENT_FLOW_OPTIONS.filter((option) => option.kind === kind)');
    expect(scan).toContain('{kind !== "transfer" ? <>');
    expect(scan).not.toContain("COMMITMENT_FLOW_OPTIONS.map");
    expect(commitmentSync).toContain('label: "Hutang diterima"');
    expect(commitmentSync).toContain('label: "Terima piutang"');
    expect(commitmentSync).toContain('label: "Bayar hutang"');
    expect(commitmentSync).toContain('label: "Piutang diberikan"');
  });

  it("membersihkan note OCR dan tidak menambahkan metadata pihak ke Keterangan secara otomatis", () => {
    expect(scan).toContain("const cleanOcrNote =");
    expect(scan).toContain("setNote(isGeneratedOcrNote(cleanedNote) ? \"\" : cleanedNote)");
    expect(scan).toContain('note: note.trim() || "Bukti transaksi"');
    expect(scan).not.toContain("appendReceiptCounterpartyToNote(note");
  });

  it("membuat draft Tagihan pinjaman hanya dari konfirmasi transaksi Hutang yang terdeteksi", () => {
    expect(confirm).toContain("const isLoanLikeDebt");
    expect(confirm).toContain("Lengkapi Tagihan");
    expect(confirm).toContain('sheet: "bill"');
    expect(plan).toContain("draftTitle?: string");
    expect(plan).toContain("draftAmount?: string");
    expect(plan).toContain("draftCounterparty?: string");
  });

  it("menyediakan Pindai Bukti khusus dari kartu Hutang dan Piutang", () => {
    expect(plan).toContain('pathname: "/scan-receipt"');
    expect(plan).toContain("commitmentFlow: settlementFlow");
    expect(scan).toContain("const params = useLocalSearchParams");
  });
});
