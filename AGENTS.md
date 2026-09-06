# Portfolio project guidance

This file contains minimal context that cannot be inferred from the project itself.

- Keep `aws` selected when the skills state is first created. This is intentional: the initial highlighted skill teaches visitors that skill pills are interactive and can be selected.
- The project must remain a compiled static application that can be hosted on GitHub Pages.
- Navigation links to sections on the current page must use browser-native smooth scrolling. A section hash loaded from another page or a cold load must align instantly.
- All user-facing changes must be visually verified at mobile (375×812), tablet (768×1024), and desktop (1440×900). Layouts must remain usable without horizontal overflow, clipping, overlap, or cramped content; automated visibility checks alone are insufficient.
- Pin npm dependencies to the latest stable major and minor release, one published patch behind the latest. Use the latest patch when no earlier patch exists in that release line or when a critical vulnerability affects the buffered patch.
- When dependencies or features are removed, clean up files and resources that are no longer used, and keep `.gitignore` current with generated artifacts.
- Validate changes locally. Do not deploy to GitHub Pages, publish the site, or otherwise trigger a production deployment without the user's explicit permission.
