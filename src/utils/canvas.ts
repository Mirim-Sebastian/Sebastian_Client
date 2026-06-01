// ─── Types ───────────────────────────────────────────────────────────────────

export type Point = { x: number; y: number };

export type StrokeAction = {
  type: "stroke";
  color: string;
  size: number;
  points: Point[];
};

export type FillAction = {
  type: "fill";
  color: string;
  x: number;
  y: number;
};

export type EraseAction = {
  type: "erase";
  size: number;
  points: Point[];
};

export type DrawAction = StrokeAction | FillAction | EraseAction;

// ─── Utilities ───────────────────────────────────────────────────────────────

export function cloneActions(actions: DrawAction[]): DrawAction[] {
  return actions.map((a) =>
    a.type === "fill" ? { ...a } : { ...a, points: a.points.map((p) => ({ ...p })) },
  );
}

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: StrokeAction,
  width: number,
  height: number,
): void {
  if (stroke.points.length === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const [first, ...rest] = stroke.points;
  ctx.moveTo(first.x * width, first.y * height);
  if (rest.length === 0) {
    ctx.lineTo(first.x * width + 0.1, first.y * height + 0.1);
  } else {
    for (const p of rest) ctx.lineTo(p.x * width, p.y * height);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawErase(
  ctx: CanvasRenderingContext2D,
  erase: EraseAction,
  width: number,
  height: number,
): void {
  if (erase.points.length === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = erase.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const [first, ...rest] = erase.points;
  ctx.moveTo(first.x * width, first.y * height);
  if (rest.length === 0) {
    ctx.lineTo(first.x * width + 0.1, first.y * height + 0.1);
  } else {
    for (const p of rest) ctx.lineTo(p.x * width, p.y * height);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawFill(
  ctx: CanvasRenderingContext2D,
  fill: FillAction,
  frameCtx: CanvasRenderingContext2D,
  strokesCtx: CanvasRenderingContext2D,
): void {
  const { canvas } = ctx;
  const w = canvas.width;
  const h = canvas.height;
  const n = w * h;

  const framePixels   = frameCtx.getImageData(0, 0, w, h).data;
  const strokesPixels = strokesCtx.getImageData(0, 0, w, h).data;

  // Walls = fish outline OR user strokes (fills excluded so subsequent fills work)
  const wall = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (framePixels[i * 4 + 3] > 0 || strokesPixels[i * 4 + 3] > 10) wall[i] = 1;
  }

  // BFS from canvas border to mark all regions reachable from outside
  const outside = new Uint8Array(n);
  const q: number[] = [];
  const seed = (p: number) => {
    if (!wall[p] && !outside[p]) { outside[p] = 1; q.push(p); }
  };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { seed(y * w); seed(y * w + w - 1); }
  for (let qi = 0; qi < q.length; qi++) {
    const p = q[qi];
    const px = p % w, py = (p / w) | 0;
    const enqueue = (np: number) => { if (!wall[np] && !outside[np]) { outside[np] = 1; q.push(np); } };
    if (px > 0)     enqueue(p - 1);
    if (px < w - 1) enqueue(p + 1);
    if (py > 0)     enqueue(p - w);
    if (py < h - 1) enqueue(p + w);
  }

  const startX = Math.max(0, Math.min(w - 1, Math.round(fill.x * w)));
  const startY = Math.max(0, Math.min(h - 1, Math.round(fill.y * h)));
  const startP = startY * w + startX;
  if (wall[startP] || outside[startP]) return;

  // DFS flood fill through the fish interior
  const filled = new Uint8Array(n);
  const stack: number[] = [startP];
  filled[startP] = 1;
  while (stack.length > 0) {
    const p = stack.pop()!;
    const px = p % w, py = (p / w) | 0;
    const push = (np: number) => { if (!filled[np] && !wall[np] && !outside[np]) { filled[np] = 1; stack.push(np); } };
    if (px > 0)     push(p - 1);
    if (px < w - 1) push(p + 1);
    if (py > 0)     push(p - w);
    if (py < h - 1) push(p + w);
  }

  const r = parseInt(fill.color.slice(1, 3), 16);
  const g = parseInt(fill.color.slice(3, 5), 16);
  const b = parseInt(fill.color.slice(5, 7), 16);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < n; i++) {
    if (filled[i]) {
      const idx = i * 4;
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function checkFishCoverage(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frameCtx: CanvasRenderingContext2D,
): number {
  const w = canvas.width;
  const h = canvas.height;
  const n = w * h;

  const framePixels = frameCtx.getImageData(0, 0, w, h).data;
  const drawPixels  = ctx.getImageData(0, 0, w, h).data;

  const wall = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (framePixels[i * 4 + 3] > 0) wall[i] = 1;
  }

  const outside = new Uint8Array(n);
  const q: number[] = [];
  const seed = (p: number) => {
    if (!wall[p] && !outside[p]) { outside[p] = 1; q.push(p); }
  };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { seed(y * w); seed(y * w + w - 1); }
  for (let qi = 0; qi < q.length; qi++) {
    const p = q[qi];
    const px = p % w, py = (p / w) | 0;
    const enqueue = (np: number) => { if (!wall[np] && !outside[np]) { outside[np] = 1; q.push(np); } };
    if (px > 0)     enqueue(p - 1);
    if (px < w - 1) enqueue(p + 1);
    if (py > 0)     enqueue(p - w);
    if (py < h - 1) enqueue(p + w);
  }

  let interior = 0;
  let covered  = 0;
  for (let i = 0; i < n; i++) {
    if (!wall[i] && !outside[i]) {
      interior++;
      if (drawPixels[i * 4 + 3] > 10) covered++;
    }
  }
  return interior === 0 ? 0 : covered / interior;
}

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
}

export function isPointNearStroke(
  point: Point,
  stroke: StrokeAction,
  width: number,
  height: number,
  threshold: number,
): boolean {
  if (stroke.points.length === 0) return false;
  const scaled = stroke.points.map((p) => ({ x: p.x * width, y: p.y * height }));
  if (scaled.length === 1) {
    return Math.hypot(point.x - scaled[0].x, point.y - scaled[0].y) <= threshold;
  }
  for (let i = 1; i < scaled.length; i++) {
    if (distanceToSegment(point, scaled[i - 1], scaled[i]) <= threshold) return true;
  }
  return false;
}
