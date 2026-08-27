import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import pptxgen from "pptxgenjs";

import { invokeLLM, listLLMModels } from "./_core/llm";
import { storageGetSignedUrl, storagePut } from "./storage";

export type AiraDocumentKind = "pdf" | "word" | "powerpoint" | "excel" | "markdown" | "text";

type OutlineSection = { heading: string; paragraphs: string[]; bullets: string[] };
type DocumentOutline = { title: string; summary: string; sections: OutlineSection[]; table: { headers: string[]; rows: string[][] } };

const documentMeta: Record<AiraDocumentKind, { extension: string; mimeType: string; label: string }> = {
  pdf: { extension: "pdf", mimeType: "application/pdf", label: "Dokumen PDF Aira" },
  word: { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Dokumen Word Aira" },
  powerpoint: { extension: "pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", label: "Presentasi Aira" },
  excel: { extension: "xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "Spreadsheet Aira" },
  markdown: { extension: "md", mimeType: "text/markdown", label: "Dokumen Markdown Aira" },
  text: { extension: "txt", mimeType: "text/plain", label: "Dokumen Teks Aira" },
};

function cleanText(value: unknown, fallback: string, maxLength: number) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return (text || fallback).slice(0, maxLength);
}

function normalizeOutline(value: unknown): DocumentOutline {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const sections = rawSections.map((entry, index) => {
    const section = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
    return {
      heading: cleanText(section.heading, `Bagian ${index + 1}`, 100),
      paragraphs: (Array.isArray(section.paragraphs) ? section.paragraphs : []).map((item) => cleanText(item, "", 700)).filter(Boolean).slice(0, 5),
      bullets: (Array.isArray(section.bullets) ? section.bullets : []).map((item) => cleanText(item, "", 180)).filter(Boolean).slice(0, 6),
    };
  }).filter((section) => section.paragraphs.length || section.bullets.length).slice(0, 8);
  const rawTable = raw.table && typeof raw.table === "object" ? raw.table as Record<string, unknown> : {};
  const headers = (Array.isArray(rawTable.headers) ? rawTable.headers : []).map((item) => cleanText(item, "Kolom", 60)).slice(0, 6);
  const rows = (Array.isArray(rawTable.rows) ? rawTable.rows : []).map((row) => Array.isArray(row) ? row.map((cell) => cleanText(cell, "", 180)).slice(0, Math.max(headers.length, 1)) : []).filter((row) => row.length).slice(0, 30);
  return {
    title: cleanText(raw.title, "Dokumen Aira", 120),
    summary: cleanText(raw.summary, "Konten dibuat Aira berdasarkan permintaan pengguna.", 420),
    sections: sections.length ? sections : [{ heading: "Isi", paragraphs: [cleanText(raw.content, "Konten belum tersedia.", 1400)], bullets: [] }],
    table: { headers, rows },
  };
}

function outlineToText(outline: DocumentOutline) {
  return [outline.title, "", outline.summary, "", ...outline.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...section.bullets.map((bullet) => `• ${bullet}`), ""]), ...(outline.table.headers.length ? [outline.table.headers.join(" | "), ...outline.table.rows.map((row) => row.join(" | "))] : [])].join("\n").trim();
}

async function createOutline(prompt: string, language: string) {
  const catalog = await listLLMModels();
  const model = catalog.data.find((item) => item.id === "gpt-5-mini")?.id ?? catalog.data.find((item) => item.id.startsWith("gemini-3-flash"))?.id ?? catalog.data[0]?.id;
  const response = await invokeLLM({
    model,
    messages: [{ role: "system", content: `You create concise, useful document outlines in ${language}. Return valid JSON only with title, summary, sections (array of heading, paragraphs array, bullets array), and table (headers array, rows array). Do not include sensitive personal data, credentials, or unsupported factual claims. Keep a maximum of 8 sections and 30 table rows.` }, { role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message?.content;
  const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => part.type === "text" ? part.text : "").join("") : "{}";
  try { return normalizeOutline(JSON.parse(text)); } catch { return normalizeOutline({ title: "Dokumen Aira", content: text }); }
}

async function buildPdf(outline: DocumentOutline) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ margin: 48 }); const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk))); document.on("error", reject); document.on("end", () => resolve(Buffer.concat(chunks)));
    document.fontSize(20).fillColor("#1267C9").text(outline.title); document.moveDown(.45); document.fontSize(10).fillColor("#435168").text(outline.summary); document.moveDown();
    outline.sections.forEach((section) => { document.fontSize(14).fillColor("#173B65").text(section.heading); document.moveDown(.25); document.fontSize(11).fillColor("#1A2433"); section.paragraphs.forEach((paragraph) => document.text(paragraph, { lineGap: 3 })); section.bullets.forEach((bullet) => document.text(`• ${bullet}`, { indent: 12, lineGap: 2 })); document.moveDown(.65); });
    if (outline.table.headers.length) { document.fontSize(12).fillColor("#173B65").text("Data ringkas"); document.fontSize(9).fillColor("#1A2433").text(outline.table.headers.join("  |  ")); outline.table.rows.forEach((row) => document.text(row.join("  |  "))); }
    document.end();
  });
}

