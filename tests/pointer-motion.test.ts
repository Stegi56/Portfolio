import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPointerMotion, defaultTeleportLimits, type Point } from "../src/lib/pointerMotion.ts";

const refreshRates = [30, 60, 120, 144];
const portfolioLimits = { maxVelocity: 1200, acceleration: 9800, deceleration: 8000 };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const velocityBetween = (a: Point, b: Point, dt: number) => ({ x: (b.x - a.x) / dt, y: (b.y - a.y) / dt });

function assertDirectTracking(motion: ReturnType<typeof createPointerMotion>) {
  for (const target of [{ x: 1400, y: 900 }, { x: 0, y: 0 }]) {
    motion.sample(target, false);
    assert.deepEqual(motion.advance(1 / 240), target, "the next frame follows unrestricted movement exactly");
  }
}

describe("pointer motion", () => {
  it("settles scrolling samples consistently across refresh rates and restores direct tracking", () => {
    const finalPositions: number[] = [];
    for (const hz of refreshRates) {
      const motion = createPointerMotion({ x: 100, y: 500 });
      motion.sample({ x: 100, y: 350 }, false, true);
      let point = { x: 100, y: 500 };
      // Measure exactly 200ms, including a partial frame for 144Hz.
      for (let elapsed = 0; elapsed < 0.2 - 1e-9;) {
        const dt = Math.min(1 / hz, 0.2 - elapsed);
        const next = motion.advance(dt);
        if (elapsed === 0) assert.ok(next.y > 350 && next.y < point.y, "the first scrolling frame follows without snapping");
        assertBetween(next.y, 350, point.y, "moves toward the sample without overshoot");
        point = next;
        elapsed += dt;
      }
      assertClose(point.y, 350, 1, "settles within one pixel after 200ms");
      finalPositions.push(point.y);
      assertDirectTracking(motion);
    }
    assert.ok(Math.max(...finalPositions) - Math.min(...finalPositions) < 0.25);
  });

  it("hands off touch recovery without snapping across the remaining scroll gap", () => {
    const motion = createPointerMotion({ x: 100, y: 400 }, { ...defaultTeleportLimits, captureDistance: 40 });
    motion.sample({ x: 100, y: 370 }, true, true);
    assert.ok(motion.advance(1 / 120).y > 395, "handoff preserves the displayed position");
    let point: Point;
    for (let frame = 0; frame < 30; frame++) point = motion.advance(1 / 120);
    assertClose(point!.y, 370, 0.25, "scroll following settles the remaining gap");
  });

  it("limits teleport speed and acceleration, brakes, and settles without overshooting", () => {
    const motion = createPointerMotion({ x: 0, y: 0 });
    const target = { x: 3000, y: 3000 };
    motion.sample(target, true);
    let point = motion.advance(0);
    assert.deepEqual(point, { x: 0, y: 0 });
    let previousVelocity = { x: 0, y: 0 };
    const speeds: number[] = [];
    // Derive movement from displayed positions, never from hidden integrator state.
    const dt = 1 / 240;
    for (let frame = 0; frame < 1440 && distance(point, target) > 0; frame++) {
      const next = motion.advance(dt);
      if (distance(next, target) > 0) {
        const velocity = velocityBetween(point, next, dt);
        const speed = Math.hypot(velocity.x, velocity.y);
        speeds.push(speed);
        assert.ok(speed <= defaultTeleportLimits.maxVelocity + 1e-6);
        assert.ok(distance(velocity, previousVelocity) <= defaultTeleportLimits.deceleration * dt + 1e-6);
        previousVelocity = velocity;
      }
      assert.ok(next.x <= target.x);
      assert.ok(next.y <= target.y);
      point = next;
    }
    assertClose(speeds[0], defaultTeleportLimits.acceleration * dt, 1e-6);
    assertClose(Math.max(...speeds), defaultTeleportLimits.maxVelocity, 1e-6);
    assert.equal(speeds.some((speed, index) => index > 0 && speed < speeds[index - 1]), true);
    assert.deepEqual(point, target);
    assertDirectTracking(motion);
  });

  it("preserves position and momentum when dragging or teleporting again during recovery", () => {
    for (const teleport of [false, true]) {
      const motion = createPointerMotion({ x: 200, y: 300 });
      motion.sample({ x: 1000, y: 800 }, true);
      const previous = motion.advance(1 / 240);
      const before = motion.advance(1 / 240);
      const velocity = velocityBetween(previous, before, 1 / 240);
      motion.sample({ x: 100, y: 50 }, teleport);
      assert.deepEqual(motion.advance(0), before, "retargeting cannot displace the anchor");
      const next = motion.advance(1 / 240);
      const nextVelocity = velocityBetween(before, next, 1 / 240);
      assert.ok(next.x > before.x, "forward momentum survives a reversal");
      assert.ok(distance(nextVelocity, velocity) <= defaultTeleportLimits.deceleration / 240 + 1e-6);
      let point = next;
      for (let frame = 0; frame < 360; frame++) point = motion.advance(1 / 60);
      assert.deepEqual(point, { x: 100, y: 50 });
      motion.sample(point, true);
      assertDirectTracking(motion);
    }
  });

  it("caps elapsed correction time after a pause and rescales recovery on resize", () => {
    const motion = createPointerMotion({ x: 400, y: 200 });
    motion.sample({ x: 1400, y: 800 }, true);
    const point = motion.advance(60);
    assert.ok(distance(point, { x: 400, y: 200 }) <= defaultTeleportLimits.maxVelocity * 0.05);
    motion.resize(0.5, 2);
    const resized = motion.advance(0);
    assert.deepEqual(resized, { x: point.x * 0.5, y: point.y * 2 });
    const next = motion.advance(1 / 240);
    assert.ok(distance(next, resized) <= defaultTeleportLimits.acceleration / 240 ** 2 + 1e-6, "obsolete momentum was removed");
    let final = next;
    for (let frame = 0; frame < 360; frame++) final = motion.advance(1 / 60);
    assert.deepEqual(final, { x: 700, y: 1600 });
  });

  it("bounds steering through sharp turns and reversals at each refresh rate", () => {
    for (const hz of [...refreshRates, 240]) {
      const motion = createPointerMotion({ x: 300, y: 400 }, portfolioLimits);
      motion.sample({ x: 1400, y: 400 }, true);
      let point = motion.advance(0);
      let previous = point;
      for (let frame = 0; frame < hz / 4; frame++) { previous = point; point = motion.advance(1 / hz); }
      for (const target of [{ x: 0, y: 400 }, { x: 300, y: 800 }, { x: 1400, y: 0 }]) {
        const velocity = velocityBetween(previous, point, 1 / hz);
        motion.sample(target, false);
        assert.deepEqual(motion.advance(0), point);
        const next = motion.advance(1 / hz);
        const nextVelocity = velocityBetween(point, next, 1 / hz);
        assert.ok(distance(next, point) <= portfolioLimits.maxVelocity / hz + 1e-6);
        assert.ok(distance(nextVelocity, velocity) <= Math.max(portfolioLimits.acceleration, portfolioLimits.deceleration) / hz + 1e-6);
        if (target.x === 0) assert.ok(next.x > point.x);
        previous = point;
        point = next;
      }
      for (let frame = 0; frame < hz * 6; frame++) point = motion.advance(1 / hz);
      assert.deepEqual(point, { x: 1400, y: 0 });
      assertDirectTracking(motion);
    }
  });

  it("corrects teleports consistently across refresh rates", () => {
    const positions = refreshRates.map((hz) => {
      const motion = createPointerMotion({ x: 0, y: 0 });
      motion.sample({ x: 1500, y: 500 }, true);
      let point: Point;
      for (let frame = 0; frame < hz; frame++) point = motion.advance(1 / hz);
      return point!;
    });
    positions.forEach((point) => assert.ok(distance(point, positions[0]) < 3));
  });

  it("leaves each corner diagonally when teleporting to the opposite corner and dragging back", () => {
    for (const [width, height] of [[375, 812], [768, 1024], [1440, 900]]) {
      for (const [flipX, flipY] of [[false, false], [true, false], [false, true], [true, true]]) {
        const origin = { x: flipX ? width : 0, y: flipY ? height : 0 };
        const motion = createPointerMotion(origin);
        motion.sample({ x: width - origin.x, y: height - origin.y }, true);
        let point = motion.advance(0);
        for (let frame = 0; frame < 30; frame++) {
          const x = width * (0.95 - frame / 100);
          motion.sample({ x: flipX ? width - x : x, y: height - origin.y }, false);
          point = motion.advance(1 / 60);
          assertBetween(point.x, 0, width);
          assertBetween(point.y, 0, height);
          assert.ok(Math.abs(point.x - origin.x) > 0, "moves away from the vertical edge");
          assert.ok(Math.abs(point.y - origin.y) > 0, "moves away from the horizontal edge");
        }
        let target = origin;
        for (let frame = 0; frame < 360; frame++) {
          target = { x: width * (0.5 + 0.1 * Math.sin(frame / 10)), y: height * 0.8 };
          motion.sample(target, false);
          point = motion.advance(1 / 60);
        }
        for (let frame = 0; frame < 360; frame++) point = motion.advance(1 / 60);
        assert.deepEqual(point, target);
        motion.sample(origin, false);
        assert.deepEqual(motion.advance(0), origin);
      }
    }
  });

  it("owns copies of input and displayed points", () => {
    const initial = { x: 10, y: 20 };
    const motion = createPointerMotion(initial);
    initial.x = 999;
    const displayed = motion.advance(0);
    displayed.y = 999;
    assert.deepEqual(motion.advance(0), { x: 10, y: 20 });
    const target = { x: 30, y: 40 };
    motion.sample(target, false);
    target.x = 999;
    assert.deepEqual(motion.advance(0), { x: 30, y: 40 });
  });
});

