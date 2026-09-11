import { advancePointer, createPointerMotion, defaultTeleportLimits, listenForPointer, resizePointer, setPointerTarget, type Point } from "../../src/lib/pointerMotion";

describe("pointer motion", () => {
  it("passes fast continuous movement and reversals through on the next frame", () => {
    const state = createPointerMotion({ x: 0, y: 0 });
    for (const target of [{ x: 1500, y: 1500 }, { x: 0, y: 0 }, { x: 900, y: 50 }]) {
      setPointerTarget(state, target, false);
      advancePointer(state, 1 / 144, defaultTeleportLimits);
      expect(state.position).to.deep.equal(target);
      expect(state.correction).to.equal(null);
    }
    // Several samples in one frame render only the latest position.
    setPointerTarget(state, { x: 100, y: 100 }, false);
    setPointerTarget(state, { x: 1200, y: 300 }, false);
    advancePointer(state, 0, defaultTeleportLimits);
    expect(state.position).to.deep.equal({ x: 1200, y: 300 });
  });

  it("limits only teleport correction, brakes, and settles without overshooting", () => {
    const state = createPointerMotion({ x: 0, y: 0 });
    // Leave enough distance to reach the speed cap before braking begins.
    const target = { x: 3000, y: 3000 };
    setPointerTarget(state, target, true);
    advancePointer(state, 0, defaultTeleportLimits);
    expect(state.position).to.deep.equal({ x: 0, y: 0 });
    const speeds: number[] = [];
    for (let frame = 0; frame < 360; frame++) {
      const before = { ...(state.correction?.velocity ?? { x: 0, y: 0 }) };
      advancePointer(state, 1 / 60, defaultTeleportLimits);
      const velocity = state.correction?.velocity ?? { x: 0, y: 0 };
      const speed = Math.hypot(velocity.x, velocity.y);
      speeds.push(speed);
      expect(speed).to.be.at.most(defaultTeleportLimits.maxVelocity + 1e-6);
      // The arrival frame hands off to unrestricted tracking instead of braking to zero.
      if (state.correction) expect(Math.hypot(velocity.x - before.x, velocity.y - before.y)).to.be.at.most(defaultTeleportLimits.deceleration / 60 + 1e-6);
      expect(state.position.x).to.be.at.most(target.x);
      expect(state.position.y).to.be.at.most(target.y);
    }
    expect(speeds[0]).to.be.closeTo(defaultTeleportLimits.acceleration / 60, 1e-6);
    expect(Math.max(...speeds)).to.be.closeTo(defaultTeleportLimits.maxVelocity, 1e-6);
    expect(speeds.some((speed, i) => i > 0 && speed < speeds[i - 1])).to.equal(true);
    expect(state.position).to.deep.equal(target);
    expect(state.correction).to.equal(null);
  });

  it("preserves position and momentum when dragging or teleporting again during recovery", () => {
    const state = createPointerMotion({ x: 200, y: 300 });
    const stationary = createPointerMotion(state.position);
    for (const motion of [state, stationary]) {
      setPointerTarget(motion, { x: 1000, y: 800 }, true);
      advancePointer(motion, 1 / 60, defaultTeleportLimits);
    }
    setPointerTarget(state, { x: 100, y: 50 }, false);
    for (const motion of [state, stationary]) advancePointer(motion, 0, defaultTeleportLimits);
    expect(state.position).to.deep.equal(stationary.position);
    expect(state.correction).to.deep.equal(stationary.correction);
    const before = { ...state.position };
    setPointerTarget(state, { x: 1500, y: 900 }, true);
    advancePointer(state, 0, defaultTeleportLimits);
    expect(state.position.x).to.be.closeTo(before.x, 1e-6);
    expect(state.position.y).to.be.closeTo(before.y, 1e-6);
    expect(state.correction!.velocity).to.deep.equal(stationary.correction!.velocity);
    for (let frame = 0; frame < 360; frame++) advancePointer(state, 1 / 60, defaultTeleportLimits);
    expect(state.position).to.deep.equal({ x: 1500, y: 900 });
    expect(state.correction).to.equal(null);
    setPointerTarget(state, state.position, true);
    expect(state.correction, "same-point acquisition needs no correction").to.equal(null);
  });

  it("caps elapsed correction time after a pause and rescales recovery on resize", () => {
    const state = createPointerMotion({ x: 400, y: 200 });
    setPointerTarget(state, { x: 1400, y: 800 }, true);
    const before = { ...state.position };
    advancePointer(state, 60, defaultTeleportLimits);
    expect(Math.hypot(state.position.x - before.x, state.position.y - before.y)).to.be.at.most(defaultTeleportLimits.maxVelocity * 0.05);
    const position = { ...state.position };
    resizePointer(state, 0.5, 2);
    advancePointer(state, 0, defaultTeleportLimits);
    expect(state.position.x).to.be.closeTo(position.x * 0.5, 1e-6);
    expect(state.position.y).to.be.closeTo(position.y * 2, 1e-6);
    expect(state.correction!.velocity).to.deep.equal({ x: 0, y: 0 });
    for (let frame = 0; frame < 360; frame++) advancePointer(state, 1 / 60, defaultTeleportLimits);
    expect(state.position).to.deep.equal({ x: 700, y: 1600 });
    expect(state.correction).to.equal(null);
  });

  it("bounds steering acceleration through sharp turns and reversals", () => {
    const limits = { maxVelocity: 1200, acceleration: 9800, deceleration: 8000 };
    for (const hz of [30, 60, 120, 144]) {
      const state = createPointerMotion({ x: 300, y: 400 });
      setPointerTarget(state, { x: 1400, y: 400 }, true);
      for (let frame = 0; frame < hz / 4; frame++) advancePointer(state, 1 / hz, limits);
      for (const target of [{ x: 0, y: 400 }, { x: 300, y: 800 }, { x: 1400, y: 0 }]) {
        const position = { ...state.position };
        const velocity = { ...state.correction!.velocity };
        setPointerTarget(state, target, false);
        advancePointer(state, 0, limits);
        expect(state.position).to.deep.equal(position);
        expect(state.correction!.velocity).to.deep.equal(velocity);
        advancePointer(state, 1 / hz, limits);
        const next = state.correction!.velocity;
        expect(Math.hypot(next.x - velocity.x, next.y - velocity.y)).to.be.at.most(Math.max(limits.acceleration, limits.deceleration) / hz + 1e-6);
        expect(Math.hypot(next.x, next.y)).to.be.at.most(limits.maxVelocity + 1e-6);
        expect(Math.hypot(state.position.x - position.x, state.position.y - position.y)).to.be.at.most(limits.maxVelocity / hz + 1e-6);
        // The first turn must retain forward momentum while braking toward the opposite target.
        if (target.x === 0) expect(next.x).to.be.greaterThan(0);
      }
      for (let frame = 0; frame < hz * 6; frame++) advancePointer(state, 1 / hz, limits);
      expect(state.correction).to.equal(null);
      setPointerTarget(state, { x: 0, y: 800 }, false);
      advancePointer(state, 0, limits);
      expect(state.position).to.deep.equal({ x: 0, y: 800 });
    }
  });

  it("corrects teleports consistently across refresh rates", () => {
    const positions = [30, 60, 120, 144].map((hz) => {
      const state = createPointerMotion({ x: 0, y: 0 });
      setPointerTarget(state, { x: 1500, y: 500 }, true);
      for (let frame = 0; frame < hz; frame++) advancePointer(state, 1 / hz, defaultTeleportLimits);
      return state.position;
    });
    positions.forEach((position) => expect(Math.hypot(position.x - positions[0].x, position.y - positions[0].y)).to.be.lessThan(3));
  });

  it("leaves each corner diagonally when teleporting to the opposite corner and dragging back", () => {
    for (const [width, height] of [[375, 812], [768, 1024], [1440, 900]]) {
      for (const [flipX, flipY] of [[false, false], [true, false], [false, true], [true, true]]) {
        const origin = { x: flipX ? width : 0, y: flipY ? height : 0 };
        const state = createPointerMotion(origin);
        setPointerTarget(state, { x: width - origin.x, y: height - origin.y }, true);
        for (let frame = 0; frame < 30; frame++) {
          const x = width * (0.95 - frame / 100);
          const target = { x: flipX ? width - x : x, y: height - origin.y };
          setPointerTarget(state, target, false);
          advancePointer(state, 1 / 60, defaultTeleportLimits);
          expect(state.position.x).to.be.within(0, width);
          expect(state.position.y).to.be.within(0, height);
          expect(Math.abs(state.position.x - origin.x), "moves away from the vertical edge").to.be.greaterThan(0);
          expect(Math.abs(state.position.y - origin.y), "moves away from the horizontal edge").to.be.greaterThan(0);
        }
        // Recovery keeps steering while the target moves, then releases direct tracking on arrival.
        for (let frame = 0; frame < 360; frame++) {
          setPointerTarget(state, { x: width * (0.5 + 0.1 * Math.sin(frame / 10)), y: height * 0.8 }, false);
          advancePointer(state, 1 / 60, defaultTeleportLimits);
        }
        for (let frame = 0; frame < 360; frame++) advancePointer(state, 1 / 60, defaultTeleportLimits);
        expect(state.correction).to.equal(null);
        expect(state.position).to.deep.equal(state.target);
        setPointerTarget(state, origin, false);
        advancePointer(state, 0, defaultTeleportLimits);
        expect(state.position).to.deep.equal(origin);
      }
    }
  });

  it("brakes and returns smoothly when the finger moves back to its starting point", () => {
    const state = createPointerMotion({ x: 0, y: 0 });
    setPointerTarget(state, { x: 375, y: 812 }, true);
    advancePointer(state, 1 / 60, defaultTeleportLimits);
    const before = { ...state.position };
    setPointerTarget(state, { x: 0, y: 0 }, false);
    advancePointer(state, 0, defaultTeleportLimits);
    expect(state.position).to.deep.equal(before);
    for (let frame = 0; frame < 360; frame++) advancePointer(state, 1 / 60, defaultTeleportLimits);
    expect(state.position).to.deep.equal({ x: 0, y: 0 });
    expect(state.correction).to.equal(null);
  });
});

