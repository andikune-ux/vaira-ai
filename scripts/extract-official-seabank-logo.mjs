import fs from "node:fs";

const htmlPath = "/home/ubuntu/browser_html/seabank_co_id_page_1786982642206.html";
const outputPath = "/home/ubuntu/copy-of-airax-ai/.brand-downloads/seabank-official.svg";
const html = fs.readFileSync(htmlPath, "utf8");
const marker = 'class="_seabankLogo_kj6i1_694 row-start"';
const markerIndex = html.indexOf(marker);
if (markerIndex < 0) throw new Error("SeaBank logo marker not found");
const svgStart = html.lastIndexOf("<svg", markerIndex);
const svgEnd = html.indexOf("</svg>", markerIndex);
if (svgStart < 0 || svgEnd < 0) throw new Error("SeaBank inline SVG bounds not found");
const svg = html.slice(svgStart, svgEnd + "</svg>".length);
fs.writeFileSync(outputPath, svg + "\n");
console.log(outputPath, svg.length);
