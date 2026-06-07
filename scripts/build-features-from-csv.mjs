/**
 * Offline merge: replace the `features` array in mmhp-master-data.json from featured-events.csv.
 *
 * Why a CSV step exists: Coordinators think in spreadsheets; the site thinks in JSON. This script is
 * the bridge—run locally after editing the CSV so the static site and build:feature-pages share one
 * canonical feature list without hand-copying dozens of fields.
 *
 * How it works: Parses RFC-style CSV with quoted fields, maps columns to feature objects (dates,
 * times, adCopy for repeatable Karaoke/DJ rows, computed endTime), writes JSON with the rest of the
 * master file untouched. Not loaded in the browser.
 *
 * Run: node scripts/build-features-from-csv.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const csvPath = path.join(root, "assets", "data", "csv", "featured-events.csv");
const jsonPath = path.join(root, "assets", "data", "json", "mmhp-master-data.json");

const LISTING_SEP = " — ";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
          continue;
        }
        inQuotes = false;
        continue;
      }
      field += c;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\r") continue;
    if (c === "\n") {
      row.push(field);
      if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += c;
  }
  row.push(field);
  if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
  return rows;
}

function formatCardLine3FromIso(ymd) {
  const p = String(ymd || "")
    .trim()
    .split("-");
  if (p.length !== 3) return "";
  const y = parseInt(p[0], 10);
  const mo = parseInt(p[1], 10) - 1;
  const d = parseInt(p[2], 10);
  if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(d)) return "";
  const dt = new Date(y, mo, d);
  return dt
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "7:00 PM" -> "19:00", "7:30 AM" -> "07:30" */
function parseTimeTo24h(s) {
  const t = String(s || "").trim();
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t);
  if (!m) return "19:00";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return String(h).padStart(2, "0") + ":" + min;
}

function addHours24h(hhmm, hours) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!m) return "";
  const h = (parseInt(m[1], 10) + hours) % 24;
  return String(h).padStart(2, "0") + ":" + m[2];
}

function repeatableAdCopy(cardLine1, cardLine2, imagePath) {
  const line1 = String(cardLine1 || "").trim().toLowerCase();
  const line2 = String(cardLine2 || "").trim().toLowerCase();
  const image = String(imagePath || "").trim().toLowerCase();
  if (line1.includes("karaoke") || line2.includes("karaoke") || image.includes("karaoke")) {
    if (line1.includes("dance") || line2.includes("dj") || image.includes("djdance")) {
      return "Dance Party with DJ Dana brings neighbors together for a familiar McAllen Mobile Park evening of music, dancing, and karaoke-style fun. Check the date and time for the current scheduled night.";
    }
    return "Karaoke night is a familiar McAllen Mobile Park feature where neighbors can sing, listen, and spend an easy evening together in the hall. Check the date and time for the current scheduled night.";
  }
  if (line1.includes("dance party") || image.includes("djdance")) {
    return "Dance Party with DJ Dana brings neighbors together for a familiar McAllen Mobile Park evening of music, dancing, and karaoke-style fun. Check the date and time for the current scheduled night.";
  }
  return "";
}

function parseBoolCell(val, defaultVal) {
  const s = String(val != null ? val : "").trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return defaultVal;
}

function deriveListingTitle(cardLine1, cardLine2) {
  const c1 = String(cardLine1 || "").trim();
  const c2 = String(cardLine2 || "").trim();
  if (!c1 && !c2) return "";
  if (!c1) return c2;
  if (!c2) return c1;
  return c1 + LISTING_SEP + c2;
}

/** Relative to assets/images. CSV Image may be "event-flyer/x.jpg" or "x.jpg". */
function resolveImagePath(cardLine1, cardLine2, imageCell) {
  let raw = String(imageCell != null ? imageCell : "").trim();
  if (raw) {
    if (!raw.includes("/")) raw = "event-flyer/" + raw.replace(/^\/+/, "");
    return raw;
  }
  const c1 = String(cardLine1 || "").trim();
  const c2 = String(cardLine2 || "").trim();
  if (c1 === "Karaoke" && c2 === "Karaoke") return "event-flyer/karaoke.png";
  if (c1 === "DJ Dance" && c2 === "DJ Karaoke") return "event-flyer/djdance.png";
  return "";
}

