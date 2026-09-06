import type { AxeResults } from "axe-core";

const blogLinkSelector = "a[aria-label^='Read ']";

describe("static portfolio", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders an accessible homepage and teaches skill selection", () => {
    checkAccessibility();

    findSkill("aws").should("have.class", "selected");
    findSkill("Python").first().should("not.have.class", "selected").click();
    findSkill("Python").should("have.class", "selected");
  });

  it("navigates between homepage sections and static blog pages", () => {
    cy.contains("a", "Skills").click();
    cy.location("hash").should("eq", "#skills");
    cy.get("#skills").should("be.visible");

    cy.contains("a", "Blog").click();
    cy.location("pathname", { timeout: 10_000 }).should("eq", "/blog/");
    cy.get("body").then(($body) => {
      const firstBlogLink = $body.find(blogLinkSelector).first();
      if (!firstBlogLink.length) return;

      const href = firstBlogLink.attr("href")!;
      cy.wrap(firstBlogLink).click();
      cy.location("pathname").should("eq", pathFromHref(href));
      cy.get("main").should("be.visible");
    });

    cy.contains("a", "Contact").click();
    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#contact");
    assertImmediatelyAtPageBottom();
  });

  it("has usable links and a functioning copy control", () => {
    cy.get("a").each(($link) => {
      expect($link.attr("href"), $link.text().trim() || "image link").to.be.a("string").and.not.be.empty;
    });

    cy.window().then((window) => {
      cy.stub(window.navigator.clipboard, "writeText").as("copyEmail").resolves();
    });
    cy.get("button[title='copy to clipboard']").click();
    cy.get("@copyEmail").should("have.been.calledWith", "56rolsj@gmail.com");
  });

  it("keeps the blog index and every published blog accessible", () => {
    openBlogIndex();
    checkAccessibility();

    cy.get("body").then(($body) => {
      const blogCount = $body.find(blogLinkSelector).length;
      if (!blogCount) return;

      for (let index = 0; index < blogCount; index += 1) {
        openBlogIndex();
        cy.get(blogLinkSelector).eq(index).then(($link) => {
          const href = $link.attr("href")!;
          cy.wrap($link).click();
          cy.location("pathname").should("eq", pathFromHref(href));
          cy.get("main h1").should("be.visible");
          checkAccessibility();
        });
      }
    });
  });

  it("exports discovered blog routes and a useful 404 page", () => {
    openBlogIndex();
    cy.get("body").then(($body) => {
      const firstBlogLink = $body.find(blogLinkSelector).first();
      if (!firstBlogLink.length) return;

      const href = firstBlogLink.attr("href")!;
      cy.visit(href);
      cy.location("pathname").should("eq", pathFromHref(href));
      cy.get("main h1").should("be.visible");
    });

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

  it("keeps the key experience usable on a mobile viewport", () => {
    cy.viewport(375, 812);
    cy.visit("/");
    cy.get("nav").should("be.visible");
    cy.contains("h1", "Joel Staugaitis").should("be.visible");
    findSkill("aws").should("have.class", "selected");
    cy.contains("a", "Blog").click();
    cy.location("pathname").should("eq", "/blog/");
    cy.get("body").then(($body) => {
      const firstBlogLink = $body.find(blogLinkSelector).first();
      if (firstBlogLink.length) cy.wrap(firstBlogLink).should("be.visible");
    });
  });

  it("reaches the contact section from a fresh mobile page", () => {
    const scrollPositions: number[] = [];
    cy.viewport(412, 924);
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
    cy.viewport(412, 924);
    cy.visit("/");
    assertBackgroundGrid(10, 16);
    assertBackgroundCoverage();
    cy.reload(true);
    assertBackgroundGrid(10, 16);
    assertBackgroundCoverage();
  });

  [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ].forEach(({ name, width, height }) => {
    it(`keeps the 404 layout usable on ${name}`, () => {
      cy.viewport(width, height);
      cy.visit("/missing-page/", { failOnStatusCode: false });
      cy.document().then((document) => {
        expect(document.documentElement.scrollWidth).to.be.at.most(width);
      });
      cy.get("main > section.card").should("be.visible").then(($card) => {
        const bounds = $card[0].getBoundingClientRect();
        expect(bounds.left).to.be.at.least(0);
        expect(bounds.right).to.be.at.most(width);
      });
      cy.get("main > section.card img").should("be.visible");
      cy.get("nav").should("be.visible");
      cy.contains("h2", "404").should("be.visible").then(($code) => {
        const fontSize = getComputedStyle($code[0]).fontSize;
        expect(parseFloat(fontSize), "404 font size").to.be.greaterThan(40);
      });
      cy.contains("h3", "This page has gone bananas").should("be.visible");
      cy.contains("a", "Return home").should("be.visible");
    });
  });
});

function findSkill(name: string) {
  return cy.get("button.chip").filter((_, element) => element.textContent?.trim() === name);
}

function openBlogIndex() {
  cy.visit("/");
  cy.contains("a", "Blog").click();
  cy.location("pathname", { timeout: 10_000 }).should("eq", "/blog/");
}

function pathFromHref(href: string) {
  return new URL(href, "http://portfolio.test").pathname;
}

function assertBackgroundCoverage() {
  cy.window().then((appWindow) => {
    cy.get("canvas").should(($canvas) => {
      const canvas = $canvas[0] as HTMLCanvasElement;
      const bounds = canvas.getBoundingClientRect();
      expect(bounds.left).to.equal(0);
      expect(bounds.top).to.equal(0);
      expect(Math.round(bounds.right)).to.equal(appWindow.innerWidth);
      expect(Math.round(bounds.bottom)).to.equal(appWindow.innerHeight);

      const context = canvas.getContext("2d");
      expect(context, "canvas context").not.to.equal(null);
      const rightEdgePixel = context!.getImageData(canvas.width - 2, Math.floor(canvas.height / 2), 1, 1).data;
      expect(rightEdgePixel[3], "right edge pixel alpha").to.be.greaterThan(0);
    });
  });
}

function assertBackgroundGrid(cols: number, rows: number) {
  cy.get("canvas")
    .should("have.attr", "data-low-poly-cols", String(cols))
    .and("have.attr", "data-low-poly-rows", String(rows));
}

function assertScrolledToPageBottom() {
  cy.get("#contact").should("be.visible");
  cy.window({ timeout: 10_000 }).should(assertWindowAtPageBottom);
}

function assertImmediatelyAtPageBottom() {
  cy.get("#contact").should("be.visible");
  cy.window().then(assertWindowAtPageBottom);
}

function assertWindowAtPageBottom(appWindow: Cypress.AUTWindow) {
  const viewportBottom = appWindow.scrollY + appWindow.innerHeight;
  expect(Math.ceil(viewportBottom)).to.be.at.least(appWindow.document.documentElement.scrollHeight - 1);
}

function checkAccessibility() {
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
