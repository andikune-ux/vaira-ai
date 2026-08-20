import fs from "node:fs";
const source = fs.readFileSync("app/global-room-chat.tsx", "utf8");
const markers = ["headerMainRow", "<Text style={[styles.roomTitle", "styles.chatCard", "styles.composer"];
const out = markers.map((marker) => {
  const index = source.indexOf(marker);
  return `=== ${marker} @ ${index} ===\n${index >= 0 ? source.slice(Math.max(0, index - 1600), index + 2400) : "NOT FOUND"}`;
}).join("\n\n");
fs.writeFileSync("notes/room-header-blocks.txt", out);
