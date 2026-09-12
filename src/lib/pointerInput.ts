import type { Point } from "./pointerMotion";

/** Touch events keep supplying coordinates after scrolling cancels pointer events. */
export function listenForPointer(win: Window, onPosition: (point: Point, teleport: boolean, scrolling?: boolean) => void) {
  let touchId: number | null = null;
  let touching = false;
  let scrolling = false;
  let scrollAnchor: { point: Point; x: number; y: number } | null = null;
  let anchorFrame = 0;
  let source: string | null = null;
  const events = new (win.document.defaultView!.AbortController)();
  const options = { passive: true, capture: true, signal: events.signal };
  const cancelAnchorFrame = () => { win.cancelAnimationFrame(anchorFrame); anchorFrame = 0; };
  const rebaseAfterTouch = () => {
    cancelAnchorFrame();
    // A touch sample can arrive one frame before its compositor scroll offset.
    // Let that offset commit before inferring further movement, or the same
    // finger movement would be counted once by touchmove and again by scroll.
    anchorFrame = win.requestAnimationFrame(() => {
      anchorFrame = win.requestAnimationFrame(() => {
        anchorFrame = 0;
        if (scrollAnchor) { scrollAnchor.x = win.scrollX; scrollAnchor.y = win.scrollY; }
      });
    });
  };
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
    if (event.pointerType === "touch" && touchId !== null) scrolling = true;
  };
  const touchStart = (event: TouchEvent) => {
    if (win.document.hidden) return;
    touching = event.touches.length > 0;
    if (touching) source = null;
    if (event.touches.length !== 1) scrollAnchor = null;
    if (touchId !== null || event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchId = touch.identifier;
    scrolling = false;
    scrollAnchor = { point: { x: touch.clientX, y: touch.clientY }, x: win.scrollX, y: win.scrollY };
    onPosition({ x: touch.clientX, y: touch.clientY }, true);
  };
  const touchMove = (event: TouchEvent) => {
    if (win.document.hidden) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === touchId);
    if (touch) {
      const point = { x: touch.clientX, y: touch.clientY };
      scrollAnchor = event.touches.length === 1 ? { point, x: win.scrollX, y: win.scrollY } : null;
      rebaseAfterTouch();
      onPosition(point, false, scrolling);
    }
  };
  const touchEnd = (event: TouchEvent) => {
    touching = event.touches.length > 0;
    if (!Array.from(event.touches).some((item) => item.identifier === touchId)) {
      touchId = null;
      scrollAnchor = null;
      cancelAnchorFrame();
    }
    // Keep the last target on release; a second finger never inherits this gesture.
  };
  const scroll = (event: Event) => {
    if (touchId === null || !scrollAnchor || anchorFrame || win.document.hidden) return;
    if (event.target !== win && event.target !== win.document) return;
    const x = win.scrollX, y = win.scrollY;
    const dx = x - scrollAnchor.x, dy = y - scrollAnchor.y;
    if (!dx && !dy) return;
    // Native scrolling can update each frame while Chrome throttles touchmove
    // to 200ms. Content displacement supplies the missing finger movement.
    // Only infer while this finger is down; inertia must not move the tracker.
    scrolling = true;
    const point = { x: scrollAnchor.point.x - dx, y: scrollAnchor.point.y - dy };
    scrollAnchor = { point, x, y };
    onPosition(point, false, true);
  };
  const reset = () => { cancelAnchorFrame(); touchId = null; touching = false; scrolling = false; scrollAnchor = null; source = null; };
  win.addEventListener("pointerdown", pointer, options);
  win.addEventListener("pointermove", pointer, options);
  win.addEventListener("pointerout", pointerOut, options);
  win.addEventListener("pointerover", pointerOver, options);
  win.addEventListener("pointercancel", pointerCancel, options);
  win.addEventListener("touchstart", touchStart, options);
  win.addEventListener("touchmove", touchMove, options);
  win.addEventListener("touchend", touchEnd, options);
  win.addEventListener("touchcancel", touchEnd, options);
  win.addEventListener("scroll", scroll, options);
  win.addEventListener("blur", reset, { signal: events.signal });
  win.document.addEventListener("visibilitychange", reset, { signal: events.signal });
  return () => {
    cancelAnchorFrame();
    events.abort();
  };
}
