---
name: Week 08 QA Plan
overview: Execute the Week 08 sprint by turning the README into the finished-state QA promise document, then auditing and repairing the site and capstone deliverables against the Project 02 rubric. Work will be committed and pushed in small, reviewable batches so the live site can be validated between changes.
todos:
  - id: readme-promise
    content: Rewrite README as final project promise document and QA checklist
    status: completed
  - id: readme-commit
    content: Commit and push README-only package
    status: completed
  - id: link-audit
    content: Audit exposed links, generated pages, templates, meaningful content, and master JSON completeness
    status: completed
  - id: site-rubric-qa
    content: Test and repair site against Week 08 product rubric
    status: completed
  - id: docs-deliverables
    content: Draft case study, presentation materials, and development reflection
    status: in_progress
  - id: repo-scrub
    content: Scrub repository for unused or outdated files before final submission
    status: pending
  - id: batch-commits
    content: Commit and push each focused change package after validation
    status: in_progress
  - id: final-go-nogo
    content: Run rubric check, README promise check, submission check, and live-site validation
    status: pending
  - id: json-driven-rendering
    content: Verify final pages load current activity and event content from master JSON
    status: in_progress
  - id: ui-ux-functionality
    content: Apply UI/UX functionality fixes for existing features without adding new features
    status: completed
isProject: false
---

Repository copy of the Cursor Week 08 plan (also under the machine-local Cursor plans folder). Edit either copy; sync manually if both should stay identical.

# Week 08 Final Submission Plan

## Current status — resume here (post live-site validation)

**Phase 3 (repo pass):** `npm run audit:links` reports **missing count: 0**. Spotlight empty-slot placeholder already uses a clear Submit Event CTA (`activities-sidebar.js`). Submit Event form labels already distinguish card title/subtitle vs flyer copy. Learn-more “as the site grows” wording not present.

**Phase 4 (started):** Draft outlines added under [`docs/`](docs/) — [`case-study-outline.md`](docs/case-study-outline.md), [`development-reflection-outline.md`](docs/development-reflection-outline.md), [`presentation-outline.md`](docs/presentation-outline.md). README Capstone section links to them.

**Where the sprint stands vs. the six phases**

