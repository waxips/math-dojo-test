# Math Dojo — student-first version (3 layers)

This release is a static GitHub Pages site. No server, login, API or build service is required to use the published HTML. Licensed `GPL-3.0-or-later` (see `COPYING`, `LICENSE`, `LICENSE-NOTICE.md`).

## Student flow

1. Open `index.html`. Two main modes are directly visible: **Обычная тренировка** and **Библиотека заданий**.
2. Ordinary mode: select any of the **12 topic cards**. A single click launches **6 problems** immediately. Or choose **Все темы вперемешку**; its one session uses the shared exercise shell and all 12 topic families.
3. Each card's `…` opens options for session length (1–100); advanced arithmetic also supports difficulty. Long-press a topic card for the same dialog on touch devices. Options are saved with `localStorage` when available; this is per browser/device, not account-based.
4. Curated mode: choose a topic (or all) and press **Начать**. Questions are shuffled *without replacement* until that topic's bank is exhausted (10 per topic currently; 30 total). No table required.
5. **Режим разработчика** reveals filtering, sorting, page length, question selection, custom series, JSON import/export. Imported records are only temporary until the published JSON is replaced.
6. The earlier experimental **«Как начать?»** unlimited generator is preserved at `trainers/how_to_start.html`, but is no longer a primary mode.

### Normal trainers

The nine original trainer subjects still use their original generation logic. `arithmetic_plus.html`, `formulas.html`, and `zero_product.html` remain independent. `mixed.html` uses the nine shared generators plus small compatible adapters for those other three categories, so mixed mode is intentionally a lighter cross-topic sampling rather than an exact copy of each specialized page.

All numerical answer fields now use `type="text"` + `inputmode="text"` so mobile keyboards can enter `1/2`, `-3`, commas and parentheses. This controls the keyboard *requested* from the mobile OS; actual layouts can vary by browser and device.

## LaTeX

The curated JSON accepts optional LaTeX strings:

- `expressionLatex` — main formula, alongside plain `expression` fallback
- `questionLatex` — full question instead of `question`
- `options[].latex` — rendered option instead of `options[].text`
- `hintLatex`, `explanationLatex` — optional full-field math markup
- In ordinary text you can embed math via `\\(x^2+1\\)` or `\\[\\frac{1}{2}\\]`. (Double the backslashes in JSON.)

`assets/math.js` renders via pinned **KaTeX 0.19.1** on jsDelivr, with Subresource Integrity, no API key or server. If the library cannot load (offline or blocked CDN), math remains readable as textual fallback. Existing Unicode expressions are unaffected. See `assets/katex-setup.md` for optional self-hosting. Math **display** accepts LaTeX; answer **input** is ordinary text, not LaTeX.

This repository does **not** bundle KaTeX's font files.

## Update the site

Upload the contents of this ZIP to the root of the GitHub repository (where `index.html` is). Keep `trainers/`, `source/`, `assets/`, tests, and license files together. In GitHub Settings → Pages choose Deploy from a branch, `main`, `/(root)`.

After editing library questions:

```bash
python source/library/build.py
```

After editing source generator files:

```bash
python source/legacy/build.py
python source/focused/build.py
python source/orientation/build.py
```

Then commit the newly generated `trainers/*.html` alongside updated source. No build is required on GitHub Pages itself.

## Tests

```bash
node tests/verify_generators.js
node tests/verify_orientation.js
node tests/verify_library.js
python tests/browser_vnext.py
```

The browser test uses `page.set_content` and embedded assets because sandbox browsers can block local HTTP navigation. It verifies DOM behaviors but does not simulate actual mobile system keyboards or verify the remote CDN's availability. The tests use real Chromium on desktop/mobile viewport sizes.
