export type Point = { x: number; y: number };
type Correction = { velocity: Point; sampledTarget: Point };
export type PointerMotion = { position: Point; target: Point; correction: Correction | null };
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

export function createPointerMotion(position: Point): PointerMotion {
  return { position: { ...position }, target: { ...position }, correction: null };
}

/** Retarget recovery without changing its position or momentum. */
export function setPointerTarget(state: PointerMotion, target: Point, teleport: boolean) {
  if (teleport) {
    if (!state.correction && (state.position.x !== target.x || state.position.y !== target.y)) {
      state.correction = { velocity: { x: 0, y: 0 }, sampledTarget: { ...target } };
    }
    // A new contact/re-entry is a discontinuity, not a sample of pointer velocity.
    if (state.correction) state.correction.sampledTarget = { ...target };
  }
  state.target.x = target.x;
  state.target.y = target.y;
}

export function advancePointer(state: PointerMotion, elapsed: number, limits: TeleportLimits) {
  if (state.correction) {
    advanceCorrection(state, elapsed, limits);
  } else {
    state.position.x = state.target.x;
    state.position.y = state.target.y;
  }
}

/** Preserve relative placement on resize without carrying obsolete correction momentum. */
export function resizePointer(state: PointerMotion, scaleX: number, scaleY: number) {
  for (const point of [state.position, state.target, state.correction?.sampledTarget]) {
    if (point) { point.x *= scaleX; point.y *= scaleY; }
  }
  if (state.correction) state.correction.velocity = { x: 0, y: 0 };
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
      state.position.x = state.target.x;
      state.position.y = state.target.y;
      state.correction = null;
      return;
    }
  }
  sampledTarget.x = state.target.x;
  sampledTarget.y = state.target.y;
}

/** Touch events keep supplying coordinates after scrolling cancels pointer events. */
export function listenForPointer(win: Window, onPosition: (point: Point, teleport: boolean) => void) {
  let touchId: number | null = null;
  let touching = false;
  let source: string | null = null;
  const options = { passive: true, capture: true };
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !event.isPrimary || touching || win.document.hidden) return;
    // Captured pointers can move outside the viewport without firing boundary events.
    if (event.clientX < 0 || event.clientX >= win.innerWidth || event.clientY < 0 || event.clientY >= win.innerHeight) {
      source = null;
      return;
    }
    const nextSource = `${event.pointerType}:${event.pointerId}`;
    const teleport = source !== nextSource;
    source = nextSource;
    onPosition({ x: event.clientX, y: event.clientY }, teleport);
  };
  const pointerOut = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && event.isPrimary && event.relatedTarget === null) source = null;
  };
  const pointerOver = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && event.isPrimary && event.relatedTarget === null) {
      source = null;
      pointer(event);
    }
  };
  const pointerCancel = (event: PointerEvent) => {
    // Touch scrolling cancels pointer events, but the touch gesture is still continuous.
    if (event.pointerType !== "touch" && event.isPrimary) source = null;
  };
  const touchStart = (event: TouchEvent) => {
    if (win.document.hidden) return;
    touching = event.touches.length > 0;
    if (touching) source = null;
    if (touchId !== null || event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchId = touch.identifier;
    onPosition({ x: touch.clientX, y: touch.clientY }, true);
  };
  const touchMove = (event: TouchEvent) => {
    if (win.document.hidden) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === touchId);
    if (touch) onPosition({ x: touch.clientX, y: touch.clientY }, false);
  };
  const touchEnd = (event: TouchEvent) => {
    touching = event.touches.length > 0;
    if (!Array.from(event.touches).some((item) => item.identifier === touchId)) touchId = null;
    // Keep the last target on release; a second finger never inherits this gesture.
  };
  const reset = () => { touchId = null; touching = false; source = null; };
  win.addEventListener("pointerdown", pointer, options);
  win.addEventListener("pointermove", pointer, options);
  win.addEventListener("pointerout", pointerOut, options);
  win.addEventListener("pointerover", pointerOver, options);
  win.addEventListener("pointercancel", pointerCancel, options);
  win.addEventListener("touchstart", touchStart, options);
  win.addEventListener("touchmove", touchMove, options);
  win.addEventListener("touchend", touchEnd, options);
  win.addEventListener("touchcancel", touchEnd, options);
  win.addEventListener("blur", reset);
  win.document.addEventListener("visibilitychange", reset);
  return () => {
    win.removeEventListener("pointerdown", pointer, options);
    win.removeEventListener("pointermove", pointer, options);
    win.removeEventListener("pointerout", pointerOut, options);
    win.removeEventListener("pointerover", pointerOver, options);
    win.removeEventListener("pointercancel", pointerCancel, options);
    win.removeEventListener("touchstart", touchStart, options);
    win.removeEventListener("touchmove", touchMove, options);
    win.removeEventListener("touchend", touchEnd, options);
    win.removeEventListener("touchcancel", touchEnd, options);
    win.removeEventListener("blur", reset);
    win.document.removeEventListener("visibilitychange", reset);
  };
}
