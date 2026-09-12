import { createPointerMotion, type Point } from "./pointerMotion";
import { listenForPointer } from "./pointerInput";

type Vertex = Point & { noise: number };
type Viewport = {
  width: number; height: number; sceneHeight: number;
  columns: number; rows: number; pixelRatio: number;
};

// The portfolio artwork has one configuration; density alone follows viewport width.
const cfg = {
  speed: 2.5, wobble: 15, parallax: 25,
  glow: 0.2, glowRadius: 150, colorJitter: 0.06, dprCap: 1.5,
  from: { r: 45, g: 58, b: 99 }, to: { r: 70, g: 58, b: 140 },
};
const limits = {
  maxVelocity: 1200, acceleration: 9800, deceleration: 8000,
  minimumApproachSpeed: 400, captureDistance: 40,
};

/** Own the canvas, input and animation until the returned cleanup is called. */
export function mountBackground(canvas: HTMLCanvasElement) {
  const win = canvas.ownerDocument.defaultView!;
  const document = canvas.ownerDocument;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};
  const context = ctx;
  const drawScene = createSceneRenderer(context);
  const motionPreference = win.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motionPreference.matches;
  let motion = createPointerMotion({ x: 0, y: 0 }, limits);
  let reacquire = true;
  let width = 0, height = 0, sceneHeight = 0, cols = 0, rows = 0;
  let seconds = 0;
  let previousTime: number | undefined;
  let frame = 0;
  let disposed = false;

  const requestRender = () => {
    if (!disposed && !frame && !document.hidden) frame = win.requestAnimationFrame(render);
  };
  const reset = () => {
    motion = createPointerMotion({ x: width / 2, y: height / 2 }, limits);
    reacquire = true;
    seconds = 0;
    previousTime = undefined;
  };
  const sample = (point: Point, teleport: boolean, scrolling = false) => {
    if (reduced) return;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    motion.sample({
      x: Math.max(0, Math.min(bounds.width, point.x - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, point.y - bounds.top)),
    }, teleport || reacquire, scrolling);
    reacquire = false;
    requestRender();
  };
  let stopListening = listenForPointer(win, sample);

  function render(now: number) {
    if (disposed) return;
    frame = 0;
    let dt = previousTime === undefined ? 0 : Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    const bounds = canvas.getBoundingClientRect();
    const vw = Math.ceil(bounds.width), vh = Math.ceil(bounds.height);
    // Navigation can temporarily detach the canvas from layout.
    if (vw <= 0 || vh <= 0) {
      if (!reduced) requestRender();
      return;
    }
    const nextCols = win.innerWidth < 768 ? 10 : win.innerWidth < 992 ? 18 : 24;
    if (cols !== nextCols) {
      if (cols) {
        stopListening();
        stopListening = listenForPointer(win, sample);
      }
      cols = nextCols;
      rows = cols === 18 ? 18 : 16;
      width = vw;
      height = sceneHeight = vh;
      reset();
      dt = 0;
      previousTime = now;
      canvas.dataset.lowPolyCols = String(cols);
      canvas.dataset.lowPolyRows = String(rows);
    } else if (width !== vw) {
      motion.resize(vw / width, vh / sceneHeight);
      sceneHeight = vh;
    }
    width = vw;
    height = vh;
    const dpr = Math.min(win.devicePixelRatio || 1, cfg.dprCap);
    // Buffer resize and repaint share one frame; toolbar notifications cannot clear it early.
    const pixelWidth = Math.round(vw * dpr), pixelHeight = Math.round(vh * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pointer = motion.advance(reduced ? 0 : dt);
    if (!reduced) seconds += dt * cfg.speed;
    // Height-only changes extend the mesh; they never stretch its existing coordinates.
    drawScene({ width: vw, height: vh, sceneHeight, columns: cols, rows, pixelRatio: dpr }, seconds, pointer);
    if (!reduced) requestRender();
    else previousTime = undefined;
  }

  const preferenceChanged = () => {
    reduced = motionPreference.matches;
    reset();
    requestRender();
  };
  const visibilityChanged = () => {
    win.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = undefined;
    requestRender();
  };
  const events = new win.AbortController();
  const options = { signal: events.signal };
  win.addEventListener("resize", requestRender, options);
  win.visualViewport?.addEventListener("resize", requestRender, options);
  motionPreference.addEventListener("change", preferenceChanged, options);
  document.addEventListener("visibilitychange", visibilityChanged, options);
  const observer = new win.ResizeObserver(requestRender);
  observer.observe(document.documentElement);
  requestRender();
  return () => {
    disposed = true;
    win.cancelAnimationFrame(frame);
    events.abort();
    observer.disconnect();
    stopListening();
  };
}

