import type { Point } from "../../src/lib/pointerMotion";
import { mountBackground } from "../../src/lib/background";
import { cdp, observeFirstVertex, mobileParallaxProjection } from "../support/background";

describe("background frame response", () => {
  let frames: ReturnType<typeof controlFrames>;

  beforeEach(() => {
    cy.viewport(375, 812);
    cy.visit("/", { onBeforeLoad(win) { frames = controlFrames(win); } });
    cy.get("canvas").then(() => frames.step(0));
    cy.get("canvas").should("have.attr", "data-low-poly-cols", "10");
  });

  it("tracks scrolling throughout a 200ms touch gap and stops following on release", () => {
    cy.window().then((win) => {
      const vertex = observeFirstVertex(win.document.querySelector("canvas")!);
      const touch = (type: string, y: number) => win.document.body.dispatchEvent(new win.TouchEvent(type, {
        touches: type === "touchend" ? [] : [new win.Touch({ identifier: 1, target: win.document.body, clientX: 187.5, clientY: y })],
        bubbles: true,
      }));
      const expected = (y: number) => -75 + 50.75 + 25 * (0.5 - y / 812);
      frames.step(0);
      touch("touchstart", 406);
      frames.step(0);
      win.document.body.dispatchEvent(new win.PointerEvent("pointercancel", {
        pointerType: "touch", isPrimary: true, bubbles: true,
      }));
      // Chrome can deliver touchmove only every 200ms during native scrolling.
      // Keep scrolling for twelve frames without delivering any new touch sample.
      for (let frame = 1; frame <= 12; frame++) {
        win.scrollTo({ top: frame * 12, behavior: "instant" });
        win.dispatchEvent(new win.Event("scroll"));
        frames.step();
        if (frame >= 6) {
          expect(vertex(), "scroll deltas keep the rendered tracker near the finger")
            .to.be.closeTo(expected(406 - frame * 12), 1.5);
        }
      }
      touch("touchmove", 142);
      frames.step();
      // This sample arrives a frame before its corresponding scroll offset.
      win.scrollTo({ top: 264, behavior: "instant" });
      win.dispatchEvent(new win.Event("scroll"));
      frames.step();
      // A fresh touch sample rebases the scroll anchor. Dragging back must
      // reverse the inferred movement without double-counting the earlier scroll.
      for (const top of [180, 96]) {
        win.scrollTo({ top, behavior: "instant" });
        win.dispatchEvent(new win.Event("scroll"));
        frames.step();
      }
      touch("touchend", 310);
      win.scrollTo({ top: 300, behavior: "instant" });
      win.dispatchEvent(new win.Event("scroll"));
      for (let frame = 0; frame < 15; frame++) frames.step();
      expect(vertex(), "momentum scrolling after release does not move the tracker").to.be.closeTo(expected(310), 1);
      vertex.restore();
    });
  });

  it("switches a continuously dragged finger to exact tracking and only limits the next touch", () => {
    cy.window().then((win) => {
      const vertex = observeFirstVertex(win.document.querySelector("canvas")!);
      const pointer = (x: number, y: number) => win.document.body.dispatchEvent(new win.PointerEvent("pointermove", {
        pointerType: "mouse", isPrimary: true, clientX: x, clientY: y, bubbles: true,
      }));
      const touch = (type: string, x = 0, y = 0) => win.document.body.dispatchEvent(new win.TouchEvent(type, {
        touches: type === "touchend" ? [] : [new win.Touch({ identifier: 1, target: win.document.body, clientX: x, clientY: y })], bubbles: true,
      }));
      const expected = mobileParallaxProjection;
      frames.step(0);
      pointer(187.5, 406);
      frames.step(0);
      pointer(0, 0);
      frames.step(0);
      touch("touchstart", 100, 500);
      for (let frame = 1; frame <= 180; frame++) {
        touch("touchmove", 100 + 40 * frame / 60, 500);
        frames.step();
      }
      // No touchend and no stationary interval: recovery must already have released the limits.
      for (const [x, y] of [[350, 50], [20, 750], [340, 40]]) {
        touch("touchmove", x, y);
        frames.step();
        expect(vertex(), "the first frame of each fast reversal matches the finger").to.be.closeTo(expected(x, y), 1);
      }
      const before = vertex.point();
      touch("touchend");
      touch("touchstart", 20, 750);
      frames.step(0);
      expect(vertex.point(), "new touch starts recovery without jumping").to.deep.equal(before);
      frames.step();
      expect(vertex(), "new touch is still recovering on its first frame").not.to.be.closeTo(expected(20, 750), 1);
      vertex.restore();
    });
  });

  it("renders the latest continuous position on the next frame and smooths re-entry only", () => {
    cy.window().then((win) => {
      const canvas = win.document.querySelector("canvas")!;
      const vertex = observeFirstVertex(canvas);
      const pointer = (type: string, x: number, y: number) => win.document.body.dispatchEvent(new win.PointerEvent(type, {
        pointerType: "mouse", pointerId: 1, isPrimary: true, clientX: x, clientY: y, bubbles: true,
      }));
      // Shared x/y wobble cancels in the first vertex's x-y difference.
      const expected = mobileParallaxProjection;
      frames.step(0);
      pointer("pointermove", 187.5, 406);
      frames.step();
      pointer("pointermove", 350, 50);
      frames.step();
      expect(vertex()).to.be.closeTo(expected(350, 50), 1);
      pointer("pointermove", 20, 750);
      frames.step();
      expect(vertex()).to.be.closeTo(expected(20, 750), 1);
      pointer("pointermove", 100, 300);
      pointer("pointermove", 180, 400);
      frames.step();
      expect(vertex()).to.be.closeTo(expected(180, 400), 1);

      pointer("pointerout", 180, 400);
      pointer("pointerover", 300, 100);
      frames.step(0);
      expect(vertex(), "re-entry preserves the displayed position").to.be.closeTo(expected(180, 400), 1);
      pointer("pointermove", 250, 200);
      frames.step(0);
      expect(vertex(), "retargeting before recovery advances preserves the origin").to.be.closeTo(expected(180, 400), 1);
      canvas.style.height = "700px";
      win.dispatchEvent(new win.Event("resize"));
      frames.step(0);
      expect(vertex(), "height changes preserve scene placement during recovery").to.be.closeTo(expected(180, 400), 1);
      canvas.style.height = "100dvh";
      win.dispatchEvent(new win.Event("resize"));
      for (let frame = 0; frame < 240; frame++) frames.step();
      expect(vertex()).to.be.closeTo(expected(250, 200), 1);
      vertex.restore();
    });
  });

  it("smooths finger replacement, continues after release, and pauses while hidden", () => {
    cy.window().then((win) => {
      const vertex = observeFirstVertex(win.document.querySelector("canvas")!);
      const touch = (id: number, x: number, y: number) => new win.Touch({ identifier: id, target: win.document.body, clientX: x, clientY: y });
      const fire = (type: string, touches: Touch[]) => win.document.body.dispatchEvent(new win.TouchEvent(type, { touches, bubbles: true }));
      const expected = mobileParallaxProjection;
      frames.step(0);
      fire("touchstart", [touch(1, 187.5, 406)]);
      frames.step();
      fire("touchmove", [touch(1, 40, 700)]);
      frames.step();
      expect(vertex()).to.be.closeTo(expected(40, 700), 1);
      fire("touchend", []);
      fire("touchstart", [touch(2, 320, 150)]);
      frames.step(0);
      expect(vertex()).to.be.closeTo(expected(40, 700), 1);
      fire("touchend", []);
      frames.step();
      const beforeHidden = vertex();
      Object.defineProperty(win.document, "hidden", { configurable: true, value: true });
      win.document.dispatchEvent(new win.Event("visibilitychange"));
      frames.step(60);
      expect(vertex()).to.equal(beforeHidden);
      Object.defineProperty(win.document, "hidden", { configurable: true, value: false });
      win.document.dispatchEvent(new win.Event("visibilitychange"));
      frames.step(60);
      expect(vertex(), "resume does not integrate the hidden interval").to.equal(beforeHidden);
      for (let frame = 0; frame < 240; frame++) frames.step();
      expect(vertex()).to.be.closeTo(expected(320, 150), 1);
      Reflect.deleteProperty(win.document, "hidden");
      vertex.restore();
    });
  });

  it("keeps the canvas covered during repeated swipes before recovery settles", () => {
    cy.window().then((win) => {
      const canvas = win.document.querySelector("canvas")!;
      const vertex = observeFirstVertex(canvas);
      const touch = (x: number, y: number) => new win.Touch({ identifier: 1, target: win.document.body, clientX: x, clientY: y });
      const fire = (type: string, touches: Touch[]) => win.document.body.dispatchEvent(new win.TouchEvent(type, { touches, bubbles: true }));
      frames.step(0);
      for (let swipe = 0; swipe < 5; swipe++) {
        fire("touchstart", [touch(350, 406)]);
        frames.step(0);
        fire("touchmove", [touch(0, 406)]);
        frames.step(0);
        fire("touchend", []);
        expect(vertex(), "new swipes do not push the anchor backwards before recovery advances").to.be.closeTo(-75 + 50.75, 1);
        const context = canvas.getContext("2d")!;
        const alpha = context.getImageData(canvas.width - 2, Math.floor(canvas.height / 2), 1, 1).data[3];
        expect(alpha, "right edge stays painted").to.be.greaterThan(0);
      }
      for (let frame = 0; frame < 240; frame++) frames.step();
      fire("touchstart", [touch(0, 406)]);
      fire("touchmove", [touch(350, 406)]);
      frames.step();
      expect(vertex(), "direct tracking resumes after correction").to.be.closeTo(-75 + 50.75 + 25 * (350 / 375 - 0.5), 1);
      vertex.restore();
    });
  });

});

