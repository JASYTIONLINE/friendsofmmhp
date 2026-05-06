/**
 * One-off/local QA: list relative href/src targets missing on disk.
 * Run: node scripts/audit-local-html-links.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const extUrl = /^(https?:|mailto:|tel:|data:|#)/i;

const htmlFiles = [];
function walk(d) {
  for (const n of fs.readdirSync(d)) {
    if (n === "node_modules" || n === ".git") continue;
    const p = path.join(d, n);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (n.endsWith(".html")) htmlFiles.push(p);
  }
}
walk(root);

const bad = [];
for (const file of htmlFiles) {
  const relFile = path.relative(root, file);
  const dir = path.dirname(file);
  const text = fs.readFileSync(file, "utf8");
  const re = /\b(?:href|src)=(["'])([^"']+)\1/gi;
  let m;
  while ((m = re.exec(text))) {
    const u = m[2].trim();
    if (!u || extUrl.test(u) || u.startsWith("//")) continue;
    const clean = u.split("#")[0].split("?")[0];
    const target = path.normalize(path.join(dir, clean));
    if (!fs.existsSync(target)) bad.push({ relFile, u });
  }
}
bad.sort((a, b) => (a.relFile + a.u).localeCompare(b.relFile + b.u));
if (bad.length) console.log(JSON.stringify(bad, null, 2));
console.log("missing count:", bad.length);
process.exit(bad.length ? 1 : 0);
