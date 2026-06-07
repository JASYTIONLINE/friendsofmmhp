/**
 * Export featured events from the JSON source of truth to a CSV audit file.
 *
 * The CSV this script writes is disposable review output for Excel or Google Sheets.
 * Edit assets/data/json/mmhp-master-data.json directly when event data changes.
 *
 * Run: npm run export:features
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "assets", "data", "json", "mmhp-master-data.json");
const outDir = path.join(root, "assets", "data", "csv", "export");
const outPath = path.join(outDir, "featured-events-audit.csv");

const columns = [
  "featureId",
  "date",
  "startTime",
  "endTime",
  "location",
  "isActive",
  "isFeatured",
  "cardLine1",
  "cardLine2",
  "cardLine3",
  "eventName",
  "adCopy",
  "description",
  "imagePath",
  "imagePathFlyer",
  "featuredPinOrder",
  "detailPath",
];

function csvCell(value) {
  if (value == null) return "";
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function main() {
  const master = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const features = Array.isArray(master.features) ? master.features : [];
  fs.mkdirSync(outDir, { recursive: true });

  const lines = [columns.map(csvCell).join(",")];
  for (const feature of features) {
    lines.push(columns.map((column) => csvCell(feature[column])).join(","));
  }

  fs.writeFileSync(outPath, "\uFEFF" + lines.join("\r\n") + "\r\n", "utf8");
  console.log("Wrote", features.length, "featured events to", path.relative(root, outPath));
}

main();
