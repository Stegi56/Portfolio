import type { AxeResults } from "axe-core";

export const blogLinkSelector = "a[aria-label^='Read ']";

export function publishedBlogPaths() {
  return cy.task<string[]>("publishedBlogPaths").then((paths) => {
    expect(paths, "published blog routes from source files").not.to.be.empty;
    return paths;
  });
}

export function assertPublishedBlogLinks(paths: string[]) {
  cy.get(blogLinkSelector).should(($links) => {
    const actual = Array.from($links, (link) => link.getAttribute("href")).sort();
    expect(actual, "index links match every published blog route").to.deep.equal([...paths].sort());
  });
}

export function pathFromHref(href: string) {
  return new URL(href, "http://portfolio.test").pathname;
}

export function assertScrolledToPageBottom() {
  cy.get("#contact").should("be.visible");
  cy.window({ timeout: 10_000 }).should(assertWindowAtPageBottom);
}

export function assertImmediatelyAtPageBottom() {
  cy.get("#contact").should("be.visible");
  cy.window().then(assertWindowAtPageBottom);
}

function assertWindowAtPageBottom(appWindow: Cypress.AUTWindow) {
  const viewportBottom = appWindow.scrollY + appWindow.innerHeight;
  expect(Math.ceil(viewportBottom)).to.be.at.least(appWindow.document.documentElement.scrollHeight - 1);
}

export function checkAccessibility() {
  cy.readFile<string>("node_modules/axe-core/axe.min.js", { log: false }).then((source) => {
    cy.window({ log: false }).then((window) => {
      const testWindow = window as typeof window & {
        axe: { run(document: Document): Promise<AxeResults> };
      };
      testWindow.eval(source);
      return testWindow.axe.run(testWindow.document);
    }).then(({ violations }) => {
      const summary = violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map((node) => node.target),
      }));

      cy.task("log", JSON.stringify(summary, null, 2)).then(() => {
        expect(violations, "accessibility violations").to.have.length(0);
      });
    });
  });
}