// Model toolbar resize notifications and stepped viewport heights explicitly:
// desktop touch emulation does not provide collapsing mobile browser chrome.
describe("mobile toolbar scroll regressions", { viewportWidth: 375, viewportHeight: 812 }, () => {
  let frames: ReturnType<typeof controlFrames>;

  beforeEach(() => {
    cy.visit("/", { onBeforeLoad(win) { frames = controlFrames(win); } });
    cy.get("canvas").then(() => frames.step(0));
    cy.get("canvas").should("have.attr", "data-low-poly-cols", "10");
    cy.window().then((win) => {
      frames.step(0);
      win.document.body.dispatchEvent(new win.TouchEvent("touchstart", {
        touches: [new win.Touch({ identifier: 1, target: win.document.body, clientX: 187.5, clientY: 406 })],
        bubbles: true,
      }));
      frames.step(0);
    });
  });

  it("keeps the painted background between redundant viewport resize notifications and the next frame", () => {
    cy.window().then((win) => {
      const canvas = win.document.querySelector("canvas")!;
      const context = canvas.getContext("2d")!;
      const alpha = () => context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data[3];
      const size = [canvas.width, canvas.height];
      expect(alpha(), "background is painted before resize").to.be.greaterThan(0);
      expect(win.visualViewport, "visual viewport API").not.to.equal(null);
      win.visualViewport!.dispatchEvent(new win.Event("resize"));
      expect([canvas.width, canvas.height], "notification did not change the canvas size").to.deep.equal(size);
      // Do not advance rAF or retry: that would hide a cleared frame.
      expect(alpha(), "resize must retain the painted background until the next frame").to.be.greaterThan(0);
    });
  });

  it("keeps the mesh stationary when a scrolling toolbar changes viewport height", () => {
    let vertices: Point[] = [];
    let before: Point[];
    cy.window().then((win) => {
      const context = win.document.querySelector("canvas")!.getContext("2d")!;
      const moveTo = context.moveTo.bind(context);
      cy.stub(context, "moveTo").callsFake((x: number, y: number) => {
        vertices.push({ x, y });
        moveTo(x, y);
      });
      frames.step(0);
      before = [...vertices];
      expect(before.length, "rendered mesh vertices").to.be.greaterThan(0);
      vertices = [];
      win.scrollTo({ top: 120, behavior: "instant" });
      frames.step(0);
      expect(vertices, "scrolling alone does not move the fixed mesh").to.deep.equal(before);
    });
    // Simulate the address bar retracting, without advancing animation time or
    // moving the finger. A mesh shift is therefore caused by resizing alone.
    for (const height of [832, 872, 842, 812]) {
      cy.viewport(375, height);
      cy.window().then((win) => {
        expect(win.innerHeight).to.equal(height);
        vertices = [];
        frames.step(0);
        // Additional rows may cover newly exposed space; existing rows stay put.
        expect(vertices.length, "original mesh remains covered").to.be.at.least(before.length);
        const displacement = Math.max(...before.map((point, index) =>
          Math.hypot(point.x - vertices[index].x, point.y - vertices[index].y)));
        expect(displacement, "toolbar resize must not jump the mesh (CSS pixels)").to.be.at.most(1);
        const canvas = win.document.querySelector("canvas")!;
        const context = canvas.getContext("2d")!;
        expect(canvas.getBoundingClientRect().height, "canvas covers the viewport").to.equal(height);
        expect(context.getImageData(canvas.width - 2, canvas.height - 2, 1, 1).data[3], "newly exposed bottom edge is painted").to.be.greaterThan(0);
      });
    }
    cy.viewport(812, 375);
    cy.window().then((win) => {
      frames.step(0);
      const canvas = win.document.querySelector("canvas")!;
      expect(canvas.getBoundingClientRect().width, "rotation updates width").to.equal(812);
      expect(canvas.getContext("2d")!.getImageData(canvas.width - 2, canvas.height - 2, 1, 1).data[3], "rotation keeps the bottom edge painted").to.be.greaterThan(0);
    });
  });
});

