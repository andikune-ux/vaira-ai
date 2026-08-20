import fs from "node:fs";
const source = fs.readFileSync("app/global-room-chat.tsx", "utf8");
const markers = ["Room Global aktif untuk percakapan publik", "Peserta audio", "Keluar room", "styles.speakerStrip", "styles.audioWave"];
const out = markers.map((marker) => {
  const index = source.indexOf(marker);
  return `=== ${marker} @ ${index} ===\n${index >= 0 ? source.slice(Math.max(0, index - 900), index + 2200) : "NOT FOUND"}`;
}).join("\n\n");
fs.writeFileSync("notes/room-layout-blocks.txt", out);
