# mmpeventcalendar

This repository implements a **McAllen Mobile Park Events** web presence: the home page foregrounds the community calendar, while sidebars and cards surface structured schedule data. The implementation relies on static **HTML**, a **single global stylesheet**, and **client-side JavaScript** only; there is no application server in the architecture.

The project is **not** an official park management system. Operational questions belong with park management.

---

## Contents

- [Week 8 sprint workflow](#week-8-sprint-workflow)
- [Final project promise](#final-project-promise)
- [How the finished site is used](#how-the-finished-site-is-used)
- [Final QA/QC checklist](#final-qaqc-checklist)
- [Repository layout](#repository-layout) (includes [activity flyer pages](#activity-flyer-pages))
- [Structure, UI, and presentation](#structure-ui-and-presentation)
- [Pages and content types](#pages-and-content-types)
- [Client-side JavaScript](#client-side-javascript)
- [Data and automation](#data-and-automation)
- [Data model (reference)](#data-model-reference)
- [Capstone artifacts](#capstone-artifacts)

---

## Week 8 sprint workflow

This section restates the Week 8 execution order from course guidance: the **official rubric and Week 8 instructions** define what must be submitted and how it is graded; this README is the working **promise + QA/QC** surface for the repository and the deployed site.

1. **README as promise** — [Final project promise](#final-project-promise) and [Final QA/QC checklist](#final-qaqc-checklist) describe the finished product as if it is already meeting standard; development closes gaps between that description and reality.
2. **Align the site** — Data ([`mmhp-master-data.json`](assets/data/json/mmhp-master-data.json)), generated feature pages (`npm run build:feature-pages`), links (`npm run audit:links`), forms, exports, and repo hygiene (Phase 5) are brought in line with the checklist.
3. **Initial QA/QC pass (pre–Phase 6)** — Walk the **Product/application** checklist on a real deployment, fix defects, and record any intentional exceptions. Do not treat this as the final course sign-off until the rubric itself is satisfied.
4. **Post–initial-QA adjustments** — After that first pass, apply any extra modifications you choose (copy, layout tweaks, optional content) before the final freeze.
5. **Phase 6 — Final go/no-go** — Confirm the **rubric** is met at 100%, then confirm the **README** still matches the deployed site; that pairing is the submit/no-submit decision per Week 8 guidance.

Throughout: **commit and push in small, single-purpose batches** so the live site can be validated after each change.

## Final project promise

McAllen Mobile Park Events is a finished static community calendar site for residents, activity organizers, and the event coordinator. It gives residents one readable place to find regular park activities, upcoming featured events, event details, location information, and contact/submission paths.

The finished product is intentionally simple: no login, no server, no database service, and no park-management workflow. The site uses static pages plus browser JavaScript to read the current calendar data from [`assets/data/json/mmhp-master-data.json`](assets/data/json/mmhp-master-data.json). The Google Calendar embed remains the familiar calendar view, while the JSON-powered sidebars, cards, exports, forms, and generated pages provide curated park-event information around it.

The final site promises the following:

- Residents can open the home page and immediately understand the current recurring schedule, the embedded community calendar, and the highlighted upcoming featured events.
- Recurring activities are listed from the master JSON data, sorted into a readable Monday-through-Sunday sidebar, and linked to activity flyer pages where a flyer exists.
- Featured events are listed from the master JSON data, show event imagery and date information, and link to meaningful detail pages.
- Karaoke and DJ dance filler events use repeatable event-page copy and imagery with the correct date/time for each occurrence.
- One-off featured events use event-specific JSON data, image paths, and promotional copy.
- Event and activity request forms collect the information needed by the coordinator and provide email/share/download handoff behavior.
- Export buttons provide useful text or CSV downloads for recurring activities and featured events.
- Coordinator email links have real `mailto:` fallbacks and are also wired through the shared coordinator config script.
- The repository contains only mission-required public files after the final scrub; background materials and future-use assets belong under ignored [`private/`](private/) folders.

## How the finished site is used

1. Open [`index.html`](index.html) or the deployed site.
2. Use the left sidebar to scan recurring activities by weekday.
3. Use the center calendar for the full calendar view.
4. Use the featured-event cards to open event detail pages.
5. Use **Request activity** for recurring activities that should be added to the sidebar schedule.
6. Use **Submit Event** for one-time featured events.
7. Use **Contact Event Coordinator** for calendar, submission, or social-event questions.

## Final QA/QC checklist

Use this list during the **initial QA/QC pass** ([Week 8 workflow, step 3](#week-8-sprint-workflow)). The **official rubric and Week 8 instructions** govern grading and submission requirements. **Phase 6** is the final go/no-go: rubric satisfied in full, then confirm this README still matches the deployed site.

Before you submit Project 02, the site and repository should pass each item below.

### Product/application

- [ ] Home page loads without broken local assets or dead links.
- [ ] Main navigation works from root pages, `contents/` pages, activity flyer pages, and feature-event pages.
- [ ] The embedded Google Calendar appears in the center calendar region.
- [ ] The left recurring schedule renders from [`mmhp-master-data.json`](assets/data/json/mmhp-master-data.json), not hardcoded HTML.
- [ ] Every recurring activity has an explicit `isActive: true` or `isActive: false` decision in JSON.
- [ ] Inactive recurring activities do not appear as active sidebar items or active exports.
- [ ] Recurring activity ad copy is stored in the activity record as JSON data, using a consistent key such as `adCopy`.
- [ ] Activity flyer pages match the corresponding JSON activity data for active state, recurrence, location, image, and ad copy.
- [ ] Featured-event cards render from JSON and route to meaningful detail pages.
- [ ] Every active featured event has a complete date, time, image, location, title/category, and promotional copy in JSON.
- [ ] Featured-event promotional copy is JSON-backed, not trapped only in static HTML.
- [ ] Generated feature-event pages can be rebuilt from JSON without losing title, date/time, image, location, or ad copy.
- [ ] Karaoke and DJ dance featured events behave as repeatable filler events with shared copy/image and date-specific detail pages.
- [ ] One-off featured events remain one-off detail pages with their own event-specific content.
- [ ] Submit Event form validates required fields and prepares the coordinator payload as described on the page.
- [ ] Request activity form validates required fields and prepares the coordinator payload as described on the page.
- [ ] Export buttons download useful text or CSV files.
- [ ] Coordinator email links work before and after JavaScript upgrades them.
- [ ] The current UI copy accurately describes the current site behavior.
- [ ] The right-rail open-slot/card behavior is clear and does not look like a dead or broken event.

### Case study

- [ ] Case study explains the problem, audience, and context.
- [ ] Case study documents the approach, tools, and methods.
- [ ] Case study names at least two key decisions or trade-offs.
- [ ] Case study explains iteration from Project 01 using specific feedback or findings.
- [ ] Case study evaluates what works well and what still falls short.
- [ ] Case study ends with specific lessons learned and CMPA program connections.

### Presentation

- [ ] Presentation tells the project story from problem to product.
- [ ] Presentation is appropriate for a professional audience.
- [ ] Presentation shows or explains the working product.
- [ ] Presentation covers key decisions, results, and lessons learned.

### Development reflection

- [ ] Reflection is specific, personal, and about the development process.
- [ ] Reflection covers what went well, what was difficult, what would change next time, and how the capstone connects to CMPA learning.

### Repository and submission (Phase 5)

Phase 5 closes the repository: nonessential files stay private, the public tree stays coherent, and the **code that ships** is trimmed, non-redundant, and documented for academic review.

**Remote repository hygiene**

- [ ] Public tracked repo contains only mission-required site, data, scripts, docs, and final deliverables.
- [ ] [`private/`](private/) is ignored and contains background/future-use material that should not clutter the remote repo.
- [ ] No active page references ignored/private assets.
- [ ] Final git status is clean after intentional commits.
- [ ] Final pushed branch matches the site and README promises.

**Codebase scrub (CSS, JavaScript, and related sources)**

- [ ] Audit [`assets/css/style.css`](assets/css/style.css) and page-embedded styles (including feature-flyer blocks) for **redundant** rules, **conflicting** selectors, and abandoned overrides; consolidate or delete so each visual concern has an obvious owning layer and the cascade is predictable.
- [ ] Audit [`assets/js/`](assets/js/) (and any inline script on HTML pages) for **unused** functions, **duplicate** logic, **legacy** code paths, and behaviors that **contradict** each other; remove or unify so runtime behavior matches the README promises with no dead weight.
- [ ] Trace the HTML include graph to confirm every stylesheet and script the site loads is **required** for the finished product; untrack or relocate orphans instead of keeping speculative or superseded sources in the public tree.

**Academic-level comments for instructors and students**

- [ ] After the scrub, add or refresh **section-level** commentary at the top of each major region in the maintained CSS, client-side JavaScript, and Node maintenance scripts under [`scripts/`](scripts/). These notes are **not** terse line-by-line “what” bullets; they are **short narrative blocks** that explain **why** the section exists in the overall architecture and **how** it achieves reliable data flow, safer DOM handling, coordinator handoff, or export behavior—written so a reviewer can follow intent and trade-offs, not just syntax.

---

## Repository layout

The site is a **static** tree: HTML at the repo root and under **contents/**, shared **assets/** (CSS, JS, data, images, docs), and **scripts/** for offline maintenance only.

### Directory tree (compact)

```
mmpeventcalendar/
├── index.html                    # home (three-column layout, calendar embed)
├── contents/
│   ├── learn-more.html           # operational pages (same shell as home)
│   ├── submit.html
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
│   └── docs/                     # capstone proposal PDF + text extract
└── scripts/                      # Node (.mjs) + Python; not loaded by the browser
```

### Path depth and linking

| Where the HTML file lives | Typical asset prefix | Notes |
|---------------------------|----------------------|--------|
| Repo root (`index.html`) | `assets/...` | Links into **contents/** use the `contents/...` prefix. |
| [contents/](contents/) (e.g. learn-more, submit) | `../assets/...` | Sibling pages in **contents/** use bare filenames (e.g. `contact.html`). |
| [contents/activity-flyer/](contents/activity-flyer/) | `../../assets/...` | Links to other **contents/** pages use `../` (e.g. `../learn-more.html`). **activities-sidebar.js** adjusts featured-event and nav targets for this extra directory level. |
| [contents/feature-events/](contents/feature-events/) | `../../assets/...` | Same depth as activity-flyer; paths mirror conventions used on those pages. |

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
| [assets/data/csv/](assets/data/csv/) | **featured-events.csv** (editorial/build input), Google Calendar–oriented CSVs, **export/** (optional local exports; generated `*.csv` under **export/** may be gitignored—folder kept via [.gitkeep](assets/data/csv/export/.gitkeep)). |
| [assets/images/](assets/images/) | Park banner, **event-flyer/**, **activity-flyer/**, favicon, misc art. |
| [assets/docs/](assets/docs/) | Capstone proposal artifacts (PDF + `.txt` extract). |
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

- **Featured events** — **Date-specific** marketing or landing pages; imagery lives under **assets/images/event-flyer/**. Client scripts may wire **mailto**-style ticketing flows and **feature-events-ics.js** where those pages opt in—supporting both **human** coordinator contact and **calendar** handoff.

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

Scripts load **per page** as needed (**defer** where applied). The master JSON path is supplied on **body** or follows layout conventions—keeping configuration **visible** in markup for a static site.

---

## Data and automation

- **Master JSON** — [mmhp-master-data.json](assets/data/json/mmhp-master-data.json) is the **browser-facing** aggregate: activities, features, and related entities consumed by sidebar and form logic.

- **Featured CSV** — [featured-events.csv](assets/data/csv/featured-events.csv) supports editorial workflows; [build-features-from-csv.mjs](scripts/build-features-from-csv.mjs) merges approved rows into master JSON **features[]** (and related fields) for republication.

- **Other scripts** — [scripts/](scripts/) also holds Node tooling (feature page generation, featured CSV merge, local HTML link audit) and Python helpers for Google Calendar–oriented CSV generation and recurring expansions. These are **offline** tools; they are not required at runtime for the static pages.

The **center** calendar on the home page is typically a **Google Calendar embed**. It operates **alongside** the site’s JSON-driven cards and lists rather than as a server dependency of this codebase—a design that keeps **familiar calendar UX** for subscribers while still allowing **curated** sidebar content from JSON.

---

## Data model (reference)

The long-term entity model is expressed in master JSON and summarized below. **Authoritative field shapes and examples** remain in [mmhp-master-data.json](assets/data/json/mmhp-master-data.json).

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

- **Activities vs events:** activities describe *what*; events describe *when* (and featured flags for special instances).  
- **Committee model:** **committeeMembers** encodes titled roles, not only membership lists.  
- **Park staff:** informational only; no operational logic in the client.  
- **Permissions:** role fields anticipate future restriction; day-to-day edits remain webmaster-controlled.  
- **Out of scope (by design):** park issue tracking, built-in ticketing, listings, document library, media CMS.

---

## Capstone artifacts

- **Proposal (PDF):** [assets/docs/Barkle-w3a1-project-proposal-and-research.pdf](assets/docs/Barkle-w3a1-project-proposal-and-research.pdf)  
- **Proposal (text extract):** [assets/docs/Barkle-w3a1-project-proposal-and-research.pdf.txt](assets/docs/Barkle-w3a1-project-proposal-and-research.pdf.txt)

**Project 02 / Week 8 documentation (per rubric):** Submit the **case study**, **presentation**, and **development reflection** through the course channels your instructor specifies. The [Case study](#case-study), [Presentation](#presentation), and [Development reflection](#development-reflection) checklist sections above mirror typical rubric expectations; they do not replace the official Week 8 document.