describe("background lifecycle", { viewportWidth: 375, viewportHeight: 812 }, () => {
  let frames: ReturnType<typeof controlFrames>;
  beforeEach(() => {
    cy.visit("/", { onBeforeLoad(win) { frames = controlFrames(win); } });
    cy.get("canvas").then(() => frames.step(0));
  });

  it("does not integrate time spent outside layout and resizes the backing buffer for DPR changes", () => {
    cy.window().then((win) => {
      const canvas = win.document.createElement("canvas");
      canvas.style.cssText = "position:fixed;width:375px;height:812px";
      win.document.body.append(canvas);
      const stop = mountBackground(canvas);
      const context = canvas.getContext("2d")!;
      const vertex = observeFirstVertex(canvas);
      const dprDescriptor = Object.getOwnPropertyDescriptor(win, "devicePixelRatio");
      try {
        frames.step(0);
        const initial = vertex.point();
        canvas.style.display = "none";
        frames.step(1);
        canvas.style.display = "block";
        frames.step(0);
        expect(vertex.point(), "restoring layout without elapsed frame time preserves artwork").to.deep.equal(initial);
        for (const dpr of [1, 1.25, 2]) {
          Object.defineProperty(win, "devicePixelRatio", { configurable: true, value: dpr });
          frames.step(0);
          expect(canvas.width).to.equal(Math.round(375 * Math.min(dpr, 1.5)));
          expect(canvas.height).to.equal(Math.round(812 * Math.min(dpr, 1.5)));
          expect(context.getImageData(canvas.width - 2, canvas.height - 2, 1, 1).data[3], "resized buffer is painted in the same frame").to.be.greaterThan(0);
        }
      } finally {
        stop();
        vertex.restore();
        canvas.remove();
        if (dprDescriptor) Object.defineProperty(win, "devicePixelRatio", dprDescriptor);
        else Reflect.deleteProperty(win, "devicePixelRatio");
      }
    });
  });

  it("centers reduced motion in the current viewport after a height-only resize and repaints only on demand", () => {
    cy.window().then((win) => {
      const preference = win.matchMedia("(prefers-reduced-motion: reduce)");
      let reduced = false;
      Object.defineProperty(preference, "matches", { configurable: true, get: () => reduced });
      const matchMedia = cy.stub(win, "matchMedia").returns(preference);
      const canvas = win.document.createElement("canvas");
      canvas.style.cssText = "position:fixed;width:375px;height:812px";
      win.document.body.append(canvas);
      const vertex = observeFirstVertex(canvas);
      const draw = cy.spy(canvas.getContext("2d")!, "clearRect");
      const stop = mountBackground(canvas);
      try {
        frames.step(0);
        canvas.style.height = "1012px";
        win.dispatchEvent(new win.Event("resize"));
        frames.step(0);
        reduced = true;
        preference.dispatchEvent(new win.Event("change"));
        frames.step(0);
        expect(vertex(), "preference reset uses the current viewport center with the original mesh height")
          .to.be.closeTo(mobileParallaxProjection(187.5, 506), 1);
        const count = draw.callCount;
        frames.step();
        expect(draw.callCount, "reduced motion does not animate continuously").to.equal(count);
        win.dispatchEvent(new win.Event("resize"));
        frames.step();
        expect(draw.callCount, "resize requests a single repaint").to.equal(count + 1);
        frames.step();
        expect(draw.callCount).to.equal(count + 1);
      } finally {
        stop();
        vertex.restore();
        matchMedia.restore();
        canvas.remove();
      }
    });
  });

  it("disposes pending work and input, ignores queued observer delivery, and mounts independently again", () => {
    cy.window().then((win) => {
      const canvas = win.document.createElement("canvas");
      canvas.style.cssText = "position:fixed;width:375px;height:812px";
      win.document.body.append(canvas);
      const draw = cy.spy(canvas.getContext("2d")!, "clearRect");
      let notifyResize = () => {};
      const observer = cy.stub(win, "ResizeObserver").callsFake(function (callback: () => void) {
        notifyResize = callback;
        return { observe() {}, disconnect() {}, unobserve() {} };
      });
      let stop = mountBackground(canvas);
      try {
        frames.step(0);
        expect(draw.callCount).to.equal(1);
        stop();
        notifyResize();
        win.dispatchEvent(new win.Event("resize"));
        win.document.body.dispatchEvent(new win.PointerEvent("pointermove", {
          pointerType: "mouse", isPrimary: true, clientX: 300, clientY: 200, bubbles: true,
        }));
        frames.step();
        expect(draw.callCount, "disposed canvas cannot draw again").to.equal(1);
        stop = mountBackground(canvas);
        frames.step(0);
        expect(draw.callCount, "new mount owns one frame").to.equal(2);
        frames.step();
        expect(draw.callCount, "new mount animates independently").to.equal(3);
        stop();
        frames.step();
        expect(draw.callCount).to.equal(3);
      } finally {
        stop();
        observer.restore();
        canvas.remove();
      }
    });
  });
});

