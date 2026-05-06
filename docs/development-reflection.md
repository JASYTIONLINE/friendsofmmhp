# Development reflection

This reflection describes process, not a feature list. Length target: **roughly 300 words**.

---

## Draft (edit voice and specifics before submission)

Static sites look simple until layout, data, and multiple page depths interact. This capstone reinforced that **most defects were integration problems**: path math for JSON on nested flyer pages, grid `min-width` behavior at mid-width viewports, and keeping featured-event dates honest when the calendar month still included past days. The hardest stretch was balancing **README promises** with what the browser could actually do without a server—forms had to be honest about mailto, share, and CSVZIP handoffs instead of pretending submissions were “saved” silently.

What went well was **centralizing behavior**: one stylesheet, one primary JSON load path, and scripts that explain themselves in file headers so reviewers can follow intent. What was difficult was **resisting scope creep**—every extra feature wanted a backend—and instead documenting why coordinator-mediated JSON updates were the right trade-off.

If I repeated the project, I would **freeze data contracts earlier** (field names for `adCopy`, `isActive`) and run link audits on every merge to `main` so drift never accumulated. I would also prototype mobile and wide layouts **together** rather than fixing overlap late.

This work connects to CMPA’s emphasis on **professional product narrative**: the site is only “done” when the repository README, the rubric, and the deployed pages tell one story. Tools (including AI assistance) speed drafting and refactors; they do not replace verification on a real deployment.

*(Word count note: trim or expand slightly to meet your instructor’s band, typically 200–400 words.)*