describe("handoff from teleport recovery to unrestricted tracking", () => {
  const limits = { maxVelocity: 1200, acceleration: 9800, deceleration: 8000 };

  it("locks within the configured pixel radius and stays unrestricted until the next teleport", () => {
    for (const captureDistance of [undefined, 9, 11]) {
      const captureLimits = { ...limits, captureDistance };
      const state = createPointerMotion({ x: 0, y: 0 });
      setPointerTarget(state, { x: 6, y: 8 }, true); // 10 pixels diagonally, not a per-axis threshold.
      advancePointer(state, 1 / 240, captureLimits);
      if (captureDistance !== 11) {
        expect(state.correction, "outside the radius, steering remains active").not.to.equal(null);
        for (let frame = 0; frame < 60 && state.correction; frame++) advancePointer(state, 1 / 60, captureLimits);
      }
      expect(state.correction, "inside the radius, recovery releases").to.equal(null);
      expect(state.position).to.deep.equal(state.target);
      setPointerTarget(state, { x: 1400, y: 900 }, false);
      advancePointer(state, 1 / 240, captureLimits);
      expect(state.position, "large continuous movement stays unrestricted").to.deep.equal(state.target);
      setPointerTarget(state, { x: 0, y: 0 }, true);
      advancePointer(state, 1 / 240, captureLimits);
      expect(state.correction, "a new distant teleport starts recovery again").not.to.equal(null);
    }
  });

  for (const minimumApproachSpeed of [undefined, 480]) {
    it(`closes the final 20 pixels promptly without overshoot at ${minimumApproachSpeed ?? "default"} minimum speed`, () => {
      const approachLimits = { ...limits, minimumApproachSpeed };
      const speed = minimumApproachSpeed ?? 240;
      for (const hz of [30, 60, 120, 144]) {
        const state = createPointerMotion({ x: 0, y: 0 });
        const target = { x: 12, y: 16 }; // A 20-pixel diagonal, testing vector length rather than each axis.
        setPointerTarget(state, target, true);
        state.correction!.velocity = { x: speed * 0.6, y: speed * 0.8 };
        let frames = 0;
        while (state.correction && frames < Math.ceil(hz * 0.15)) {
          const before = { ...state.position };
          advancePointer(state, 1 / hz, approachLimits);
          frames++;
          if (state.correction) {
            expect(Math.hypot(state.position.x - before.x, state.position.y - before.y), "configured minimum closing step scales with elapsed time").to.be.at.least(speed / hz - 1e-6);
          }
          expect(state.position.x).to.be.within(0, target.x);
          expect(state.position.y).to.be.within(0, target.y);
        }
        expect(state.correction, `final approach completes within 150ms at ${hz}Hz`).to.equal(null);
        expect(state.position).to.deep.equal(target);
        setPointerTarget(state, { x: 1400, y: 900 }, false);
        advancePointer(state, 1 / hz, limits);
        expect(state.position, "the very next movement is unrestricted").to.deep.equal({ x: 1400, y: 900 });
      }
    });
  }

  it("accelerates short teleports into the minimum approach without a slow tail", () => {
    for (const hz of [30, 60, 120, 144]) {
      const state = createPointerMotion({ x: 0, y: 0 });
      setPointerTarget(state, { x: 20, y: 0 }, true);
      advancePointer(state, 0, limits);
      expect(state.position, "minimum step does not jump on touch down").to.deep.equal({ x: 0, y: 0 });
      for (let frame = 0; frame < Math.ceil(hz * 0.15); frame++) advancePointer(state, 1 / hz, limits);
      expect(state.correction, `short teleport completes within 150ms at ${hz}Hz`).to.equal(null);
      expect(state.position).to.deep.equal({ x: 20, y: 0 });
    }
  });

  it("catches a moving pointer without requiring it to stop, then removes both limits", () => {
    for (const hz of [30, 60, 120, 144]) {
      for (const speed of [180, 600, 1000]) {
        const state = createPointerMotion({ x: 0, y: 0 });
        setPointerTarget(state, { x: 300, y: 200 }, true);
        let caught = false;
        for (let frame = 1; frame <= hz * 6; frame++) {
          // The pointer never stops or releases the gesture during this test.
          setPointerTarget(state, { x: 300 + speed * frame / hz, y: 200 }, false);
          advancePointer(state, 1 / hz, limits);
          if (!state.correction) { caught = true; break; }
        }
        expect(caught, `captures ${speed}px/s motion at ${hz}Hz`).to.equal(true);
        expect(state.position, "handoff aligns exactly to the latest sample").to.deep.equal(state.target);

        for (const target of [{ x: 10000, y: 900 }, { x: 0, y: 0 }, { x: 9000, y: 100 }]) {
          setPointerTarget(state, target, false);
          advancePointer(state, 1 / hz, limits);
          expect(state.position, "fast movement and reversals follow on the next frame").to.deep.equal(target);
          expect(state.correction, "continuous movement cannot re-enable limits").to.equal(null);
        }

        const before = { ...state.position };
        setPointerTarget(state, { x: 100, y: 800 }, true);
        advancePointer(state, 0, limits);
        expect(state.position, "a new teleport preserves the displayed position").to.deep.equal(before);
        expect(state.correction, "only the new teleport re-enables steering").not.to.equal(null);
        advancePointer(state, 1 / hz, limits);
        expect(Math.hypot(state.position.x - before.x, state.position.y - before.y)).to.be.at.most(limits.maxVelocity / hz + 1e-6);
      }
    }
  });

  it("continues bounded steering while the pointer is still too far ahead", () => {
    const state = createPointerMotion({ x: 0, y: 0 });
    setPointerTarget(state, { x: 300, y: 200 }, true);
    for (let frame = 1; frame <= 120; frame++) {
      const before = { ...state.position };
      const velocity = { ...state.correction!.velocity };
      setPointerTarget(state, { x: 300 + 2000 * frame / 60, y: 200 }, false);
      advancePointer(state, 1 / 60, limits);
      expect(state.correction, "no premature handoff to a distant pointer").not.to.equal(null);
      const next = state.correction!.velocity;
      expect(Math.hypot(next.x, next.y)).to.be.at.most(limits.maxVelocity + 1e-6);
      expect(Math.hypot(next.x - velocity.x, next.y - velocity.y)).to.be.at.most(Math.max(limits.acceleration, limits.deceleration) / 60 + 1e-6);
      expect(Math.hypot(state.position.x - before.x, state.position.y - before.y)).to.be.at.most(limits.maxVelocity / 60 + 1e-6);
    }
  });
});

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
      const dispose = listenForPointer(win, (point, teleport) => { positions.push(point); teleports.push(teleport); });
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

  it("tracks native Chrome touch movement after scrolling cancels the pointer", { browser: "chrome" }, () => {
    const events: string[] = [];
    const positions: { x: number; y: number }[] = [];
    const pointerPositions: number[] = [];
    let firstVertexDifference = NaN;
    let dispose: () => void;
    cy.window().then((win) => {
      win.addEventListener("pointercancel", () => events.push("cancel"));
      win.addEventListener("touchmove", () => events.push("touchmove"));
      win.addEventListener("pointermove", (event) => pointerPositions.push(event.clientY));
      dispose = listenForPointer(win, (point) => positions.push(point));
    });
    cy.get("canvas").then(($canvas) => {
      const context = ($canvas[0] as HTMLCanvasElement).getContext("2d")!;
      const clear = context.clearRect.bind(context);
      const move = context.moveTo.bind(context);
      let first = true;
      context.clearRect = (...args: [number, number, number, number]) => { first = true; clear(...args); };
      context.moveTo = (x: number, y: number) => {
        if (first) firstVertexDifference = x - y;
        first = false;
        move(x, y);
      };
    });
    cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    nativeTouch("touchStart", 180, 650);
    cy.then(() => { nativeTouchActive = true; });
    for (const y of [610, 550, 490, 430, 370, 310]) nativeTouch("touchMove", 180, y);
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
    cy.wrap(null).should(() => expect(firstVertexDifference).to.be.closeTo(-75 + 50.75 + 25 * (180 / 375 - 310 / 812), 1));
    nativeTouch("touchEnd");
    cy.then(() => { nativeTouchActive = false; });
    cy.then(() => dispose());
    cy.screenshot("mobile-native-touch", { capture: "viewport" });
  });

  afterEach(() => {
    if (Cypress.isBrowser("chrome")) {
      if (nativeTouchActive) cdp("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
      nativeTouchActive = false;
      cdp("Emulation.setTouchEmulationEnabled", { enabled: false });
    }
  });
});

