import fs from "node:fs";

const path = "app/administrator.tsx";
const source = fs.readFileSync(path, "utf8");
const start = source.indexOf('    <View style={styles.terminalPanel}><View style={styles.accountListHeader}><View style={styles.accountText}><Text style={styles.panelLabel}>PESAN ROOM GLOBAL</Text>');
const end = source.indexOf('{selectedReport ?', start);
if (start < 0 || end < 0 || end <= start) throw new Error("Inline admin message panel markers not found");
const next = source.slice(0, start) + source.slice(end);
fs.writeFileSync(path, next);
