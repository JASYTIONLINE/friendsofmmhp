/**
 * Apply alternating Saturday Karaoke / Dance schedule through Dec 2026.
 * Skips reserved events (Halloween, NYE) and pushes when another event occupies the slot.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "assets", "data", "json", "mmhp-master-data.json");
const outDir = path.join(root, "contents", "feature-events");

const K = {
  eventName: "Saturday Karaoke with DJ Kushman",
  cardLine1: "Karaoke with DJ Kushman",
  cardLine2: "Sat 7–10 PM · Hall A",
  adCopy:
    "Saturday karaoke is back for this night with DJ Kushman! Join neighbors in Hall A from 7:00 to 10:00 PM for music, singing, dancing, and friends. Grab the mic, make a request, and enjoy a fun McAllen Mobile Park evening together.",
  imagePath: "event-flyer/dj-kushman-karaoke-sq.png",
  imagePathFlyer: "event-flyer/dj-kushman-karaoke.png",
  stem: "dj-kushman-karaoke",
  invite: "Karaoke with DJ Kushman — everyone is welcome.",
};
const D = {
  eventName: "Saturday Dance with DJ Kushman",
  cardLine1: "Saturday Dance",
  cardLine2: "DJ Kushman",
  adCopy:
    "Saturday Dance with DJ Kushman brings neighbors together for a familiar McAllen Mobile Park evening of music, dancing, and friends. This is the Saturday evening dance event used when karaoke is not scheduled; check the date and time for the current scheduled night.",
  imagePath: "event-flyer/djdance-sq.png",
  imagePathFlyer: "event-flyer/djdance.png",
  stem: "djdance",
  invite: "Join neighbors for an evening in the hall - everyone is welcome.",
};

function cardLine3(date) {
  const [y, m, dd] = date.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${dd} ${y}`;
}

function longDate(date) {
  const [y, m, dd] = date.split("-").map(Number);
  return new Date(y, m - 1, dd).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function satBetween(start, end) {
  const out = [];
  const [y, m, dd] = start.split("-").map(Number);
  const endDt = new Date(+end.split("-")[0], +end.split("-")[1] - 1, +end.split("-")[2]);
  let dt = new Date(y, m - 1, dd);
  while (dt <= endDt) {
    if (dt.getDay() === 6) out.push(dt.toISOString().slice(0, 10));
    dt.setDate(dt.getDate() + 1);
  }
  return out;
}

function isReserved(f) {
  if (!f || f.isActive === false) return false;
  const n = String(f.eventName || f.cardLine1 || "").toLowerCase();
  return /halloween|new year|gala|benefit|howlers|band|encore|4th of july|spooktacular/i.test(n);
}

function isKdMatch(f, want) {
  if (!f || f.isActive === false) return false;
  const n = String(f.eventName || "").toLowerCase();
  if (want === "karaoke") return /karaoke with dj kushman|saturday karaoke/i.test(n);
  return /saturday dance with dj kushman/i.test(n);
}

function isOccupiedOther(f, want) {
  if (!f || f.isActive === false) return false;
  if (isReserved(f)) return true;
  if (isKdMatch(f, want)) return false;
  if (/canceled/i.test(String(f.eventName || ""))) return false;
  return f.isFeatured !== false;
}

function buildPage({ date, cfg, featureId }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cfg.eventName} | McAllen Mobile Park Events</title>
  <link rel="icon" type="image/svg+xml" href="../../assets/images/stock-images/favicon.svg" />
  <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body id="top" class="feature-events-page"
  data-mmhp-master-json="../../assets/data/json/mmhp-master-data.json"
  data-mmhp-feature-id="${featureId}">
  <header class="feature-events-banner" aria-label="McAllen Mobile Park">
    <img src="../../assets/images/park-b-roll/park-banner.png" alt="McAllen Mobile Park">
    <div class="feature-events-banner-text">
      <h1>McAllen Mobile Park</h1>
      <p>Community events in the RGV — we’re glad you’re here.</p>
    </div>
  </header>
  <div class="feature-events-wave" aria-hidden="true"></div>
  <nav class="feature-events-actions" aria-label="Featured event actions">
    <a class="feature-events-back" href="../../index.html">← Back To Calendar</a>
  </nav>
  <main class="feature-events-main">
    <h1 class="feature-events-title">${cfg.eventName}</h1>
    <div class="feature-events-grid">
      <div class="feature-events-box feature-events-feature-frame">
        <img src="../../assets/images/${cfg.imagePathFlyer}" alt="${cfg.eventName} flyer">
      </div>
      <section class="feature-events-box feature-events-story" aria-labelledby="feature-event-story-heading">
        <h2 id="feature-event-story-heading">About this featured event</h2>
        <div class="feature-events-about"><p>${cfg.adCopy}</p></div>
      </section>
      <div class="feature-events-box feature-events-details">
        <h2>When &amp; where</h2>
        <div class="feature-events-when">
          <div class="feature-events-when-actions">
            <button type="button" class="feature-events-ribbon" id="feature-events-save-calendar"
              aria-haspopup="dialog" aria-controls="feature-events-ics-help-dialog"
              aria-label="Save The Date: Open Instructions To Add This Event To Your Calendar">Save The Date</button>
            <a class="feature-events-directions" href="https://maps.app.goo.gl/6st9THqUttarC7vUA" target="_blank" rel="noopener noreferrer">Get Directions</a>
          </div>
          <time datetime="${date}T19:00">${longDate(date)}</time>
          <p class="feature-events-time-pill" aria-label="Event time">7:00 PM - 10:00 PM · Hall A</p>
          <p class="feature-events-invite">${cfg.invite}</p>
        </div>
        <p class="feature-events-loc"><strong>Location</strong> McAllen Mobile Park · Hall A<br>4900 N Mc Coll Rd, McAllen, TX</p>
      </div>
    </div>
  </main>
  <footer class="feature-events-footer">
    <address>McAllen Mobile Park · 4900 N Mc Coll Rd · McAllen, TX 78504</address>
    <a href="../../index.html">Calendar Home</a> · <a href="https://maps.app.goo.gl/sVCaEKHYQw5QcqK7A" target="_blank" rel="noopener noreferrer">Directions</a>
    <a href="#top" class="site-footer-back-top" aria-label="Back To Top Of Page">Back To Top</a>
  </footer>
  <script src="../../assets/js/mmhp-coordinator-config.js" defer></script>
  <script src="../../assets/js/feature-events-ics.js" defer></script>
</body>
</html>`;
}

function applyCopy(f, date, cfg) {
  f.date = date;
  f.startTime = "19:00";
  f.endTime = "22:00";
  f.location = "Hall A";
  f.isActive = true;
  f.isFeatured = true;
  f.cardLine1 = cfg.cardLine1;
  f.cardLine2 = cfg.cardLine2;
  f.cardLine3 = cardLine3(date);
  f.eventName = cfg.eventName;
  f.adCopy = cfg.adCopy;
  f.description = cfg.adCopy;
  f.imagePath = cfg.imagePath;
  f.imagePathFlyer = cfg.imagePathFlyer;
  f.detailPath = `contents/feature-events/${date}-1900-${cfg.stem}.html`;
}

const d = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const feats = d.features;
const byDate = Object.fromEntries(feats.map((f) => [f.date, f]));
const byId = Object.fromEntries(feats.map((f) => [f.featureId || f.id, f]));

const plan = [];
let want = "karaoke";
for (const date of satBetween("2026-09-05", "2026-12-31")) {
  if (date === "2026-09-05" || date === "2026-09-12") continue;
  const f = byDate[date];
  if (isReserved(f)) {
    plan.push({ date, action: "skip-reserved", event: f?.eventName });
    continue;
  }
  if (f && isOccupiedOther(f, want)) {
    plan.push({ date, action: "skip-push", want, event: f.eventName });
    continue;
  }
  if (f && isKdMatch(f, want)) {
    plan.push({ date, action: "update-match", want, featureId: f.featureId || f.id });
    want = want === "karaoke" ? "dance" : "karaoke";
    continue;
  }
  plan.push({ date, action: "assign", want, featureId: f?.featureId || f?.id });
  want = want === "karaoke" ? "dance" : "karaoke";
}

let nextNum = 62;
function nextFeatureId() {
  while (byId[`fe${String(nextNum).padStart(4, "0")}`]) nextNum++;
  const id = `fe${String(nextNum).padStart(4, "0")}`;
  nextNum++;
  return id;
}

const pages = [];
for (const p of plan) {
  if (p.action === "skip-reserved" || p.action === "skip-push") continue;
  const cfg = p.want === "karaoke" ? K : D;
  let f = p.featureId ? byId[p.featureId] : null;
  if (!f) {
    const id = nextFeatureId();
    f = { featureId: id, id };
    feats.push(f);
    byId[id] = f;
  }
  applyCopy(f, p.date, cfg);
  byDate[p.date] = f;
  pages.push({ date: p.date, cfg, featureId: f.featureId || f.id, detailPath: f.detailPath });
}

fs.writeFileSync(jsonPath, JSON.stringify(d, null, 2) + "\n");
for (const p of pages) {
  fs.writeFileSync(path.join(outDir, path.basename(p.detailPath)), buildPage(p));
}

console.log("Saturday K/D schedule applied:");
for (const p of plan) {
  console.log(p.date, p.action, p.want || "", p.event || "");
}
console.log("Wrote", pages.length, "event pages");
