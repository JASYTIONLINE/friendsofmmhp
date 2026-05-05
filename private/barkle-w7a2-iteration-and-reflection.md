# Barkle W7A2: Iteration and Reflection

## Project Context

The McAllen Mobile Park Event Calendar began as a focused solution to a communication problem in a small residential community. The original concept was simple: residents needed one dependable place to find park events without searching through Facebook posts, relying on word of mouth, or navigating large public event platforms that were not designed for them. The target audience shaped the project from the start. Many residents are older adults, many use phones more often than desktop computers, and many benefit from large text, predictable navigation, and a low-clutter interface.

The first concept described a mobile-first website with a calendar, a submission page, event detail pages, and an about page. At that stage, Google Calendar and Google Forms looked like the main tools for event data and submission. The prototype has since grown into a more complete static web application. The core idea is still the same, but the implementation has become more practical: a public Google Calendar embed provides the familiar calendar view, while structured JSON, CSV files, client-side JavaScript, and local scripts support the recurring schedule, featured event cards, activity flyers, and maintenance workflows.

This reflection focuses on the larger changes from the concept through the current build, especially the changes that improved user experience, fixed functionality, or made development and maintenance easier.

## Major UI and UX Improvements

The biggest user-facing improvement is the move from a basic page structure to a consistent site shell. Early work established the home page, header, navigation, sidebars, main content area, and footer. Later iterations made that structure reusable across operational pages and activity flyers. This matters because residents do not have to relearn the interface on each page. The same navigation style, button shape, color palette, footer, and general layout repeat across the site.

The home page also became more useful as an information hub. Instead of only embedding a calendar, the current layout separates three different kinds of information: recurring activities on the left, the main Google Calendar in the center, and featured or near-term events on the right or below the calendar depending on page context. This three-part layout supports different resident needs. Someone who wants the full schedule can use the calendar. Someone looking for regular weekly activities can scan the recurring list. Someone who only wants the highlights can look at featured cards.

The visual design also improved from a generic prototype into a community-oriented interface. The shared stylesheet defines a calm sky, sand, white, and driftwood palette, with rounded cards and pill-shaped buttons. Those choices are not just decoration. They support readability, make actions easier to recognize, and keep the interface from feeling dense. The large type and generous spacing stay aligned with the original accessibility goal for older users.

Another major improvement was the creation of activity flyer pages for recurring programs. The original plan called for event detail pages, but the project now includes recurring-activity pages such as bingo, card games, Bible study, arts and crafts, pool, vespers, and other activities. These pages turn short sidebar labels into fuller explanations. That improves UX because residents can move from "what is this?" to a dedicated page with context, images, schedule information, and a familiar page layout.

Featured event presentation has also been improved in several passes. Featured cards moved from simple placeholders toward JSON-driven cards with images, dates, and links. A month stepper was added so the home featured section can browse featured events by month instead of only showing a static list. A later layout fix made featured event rows fill more evenly, and the latest card polish standardizes the title area so one-line and two-line titles do not create uneven card heights. These are small visual details, but they matter because uneven cards make the page look less finished and can make scanning harder.

## Major Functionality Fixes

One of the most important functional changes was the decision to use a public Google Calendar embed instead of assuming residents would sign in to Google. The original research identified Facebook account requirements as a barrier, so it would have been inconsistent to build a solution that quietly introduced another account barrier. The public calendar embed keeps the calendar accessible to anonymous visitors while still allowing residents who use Google Calendar to subscribe or use reminders through Google's own tools.

The data model also changed in a meaningful way. The proposal treated Google Calendar as the likely center of the system, but the current implementation uses a parallel model. Google Calendar remains the resident-facing calendar surface, while repository data drives the curated parts of the site. The master JSON file supports recurring lists, featured cards, activity information, and form options. This solved a real implementation issue: the site needs more structured display data than a basic calendar embed can provide cleanly.

The recurring activity sidebar is another functional improvement. It is now rendered from structured data and includes filtering so inactive recurring activities do not appear as if they are current. That is a practical fix because stale event data is worse than missing data for this audience. If a resident trusts the site and then sees outdated activities, confidence in the whole calendar drops.

Featured event links also improved over time. Recurring activity titles were wired to activity flyer pages, and one-time featured events gained dated landing pages. This moves the project closer to the original "digital flyer" idea. Instead of asking every card to carry all information in a small space, the card can act as a clear invitation to a more detailed page.

The submission workflow also changed substantially. The early plan mentioned Google Forms, but the project moved toward native HTML and JavaScript forms. That choice gave more control over layout, validation, required fields, image handling, and coordinator handoff. The submit flow now better matches the project's static-hosting constraint: there is no server silently accepting submissions, so the workflow keeps a human coordinator in the loop. The request-activity page extends that same idea to recurring activities rather than treating every request as a one-time event.