describe("background frame response", () => {
  let frames: ReturnType<typeof controlFrames>;

  beforeEach(() => {
    cy.viewport(375, 812);
    cy.visit("/", { onBeforeLoad(win) { frames = controlFrames(win); } });
    cy.get("canvas").should("have.attr", "data-low-poly-cols", "10");
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
      const expected = (x: number, y: number) => -75 + 50.75 + 25 * (x / 375 - y / 812);
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
      const expected = (x: number, y: number) => -75 + 50.75 + 25 * (x / 375 - y / 812);
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
      // Shorter cells require two overscan rows: the first vertex moves to y=-87.5.
      expect(vertex(), "resize preserves relative placement during recovery").to.be.closeTo(-75 + 87.5 + 25 * (180 / 375 - 400 / 812), 1);
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
      const expected = (x: number, y: number) => -75 + 50.75 + 25 * (x / 375 - y / 812);
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

  it("moves right and down when touching bottom-right and dragging left from a top-left anchor", () => {
    cy.window().then((win) => {
      const vertex = observeFirstVertex(win.document.querySelector("canvas")!);
      const pointer = (x: number, y: number) => win.document.body.dispatchEvent(new win.PointerEvent("pointermove", {
        pointerType: "mouse", isPrimary: true, clientX: x, clientY: y, bubbles: true,
      }));
      const touch = (type: string, x: number) => win.document.body.dispatchEvent(new win.TouchEvent(type, {
        touches: [new win.Touch({ identifier: 1, target: win.document.body, clientX: x, clientY: 800 })], bubbles: true,
      }));
      frames.step(0);
      pointer(187.5, 406);
      frames.step(0);
      pointer(0, 0);
      frames.step(0);
      touch("touchstart", 350);
      for (let frame = 1; frame <= 18; frame++) {
        touch("touchmove", 350 - frame * 5);
        frames.step();
      }
      // Remove the known first vertex wobble after 0.3 seconds to recover both
      // parallax axes. Looking only at x-y would miss a pointer stuck at x=0.
      const time = 0.3 * 2.5 * 0.8;
      const wobble = 15 * Math.sin(1.2 * -1.6 + 0.7 * -0.7 + 0.6 * time)
        * Math.cos(0.7 * -1.6 - 1.1 * -0.7 + 0.4 * time);
      const point = vertex.point();
      const anchorX = ((point.x + 75 - wobble) / 25 + 0.5) * 375;
      const anchorY = ((point.y + 50.75 - wobble) / 25 + 0.5) * 812;
      expect(anchorX, "moves right, away from the left edge").to.be.within(40, 260);
      expect(anchorY, "moves down toward the finger").to.be.within(100, 800);
      touch("touchmove", 50);
      frames.step(0);
      expect(vertex.point(), "dragging cannot displace the rendered anchor").to.deep.equal(point);
      vertex.restore();
    });
  });
});

describe("background visual verification", () => {
  for (const [name, width, height] of [["mobile", 375, 812], ["tablet", 768, 1024], ["desktop", 1440, 900]] as const) {
    it(`renders and follows mouse movement on ${name}`, () => {
      cy.viewport(width, height);
      cy.visit("/");
      cy.get("canvas").should("be.visible");
      cy.get("body").trigger("pointermove", { eventConstructor: "PointerEvent", pointerType: "mouse", isPrimary: true, clientX: width * 0.8, clientY: height * 0.3 });
      cy.window().should((win) => expect(win.document.documentElement.scrollWidth).to.be.at.most(width));
      cy.screenshot(`${name}-background`, { capture: "viewport" });
      cy.contains("nav a", "Skills").click();
      cy.get("#skills > .container > div").should("have.css", "opacity", "1");
      cy.get("#skills").should(($section) => expect($section[0].getBoundingClientRect().top).to.be.within(80, 140));
      cy.screenshot(`${name}-skills`, { capture: "viewport" });
      cy.contains("nav a", "Contact").click();
      cy.get("#contact > .container > div").should("have.css", "opacity", "1");
      cy.window().should((win) => expect(win.scrollY + win.innerHeight).to.be.at.least(win.document.documentElement.scrollHeight - 1));
      cy.screenshot(`${name}-contact`, { capture: "viewport" });
    });
  }

  it("renders once for reduced motion and responds to preference changes", { browser: "chrome" }, () => {
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
    if (Cypress.isBrowser("chrome")) cdp("Emulation.setEmulatedMedia", { features: [] });
  });
});

function cdp(command: string, params: Record<string, unknown>) {
  return cy.then(() => Cypress.automation("remote:debugger:protocol", { command, params }));
}

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

function observeFirstVertex(canvas: HTMLCanvasElement) {
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
