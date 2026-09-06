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

In Cypress, select **E2E Testing**, choose a browser, and open `portfolio.cy.ts`. Close Cypress when finished; the local preview server will stop automatically.

### Blogs

Each post is defined by one `src/data/blog/<slug>/blog.mdx` file and a matching `public/blog/<slug>/cover.jpg`. The folder name becomes the URL slug. Frontmatter contains only a title and a human-entered date in `DD-MMM-YYYY` format:

```md
---
title: "Post title"
date: "03-Jan-2026"
---
```

The build discovers posts, validates their metadata and cover, calculates reading time at 200 words per minute, sorts them newest-first, and exports their static pages to `out/`.