describe("handoff from teleport recovery to unrestricted tracking", () => {
  it("locks within the configured pixel radius and stays unrestricted until the next teleport", () => {
    for (const captureDistance of [undefined, 9, 11]) {
      const motion = createPointerMotion({ x: 0, y: 0 }, { ...portfolioLimits, captureDistance });
      const target = { x: 6, y: 8 };
      motion.sample(target, true);
      let point = motion.advance(1 / 240);
      if (captureDistance !== 11) assert.notDeepEqual(point, target, "outside the radius, steering remains bounded");
      else assert.deepEqual(point, target, "inside the radius, recovery releases");
      for (let frame = 0; frame < 60; frame++) point = motion.advance(1 / 60);
      assert.deepEqual(point, target);
      assertDirectTracking(motion);
      motion.sample({ x: 1400, y: 900 }, true);
      assert.notDeepEqual(motion.advance(1 / 240), { x: 1400, y: 900 }, "new contact starts recovery");
    }
  });

  for (const minimumApproachSpeed of [undefined, 480]) {
    it(`closes the final 20 pixels promptly without overshoot at ${minimumApproachSpeed ?? "default"} minimum speed`, () => {
      for (const hz of refreshRates) {
        const motion = createPointerMotion({ x: 0, y: 0 }, { ...portfolioLimits, minimumApproachSpeed });
        const target = { x: 600, y: 800 };
        motion.sample(target, true);
        let point = motion.advance(0);
        // Reach the final approach naturally, instead of injecting integrator velocity.
        for (let frame = 0; frame < 240 * 6 && distance(point, target) > 20; frame++) point = motion.advance(1 / 240);
        assertBetween(distance(point, target), 0.001, 20, "reached the final approach without already capturing");
        for (let frame = 0; frame < Math.ceil(hz * 0.15); frame++) {
          const before = point;
          point = motion.advance(1 / hz);
          if (distance(point, target) > 0) {
            assert.ok(distance(point, before) >= (minimumApproachSpeed ?? 240) / hz - 1e-6, "minimum closing speed scales with frame duration");
          }
          assertBetween(point.x, 0, target.x);
          assertBetween(point.y, 0, target.y);
        }
        assert.deepEqual(point, target, `final approach completes within 150ms at ${hz}Hz`);
        assertDirectTracking(motion);
      }
    });
  }

  it("accelerates short teleports into the minimum approach without a slow tail", () => {
    for (const hz of refreshRates) {
      const motion = createPointerMotion({ x: 0, y: 0 }, portfolioLimits);
      const target = { x: 20, y: 0 };
      motion.sample(target, true);
      let point = motion.advance(0);
      assert.deepEqual(point, { x: 0, y: 0 });
      for (let frame = 0; frame < Math.ceil(hz * 0.15); frame++) point = motion.advance(1 / hz);
      assert.deepEqual(point, target, `short teleport completes within 150ms at ${hz}Hz`);
    }
  });

  it("catches a moving pointer without requiring it to stop, then removes both limits", () => {
    for (const hz of refreshRates) {
      for (const speed of [180, 600, 1000]) {
        const motion = createPointerMotion({ x: 0, y: 0 }, portfolioLimits);
        motion.sample({ x: 300, y: 200 }, true);
        let caught = false;
        for (let frame = 1; frame <= hz * 6; frame++) {
          const target = { x: 300 + speed * frame / hz, y: 200 };
          motion.sample(target, false);
          if (distance(motion.advance(1 / hz), target) === 0) { caught = true; break; }
        }
        assert.equal(caught, true, `captures ${speed}px/s motion at ${hz}Hz`);
        assertDirectTracking(motion);
      }
    }
  });

  it("continues bounded steering while the pointer is still too far ahead", () => {
    for (const hz of [...refreshRates, 240]) {
      const motion = createPointerMotion({ x: 0, y: 0 }, portfolioLimits);
      motion.sample({ x: 300, y: 200 }, true);
      let point = motion.advance(0);
      let velocity = { x: 0, y: 0 };
      for (let frame = 1; frame <= hz * 2; frame++) {
        const target = { x: 300 + 2000 * frame / hz, y: 200 };
        motion.sample(target, false);
        const next = motion.advance(1 / hz);
        assert.notDeepEqual(next, target, "no premature handoff to a distant pointer");
        const nextVelocity = velocityBetween(point, next, 1 / hz);
        assert.ok(distance(next, point) <= portfolioLimits.maxVelocity / hz + 1e-6);
        assert.ok(distance(nextVelocity, velocity) <= Math.max(portfolioLimits.acceleration, portfolioLimits.deceleration) / hz + 1e-6);
        point = next;
        velocity = nextVelocity;
      }
    }
  });
});

function assertClose(actual: number, expected: number, tolerance: number, message?: string) {
  assert.ok(Math.abs(actual - expected) <= tolerance, message ?? `${actual} differs from ${expected} by more than ${tolerance}`);
}
function assertBetween(actual: number, minimum: number, maximum: number, message?: string) {
  assert.ok(actual >= minimum && actual <= maximum, message ?? `${actual} is outside [${minimum}, ${maximum}]`);
}