describe("reduced-motion preference", () => {
  it("renders once for reduced motion and responds to preference changes", { browser: ["chrome", "edge"] }, () => {
    cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    cy.visit("/");
    cy.get("canvas").then(($canvas) => {
      const canvas = $canvas[0] as HTMLCanvasElement;
      cy.spy(canvas.getContext("2d")!, "clearRect").as("draw");
    });
    // Allow the initial ResizeObserver notification to finish before measuring idle work.
    cy.wait(100);
    cy.get<Cypress.Agent<sinon.SinonSpy>>("@draw").then((draw) => draw.resetHistory());
    cy.get("body").trigger("pointermove", { eventConstructor: "PointerEvent", pointerType: "mouse", isPrimary: true, clientX: 100, clientY: 100 });
    cy.wait(100);
    cy.get("@draw").should("not.have.been.called");
    cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    cy.get("@draw").should("have.been.called");
  });

  afterEach(() => {
    if (Cypress.isBrowser({ family: "chromium" })) cdp("Emulation.setEmulatedMedia", { features: [] });
  });
});

/** Drive real canvas frames without retrying away a frame of unwanted tracking lag. */
function controlFrames(win: Window) {
  let now = win.performance.now();
  let id = 0;
  const pending = new Map<number, FrameRequestCallback>();
  cy.stub(win, "requestAnimationFrame").callsFake((callback: FrameRequestCallback) => {
    pending.set(++id, callback);
    return id;
  });
  cy.stub(win, "cancelAnimationFrame").callsFake((key: number) => pending.delete(key));
  return {
    step(seconds = 1 / 60) {
      now += seconds * 1000;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(now));
    },
  };
}
