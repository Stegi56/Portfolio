import type { Point } from "../../src/lib/pointerMotion";
import { listenForPointer } from "../../src/lib/pointerInput";
import { cdp, observeFirstVertex, mobileParallaxProjection } from "../support/background";

describe("background input", () => {
  let nativeTouchActive = false;
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.visit("/");
    cy.get("canvas").should("have.attr", "data-low-poly-cols", "10");
  });

  it("continues after pointer cancellation, keeps one finger, and removes listeners", () => {
    cy.window().then((win) => {
      const positions: { x: number; y: number }[] = [];
      const teleports: boolean[] = [];
      const scrollModes: boolean[] = [];
      const dispose = listenForPointer(win, (point, teleport, scrolling = false) => {
        positions.push(point); teleports.push(teleport); scrollModes.push(scrolling);
      });
      const touch = (identifier: number, clientX: number, clientY: number) => new win.Touch({ identifier, target: win.document.body, clientX, clientY });
      const fire = (type: string, touches: Touch[]) => win.document.body.dispatchEvent(new win.TouchEvent(type, { touches, bubbles: true, cancelable: true }));
      const first = touch(1, 50, 200);
      fire("touchstart", [first]);
      win.document.body.dispatchEvent(new win.PointerEvent("pointercancel", { pointerType: "touch", bubbles: true }));
      win.document.body.dispatchEvent(new win.PointerEvent("pointerout", { pointerType: "touch", isPrimary: true, bubbles: true }));
      expect(fire("touchmove", [touch(1, 100, 250)])).to.equal(true);
      fire("touchstart", [touch(2, 300, 600), first]);
      fire("touchmove", [touch(2, 300, 600), touch(1, 150, 300)]);
      win.document.body.dispatchEvent(new win.PointerEvent("pointermove", { pointerType: "mouse", isPrimary: true, clientX: 200, clientY: 250, bubbles: true }));
      expect(positions).to.deep.equal([{ x: 50, y: 200 }, { x: 100, y: 250 }, { x: 150, y: 300 }]);
      fire("touchend", [touch(2, 300, 600)]);
      fire("touchmove", [touch(2, 200, 500)]);
      expect(positions).to.have.length(3);
      fire("touchcancel", []);
      fire("touchstart", [touch(3, 75, 400)]);
      expect(positions.at(-1)).to.deep.equal({ x: 75, y: 400 });
      fire("touchend", []);
      win.document.body.dispatchEvent(new win.PointerEvent("pointermove", { pointerType: "mouse", isPrimary: true, clientX: 200, clientY: 250, bubbles: true }));
      expect(positions.at(-1)).to.deep.equal({ x: 200, y: 250 });
      expect(teleports).to.deep.equal([true, false, false, true, true]);
      expect(scrollModes, "only the browser-owned gesture uses scroll following").to.deep.equal([false, true, true, false, false]);
      dispose();
      fire("touchstart", [first]);
      expect(positions).to.have.length(5);
    });
  });

  it("recognises re-entry, capture outside the viewport, source changes, blur and hidden tabs", () => {
    cy.window().then((win) => {
      const samples: { point: Point; teleport: boolean }[] = [];
      const dispose = listenForPointer(win, (point, teleport) => samples.push({ point, teleport }));
      const fire = (type = "pointermove", init: PointerEventInit = {}) => win.document.body.dispatchEvent(new win.PointerEvent(type, {
        pointerType: "mouse", pointerId: 1, isPrimary: true, clientX: 50, clientY: 200, bubbles: true, ...init,
      }));
      fire();
      fire("pointermove", { clientX: 350 });
      fire("pointerdown");
      // Crossing descendants and changing capture within the page is continuous.
      fire("pointerout", { relatedTarget: win.document.documentElement });
      fire("pointerover", { relatedTarget: win.document.documentElement });
      fire("lostpointercapture");
      fire();
      expect(samples.map(({ teleport }) => teleport)).to.deep.equal([true, false, false, false]);

      fire("pointerout");
      fire("pointerover", { clientX: 300 });
      expect(samples.at(-1)).to.deep.equal({ point: { x: 300, y: 200 }, teleport: true });
      fire();
      expect(samples.at(-1)!.teleport).to.equal(false);
      fire("pointerover", { clientX: 300 });
      expect(samples.at(-1)!.teleport, "re-entry also works if the leave event was missed").to.equal(true);
      const count = samples.length;
      fire("pointermove", { clientX: -20 });
      expect(samples).to.have.length(count);
      fire("pointermove", { clientX: 320 });
      expect(samples.at(-1)!.teleport).to.equal(true);
      fire("pointermove", { isPrimary: false });
      expect(samples).to.have.length(count + 1);

      fire("pointermove", { pointerType: "pen", pointerId: 2 });
      expect(samples.at(-1)!.teleport).to.equal(true);
      fire("pointermove", { pointerType: "pen", pointerId: 2 });
      expect(samples.at(-1)!.teleport).to.equal(false);
      fire("pointercancel", { pointerType: "pen", pointerId: 2 });
      fire("pointermove", { pointerType: "pen", pointerId: 2 });
      expect(samples.at(-1)!.teleport).to.equal(true);

      fire();
      fire();
      win.dispatchEvent(new win.Event("blur"));
      fire();
      expect(samples.at(-1)!.teleport).to.equal(true);
      fire();
      const beforeHidden = samples.length;
      Object.defineProperty(win.document, "hidden", { configurable: true, value: true });
      win.document.dispatchEvent(new win.Event("visibilitychange"));
      fire();
      expect(samples).to.have.length(beforeHidden);
      Object.defineProperty(win.document, "hidden", { configurable: true, value: false });
      win.document.dispatchEvent(new win.Event("visibilitychange"));
      fire();
      expect(samples.at(-1)!.teleport).to.equal(true);
      Reflect.deleteProperty(win.document, "hidden");

      const total = samples.length;
      dispose();
      fire("pointerout");
      fire("pointerover");
      fire("pointerdown");
      fire();
      win.dispatchEvent(new win.Event("blur"));
      win.document.dispatchEvent(new win.Event("visibilitychange"));
      expect(samples).to.have.length(total);
    });
  });

  it("removes blur and visibility listeners when the input subscription is disposed", () => {
    cy.window().then((win) => {
      const iframe = win.document.createElement("iframe");
      iframe.hidden = true;
      win.document.body.append(iframe);
      const isolated = iframe.contentWindow!;
      const cancel = cy.spy(isolated, "cancelAnimationFrame");
      const stop = listenForPointer(isolated, () => {});
      try {
        isolated.dispatchEvent(new Event("blur"));
        expect(cancel.callCount, "active reset handler runs").to.equal(1);
        stop();
        cancel.resetHistory();
        isolated.dispatchEvent(new Event("blur"));
        isolated.document.dispatchEvent(new Event("visibilitychange"));
        expect(cancel.callCount, "retired reset handlers cannot run").to.equal(0);
      } finally {
        stop();
        iframe.remove();
      }
    });
  });

  it("tracks native Chromium touch movement after scrolling cancels the pointer", { browser: ["chrome", "edge"] }, () => {
    const events: string[] = [];
    const positions: { x: number; y: number }[] = [];
    const pointerPositions: number[] = [];
    let vertex: ReturnType<typeof observeFirstVertex>;
    let dispose: () => void;
    cy.window().then((win) => {
      win.addEventListener("pointercancel", () => events.push("cancel"));
      win.addEventListener("touchmove", () => events.push("touchmove"));
      win.addEventListener("pointermove", (event) => pointerPositions.push(event.clientY));
      dispose = listenForPointer(win, (point) => positions.push(point));
    });
    cy.get("canvas").then(($canvas) => { vertex = observeFirstVertex($canvas[0] as HTMLCanvasElement); });
    cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    nativeTouch("touchStart", 180, 650);
    cy.then(() => { nativeTouchActive = true; });
    for (const y of [610, 550, 490, 430, 370, 310]) {
      nativeTouch("touchMove", 180, y);
      // Allow the compositor's corresponding scroll offset to commit as well.
      cy.window().then((win) => new Cypress.Promise<void>((resolve) => {
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve())));
      }));
      // Once native scrolling owns the gesture, CDP can acknowledge a move
      // before the passive touch listener receives it. Wait for delivery.
      cy.wrap(null).should(() => {
        expect(positions.at(-1)!.y, "each native scrolling sample follows the finger").to.be.closeTo(y, 3);
      });
    }
    cy.window().should((win) => {
      expect(win.scrollY, "native scrolling remains enabled").to.be.greaterThan(100);
      const cancelled = events.indexOf("cancel");
      expect(cancelled, "browser cancelled pointer events").to.be.at.least(0);
      expect(events.slice(cancelled + 1)).to.include("touchmove");
      expect(positions.at(-1)!.y).to.be.closeTo(310, 3);
      expect(pointerPositions.at(-1)! - positions.at(-1)!.y, "old pointer-only listener would remain behind").to.be.greaterThan(100);
    });
    // The first vertex starts at (-75, -50.75). Its shared x/y wobble cancels
    // in x-y, leaving only parallax. Verify the real renderer reaches the finger.
    cy.wrap(null).should(() => expect(vertex()).to.be.closeTo(mobileParallaxProjection(180, 310), 1));
    nativeTouch("touchEnd");
    cy.then(() => { nativeTouchActive = false; });
    cy.then(() => { dispose(); vertex.restore(); });
    cy.screenshot("mobile-native-touch", { capture: "viewport" });
  });

  afterEach(() => {
    if (Cypress.isBrowser({ family: "chromium" })) {
      if (nativeTouchActive) cdp("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
      nativeTouchActive = false;
      cdp("Emulation.setTouchEmulationEnabled", { enabled: false });
    }
  });
});

function nativeTouch(type: string, x = 0, y = 0) {
  cy.window().then((win) => {
    // CDP coordinates address the runner's top viewport, including the scaled AUT iframe.
    const iframe = window.top!.document.querySelector<HTMLIFrameElement>("iframe.aut-iframe")!;
    const bounds = iframe.getBoundingClientRect();
    const touchPoints = type === "touchEnd" ? [] : [{
      x: bounds.left + x * bounds.width / win.innerWidth,
      y: bounds.top + y * bounds.height / win.innerHeight,
      id: 1,
    }];
    return Cypress.automation("remote:debugger:protocol", { command: "Input.dispatchTouchEvent", params: { type, touchPoints } });
  });
}
