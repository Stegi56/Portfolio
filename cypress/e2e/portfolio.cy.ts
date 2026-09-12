import { assertBackgroundCoverage } from "../support/background";
import {
  assertImmediatelyAtPageBottom,
  assertPublishedBlogLinks,
  blogLinkSelector,
  checkAccessibility,
  pathFromHref,
  publishedBlogPaths,
} from "../support/portfolio";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const requestedViewport = Cypress.env("viewport") ?? "all";
const selectedViewports = viewports.filter(({ name }) => requestedViewport === "all" || requestedViewport === name);
if (!selectedViewports.length) throw new Error(`Unknown portfolio viewport: ${requestedViewport}`);

selectedViewports.forEach(({ name, width, height }) => {
  describe(`static portfolio - ${name}`, { viewportWidth: width, viewportHeight: height }, () => {
    it("renders an accessible homepage and teaches skill selection", () => {
      cy.visit("/");
      cy.get("nav").should("be.visible");
      cy.contains("h1", "Joel Staugaitis").should("be.visible");
      checkAccessibility();
      assertNoHorizontalOverflow(width);
      assertBackgroundCoverage();
      cy.get("body").trigger("pointermove", { eventConstructor: "PointerEvent", pointerType: "mouse", isPrimary: true, clientX: width * 0.8, clientY: height * 0.3 });
      cy.screenshot(`${name}-homepage`, { capture: "viewport" });

      findSkill("aws").should("have.class", "selected");
      findSkill("Python").first().should("not.have.class", "selected").click();
      findSkill("Python").should("have.class", "selected");
    });

    it("navigates between homepage sections and static blog pages", () => {
      cy.visit("/");
      cy.contains("a", "Skills").click({ scrollBehavior: false });
      cy.location("hash").should("eq", "#skills");
      cy.get("#skills").should("be.visible");
      cy.get("#skills > .container > div").should("have.css", "opacity", "1");
      cy.get("#skills").should(($section) => expect($section[0].getBoundingClientRect().top).to.be.within(80, 140));
      cy.screenshot(`${name}-skills`, { capture: "viewport" });

      cy.contains("a", "Blog").click();
      cy.location("pathname", { timeout: 10_000 }).should("eq", "/blog/");
      cy.get(blogLinkSelector).first().should("be.visible").invoke("attr", "href").then((href) => {
        expect(href, "first blog destination").to.be.a("string").and.not.be.empty;
        cy.get(blogLinkSelector).first().click();
        cy.location("pathname").should("eq", pathFromHref(href!));
        cy.get("main").should("be.visible");
      });

      cy.contains("a", "Contact").click();
      cy.location("pathname").should("eq", "/");
      cy.location("hash").should("eq", "#contact");
      assertImmediatelyAtPageBottom();
      cy.get("#contact > .container > div").should("have.css", "opacity", "1");
      cy.screenshot(`${name}-contact`, { capture: "viewport" });
    });

    it("has usable links and a functioning copy control", () => {
      cy.visit("/");
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
      publishedBlogPaths().then((paths) => {
        cy.visit("/blog/");
        assertPublishedBlogLinks(paths);
        checkAccessibility();
        assertNoHorizontalOverflow(width);
        cy.get("#blog").scrollIntoView();
        cy.get("#blog > .container > div").should("have.css", "opacity", "1");
        cy.screenshot(`${name}-blog-index`, { capture: "viewport" });

        paths.forEach((path) => {
          cy.visit("/blog/");
          cy.get(`${blogLinkSelector}[href='${path}']`).click();
          cy.location("pathname").should("eq", path);
          cy.get("main h1").should("be.visible");
          checkAccessibility();
          assertNoHorizontalOverflow(width);
          cy.screenshot(`${name}-article-${path.split("/")[2]}`, { capture: "viewport" });
        });
      });
    });

    it("keeps the 404 layout usable", () => {
      cy.visit("/missing-page/", { failOnStatusCode: false });
      assertNoHorizontalOverflow(width);
      cy.get("main > section.card").should("be.visible").should(($card) => {
        const bounds = $card[0].getBoundingClientRect();
        expect(bounds.left).to.be.at.least(0);
        expect(bounds.right).to.be.at.most(width);
      });
      cy.get("main > section.card img").should("be.visible");
      cy.get("nav").should("be.visible");
      cy.contains("h2", "404").should("be.visible").should(($code) => {
        const fontSize = getComputedStyle($code[0]).fontSize;
        expect(parseFloat(fontSize), "404 font size").to.be.greaterThan(40);
      });
      cy.contains("h3", "This page has gone bananas").should("be.visible");
      cy.contains("a", "Return home").should("be.visible");
      assertBackgroundCoverage();
      cy.screenshot(`${name}-404`, { capture: "viewport" });
    });
  });
});

function findSkill(name: string) {
  return cy.get("button.chip").filter((_, element) => element.textContent?.trim() === name);
}

function assertNoHorizontalOverflow(width: number) {
  cy.document().should((document) => {
    expect(document.documentElement.scrollWidth, "page width").to.be.at.most(width);
  });
}
