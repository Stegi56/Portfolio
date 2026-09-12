import { assertBackgroundCoverage } from "../support/background";
import { assertPublishedBlogLinks, assertScrolledToPageBottom, publishedBlogPaths } from "../support/portfolio";

// Content checks and targeted regressions run once, outside the viewport matrix.
describe("static content and navigation regressions", () => {
  it("returns to the homepage when the brand is clicked from the blog index", () => {
    cy.visit("/blog/");
    cy.get("a[aria-label='STEGI56 home']").click();

    cy.location("pathname", { timeout: 10_000 }).should("eq", "/");
    cy.location("hash").should("eq", "#home");
  });

  it("exports every published blog route", () => {
    publishedBlogPaths().then((paths) => {
      cy.visit("/blog/");
      assertPublishedBlogLinks(paths);

      paths.forEach((path) => {
        cy.visit(path);
        cy.location("pathname").should("eq", path);
        cy.get("main h1").should("be.visible");
        cy.reload();
        cy.location("pathname").should("eq", path);
        cy.get("main h1").should("be.visible");
      });
    });
  });

  it("exports a useful 404 page", () => {
    cy.visit("/blog/not-a-blog/", { failOnStatusCode: false });
    cy.contains("h3", "This page has gone bananas").should("be.visible");
    cy.get("img[alt*='confused monkey']").should("be.visible");

    cy.visit("/missing-page/", { failOnStatusCode: false });
    cy.contains("h3", "This page has gone bananas").should("be.visible");
    cy.get("img[alt*='confused monkey']").should("be.visible");
    cy.contains("a", "Return home").should("have.attr", "href", "/");
  });

  it("uses consistent human-entered blog dates", () => {
    cy.visit("/blog/");
    cy.get(".blog-date").each(($date) => {
      expect($date.text().trim()).to.match(/^(0[1-9]|[12]\d|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/);
    });
  });
});

describe("mobile refresh regressions", { viewportWidth: 412, viewportHeight: 924 }, () => {
  it("reaches the contact section from a fresh mobile page", () => {
    const scrollPositions: number[] = [];
    cy.visit("/");
    cy.window().then((appWindow) => {
      appWindow.addEventListener("scroll", () => scrollPositions.push(appWindow.scrollY));
    });
    cy.contains("a", "Contact").click();
    cy.location("hash").should("eq", "#contact");
    assertScrolledToPageBottom();
    cy.then(() => {
      const distinctPositions = new Set(scrollPositions.map(Math.round));
      expect(distinctPositions.size, "smooth scroll positions").to.be.greaterThan(2);
    });

    cy.reload(true);
    cy.location("hash").should("eq", "#contact");
    assertScrolledToPageBottom();
  });

  it("covers the mobile viewport with the background after refresh", () => {
    cy.visit("/");
    assertBackgroundGrid(10, 16);
    assertBackgroundCoverage();
    cy.reload(true);
    assertBackgroundGrid(10, 16);
    assertBackgroundCoverage();
  });
});

function assertBackgroundGrid(cols: number, rows: number) {
  cy.get("canvas")
    .should("have.attr", "data-low-poly-cols", String(cols))
    .and("have.attr", "data-low-poly-rows", String(rows));
}
