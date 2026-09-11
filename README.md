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

Build and run the local Cypress accessibility and interaction suite:

```bash
npm test
```

To watch the tests run interactively in a browser:

```bash
npm run test:open
```

In Cypress, select **E2E Testing**, choose Chrome, and open a spec. Close Cypress when finished; the local preview server will stop automatically.

- `portfolio.cy.ts` runs the shared homepage, skills, clipboard, blog accessibility and 404 layout checks at mobile (375×812), tablet (768×1024) and desktop (1440×900). Each test starts at its intended size before loading the page.
- `portfolio-regressions.cy.ts` runs content checks and targeted navigation/412×924 refresh regressions once. Blog index links are compared with the published source files, and every article is loaded directly and refreshed.
- `pointer-background.cy.ts` checks unrestricted pointer tracking, teleport-only correction, input continuity, native Chrome touch scrolling, reduced motion and visual rendering. Its own viewport cases are independent of the portfolio matrix.

Teleport recovery steers toward the moving pointer with bounded speed and acceleration, preserving recovery momentum. Set `teleportLimits.minimumApproachSpeed` on `LowPolyBackground` to control the desired minimum closing speed in CSS pixels/second (default: 240; 0 disables the floor). Movement scales with elapsed time. Set `teleportLimits.captureDistance` to the distance from the pointer at which recovery switches to exact, unrestricted tracking (default: 2 CSS pixels). Larger values lock sooner, snapping the remaining gap; the pointer does not need to stop. Fast movement and reversals then remain unrestricted until a new touch, re-entry, or other teleport starts recovery again. The handoff tests cover default and custom closing speeds and capture distances, including this sequence while the pointer keeps moving.

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

GitHub Actions builds once, then runs four parallel jobs: the three portfolio viewports and a separate group for content/regression and pointer tests. Each worker serves its own copy of the same static artifact; `PORTFOLIO_SKIP_BUILD=1` tells Cypress to use that existing `out/` build. Local runs build fresh unless this variable is explicitly set. Avoid running concurrent builds in the same checkout.

Pull requests run the build and tests without deploying. The existing main-branch deployment waits for all test jobs to pass. Every test job uploads its screenshots, including failure screenshots, for review.

### Blogs

Each post is defined by one `src/data/blog/<slug>/blog.mdx` file and a matching `public/blog/<slug>/cover.jpg`. The folder name becomes the URL slug. Frontmatter contains only a title and a human-entered date in `DD-MMM-YYYY` format:

```md
---
title: "Post title"
date: "03-Jan-2026"
---
```

The build discovers posts, validates their metadata and cover, calculates reading time at 200 words per minute, sorts them newest-first, and exports their static pages to `out/`.
