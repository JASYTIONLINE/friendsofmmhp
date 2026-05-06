# Presentation notes (Project 02)

Use these notes with slides, a short demo recording, or a live walkthrough—whatever format your instructor requires.

## Opening (≈1 min)

- **Problem:** Residents need one calendar-forward place for park events; coordinator needs structured requests without a custom server.
- **Stakeholders:** Residents, activity organizers, event coordinator.

## Product demo (≈3–4 min)

1. **Home:** Embedded Google Calendar; left rail recurring schedule from JSON; Future Featured with month navigation; right-rail “this week” spotlight when present.
2. **Deep link:** Open one featured event detail page—show title, date/time, image, copy from data.
3. **Forms:** Submit Event — required fields, coordinator payload (describe share/mailto/CSV behavior in one sentence). Request Activity — same idea for recurring additions.
4. **Exports:** Show recurring or featured export producing a useful file.

## Architecture (≈2 min)

- Static HTML/CSS/JS only; master JSON at `assets/data/json/mmhp-master-data.json`.
- Offline scripts for link audit and page generation—not part of visitor runtime.
- **Trade-off:** No server → coordinator-mediated publishing, explicit resident handoff from forms.

## Decisions & iteration (≈1–2 min)

- Two key trade-offs: static hosting vs. CMS; handoff payloads vs. database submissions.
- Iteration: responsive home layout, featured date rules, README as QA contract.

## Close (≈1 min)

- What improved from Project 01; what remains limited (static data refresh, no push notifications).
- Lessons: README/deploy parity, small commits, AI as accelerator with human QA.

## Demo checklist

- [ ] Home loads with calendar + sidebars
- [ ] One featured detail page
- [ ] Submit or Request form validation visible
- [ ] Export or mailto path mentioned aloud