/** Reuse the mesh between frames; only its positions and shading change. */
function createSceneRenderer(context: CanvasRenderingContext2D) {
  const vertices: Vertex[] = [];
  return function drawScene(viewport: Viewport, seconds: number, pointer: Point) {
    const { width, height, sceneHeight, columns, rows, pixelRatio } = viewport;
    const angle = seconds * 0.12;
    const noiseTime = seconds * 0.8;
    const gradientX = Math.cos(angle), gradientY = Math.sin(angle);
    const diagonal = Math.hypot(width, sceneHeight);
    const cellWidth = width / columns, cellHeight = sceneHeight / rows;
    const shiftX = (pointer.x / width - 0.5) * cfg.parallax;
    const shiftY = (pointer.y / sceneHeight - 0.5) * cfg.parallax;

    // Momentum can carry recovery outside an edge. Extend the mesh to cover it.
    const bleed = Math.max(cfg.parallax, Math.abs(shiftX), Math.abs(shiftY)) + cfg.wobble + 8;
    const extraColumns = Math.ceil(bleed / cellWidth), extraRows = Math.ceil(bleed / cellHeight);
    const totalColumns = columns + extraColumns * 2;
    const totalRows = Math.ceil(height / cellHeight) + extraRows * 2;
    const stride = totalColumns + 1;
    const vertexCount = stride * (totalRows + 1);
    while (vertices.length < vertexCount) vertices.push({ x: 0, y: 0, noise: 0 });

    for (let row = 0; row <= totalRows; row++) {
      for (let column = 0; column <= totalColumns; column++) {
        const gridX = column - extraColumns, gridY = row - extraRows;
        const vertex = vertices[row * stride + column];
        vertex.noise = noise(gridX * 0.8, gridY * 0.7, noiseTime);
        const wobble = cfg.wobble * vertex.noise;
        vertex.x = Math.round((gridX * cellWidth + shiftX + wobble) * pixelRatio) / pixelRatio;
        vertex.y = Math.round((gridY * cellHeight + shiftY + wobble) * pixelRatio) / pixelRatio;
      }
    }

    function drawTriangle(a: Vertex, b: Vertex, c: Vertex) {
      const centerX = (a.x + b.x + c.x) / 3, centerY = (a.y + b.y + c.y) / 3;
      const gradient = Math.max(0, Math.min(1, (centerX * gradientX + centerY * gradientY) / diagonal)) * 0.9;
      const distance = Math.hypot(centerX - pointer.x, centerY - pointer.y);
      const glow = Math.max(0, 1 - distance / cfg.glowRadius) * cfg.glow;
      const jitter = (a.noise + b.noise + c.noise) / 3;
      const light = 255 * (cfg.colorJitter * jitter + glow);
      const red = shade(cfg.from.r, cfg.to.r, gradient, light);
      const green = shade(cfg.from.g, cfg.to.g, gradient, light);
      const blue = shade(cfg.from.b, cfg.to.b, gradient, light);

      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.lineTo(c.x, c.y);
      context.closePath();
      context.fillStyle = `rgb(${red},${green},${blue})`;
      context.fill();
    }

    context.clearRect(0, 0, width, height);
    for (let row = 0; row < totalRows; row++) {
      for (let column = 0; column < totalColumns; column++) {
        const index = row * stride + column;
        const topLeft = vertices[index], topRight = vertices[index + 1];
        const bottomLeft = vertices[index + stride], bottomRight = vertices[index + stride + 1];
        drawTriangle(topLeft, topRight, bottomRight);
        drawTriangle(topLeft, bottomRight, bottomLeft);
      }
    }
  };
}

function shade(from: number, to: number, gradient: number, light: number) {
  // The artwork rounds its base gradient before applying glow and color variation.
  return channel(channel(from + (to - from) * gradient) + light);
}
function channel(value: number) { return Math.round(Math.max(0, Math.min(255, value))); }
function noise(x: number, y: number, time: number) {
  return Math.sin(1.2 * x + 0.7 * y + 0.6 * time) * Math.cos(0.7 * x - 1.1 * y + 0.4 * time);
}