async function buildWord(outline: DocumentOutline) {
  const children = [
    new Paragraph({ text: outline.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: outline.summary }),
    ...outline.sections.flatMap((section) => [
      new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }),
      ...section.paragraphs.map((paragraph) => new Paragraph(paragraph)),
      ...section.bullets.map((bullet) => new Paragraph({ text: bullet, bullet: { level: 0 } })),
    ]),
  ];
  const document = new Document({ sections: [{ children }] });
  return Packer.toBuffer(document);
}

async function buildExcel(outline: DocumentOutline) {
  const workbook = new ExcelJS.Workbook(); workbook.creator = "V A I R A  A I";
  const overview = workbook.addWorksheet("Ringkasan"); overview.views = [{ showGridLines: false }]; overview.getColumn(1).width = 3; overview.mergeCells("B2:G2"); overview.getCell("B2").value = outline.title; overview.getCell("B2").font = { name: "Calibri", size: 20, bold: true, color: { argb: "FF1267C9" } }; overview.mergeCells("B3:G4"); overview.getCell("B3").value = outline.summary; overview.getCell("B3").alignment = { wrapText: true, vertical: "top" }; overview.getCell("B6").value = "Dibuat oleh V A I R A  A I"; overview.getCell("B6").font = { italic: true, color: { argb: "FF687076" } };
  const content = workbook.addWorksheet("Konten", { views: [{ state: "frozen", ySplit: 1, showGridLines: false }] }); content.columns = [{ width: 24 }, { width: 74 }]; content.addRow(["Bagian", "Isi"]); content.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; content.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1267C9" } }; outline.sections.forEach((section) => content.addRow([section.heading, [...section.paragraphs, ...section.bullets.map((bullet) => `• ${bullet}`)].join("\n")])); content.eachRow((row) => { row.alignment = { vertical: "top", wrapText: true }; });
  if (outline.table.headers.length) { const data = workbook.addWorksheet("Data", { views: [{ state: "frozen", ySplit: 1, showGridLines: false }] }); data.addRow(outline.table.headers); data.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; data.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1267C9" } }; outline.table.rows.forEach((row) => data.addRow(row)); data.columns.forEach((column) => { column.width = 22; }); }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function buildPowerPoint(outline: DocumentOutline) {
  const presentation = new pptxgen(); presentation.layout = "LAYOUT_WIDE"; presentation.author = "V A I R A  A I"; presentation.subject = outline.summary;
  const cover = presentation.addSlide(); cover.background = { color: "F7FAFF" }; cover.addText(outline.title, { x: .65, y: 1.35, w: 11.8, h: .7, fontFace: "Aptos Display", fontSize: 28, bold: true, color: "1267C9" }); cover.addText(outline.summary, { x: .7, y: 2.2, w: 11.2, h: 1.2, fontFace: "Aptos", fontSize: 15, color: "435168", breakLine: false }); cover.addText("Dibuat oleh V A I R A  A I", { x: .7, y: 6.5, w: 4, h: .3, fontSize: 9, color: "687076" });
  outline.sections.slice(0, 8).forEach((section) => { const slide = presentation.addSlide(); slide.background = { color: "FFFFFF" }; slide.addText(section.heading, { x: .65, y: .55, w: 11.5, h: .5, fontFace: "Aptos Display", fontSize: 23, bold: true, color: "1267C9" }); const bullets = [...section.paragraphs, ...section.bullets.map((bullet) => `• ${bullet}`)].join("\n\n"); slide.addText(bullets || "Tidak ada rincian tambahan.", { x: .8, y: 1.4, w: 11, h: 4.8, fontFace: "Aptos", fontSize: 15, color: "1A2433", breakLine: false, valign: "top", margin: 0.04 }); });
  const result = await presentation.write({ outputType: "nodebuffer" }); return Buffer.from(result as Buffer);
}

export async function generateAiraDocument(kind: AiraDocumentKind, prompt: string, language: string, accountId: number) {
  const outline = await createOutline(prompt, language); const meta = documentMeta[kind];
  const data = kind === "pdf" ? await buildPdf(outline) : kind === "word" ? await buildWord(outline) : kind === "excel" ? await buildExcel(outline) : kind === "powerpoint" ? await buildPowerPoint(outline) : Buffer.from(kind === "markdown" ? `# ${outlineToText(outline).replace(/\n/g, "\n\n")}` : outlineToText(outline), "utf8");
  const safeTitle = outline.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 48) || "dokumen-aira";
  const stored = await storagePut(`aira-generated/${accountId}/${Date.now()}-${safeTitle}.${meta.extension}`, data, meta.mimeType);
  const url = await storageGetSignedUrl(stored.key);
  return { ...meta, url, storageKey: stored.key, title: outline.title, summary: outline.summary };
}
