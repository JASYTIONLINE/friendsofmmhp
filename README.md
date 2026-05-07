# mmpeventcalendar

This repository implements a **McAllen Mobile Park Events** web presence: the home page foregrounds the community calendar, while sidebars and cards surface structured schedule data. The implementation relies on static **HTML**, a **single global stylesheet**, and **client-side JavaScript** only; there is no application server in the architecture.

The project is **not** an official park management system. Operational questions belong with park management.

---

## Contents

- [Week 8 sprint workflow](#week-8-sprint-workflow)
- [Final project promise](#final-project-promise)
- [How the finished site is used](#how-the-finished-site-is-used)
- [Final submission access](#final-submission-access)
- [Project completion and quality assurance](#project-completion-and-quality-assurance)
- [Case study (capstone narrative)](#case-study-capstone-narrative)
- [Repository layout](#repository-layout) (includes [activity flyer pages](#activity-flyer-pages))
- [Structure, UI, and presentation](#structure-ui-and-presentation)
- [Pages and content types](#pages-and-content-types)
- [Client-side JavaScript](#client-side-javascript)
- [Data and automation](#data-and-automation)
- [Data model (reference)](#data-model-reference) — broader entity architecture for **future** site versions (not everything below is exercised by the current static build)
- [Closing remarks](#closing-remarks)

---

## Week 8 sprint workflow

This section restates the Week 8 execution order from course guidance: the **official rubric and Week 8 instructions** define what must be submitted and how it is graded; this README is the working **promise + QA/QC** surface for the repository and the deployed site.

1. **README as promise** — [Final project promise](#final-project-promise) and [Project completion and quality assurance](#project-completion-and-quality-assurance) describe the finished product and how it was verified; development closed gaps until the **deployed site** matched that narrative.
2. **Align the site** — Data ([**mmhp-master-data.json**](assets/data/json/mmhp-master-data.json)), generated feature pages (**npm run build:feature-pages**), links (**npm run audit:links**), forms, exports, and repo hygiene were brought in line with the README and the rubric.
3. **Initial QA/QC pass (pre–Phase 6)** — Validate the **public deployment** (see [Final submission access](#final-submission-access)), fix defects, and record intentional exceptions. The **official rubric** must be satisfied before treating the project as complete.
4. **Post–initial-QA adjustments** — After that pass, apply any final copy or layout tweaks before freeze.
5. **Phase 6 — Final go/no-go** — Confirm the **rubric** is met, then confirm this **README** still accurately describes the **live site** at the graded URL; that pairing is the submit/no-submit decision per Week 8 guidance.

Throughout: **commit and push in small, single-purpose batches** so the live site can be validated after each change.

## Final project promise

McAllen Mobile Park Events is a finished static community calendar site for residents, activity organizers, and the event coordinator. It gives residents one readable place to find regular park activities, upcoming featured events, event details, location information, and contact/submission paths.

The finished product is intentionally simple: no login, no server, no database service, and no park-management workflow. The site uses static pages plus browser JavaScript to read the current calendar data from [**assets/data/json/mmhp-master-data.json**](assets/data/json/mmhp-master-data.json). The Google Calendar embed remains the familiar calendar view, while the JSON-powered sidebars, cards, exports, forms, and generated pages provide curated park-event information around it.

The final site promises the following:

- Residents can open the home page and immediately understand the current recurring schedule, the embedded community calendar, and the highlighted upcoming featured events.
- Recurring activities are listed from the master JSON data, sorted into a readable Monday-through-Sunday sidebar, and linked to activity flyer pages where a flyer exists.
- Featured events are listed from the master JSON data, show event imagery and date information, and link to meaningful detail pages.
- Karaoke and DJ dance filler events use repeatable event-page copy and imagery with the correct date/time for each occurrence.
- One-off featured events use event-specific JSON data, image paths, and promotional copy.
- Event and activity request forms collect the information needed by the coordinator and provide email/share/download handoff behavior.
- Export buttons provide useful text or CSV downloads for recurring activities and featured events.
- Coordinator email links have real ***mailto:*** fallbacks and are also wired through the shared coordinator config script.
- Calendar coordinators have a **discreet on-page shortcut** (the **secret squirrel** image link on the home page) to open **Google Calendar** for managing the same embedded calendar—without a prominent “admin” button for general visitors (**index.html**, class *secret-calendar-link*; see [How the finished site is used](#how-the-finished-site-is-used)).
- The repository contains only mission-required public files after the final scrub; background materials and future-use assets belong under ignored [**private/**](private/) folders.

## How the finished site is used

1. Open [**index.html**](index.html) or the deployed site.
2. Use the left sidebar to scan recurring activities by weekday.
3. Use the center calendar for the full calendar view.
4. Use the featured-event cards to open event detail pages.
5. Use **Request activity** for recurring activities that should be added to the sidebar schedule.
6. Use **Submit Event** for one-time featured events.
7. Use **Contact Event Coordinator** for calendar, submission, or social-event questions.

**Calendar coordinator shortcut (secret squirrel).** The home page includes a **low-visibility** image at the bottom ([**assets/images/secret-squirrel.png**](assets/images/secret-squirrel.png)) inside a link with class *secret-calendar-link* in [**index.html**](index.html). It opens Google Calendar’s web app for the shared calendar used in the embed (the same *mmhpevents@gmail.com* source as the center iframe—see the *href* on that anchor). Coordinators who are allowed to edit that calendar in Google can use this as a **quick path to update events** without cluttering the main layout with an obvious “admin” or “manager” control for everyone else.

**Security and expectations:** The shortcut is **not** a password and **does not** embed credentials in the site. It is deliberately **unadvertised** (presentation obscurity, not encryption) so casual visitors see a clean community page first. If someone finds the link anyway, they are only taken to **Google Calendar** in their browser—the same as following any calendar URL. **Who may edit** the park calendar is enforced by **Google account permissions** for that calendar; the static site does not grant edit rights by itself.

## Final submission access

- **Source repository:** [github.com/JASYTIONLINE/mmpeventcalendar](https://github.com/JASYTIONLINE/mmpeventcalendar).
- **Live site (GitHub Pages):** [https://jasytionline.github.io/mmpeventcalendar/index.html](https://jasytionline.github.io/mmpeventcalendar/index.html) — graded deployment.
- **Local preview:** Clone the repo and open [**index.html**](index.html) from a **static HTTP server** rooted at the repository (many browsers restrict *file://* fetches for [**mmhp-master-data.json**](assets/data/json/mmhp-master-data.json)). For example: **npx serve .** from the repo root, then browse the URL the tool prints.
- **Hosting note:** The site is published with **GitHub Pages** at the repository root so *assets/…* and *contents/…* paths resolve the same as locally under a static server.

## Project completion and quality assurance

This section replaces the **development checklist** used during the build. It documents **what was completed** and **how acceptance was verified**, aligned with CMPA **4304** Week 8 expectations and the **official rubric** (which remains the authoritative grading instrument).

### Go/no-go sequence (Week 8)

Following course guidance, closure used a **two-step gate**: (1) confirm the **product and documentation** meet the **rubric**; (2) confirm this **README** still **accurately describes** the **deployed** experience at the [live site](#final-submission-access). That **README ↔ deployment** pairing is the final integrity check that the “promise document” matches reality—separate from, and after, rubric satisfaction.

### Delivered product (application)

The **static** McAllen Mobile Park Events site is live at GitHub Pages (URL above). It provides: a **home** layout with Monday–Sunday recurring schedule from [**mmhp-master-data.json**](assets/data/json/mmhp-master-data.json), embedded **Google Calendar**, **featured** regions (week spotlight / cards / Future Featured with month navigation as implemented), **operational** pages (*contents/*: learn-more, contact, request-activity, submit-feature), **activity flyer** pages linked from the sidebar where configured, **generated feature-event** pages from **npm run build:feature-pages**, **export** affordances for recurring and featured lists, **forms** with validation and coordinator handoff (mailto / share / download / ZIP as implemented), **coordinator** email wiring via [**mmhp-coordinator-config.js**](assets/js/mmhp-coordinator-config.js) with static fallbacks, and the **discreet calendar shortcut** ([secret squirrel](#how-the-finished-site-is-used)) for editors who manage the shared Google calendar. **Inactive** activities are filtered from the sidebar; **isActive**, *adCopy*, and feature metadata are carried in JSON as described in the [data model](#data-model-reference). Internal links are validated with **npm run audit:links** (target: no missing local targets in the audited set).

### Repository and engineering quality

The **public** ***main*** **branch** is scoped to the **site**, supporting files under [**assets/docs/**](assets/docs/), data, images, and **maintenance scripts** under [**scripts/**](scripts/). **Local-only** material (*private/*, optional root *docs/*) is excluded via [**.gitignore**](.gitignore). **Closing work** included: consolidated **CSS** and client **JavaScript** with **section-level narrative comments** where appropriate; **no dead** duplicate audio assets on the branch; **JSZip** loaded with **Subresource Integrity** on form pages; **deferred** shared scripts on feature-event pages; **orphan** and **comment-only template bloat** reduced; small **single-purpose commits** with regular **pushes** so the live site stayed testable throughout.

For full narrative of the final pass, see [Closing remarks](#closing-remarks).

### Case study (capstone narrative)

The **structured case study** for this project—scope, stakeholders, methodology, and outcomes aligned with the Week 8 / Project 02 rubric—is kept in the repository as [**assets/docs/case-study.md**](assets/docs/case-study.md). It is the reviewer-oriented narrative complement to this README’s product and engineering focus.

---

## Repository layout

The site is a **static** tree: HTML at the repo root and under **contents/**, shared **assets/** (CSS, JS, data, images, docs), and **scripts/** for offline maintenance only.

### Directory tree (compact)

```
mmpeventcalendar/
├── index.html                    # home (three-column layout, calendar embed)
├── contents/
│   ├── learn-more.html           # operational pages (same shell as home)
│   ├── submit-feature.html
│   ├── contact.html
│   ├── request-activity.html
│   ├── activity-flyer/           # recurring-activity pages + template-recurring-activity.html
│   └── feature-events/           # dated one-off landings + yyyy-mm-dd-… template
├── assets/
│   ├── css/style.css             # single global stylesheet
│   ├── js/                       # sidebar, forms, ICS helper, coordinator config
│   ├── data/
│   │   ├── json/mmhp-master-data.json
│   │   └── csv/                  # featured-events.csv, calendar import/export CSVs, export/
│   ├── images/                   # banners; event-flyer/; activity-flyer/
│   └── docs/                     # PDF + companion text
```

*Local-only (gitignored): an optional root **docs/** folder may exist for working drafts; it is not part of the published remote tree.*

### Path depth and linking

| Where the HTML file lives | Typical asset prefix | Notes |
|---------------------------|----------------------|--------|
| Repo root (**index.html**) | *assets/…* | Links into **contents/** use the *contents/…* prefix. |
| [contents/](contents/) (e.g. learn-more, submit) | *../assets/…* | Sibling pages in **contents/** use bare filenames (e.g. *contact.html*). |
| [contents/activity-flyer/](contents/activity-flyer/) | *../../assets/…* | Links to other **contents/** pages use *../* (e.g. *../learn-more.html*). **activities-sidebar.js** adjusts featured-event and nav targets for this extra directory level. |
| [contents/feature-events/](contents/feature-events/) | *../../assets/…* | Same depth as activity-flyer; paths mirror conventions used on those pages. |

### Folders in brief

| Path | Role |
|------|------|
| [index.html](index.html) | **Home:** shared chrome, embedded Google Calendar, featured regions, **three-column** layout (recurring sidebar, calendar column, short-horizon highlights). |
| [contents/](contents/) | **Operational** HTML plus **activity-flyer/** and **feature-events/** subtrees (see tree above). |
| [contents/feature-events/](contents/feature-events/) | **Dated, one-off** featured-event landings (flyer-style layout; optional ICS and coordinator flows); bookme-style template and generated **YYYY-MM-DD-HHmm-** pages. |
| [contents/activity-flyer/](contents/activity-flyer/) | **Recurring-activity** explainers (typical week pattern, not one night); optional **data-mmhp-activity-id** ties copy to **activities[]** in master JSON. Individual pages are linked below. |
| [assets/css/style.css](assets/css/style.css) | **One stylesheet:** tokens, layout, components, page-scoped overrides (**page-home**, **page-activity-flyer**, etc.). |
| [assets/js/](assets/js/) | **Client behavior:** master JSON load, sidebar and cards, event and activity request forms, feature-event ICS, coordinator mailto hooks. |
| [assets/data/json/](assets/data/json/) | **mmhp-master-data.json** — browser-facing aggregate for sidebar and forms. |
| [assets/data/csv/](assets/data/csv/) | **featured-events.csv** (editorial/build input), Google Calendar–oriented CSVs, **export/** (optional local exports; generated CSVs under **export/** may be gitignored—folder kept via [.gitkeep](assets/data/csv/export/.gitkeep)). |
| [assets/images/](assets/images/) | Park banner, **event-flyer/**, **activity-flyer/**, favicon, misc art. |
| [assets/docs/](assets/docs/) | Capstone **case study** ([**case-study.md**](assets/docs/case-study.md)); proposal PDF and *.txt* companion. |
| **docs/** *local, gitignored* | Optional working drafts; not in the published tree. |
| [scripts/](scripts/) | **build-features-from-csv.mjs**, **build-feature-event-pages.mjs**, **audit-local-html-links.mjs**; Python helpers for recurring expansion and Google Calendar CSV export—run locally, not at runtime. |

### Activity flyer pages

Source HTML for recurring-activity landings (same path depth as the folder link in the table above):

- [arts-and-crafts.html](contents/activity-flyer/arts-and-crafts.html)
- [bible-study.html](contents/activity-flyer/bible-study.html)
- [bingo.html](contents/activity-flyer/bingo.html)
- [book-club.html](contents/activity-flyer/book-club.html)
- [card-games.html](contents/activity-flyer/card-games.html)
- [kitchen-inventory.html](contents/activity-flyer/kitchen-inventory.html)
- [martial-arts-training.html](contents/activity-flyer/martial-arts-training.html)
- [pool-8-ball.html](contents/activity-flyer/pool-8-ball.html)
- [vespers.html](contents/activity-flyer/vespers.html)
- [template-recurring-activity.html](contents/activity-flyer/template-recurring-activity.html) — copy for new flyers

---

## Structure, UI, and presentation

### Visual system and consistency

The file **assets/css/style.css** is described in-repo as a **consolidated** stylesheet: one place defines the **sky, ocean-mist, sand, and driftwood** palette, shared spacing and corner radii under **:root**, and the structural “primitives” reused on every page. From a **UI/UX** perspective, that choice supports **predictability**: residents encounter the same visual language whether they are on the home page, a form, or a flyer.

**Layout vocabulary** (still technical, but stable across the site): **site-wrapper** → **site-shell** → **site-header**, an optional **hero-image**, **site-nav** / **navbar**, then **site-layout** with **site-sidebar-left**, **site-main**, and **site-sidebar-right**, leading into **site-main-content** / **content** and **site-footer**. Cards align with **site-card**, **card**, or **box** patterns. Primary actions use **btn** and **site-button**—**pill-shaped** controls with a driftwood border and a sky-toned hover state—so interactive elements read consistently as **actions**. Primary navigation uses **site-nav-link** pills on a sand-toned rail, which **segments** the top of the page without relying on a dense hamburger menu.

### Page-scoped behavior without layout drift

**Body** classes tune presentation **without** forking separate style sheets—for example **page-home** adjusts hero height, the calendar stack, and featured grids; **page-activity-flyer** keeps the hero treatment **aligned with the home banner** and applies **.page-activity-flyer-*** rules for the flyer grid, badge, schedule emphasis, and feature image frame **inside** the standard content column. For reviewers, this pattern shows an intentional balance: **shared chrome** for familiarity, **local rules** only where a page type needs them.

### Typography and accessibility-minded scale

Global heading and paragraph scales are set for **readability** and **generous touch targets**; sidebars and areas adjacent to forms add **scoped** font-size rules so dense lists remain legible next to the main column. The overall aim is a calm, **low-friction** reading experience appropriate to a **mixed-age** community audience.

### Feature-event pages

HTML under **contents/feature-events/** often includes **embedded** CSS for flyer-specific grids, dialogs, and ICS affordances, while still **echoing** the global palette. That hybrid reflects a trade-off: **maximum control** for print-like event landings, without abandoning the site’s broader visual identity.

### UI/UX takeaways (for review)

- **Single stylesheet** → coherent color, spacing, and component behavior site-wide.  
- **Three-column home layout** → **separates** “what happens every week,” “the authoritative calendar,” and “what is highlighted soon,” reducing the need to hunt across unrelated regions.  
- **Pill navigation and buttons** → **clear affordances** and repeated shape language for “you can click here.”  
- **Activity flyers use the same shell** as operational pages → **continuity** when moving from calendar to a recurring-activity story.  
- **Page-scoped classes** → structural discipline: avoid one-off pages that look like a different product.

---

## Pages and content types

- **Home** — Header copy, full-width park-banner hero, main navigation, **left** rail (recurring schedule from master JSON), **center** column (iframe calendar plus home featured section), **right** rail (week spotlight / featured cards where enabled). The **spatial split** is a deliberate **information-architecture** choice: recurring rhythm vs. embedded calendar vs. promotional cards.

- **Operational pages** — **learn-more**, **submit**, **contact**, **request-activity** reuse the multi-column shell, the **data-mmhp-master-json** hook, and shared footer and navigation patterns with path-adjusted asset URLs. Users therefore **do not** relearn navigation when they move from reading to submitting.

- **Featured events** — **Date-specific** marketing or landing pages; imagery lives under **assets/images/event-flyer/**. Shared scripts add coordinator **mailto** hooks where included, and **feature-events-ics.js** provides calendar download / “Save the date” handoff.

- **Activity flyers** — Explainers for **recurring** activities: typical weekdays and times, venue and park address, and a longer narrative; optional **data-mmhp-activity-id** ties copy to **activities[]** in master JSON when desired. Imagery uses **assets/images/activity-flyer/**. The UX intent is **idea-first** communication (pattern of the week) rather than “save this single date.”

---

## Client-side JavaScript

| Module | Responsibility |
|--------|----------------|
| [activities-sidebar.js](assets/js/activities-sidebar.js) | Loads master JSON; renders recurring lists and featured grids according to page context. |
| [event-submit-form.js](assets/js/event-submit-form.js) | Featured / one-time event submission: validation, CSV payload, and attachment / mailto / share flows as implemented. |
| [request-activity-form.js](assets/js/request-activity-form.js) | Recurring activity request flow. |
| [feature-events-ics.js](assets/js/feature-events-ics.js) | Calendar download and help UX on feature-event pages that include it. |
| [mmhp-coordinator-config.js](assets/js/mmhp-coordinator-config.js) | Coordinator contact surface for mailto and related hooks. |

Scripts load **per page** as needed (**defer** on external scripts). The master JSON path is supplied on **body** or follows layout conventions—keeping configuration **visible** in markup for a static site.

**Static asset trade-offs:** The site intentionally uses **one global** stylesheet and a **shared** [**activities-sidebar.js**](assets/js/activities-sidebar.js) so repeat visitors cache a single copy. Pages without sidebar or export hooks still download that script, but initialization **skips** the master JSON fetch when no hooked regions exist—acceptable for this architecture. Forms that build ZIP attachments load **JSZip** from jsDelivr **pinned to 3.10.1** with *integrity* and *crossorigin="anonymous"* for Subresource Integrity (see [**contents/submit-feature.html**](contents/submit-feature.html) and [**contents/request-activity.html**](contents/request-activity.html)).

---

## Data and automation

- **Master JSON** — [mmhp-master-data.json](assets/data/json/mmhp-master-data.json) is the **browser-facing** aggregate: activities, features, and related entities consumed by sidebar and form logic.

- **Featured CSV** — [featured-events.csv](assets/data/csv/featured-events.csv) supports editorial workflows; [build-features-from-csv.mjs](scripts/build-features-from-csv.mjs) merges approved rows into master JSON **features[]** (and related fields) for republication.

- **Other scripts** — [scripts/](scripts/) also holds Node tooling (feature page generation, featured CSV merge, local HTML link audit) and Python helpers for Google Calendar–oriented CSV generation and recurring expansions. These are **offline** tools; they are not required at runtime for the static pages.

The **center** calendar on the home page is typically a **Google Calendar embed**. It operates **alongside** the site’s JSON-driven cards and lists rather than as a server dependency of this codebase—a design that keeps **familiar calendar UX** for subscribers while still allowing **curated** sidebar content from JSON.

---

## Data model (reference)

This section is **mostly forward-looking infrastructure**: it documents a **broader entity architecture** so that **future, more comprehensive** web versions of the park site—authentication, richer resident or committee tooling, deeper scheduling, and similar upgrades—can adopt the **same ids and relationships** without a ground-up redesign. Those structures are **defined and kept in step with master JSON now** so today’s data stays **compatible** when those capabilities arrive.

The **current** deployment remains a **static** site; it exercises **only part** of this model (activities, features, and related fields surfaced in the browser—see [Data and automation](#data-and-automation)). Types such as **residents**, **spaces**, **committees**, or **roles** may appear in JSON as **scaffolding** or for **limited display**; they are **not** a promise that the live static UI implements every workflow implied here. **Authoritative field shapes for what the site uses today** remain in [mmhp-master-data.json](assets/data/json/mmhp-master-data.json).

**Id convention:** each entity carries a string **id** with a type prefix and four digits (for example **re0001**, **ac0001**, **fe0009**). Foreign keys use **\*Id** fields that reference those ids.

### Core object list

1. residents  
2. spaces  
3. activities  
4. events  
5. committees  
6. committeeMembers  
7. parkStaff  
8. announcements  
9. locations  
10. roles  
11. residentRoles  

Featured presentation rows use **fe####** ids in **features[]**; they are **not** required to reference an **activityId**—a deliberate client-side distinction between **featured one-offs** and **recurring** sidebar content.

### Relationships (high level)

- **Activities → events:** an activity becomes an event when scheduled; **events.activityId** references **activities.id**.  
- **Residents → spaces:** **spaces.residentId** references **residents.id** (multiple residents may share a space).  
- **Activities → residents:** **activities.chairpersonId**; optional **coChairIds[]**.  
- **Events → residents / locations:** **events.chairpersonId**, **events.locationId**.  
- **Committees → members:** **committeeMembers** links **committeeId** and **residentId** with a **position** (chair, secretary, and so on).  
- **Residents → roles:** **residentRoles** links **residentId** and **roleId**.

### Object definitions

#### residents
People in the park — **id**, **name**, **phone**, **memberSince**, **isFullTime**, **notes**, **imagePath**.

#### spaces
Lots — **id**, **spaceNumber**, **street**, **residentId**, **status** (For Sale | For Rent | Unavailable), **notes**, **imagePath**.

#### activities
Ongoing programs — **id**, **activityName**, **description**, **chairpersonId**, **coChairIds[]**, **notes**, **imagePath**, plus recurrence-oriented fields as present in JSON (for example **recurrenceType**, **recurrenceDetails** for display).

#### events
Scheduled occurrences — **id**, **eventName**, **activityId**, **chairpersonId**, **locationId**, **date**, **time**, **recurrenceType** (OneTime | Weekly | Monthly), **isFeatured**, **isActive**, **notes**, **imagePath**.

#### committees
**id**, **committeeName**, **description**, **notes**.

#### committeeMembers
Committee **positions** (not a flat people list) — **id**, **committeeId**, **residentId**, **position**.

#### parkStaff
Display-only — **id**, **name**, **imagePath**, **notes** (no phone or email in the model).

#### announcements
**id**, **title**, **description**, **datePosted**, **expirationDate**, **priority** (Low | Normal | High), **notes**, **imagePath**.

#### locations
**id**, **locationName**, **description**, **notes**.

#### roles
**id**, **roleName**, **description** — for example Resident, Committee Member, Chairperson, Webmaster.

#### residentRoles
**id**, **residentId**, **roleId**.

### Design notes

- **This reference vs. the running site:** Treat the [object definitions](#object-definitions) above as **architectural alignment** for **future development**; the static build’s **runtime** behavior is governed by what is actually loaded and bound in client scripts (see [Client-side JavaScript](#client-side-javascript)) and present in master JSON.
- **Activities vs events:** activities describe *what*; events describe *when* (and featured flags for special instances).  
- **Committee model:** **committeeMembers** encodes titled roles, not only membership lists.  
- **Park staff:** informational only; no operational logic in the client.  
- **Permissions:** role fields anticipate future restriction; day-to-day edits remain webmaster-controlled.  
- **Out of scope (by design):** park issue tracking, built-in ticketing, listings, document library, media CMS.

---

## Closing remarks

The final **closing** work for this repository included a **professional code sweep** and **remote cleansing** so ***main*** stays lean, reviewable, and aligned with static-site best practices—beyond “it runs locally.”

**Code sweep (engineering hygiene).** Feature-event pages and their generator template were brought into one convention: shared scripts load with *defer*, commented-out ticket UI bulk was removed from the template and regenerated pages, and third-party **JSZip** on the submit and request-activity forms was **pinned** with **Subresource Integrity** (*integrity* + *crossorigin*) for supply-chain transparency. Narrative file headers and the existing single global CSS/JS strategy were preserved so reviewers can follow intent without redundant bundles.

**Remote repository cleansing.** The public tree was audited so it contains **only** what ships the site and **assets/docs/** supporting files; a **local, gitignored** root **docs/** (if present) does not publish to the remote; **private/** remains ignored for background notes; and **npm run audit:links** was kept at **zero missing** internal links. **Untracked duplicate or orphan media** (e.g. unreferenced duplicate audio files with identical content) was removed from the branch to reduce clone noise and supervisor QA friction. After a push, ***origin/main*** was verified to match the intended **minimal, functional** snapshot—suitable for a **GitHub-style quality pass** alongside the rubric and this README.
