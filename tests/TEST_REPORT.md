<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# Math Dojo — verification report, 2026-11-03

## Automated checks performed

| Check | Result |
|---|---|
| Existing math generators (`node tests/verify_generators.js`) | PASS — 8,000 generated exercises |
| Experimental infinite pedagogy generator (`node tests/verify_orientation.js`) | PASS — 75,000 generated questions across three themes |
| Curated bank (`node tests/verify_library.js`) | PASS — 30 entries; 3 topics; 8 skill types; 3 levels |
| Static site audit (`python tests/site_audit.py`) | PASS — 15 trainer pages + internal paths and text-input mode |
| Chromium UI regression (`python tests/browser_vnext.py`) | PASS — 12 scenarios, no observed JS errors |

### Browser scenarios

1. Main page: two prominent modes, twelve topic cards, card settings/persistence.
2. Narrow/mobile viewport, settings layout and controls.
3. Student library: 10 questions from selected topic, shuffled without repetitions.
4. Developer mode: advanced filters, sorting, public/student path still available.
5. Mixed session: 6 questions from 6 distinct topic families.
6. Focused formula and zero-product trainers immediately begin on click-through.
7. Arithmetic-plus immediate start and regular text keyboard field.
8. Fractions accepts typed slash `3/4` in regular text input.
9. Curated question math-renderer API and readable fallback.
10. Mixed 12 questions samples all 12 topic families.
11. Explicit LaTeX field passes through the KaTeX renderer (mocked renderer).
12. Import a new topic in JSON, have it appear in selectors, and train it.

## Boundaries / things not claimed

- Mobile viewport and `inputmode="text"` were checked, but **physical iOS/Android keyboards were not tested on real devices**. Browsers and mobile systems can vary in which keyboard they offer.
- KaTeX is loaded from a pinned CDN address and protected by SRI. The sandbox browser could not access the external CDN. The integration and rendering API were checked with a stub; actual hosted KaTeX typography must be visually checked once deployed online. If CDN is unavailable, textual fallback remains readable.
- Mixed mode uses compatible adapters for 3 specialized original trainers rather than copying those trainers' full question generation engines. All 12 categories are covered.
- Checks verify code paths, data constraints, and numeric invariants. They are **not proof of educational effectiveness**; teacher/pupil observation remains necessary.
- Real GitHub Pages deployment was not performed; no write access to the user's repository was used.

## Running tests

```bash
node tests/verify_generators.js
node tests/verify_orientation.js
node tests/verify_library.js
python tests/site_audit.py
python tests/browser_vnext.py
```

Python browser test uses the `playwright` Python module and a locally available Chromium binary. Site audit uses `beautifulsoup4`.
