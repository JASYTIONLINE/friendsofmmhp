# Case study: McAllen Mobile Park Events (Project 02)

## 1. Problem and context

Residents of a mobile home park need a **single, trustworthy view** of what is happening: recurring clubs and classes, one-off social events, and the broader Google Calendar view many people already use. Paper flyers and scattered announcements do not scale, and not everyone uses the same social channel. The event coordinator needs a **structured handoff** from residents (new activities, featured one-time events) without standing up custom server infrastructure.

This project delivers a **static website**—HTML, one global stylesheet, client-side JavaScript—that surfaces curated data from [`assets/data/json/mmhp-master-data.json`](../assets/data/json/mmhp-master-data.json) alongside an embedded Google Calendar. It is **not** a park management system; it is a community-facing calendar and submission surface.

## 2. Approach and methodology

- **Architecture:** No application server. Pages load in the browser; `activities-sidebar.js` fetches master JSON, builds the recurring schedule and featured regions, and normalizes links for pages under the repo root, `contents/`, and nested flyer paths.
- **Data governance:** Recurring and featured content is edited in JSON (and supporting CSV/editorial flows where used), then republished. Forms (`event-submit-form.js`, `request-activity-form.js`) produce coordinator-friendly payloads (CSV, share, mailto) instead of silent server posts.
- **Tooling:** Node scripts under `scripts/` handle offline tasks such as link audits and generated feature pages; they are not required at runtime for visitors.
- **Quality:** `npm run audit:links` validates internal links; responsive layout work keeps home, tablet, and mobile flows readable without overlapping rails.

## 3. Key decisions and trade-offs

1. **Static hosting vs. dynamic CMS:** A CMS would simplify author workflows but contradicts the course static-site constraint and increases attack surface and cost. The trade-off is **coordinator-mediated updates** to JSON and calendars instead of instant publish-from-web.
2. **Coordinator handoff vs. database-backed submissions:** Without a server, forms cannot store submissions privately. The trade-off is **email/share/download** payloads the resident sends explicitly, matching privacy expectations for a small community project.
3. **Google Calendar embed + JSON sidebar:** The embed preserves familiarity; JSON powers editorial highlights (featured cards, recurring list). Two sources require discipline so dates and titles stay aligned when events change.

## 4. Iteration from Project 01

Iteration focused on **layout stability** (containment, grid breakpoints, sidebar stretch), **Future Featured** month navigation and **date filtering** (current month forward, events today-or-later), and **copy/labels** on submission paths so residents understand card titles vs. flyer text. Link auditing and README alignment turned the repository into a **promise document** checked against the deployed site.

## 5. Evaluation of the result

**What works well:** Clear information scent from home to detail pages; exports for recurring and featured lists; accessible forms with real `mailto:` fallbacks before JavaScript upgrades. The model fits a volunteer coordinator and a small park audience.

**Limits:** Static JSON must be refreshed when real-world schedules change; the site does not push notifications; `file://` local preview can block JSON fetches in some browsers—reviewers should use a static server or the hosted deployment. AI assistance accelerated refactoring and documentation; human review remained responsible for data accuracy and rubric compliance.

## 6. Lessons learned and CMPA connection

Shipping a **complete static product** requires saying no to tempting scope (accounts, databases) and investing in **disciplined data** (explicit `isActive`, JSON `adCopy`, regenerable feature pages). Professional communication—for residents and instructors—depends on README promises matching behavior. This connects to CMPA themes: **clear audience**, **ethical transparency** about tooling and limits, and **iteration** driven by feedback and rubric-aligned QA.