Several fixes also support the page structure itself. Links had to account for different directory depths, because root pages, operational pages, activity flyers, and feature-event pages do not all live at the same path level. The shared JavaScript and README now reflect that structure. This is the kind of functional fix that users may not notice when it works, but they notice immediately when it fails.

## Development and Maintenance Improvements

Some of the most valuable changes were not designed primarily for residents. They were built to make the project easier to maintain. The export buttons are a good example. The sidebar export format chooser and CSV export support help turn site data into files that can be reviewed, shared, or used for development. These tools are useful to me as the builder because they reduce manual copying and make it easier to inspect whether the structured event data is correct.

The added CSV schedule file and featured event CSV workflow are also important. The site now has a clearer bridge between human-friendly editing and structured data. A CSV can be reviewed more easily than a large JSON file, and scripts can transform approved rows into the format the browser needs. This supports a future coordinator workflow without requiring a full backend application.

The local scripts in the repository show the same direction. They are not part of the public runtime, but they help generate or transform data for the site. This is a reasonable compromise for a static site. Residents get a simple website, while the maintainer gets tools that reduce repetitive work and lower the chance of hand-editing mistakes.

The hidden calendar manager link is another maintenance-oriented addition. It is not meant to be a primary resident feature. It gives the person managing the calendar a quicker path into the Google Calendar management surface without adding clutter to the main navigation. That fits the overall design goal: make the public interface simple, but keep practical helper paths available for the person running the system.

The README also grew into a more useful maintenance document. It now explains the repository layout, page types, JavaScript responsibilities, data model, and automation scripts. That documentation matters because the project is not only a website; it is an operating process for keeping a community calendar updated.

## What Changed From the Original Concept

The project did not abandon the original concept, but it became more realistic. The concept started with "a simple calendar-first website." The current version is still calendar-first, but it recognizes that a calendar alone is not enough. Residents also need featured highlights, recurring activity explanations, submission paths, contact information, and simple ways to understand what is current.

The largest pivot was away from trying to make Google tools do everything. Google Calendar remains valuable because it solves public calendar display and subscription. Google Forms became less central because the native form gave better control over the resident experience and better matched the coordinator review process. The project also avoided building a backend before it was truly needed. That kept the scope realistic while still allowing real functionality.

Another major change was the expansion from event listings to event and activity storytelling. Activity flyers and feature-event pages make the site feel less like a data table and more like a community bulletin board. That is a better fit for McAllen Mobile Park. The users are not browsing anonymous event inventory. They are deciding whether to attend something with neighbors.

The development process also shifted from building pages one at a time toward building reusable patterns. The shared CSS, page body classes, common card styles, data-driven sidebars, and documented folder structure make the project more stable. This is important for Project 02 because polish depends on consistency. A site can have many features and still feel unfinished if every page behaves differently.

## Evaluation Criteria

The most important evaluation question is whether a resident can quickly answer, "What is happening, and how do I participate?" The current build is much closer to that goal than the first prototype. The home page shows the calendar, recurring activities, and featured events. The activity flyers explain recurring programs. The submission and request pages give residents a way to propose new events or activities.

A second criterion is whether the site reduces cognitive load. The current design supports that through repeated navigation, large readable text, obvious buttons, and a narrow focus on park events. The site does not try to become Eventbrite, Facebook, or a city-wide listing system. It stays close to the community problem that started the project.

A third criterion is maintainability. A community calendar only works if it can stay current. The export buttons, CSV workflows, JSON model, scripts, and README all support that goal. They are not as visible as the home page, but they are part of whether the project can survive beyond a class demo.

## Reflection and Next Steps

The strongest part of the iteration process has been learning where simplicity belongs. The public-facing side of the project needs to stay simple for residents. The maintenance side can be more technical if it saves time and prevents mistakes. That split helped the project grow without making the resident experience heavier.

The hardest part has been managing the boundary between calendar data, JSON data, CSV data, and human workflow. Each format has a reason to exist, but too many disconnected paths could become confusing. The next iteration should continue tightening that workflow so there is a clear standard process for adding, featuring, exporting, and publishing events.

For Project 02, the most important next steps are to finish polishing the featured-event and flyer experience, confirm mobile behavior on real devices, continue cleaning data consistency, and make sure the README matches the actual operating process. I also need to evaluate the site using practical criteria: Can a resident find the next event? Can a coordinator understand what data needs to be updated? Can I export or inspect event data without manual rework? Those questions are more useful than judging the project only by the number of pages or features.

Overall, the project has moved from a concept for a simple calendar website into a more complete community event system. The biggest improvements are not just extra features. They are the changes that made the site clearer for residents, more dependable in its links and data, and easier for me to maintain while continuing development.