function rowsToObjects(header, body) {
  const h = header.map((x) => String(x || "").trim());
  const objects = [];
  for (const cells of body) {
    const o = {};
    for (let i = 0; i < h.length; i++) {
      o[h[i]] = cells[i] != null ? String(cells[i]).trim() : "";
    }
    objects.push(o);
  }
  return objects;
}

function main() {
  const text = fs.readFileSync(csvPath, "utf8");
  const lines = text.split(/\r?\n/);
  const dataLines = lines
    .filter((ln) => {
      const s = ln.trim();
      return s.length > 0 && !s.startsWith("#");
    })
    .join("\n");

  const table = parseCsv(dataLines);
  if (table.length < 2) {
    console.error("No data rows in featured-events.csv");
    process.exit(1);
  }

  const header = table[0].map((c) => String(c || "").trim());
  const required = ["Date", "Time", "Event", "Activity"];
  for (const col of required) {
    if (!header.includes(col)) {
      console.error("Missing column:", col);
      process.exit(1);
    }
  }

  const body = table.slice(1);
  const objectRows = rowsToObjects(header, body);
  const features = [];

  let n = 1;
  for (const o of objectRows) {
    const date = String(o.Date || "").trim();
    if (!date) continue;
    const timeRaw = String(o.Time || "").trim();
    const cardLine1 = String(o.Event || "").trim();
    const cardLine2 = String(o.Activity || "").trim();
    if (!cardLine1 || !cardLine2) {
      console.warn("Skipping row missing Event or Activity:", o);
      continue;
    }

    const desc = String(o.Description || "").trim();
    const location = String(o.Location || "").trim() || "Hall A";
    const isFeatured = parseBoolCell(o.isFeatured, true);

    const numStr = String(n);
    const padded = numStr.length < 4 ? "0".repeat(4 - numStr.length) + numStr : numStr;
    const featureId = "fe" + padded;
    n++;

    const startTime = parseTimeTo24h(timeRaw);
    const endTimeRaw = String(o.EndTime != null ? o.EndTime : "").trim();
    const endTime = endTimeRaw ? parseTimeTo24h(endTimeRaw) : addHours24h(startTime, 3);
    const eventName = deriveListingTitle(cardLine1, cardLine2);
    const cardLine3 = formatCardLine3FromIso(date);
    const imagePath = resolveImagePath(cardLine1, cardLine2, o.Image);
    const imagePathFlyer = resolveImagePath("", "", o.ImageFlyer != null ? o.ImageFlyer : "");
    const adCopy = desc || repeatableAdCopy(cardLine1, cardLine2, imagePath);

    const row = {
      featureId,
      id: featureId,
      date,
      startTime,
      endTime,
      location,
      isActive: true,
      isFeatured,
      cardLine1,
      cardLine2,
      cardLine3,
      eventName,
      adCopy,
    };
    if (desc) row.description = desc;
    if (imagePath) row.imagePath = imagePath;
    if (imagePathFlyer) row.imagePathFlyer = imagePathFlyer;
    const pinRaw = String(o.PinOrder != null ? o.PinOrder : "").trim();
    const pinOrder = pinRaw ? parseInt(pinRaw, 10) : 0;
    if (Number.isFinite(pinOrder) && pinOrder > 0) row.featuredPinOrder = pinOrder;
    const detailPath = String(o.DetailPath != null ? o.DetailPath : "").trim().replace(/^\/+/, "");
    if (detailPath) row.detailPath = detailPath;
    features.push(row);
  }

  const master = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  master.features = features;
  fs.writeFileSync(jsonPath, JSON.stringify(master, null, 2) + "\n", "utf8");
  console.log("Wrote", features.length, "features to", path.relative(root, jsonPath));
}

main();
