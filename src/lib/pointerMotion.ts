export type Point = { x: number; y: number };
type Correction = { velocity: Point; sampledTarget: Point };
type PointerMotion = { position: Point; target: Point; correction: Correction | null; scrolling: boolean };
export type TeleportLimits = {
  maxVelocity: number; // CSS pixels / second
  acceleration: number; // CSS pixels / second squared
  deceleration: number; // CSS pixels / second squared
  minimumApproachSpeed?: number; // CSS pixels / second; defaults to 240
  captureDistance?: number; // CSS pixel radius for switching to unrestricted tracking; defaults to 2
};

export const defaultTeleportLimits = {
  maxVelocity: 3200,
  acceleration: 4800,
  deceleration: 6000,
  minimumApproachSpeed: 240,
  captureDistance: 2,
} satisfies TeleportLimits;

/** Samples cannot move the displayed position until a frame advances it. */
export function createPointerMotion(initial: Point, limits: TeleportLimits = defaultTeleportLimits) {
  const state: PointerMotion = {
    position: { ...initial }, target: { ...initial }, correction: null, scrolling: false,
  };
  return {
    sample(target: Point, teleport: boolean, scrolling = false) {
      state.scrolling = scrolling;
      if (teleport) {
        if (!state.correction && (state.position.x !== target.x || state.position.y !== target.y)) {
          state.correction = { velocity: { x: 0, y: 0 }, sampledTarget: { ...target } };
        }
        // Re-entry is a discontinuity, not a sample of pointer velocity.
        if (state.correction) state.correction.sampledTarget = { ...target };
      }
      state.target = { ...target };
    },
    advance(elapsed: number): Point {
      if (state.correction) {
        advanceCorrection(state, elapsed, limits);
      } else if (state.scrolling) {
        // Native scrolling supplies sparse touch samples; follow between them in time.
        const blend = -Math.expm1(-Math.min(Math.max(elapsed, 0), 0.05) / 0.035);
        state.position.x += (state.target.x - state.position.x) * blend;
        state.position.y += (state.target.y - state.position.y) * blend;
        if (Math.hypot(state.target.x - state.position.x, state.target.y - state.position.y) < 0.25) {
          state.position = { ...state.target };
        }
      } else {
        state.position = { ...state.target };
      }
      return { ...state.position };
    },
    resize(scaleX: number, scaleY: number) {
      // Preserve placement without carrying obsolete correction momentum.
      for (const point of [state.position, state.target, state.correction?.sampledTarget]) {
        if (point) { point.x *= scaleX; point.y *= scaleY; }
      }
      if (state.correction) state.correction.velocity = { x: 0, y: 0 };
    },
  };
}

/** Steer velocity in small steps; a moving target never directly displaces the anchor. */
function advanceCorrection(state: PointerMotion, elapsed: number, limits: TeleportLimits) {
  const { velocity, sampledTarget } = state.correction!;
  const duration = Math.min(Math.max(elapsed, 0), 0.05);
  if (!duration) return;
  const minimumApproachSpeed = Math.max(0, limits.minimumApproachSpeed ?? defaultTeleportLimits.minimumApproachSpeed);
  const captureDistance = Math.max(0, limits.captureDistance ?? defaultTeleportLimits.captureDistance);
  const targetVelocity = {
    x: (state.target.x - sampledTarget.x) / duration,
    y: (state.target.y - sampledTarget.y) / duration,
  };
  let remaining = duration;
  while (remaining > 1e-8) {
    const dt = Math.min(remaining, 1 / 240);
    remaining -= dt;
    // Follow the target's motion through this frame, rather than braking toward
    // a frozen point every frame and remaining permanently behind a moving finger.
    const time = duration - remaining - dt;
    const dx = sampledTarget.x + targetVelocity.x * time - state.position.x;
    const dy = sampledTarget.y + targetVelocity.y * time - state.position.y;
    const gap = Math.hypot(dx, dy);
    const speed = Math.hypot(velocity.x, velocity.y);
    // Reserve a short approach time as well as the braking distance:
    // distance = v² / (2 * deceleration) + approachTime * v.
    // This smooth version of sqrt(2ad) avoids a sudden switch to final braking.
    const reserve = limits.deceleration / 12;
    const approachSpeed = Math.min(gap / dt, Math.max(
      minimumApproachSpeed,
      Math.sqrt(reserve * reserve + 2 * limits.deceleration * gap) - reserve,
    ));
    // Preserve pursuit from a distance. Match pointer velocity only near arrival,
    // so a fast drag cannot pull the initial teleport heading away from the finger.
    const followWeight = Math.max(0, 1 - gap / (limits.maxVelocity * 0.25));
    const desiredX = targetVelocity.x * followWeight + (gap ? dx / gap * approachSpeed : 0);
    const desiredY = targetVelocity.y * followWeight + (gap ? dy / gap * approachSpeed : 0);
    const desiredSpeed = Math.hypot(desiredX, desiredY);
    const speedScale = desiredSpeed ? Math.min(1, limits.maxVelocity / desiredSpeed) : 0;
    const changeX = desiredX * speedScale - velocity.x;
    const changeY = desiredY * speedScale - velocity.y;
    const change = Math.hypot(changeX, changeY);
    const braking = desiredSpeed * speedScale < speed || velocity.x * desiredX + velocity.y * desiredY < 0;
    const rate = braking ? limits.deceleration : limits.acceleration;
    const scale = change ? Math.min(1, rate * dt / change) : 0;
    velocity.x += changeX * scale;
    velocity.y += changeY * scale;
    state.position.x += velocity.x * dt;
    state.position.y += velocity.y * dt;
    // Check every integration step so the minimum approach cannot skip the arrival zone.
    // Capture only the latest actual sample, never an interpolated point earlier in the frame.
    if (Math.hypot(state.target.x - state.position.x, state.target.y - state.position.y) <= captureDistance) {
      // Scrolling hands the remaining gap to the short follow above, avoiding
      // a visible snap at the configured teleport capture distance.
      if (!state.scrolling) {
        state.position.x = state.target.x;
        state.position.y = state.target.y;
      }
      state.correction = null;
      return;
    }
  }
  sampledTarget.x = state.target.x;
  sampledTarget.y = state.target.y;
}
