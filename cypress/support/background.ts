export function cdp(command: string, params: Record<string, unknown>) {
  return cy.then(() => Cypress.automation("remote:debugger:protocol", { command, params }));
}

export function observeFirstVertex(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d")!;
  const clear = context.clearRect;
  const move = context.moveTo;
  let first = true;
  let difference = NaN;
  let point = { x: NaN, y: NaN };
  context.clearRect = (...args) => { first = true; clear.apply(context, args); };
  context.moveTo = (x, y) => {
    if (first) { difference = x - y; point = { x, y }; }
    first = false;
    move.call(context, x, y);
  };
  return Object.assign(() => difference, {
    point: () => point,
    restore() { context.clearRect = clear; context.moveTo = move; },
  });
}

// For the first overscan vertex at 375x812, shared x/y wobble cancels.
// This artwork-specific projection observes pointer displacement through actual drawing.
export function mobileParallaxProjection(x: number, y: number) {
  return -75 + 50.75 + 25 * (x / 375 - y / 812);
}

export function assertBackgroundCoverage() {
  cy.window().then((appWindow) => {
    cy.get("canvas").should(($canvas) => {
      const canvas = $canvas[0] as HTMLCanvasElement;
      const bounds = canvas.getBoundingClientRect();
      const style = appWindow.getComputedStyle(canvas);
      expect(style.display, "background participates in layout").not.to.equal("none");
      expect(style.visibility, "background is shown").to.equal("visible");
      expect(Number(style.opacity), "background is not transparent").to.be.greaterThan(0);
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
