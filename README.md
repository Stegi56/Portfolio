## Stegi Portfolio

### Dev

```bash
npm install
```

```bash
npm run dev
```

### Static build

```bash
npm run build
npm run preview
```

The generated GitHub Pages-ready site is written to `out/`.

### Tests

Run the fast pointer-motion tests, then build and run the browser accessibility and interaction tests:

```bash
npm test
```

To run only the pointer-motion tests (no browser or build required):

```bash
npm run test:unit
```

To watch the browser tests interactively:

```bash
npm run test:open
```

In Cypress, select **E2E Testing**, choose Chrome, and open a spec. Close Cypress when finished; the local preview server will stop automatically.

- `portfolio.cy.ts` runs the shared homepage, skills, clipboard, blog accessibility and 404 layout checks at mobile (375×812), tablet (768×1024) and desktop (1440×900). Each test starts at its intended size before loading the page.
- `portfolio-regressions.cy.ts` runs content checks and targeted navigation/412×924 refresh regressions once. Blog index links are compared with the published source files, and every article is loaded directly and refreshed.
- `tests/pointer-motion.test.ts` checks pointer tracking, bounded teleport recovery, moving-target capture, resize and scroll following with Node's built-in test runner.
- `pointer-input.cy.ts` checks mouse, pen and touch ownership, listener cleanup and native Chrome/Edge touch scrolling.
- `background.cy.ts` checks actual drawing, frame timing, viewport resizing, reduced motion and canvas cleanup.

The background's artwork and recovery settings live in `src/lib/background.ts`. Pointer recovery follows moving targets with bounded speed and acceleration, then returns to exact tracking until another touch or re-entry. The tests describe the required motion and browser behavior.

To run just the mobile portfolio checks in PowerShell:

```powershell
$env:PORTFOLIO_VIEWPORT = "mobile"
try {
  npm run cypress:run -- --spec cypress/e2e/portfolio.cy.ts
} finally {
  Remove-Item Env:PORTFOLIO_VIEWPORT
}
```

`PORTFOLIO_VIEWPORT` accepts `mobile`, `tablet`, `desktop` or `all` (the default), and only selects cases in `portfolio.cy.ts`. Screenshots are written to the ignored `cypress/screenshots/` directory. Inspect them at all three required sizes: automated visibility and overflow checks do not replace visual review.

GitHub Actions runs the Node tests once before building, then runs three parallel browser jobs: pinned Chrome 109, Firefox 115 and Edge 120. Each browser runs the shared suite at its specified viewport sizes; two Chromium-native input/media checks are explicitly pending in Firefox. Each worker serves its own copy of the same static artifact; `PORTFOLIO_SKIP_BUILD=1` tells Cypress to use that existing `out/` build. Local runs build fresh unless this variable is explicitly set. Avoid running concurrent builds in the same checkout.

Pull requests run the build and tests without deploying. The existing main-branch deployment waits for all test jobs to pass. Every test job uploads its screenshots, including failure screenshots, for review.

The [compatibility document](docs/compatibility.md) records the estimated browser floors evaluated on 12 September 2026, their [12 March 2027 review](https://github.com/Stegi56/Portfolio/issues/3), and the Cypress/TypeScript compatibility pins. Exact browser artifacts are in [test-browsers.json](test-browsers.json); the separate CPU/frame budget is in [performance-budget.json](performance-budget.json).

### Blogs

Each post is defined by one `src/data/blog/<slug>/blog.mdx` file and a matching `public/blog/<slug>/cover.jpg`. The folder name becomes the URL slug. Frontmatter contains only a title and a human-entered date in `DD-MMM-YYYY` format:

```md
---
title: "Post title"
date: "03-Jan-2026"
---
```

The build discovers posts, validates their metadata and cover, calculates reading time at 200 words per minute, sorts them newest-first, and exports their static pages to `out/`.

### Pinned test browsers

`npm test` runs Node motion checks, builds once, then runs browser tests against the pinned Chrome, Firefox and Edge binaries. `npm run cypress:run -- --browser firefox` selects just the pinned Firefox; `npm run cypress:open` opens pinned Chrome by default. `npm run test:browsers:install` prepares the browser cache without running tests.

Edge 120 fails to launch correctly on the evaluated Windows machine; local tests report that failure. CI temporarily allows only the Edge Cypress step to fail, with a warning linked to [issue #4](https://github.com/Stegi56/Portfolio/issues/4). Provisioning and all other checks remain blocking. Chrome 109 and Firefox 115 have passed their applicable checks. See the [compatibility limitations](docs/compatibility.md#test-toolchain-and-coverage), including Firefox's headless blur discrepancy and unverified Linux execution.

Downloads are checked against stored SHA256 hashes and extracted into ignored `.cache/test-browsers/`; they do not replace normal desktop browsers. Setup supports Windows x64 and Linux x64. Linux Chrome 109 extraction requires Docker, available on the GitHub-hosted Ubuntu runner; the other Linux archives use `tar` and `dpkg-deb`. Screenshots are grouped by browser under `cypress/screenshots/`.

The test runner checks the browser product and full version before launch. Explicit browser executable paths are diagnostic runs and do not satisfy the pinned default policy. The Firefox fallback applies only when a version cannot launch, not when the application fails an assertion. Browser results do not establish the calibrated performance budget.
