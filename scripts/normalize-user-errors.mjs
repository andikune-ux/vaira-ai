import fs from "node:fs";
import path from "node:path";

const root = path.resolve("app");
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith(".tsx")) files.push(full);
  }
}
walk(root);
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("error instanceof Error ? error.message")) continue;
  if (!text.includes("@/lib/user-facing-error")) {
    const marker = text.includes('import { trpc }') ? text.match(/import \{ trpc \}[^\n]*\n/)?.[0] : null;
    if (marker) text = text.replace(marker, `${marker}import { getUserFacingError } from "@/lib/user-facing-error";\n`);
    else text = `import { getUserFacingError } from "@/lib/user-facing-error";\n${text}`;
  }
  text = text.replace(/error instanceof Error \? error\.message : "([^"]+)"/g, 'getUserFacingError(error, "$1")');
  fs.writeFileSync(file, text);
}