| Phase | Name | Status (current assessment) |
|-------|------|---------------------|
| **1** | README Promise Document | **Effectively complete** — `README.md` includes Week 8 workflow, final promise, full QA/QC checklist sections. |
| **2** | Product Link and Content QA | **Link audit clean** (`npm run audit:links`). Master JSON completeness is an ongoing editorial task if instructors require field-by-field proof. |
| **3** | Website Rubric QA | **Closed for automated/repo checks;** live validation was your sign-off. Tick README [Final QA/QC checklist](#final-qaqc-checklist) when you align words with delivery. |
| **4** | Documentation Deliverables | **In progress** — outlines in `docs/`; replace with final case study, reflection, and presentation per course submission format. |
| **5** | Pre-Final Repository Scrub | **`private/` already in `.gitignore`.** Remaining: untrack any mistakenly committed noise; optional codebase comment pass per README Phase 5. |
| **6** | Final Go/No-Go | **Pending** — rubric + README + live site + deliverables together. |

**Checkpoint:** Manual validation of the **deployed** site was requested before continuing. That pass is **done** from your side; you indicated readiness to ship “as is.”

**Execution order when resuming**

1. **Optional sweep:** Close any remaining Phase 2/3 checklist items you still want verified (link script, JSON fields, README checkboxes).
2. **Phase 4:** Produce or update capstone docs (case study, reflection, slides) in separate commits from site code.
3. **Phase 5:** Repo scrub + `.gitignore` + untrack as needed.
4. **Phase 6:** Final go/no-go using the plan’s ordered checklist at the bottom of this file.

**Note:** A separate Cursor plan (`home_responsive_breakpoints_a1dbb264.plan.md` in `.cursor/plans`) tracked layout/tablet work; that work **contributes to Phase 3** and is done. This Week 08 file is the **six-phase submission** plan.

---

## Sprint Rule
- Use [`private/background/4304-rough-notes.txt`](../private/background/4304-rough-notes.txt) lines 4760-4761 as the controlling sprint instruction.
- Start with [`README.md`](../README.md), making it read like the finished project is complete while also serving as the final QA/QC checklist.
- After the README is updated, make the website match the README and the Week 08 rubric.
- Work in coordinated batches: one focused change package per commit, push after each accepted package so the live site can be validated before continuing.

## Phase 1: README Promise Document
- Rewrite [`README.md`](../README.md) from a repo inventory into a finished-project document.
- Preserve useful existing sections: static architecture, page types, data model, scripts, and capstone artifacts.
- Add a clear user-facing project overview: what problem the event calendar solves, who it serves, and how residents/coordinators use it.
- Add a rubric-aligned QA checklist covering:
  - Complete product: functional, polished, accessible, usable, and improved from Project 01.
  - Case study: full lifecycle narrative, feedback, iteration, evaluation, and professional writing.
  - Presentation: professional audience, problem-to-result story, product demo.
  - Development reflection: specific process reflection and CMPA learning connection.
- Add a “Final Submission Access” section with deployed URL/source-code usage instructions once the deployment details are confirmed.
- Commit/push as batch 1: README promise document only.

## Phase 2: Product Link and Content QA
- Re-run a full link audit across [`index.html`](../index.html), [`contents/`](../contents/), [`assets/`](../assets/), and generated feature pages.
- Confirm no exposed links point to missing files, placeholder hash links, empty pages, or template-only pages.
- Treat karaoke and DJ/dance-party featured events as repeatable featured-event patterns: same image/copy, date/time specific per generated page.
- Treat all other featured events as one-off pages with their own event-specific copy.
- Audit [`assets/data/json/mmhp-master-data.json`](../assets/data/json/mmhp-master-data.json) for completeness and accuracy across both scheduled events/features and recurring activities.
- Identify every blank, missing, or placeholder field in the JSON data, then classify each one:
  - Use a correct value when the source information is known or can be inferred from existing project data.
  - Use explicit `null` only when the field is intentionally unknown, not applicable, or unavailable.
  - Leave an item unresolved only if it requires a user/source decision, and document the exact field and record id.
- Verify the JSON remains internally consistent after cleanup: ids, date/time formats, image paths, location references, active/featured flags, recurrence details, and generated page naming.
- Confirm every recurring activity has an explicit active state, using a consistent boolean field such as `isActive: true` or `isActive: false`.
- Confirm one-off featured events include complete JSON-backed data: date, start/end time where applicable, image path, event title/category, location, and promotional copy.
- Add or standardize an event promotional-copy field in JSON if needed, so ad copy can be updated in [`mmhp-master-data.json`](../assets/data/json/mmhp-master-data.json) instead of requiring edits to generated/static HTML pages.
- Apply the same JSON-source-of-truth rule to recurring activities: each activity record should include its own promotional/ad-copy key-value field, using a consistent field such as `adCopy`, so recurring activity flyer copy can be maintained from JSON instead of static HTML.
- Audit recurring activity flyer pages against their matching activity JSON records and identify any flyer copy that should move into the activity record.
- Review template files under [`contents/activity-flyer/`](../contents/activity-flyer/) and [`contents/feature-events/`](../contents/feature-events/) and decide whether they should remain linked in README, be marked internal-only, or be excluded from user-facing promises.
- Commit/push Phase 2 in focused batches, for example link/content integrity first and master JSON cleanup as its own separate batch.

## Phase 3: Website Rubric QA
- Audit the product against the Week 08 product rubric from [`private/background/4304-rough-notes.txt`](../private/background/4304-rough-notes.txt): functionality, meaningful progress, accessible result, core scope, edge cases, and interface detail.
- Apply UI/UX functionality fixes only where current features are not working as intended; do not add new feature scope.
- Test the main user paths:
  - Home calendar loads and navigation works.
  - Recurring schedule renders from [`assets/data/json/mmhp-master-data.json`](../assets/data/json/mmhp-master-data.json).
  - Featured cards route to meaningful detail pages.
  - Event submission flow opens/share/downloads the expected coordinator payload.
  - Activity request flow opens/share/downloads the expected coordinator payload.
  - Contact/coordinator mailto links work with a fallback.
  - Export buttons produce useful files.
  - Feature-event ICS download flow works where present.
- Standardize active-state behavior so recurring activities and featured events use the same explicit JSON convention, preferably `isActive: true` or `isActive: false`.
- Make recurring activity exports match what users see in the left sidebar; inactive activities should not silently export as if active unless the UI clearly labels them.
- Make feature-event detail pages JSON-driven at page load wherever JSON is authoritative: title, date/time, location, image, and promotional/ad copy should refresh from [`mmhp-master-data.json`](../assets/data/json/mmhp-master-data.json) using the page's feature id.
- Keep generated feature pages regenerable from JSON without hand-edited page-specific copy.
- Make recurring activity flyer pages data-driven where JSON is authoritative: active state, recurrence details, image path, location, and activity `adCopy`.
- Clean up existing user-facing wording so it matches current behavior:
  - Remove stale “as the site grows” language from [`contents/learn-more.html`](../contents/learn-more.html).
  - Clarify submit-form labels such as “Short description of event” and “Short description” so residents understand these are featured-card title/category lines.
  - Keep form help text aligned with actual Share, mailto, CSV, and ZIP behavior.
- Reduce right-rail placeholder confusion by making the existing “bookme” empty-slot card read as one clear action: submit an event for that open Wednesday/Saturday slot. Preserve image preview only if the action remains clearly labeled.
- Treat [`contents/contact.html`](../contents/contact.html) as intentionally simpler: no sidebar consistency work is required there.
- Fix only rubric-relevant gaps; avoid unrelated redesign.
- Commit/push as one or more focused product batches, for example “feature routing/content,” “form QA,” or “accessibility polish.”

## Phase 4: Documentation Deliverables
- Draft or update the Project 02 case study using the six required sections:
  - Problem and context.
  - Approach and methodology.
  - Key decisions and trade-offs.
  - Iteration from Project 01.
  - Evaluation of the result.
  - Lessons learned.
- Draft or update the development reflection at roughly 200-400 words with concrete successes, difficulties, do-over notes, and CMPA program connections.
- Prepare presentation materials as the simplest acceptable format: likely a slide deck plus optional brief walkthrough if needed.
- Make sure documentation honestly describes AI-assisted work, generated pages, static-site constraints, and the Google Calendar plus JSON architecture.
- Commit/push documentation batches separately from website code.

## Phase 5: Pre-Final Repository Scrub
- Audit the repo for inactive, outdated, unused, or non-mission-required material before final submission.
- Identify unused assets and support files, including:
  - Images not referenced by active HTML, CSS, JS, JSON, or documentation.
  - Audio/video files not used by the final product or submission materials.
  - Old exports, generated scratch files, abandoned templates, obsolete CSVs, and temporary build artifacts.
  - Background notes, rough drafts, source extraction files, and planning materials not meant for the public remote repo.
- Move nonessential background/build material into [`private/`](../private/) rather than deleting it, preserving it locally for future reference.
- Organize parked assets into purpose-specific private folders, for example:
  - [`private/future-images/`](../private/future-images/) for unused or possible future images.
  - [`private/future-audio/`](../private/future-audio/) for unused or possible future audio.
  - [`private/future-video/`](../private/future-video/) for unused or possible future video.
  - [`private/background/`](../private/background/) for rough notes, course/source material, and non-public drafts.
- Add or update `.gitignore` so [`private/`](../private/) and other nonessential local-only artifacts are excluded from future commits.
- Untrack nonessential files that were previously committed so they are removed from the remote repo while remaining available locally under [`private/`](../private/).
- Confirm the public tracked repo contains only mission-required submission files:
  - Active site HTML, CSS, JS, JSON, data, images, docs, scripts needed to build or maintain the site.
  - Final capstone deliverables intended for submission or review.
  - README and any required public documentation.
- Commit/push this as its own focused cleanup batch after verifying no active page references moved files.

## Phase 6: Final Go/No-Go
- Run the final QA in this order:
  - Check the site against the Week 08 rubric.
  - Check the site against promises made in [`README.md`](../README.md).
  - Check that pages render current information from [`assets/data/json/mmhp-master-data.json`](../assets/data/json/mmhp-master-data.json), not stale hardcoded page copy where JSON should be authoritative.
  - Spot-check data-driven regions: left recurring-activities bar, featured-event cards, feature-event detail pages, submission defaults, and activity request context.
  - Confirm generated feature-event pages can be regenerated from JSON without losing event dates, times, images, locations, and promotional copy.
  - Confirm recurring activity pages can be refreshed from JSON activity data, including active state, recurrence details, image path, location, and activity ad copy.
  - Check deliverables against submission requirements: product access, case study, presentation, reflection.
  - Check that repo scrub is complete: public tracked files are mission-required only, [`private/`](../private/) is ignored, and no active site references point to private/untracked assets.
  - Check git status and make sure only intentional files are committed.
  - Push the final batch and validate the live site.
- If any README promise is not true, either implement the missing behavior or revise the README before submission.
- Produce a final submission checklist with pass/no-go status and any residual risks.

## Commit and Push Protocol
- Before every commit: inspect status and diff, group only related files, and avoid mixing unrelated changes.
- Keep commit messages specific to the package, such as `Update README final QA checklist`, `Generate featured event detail pages`, or `Polish submission form accessibility`.
- Push after each successful commit so the live site can be reviewed.
- Do not include unrelated private notes or scratch files in a public-facing batch unless they are intentionally part of the submission record.
