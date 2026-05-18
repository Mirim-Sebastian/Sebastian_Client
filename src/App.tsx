import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import { postFish } from "./api/fish";
import { DrawScreen } from "./components/DrawScreen";
import { NameScreen } from "./components/NameScreen";
import { SentScreen } from "./components/SentScreen";
import { FISH_TEMPLATES } from "./components/fishTemplates";
import {
  BRUSH_MAX,
  BRUSH_MIN,
  COLORS,
  ERASER_SIZE_DEFAULT,
  MAX_NAME,
  MAX_MESSAGE,
  MIN_NAME,
  PEN_SIZE_DEFAULT,
} from "./constants";
import { AppWrapper, AppBubble } from "./App.styles";

type Step = "draw" | "name" | "sent";
type Point = {
  x: number;
  y: number;
};

type StrokeAction = {
  type: "stroke";
  color: string;
  size: number;
  points: Point[];
};

type FillAction = {
  type: "fill";
  color: string;
  x: number;
  y: number;
};

type EraseAction = {
  type: "erase";
  size: number;
  points: Point[];
};

type DrawAction = StrokeAction | FillAction | EraseAction;

type Bubble = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  peakOpacity: number;
};

const APP_BUBBLE_COUNT = 18;

function generateBubbles(): Bubble[] {
  return Array.from({ length: APP_BUBBLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 12,
    duration: 12 + Math.random() * 11,
    delay: -(Math.random() * 15),
    peakOpacity: 0.18 + Math.random() * 0.35,
  }));
}

function App() {
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const hasDrawingRef = useRef(false);
  const templateImageRef = useRef<HTMLImageElement | null>(null);
  const actionsRef = useRef<DrawAction[]>([]);
  const currentStrokeRef = useRef<StrokeAction | null>(null);
  const currentEraseRef = useRef<EraseAction | null>(null);
  const historyRef = useRef<DrawAction[][]>([[]]);
  const redoHistoryRef = useRef<DrawAction[][]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const [step, setStep] = useState<Step>("draw");
  const [tool, setTool] = useState<"pen" | "eraser" | "fill">("pen");
  const [eraserMode, setEraserMode] = useState<"stroke" | "brush">("stroke");
  const [color, setColor] = useState(COLORS[0].value);
  const [customColor, setCustomColor] = useState(COLORS[0].value);
  const [penSize, setPenSize] = useState(PEN_SIZE_DEFAULT);
  const [eraserSize, setEraserSize] = useState(ERASER_SIZE_DEFAULT);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawError, setDrawError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    FISH_TEMPLATES[0].id,
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [bubbles] = useState<Bubble[]>(generateBubbles);

  useEffect(() => {
    hasDrawingRef.current = hasDrawing;
  }, [hasDrawing]);

  const cloneActions = (actions: DrawAction[]) =>
    actions.map((action) =>
      action.type === "fill"
        ? { ...action }
        : {
            ...action,
            points: action.points.map((point) => ({ ...point })),
          },
    );

  const updateFrame = (width?: number, height?: number) => {
    const frameCanvas = frameCanvasRef.current;
    const frameCtx = frameContextRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!frameCanvas || !frameCtx || !drawCanvas) return;
    const rect = drawCanvas.getBoundingClientRect();
    const frameWidth = width ?? rect.width;
    const frameHeight = height ?? rect.height;
    const img = templateImageRef.current;
    frameCtx.clearRect(0, 0, frameWidth, frameHeight);
    if (!img?.complete || !img.naturalWidth) return;
    const scale = Math.min(
      (frameWidth * 0.85) / img.naturalWidth,
      (frameHeight * 0.85) / img.naturalHeight,
    );
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = (frameWidth - drawW) / 2;
    const drawY = (frameHeight - drawH) / 2;
    frameCtx.drawImage(img, drawX, drawY, drawW, drawH);
  };

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeAction,
    width: number,
    height: number,
  ) => {
    if (stroke.points.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const [firstPoint, ...restPoints] = stroke.points;
    ctx.moveTo(firstPoint.x * width, firstPoint.y * height);
    if (restPoints.length === 0) {
      ctx.lineTo(firstPoint.x * width + 0.1, firstPoint.y * height + 0.1);
    } else {
      restPoints.forEach((point) => {
        ctx.lineTo(point.x * width, point.y * height);
      });
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawFill = (ctx: CanvasRenderingContext2D, fill: FillAction) => {
    const frameCtx = frameContextRef.current;
    if (!frameCtx) return;

    const { canvas } = ctx;
    const w = canvas.width;
    const h = canvas.height;
    const n = w * h;

    const framePixels = frameCtx.getImageData(0, 0, w, h).data;
    const drawPixels = ctx.getImageData(0, 0, w, h).data;

    // Walls = fish outline (any frame pixel with alpha > 0) OR existing strokes/fills
    const wall = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (framePixels[i * 4 + 3] > 0 || drawPixels[i * 4 + 3] > 10) wall[i] = 1;
    }

    // BFS from all canvas border pixels to mark every transparent region
    // reachable from outside — these are "outside the fish outline"
    const outside = new Uint8Array(n);
    const q: number[] = [];

    const seed = (p: number) => {
      if (!wall[p] && !outside[p]) { outside[p] = 1; q.push(p); }
    };
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
    for (let y = 1; y < h - 1; y++) { seed(y * w); seed(y * w + w - 1); }

    for (let qi = 0; qi < q.length; qi++) {
      const p = q[qi];
      const x = p % w, y = (p / w) | 0;
      if (x > 0)     { const np = p - 1; if (!wall[np] && !outside[np]) { outside[np] = 1; q.push(np); } }
      if (x < w - 1) { const np = p + 1; if (!wall[np] && !outside[np]) { outside[np] = 1; q.push(np); } }
      if (y > 0)     { const np = p - w; if (!wall[np] && !outside[np]) { outside[np] = 1; q.push(np); } }
      if (y < h - 1) { const np = p + w; if (!wall[np] && !outside[np]) { outside[np] = 1; q.push(np); } }
    }

    // Click position in physical pixels (fill.x/y are relative 0–1 of CSS canvas)
    const startX = Math.max(0, Math.min(w - 1, Math.round(fill.x * w)));
    const startY = Math.max(0, Math.min(h - 1, Math.round(fill.y * h)));
    const startP = startY * w + startX;

    // Reject if clicked on the outline, an existing stroke, or outside the fish
    if (wall[startP] || outside[startP]) return;

    // DFS flood fill through the fish interior, bounded by walls and strokes
    const filled = new Uint8Array(n);
    const stack: number[] = [startP];
    filled[startP] = 1;

    while (stack.length > 0) {
      const p = stack.pop()!;
      const x = p % w, y = (p / w) | 0;
      const check = (np: number) => {
        if (!filled[np] && !wall[np] && !outside[np]) { filled[np] = 1; stack.push(np); }
      };
      if (x > 0)     check(p - 1);
      if (x < w - 1) check(p + 1);
      if (y > 0)     check(p - w);
      if (y < h - 1) check(p + w);
    }

    // Parse #rrggbb
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
  };

  const drawErase = (
    ctx: CanvasRenderingContext2D,
    erase: EraseAction,
    width: number,
    height: number,
  ) => {
    if (erase.points.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = erase.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const [firstPoint, ...restPoints] = erase.points;
    ctx.moveTo(firstPoint.x * width, firstPoint.y * height);
    if (restPoints.length === 0) {
      ctx.lineTo(firstPoint.x * width + 0.1, firstPoint.y * height + 0.1);
    } else {
      restPoints.forEach((point) => {
        ctx.lineTo(point.x * width, point.y * height);
      });
    }
    ctx.stroke();
    ctx.restore();
  };

  const redrawCanvas = (actions: DrawAction[]) => {
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actions.forEach((action) => {
      if (action.type === "fill") {
        drawFill(ctx, action);
      } else if (action.type === "erase") {
        drawErase(ctx, action, width, height);
      } else {
        drawStroke(ctx, action, width, height);
      }
    });
  };

  const setActions = (actions: DrawAction[]) => {
    actionsRef.current = actions;
    setHasDrawing(actions.length > 0);
    redrawCanvas(actions);
  };

  const commitActions = (actions: DrawAction[]) => {
    const nextActions = cloneActions(actions);
    setActions(nextActions);
    historyRef.current.push(cloneActions(nextActions));
    redoHistoryRef.current = [];
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(false);
  };

  useEffect(() => {
    const drawCanvas = drawCanvasRef.current;
    const frameCanvas = frameCanvasRef.current;
    if (!drawCanvas || !frameCanvas) return;
    const drawCtx = drawCanvas.getContext("2d");
    const frameCtx = frameCanvas.getContext("2d");
    if (!drawCtx || !frameCtx) return;
    contextRef.current = drawCtx;
    frameContextRef.current = frameCtx;

    const resizeCanvas = () => {
      const { width, height } = drawCanvas.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      drawCanvas.width = Math.round(width * ratio);
      drawCanvas.height = Math.round(height * ratio);
      frameCanvas.width = Math.round(width * ratio);
      frameCanvas.height = Math.round(height * ratio);
      drawCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      frameCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      updateFrame(width, height);
      redrawCanvas(actionsRef.current);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(drawCanvas);
    resizeCanvas();

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const template =
      FISH_TEMPLATES.find((t) => t.id === selectedTemplateId) ??
      FISH_TEMPLATES[0];
    const img = new Image();
    img.onload = () => {
      templateImageRef.current = img;
      window.requestAnimationFrame(() => {
        updateFrame();
        redrawCanvas(actionsRef.current);
      });
    };
    img.src = template.imageUrl;
  }, [selectedTemplateId]);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const getRelativePoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const getDistanceToSegment = (
    point: Point,
    segmentStart: Point,
    segmentEnd: Point,
  ) => {
    const dx = segmentEnd.x - segmentStart.x;
    const dy = segmentEnd.y - segmentStart.y;

    if (dx === 0 && dy === 0) {
      return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y);
    }

    const projection =
      ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) /
      (dx * dx + dy * dy);
    const t = Math.max(0, Math.min(1, projection));
    const closestX = segmentStart.x + dx * t;
    const closestY = segmentStart.y + dy * t;

    return Math.hypot(point.x - closestX, point.y - closestY);
  };

  const isPointNearStroke = (
    point: Point,
    stroke: StrokeAction,
    width: number,
    height: number,
    threshold: number,
  ) => {
    if (stroke.points.length === 0) return false;

    const scaledPoints = stroke.points.map((strokePoint) => ({
      x: strokePoint.x * width,
      y: strokePoint.y * height,
    }));

    if (scaledPoints.length === 1) {
      return (
        Math.hypot(point.x - scaledPoints[0].x, point.y - scaledPoints[0].y) <=
        threshold
      );
    }

    for (let index = 1; index < scaledPoints.length; index += 1) {
      const segmentStart = scaledPoints[index - 1];
      const segmentEnd = scaledPoints[index];
      if (getDistanceToSegment(point, segmentStart, segmentEnd) <= threshold) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000");

    socketRef.current.onopen = () => {
      console.log("✅연결됨");
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const applyTool = (ctx: CanvasRenderingContext2D) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = penSize;
  };

  const resetDrawing = () => {
    currentStrokeRef.current = null;
    setActions([]);
    historyRef.current = [[]];
    redoHistoryRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
    setDrawError(false);
  };

  const flashError = (setter: (value: boolean) => void) => {
    setter(true);
    window.setTimeout(() => setter(false), 600);
  };

  const handleFill = (rx: number, ry: number) => {
    commitActions([
      ...actionsRef.current,
      { type: "fill", color, x: rx, y: ry },
    ]);
  };

  const findActionIndexAtPoint = (x: number, y: number) => {
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    const frameCtx = frameContextRef.current;
    if (!canvas || !ctx) return -1;
    const { width, height } = canvas.getBoundingClientRect();
    let lastFillIndex = -1;
    const isInsideFillShape = (() => {
      if (!frameCtx) return false;
      const ratio = window.devicePixelRatio || 1;
      try {
        const pixel = frameCtx.getImageData(
          Math.round(x * ratio),
          Math.round(y * ratio),
          1,
          1,
        );
        return pixel.data[3] > 10;
      } catch {
        return false;
      }
    })();

    for (let index = actionsRef.current.length - 1; index >= 0; index -= 1) {
      const action = actionsRef.current[index];

      if (action.type === "fill") {
        if (isInsideFillShape && lastFillIndex === -1) {
          lastFillIndex = index;
        }
        continue;
      }
      if (action.type === "erase") {
        continue;
      }

      const hitThreshold = Math.max(action.size * 0.5 + 6, eraserSize * 0.7);
      if (isPointNearStroke({ x, y }, action, width, height, hitThreshold)) {
        return index;
      }
    }

    return lastFillIndex;
  };

  const handleEraseAction = (event: PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getPoint(event);
    if (eraserMode === "stroke") {
      const actionIndex = findActionIndexAtPoint(x, y);
      if (actionIndex < 0) return;
      const nextActions = actionsRef.current.filter(
        (_, index) => index !== actionIndex,
      );
      commitActions(nextActions);
      return;
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (step !== "draw") return;
    if (tool === "fill") {
      const { x: rx, y: ry } = getRelativePoint(event);
      handleFill(rx, ry);
      return;
    }
    if (tool === "eraser") {
      const canvas = drawCanvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx) return;
      isErasingRef.current = true;
      canvas.setPointerCapture(event.pointerId);
      if (eraserMode === "brush") {
        const { x, y } = getPoint(event);
        const startPoint = getRelativePoint(event);
        currentEraseRef.current = {
          type: "erase",
          size: eraserSize,
          points: [startPoint],
        };
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = eraserSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.1, y + 0.1);
        ctx.stroke();
        setHasDrawing(true);
        return;
      }
      handleEraseAction(event);
      return;
    }
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(event);
    const startPoint = getRelativePoint(event);
    currentStrokeRef.current = {
      type: "stroke",
      color,
      size: penSize,
      points: [startPoint],
    };
    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    applyTool(ctx);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    setHasDrawing(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (isErasingRef.current) {
      if (eraserMode === "brush") {
        const ctx = contextRef.current;
        if (!ctx) return;
        const { x, y } = getPoint(event);
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = eraserSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        currentEraseRef.current?.points.push(getRelativePoint(event));
        ctx.lineTo(x, y);
        ctx.stroke();
        return;
      }
      handleEraseAction(event);
      return;
    }
    if (!isDrawingRef.current) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    const { x, y } = getPoint(event);
    currentStrokeRef.current?.points.push(getRelativePoint(event));
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas) return;
    if (isErasingRef.current) {
      isErasingRef.current = false;
      if (eraserMode === "brush" && currentEraseRef.current) {
        const ctx = contextRef.current;
        if (ctx) {
          ctx.closePath();
          ctx.globalCompositeOperation = "source-over";
        }
        commitActions([...actionsRef.current, currentEraseRef.current]);
        currentEraseRef.current = null;
      }
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      return;
    }
    if (!ctx) return;
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    ctx.closePath();
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (currentStrokeRef.current) {
      commitActions([...actionsRef.current, currentStrokeRef.current]);
      currentStrokeRef.current = null;
    }
  };

  const exportImage = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return null;

    // 사용자가 그린 선(drawCanvas)만
    exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    return exportCanvas.toDataURL("image/png");
  };

  const handleCompleteDrawing = () => {
    console.log("🔥 hasDrawing:", hasDrawing);
    if (!hasDrawing) {
      flashError(setDrawError);
      return;
    }
    const image = exportImage();
    if (!image) {
      flashError(setDrawError);
      return;
    }
    setDraftImage(image);
    setStep("name");
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.slice(0, MAX_NAME);
    setName(value);
    setNameError(false);
    setSubmitError(false);
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value.slice(0, MAX_MESSAGE);
    setMessage(value);
    setMessageError(false);
    setSubmitError(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (step !== "draw") return;
    setSelectedTemplateId(templateId);
    resetDrawing();
    setTool("pen");
  };

  const handleBrushSizeChange = (value: number) => {
    if (tool === "eraser") {
      setEraserSize(value);
    } else if (tool === "pen") {
      setPenSize(value);
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop();
    if (current) {
      redoHistoryRef.current.push(cloneActions(current));
    }
    const previous = historyRef.current[historyRef.current.length - 1] ?? [];
    setActions(cloneActions(previous));
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(redoHistoryRef.current.length > 0);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const next = redoHistoryRef.current.pop();
    if (!next) return;
    const restored = cloneActions(next);
    historyRef.current.push(cloneActions(restored));
    setActions(restored);
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(redoHistoryRef.current.length > 0);
  };

  const nameLength = name.trim().length;
  const isNameValid = nameLength >= MIN_NAME && nameLength <= MAX_NAME;
  const isMessageValid = message.trim().length > 0;

  const handleSubmit = async () => {
    if (!draftImage) {
      setStep("draw");
      return;
    }

    if (!isNameValid) {
      flashError(setNameError);
      return;
    }

    if (!isMessageValid) {
      flashError(setMessageError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const trimmedName = name.trim();
      const trimmedMessage = message.trim();
      const savedFish = await postFish({
        name: trimmedName,
        image: draftImage,
        message: trimmedMessage,
      });

      socketRef.current?.send(
        JSON.stringify({
          type: "NEW_FISH",
          data: {
            ...savedFish,
            name: trimmedName,
            message: trimmedMessage,
          },
        }),
      );

      setStep("sent");
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppWrapper>
      {bubbles.map((bubble) => (
        <AppBubble
          key={bubble.id}
          style={
            {
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              "--bubble-peak": bubble.peakOpacity,
            } as CSSProperties
          }
        />
      ))}

      {step === "draw" && (
        <DrawScreen
          tool={tool}
          eraserMode={eraserMode}
          color={color}
          colors={COLORS}
          customColor={customColor}
          templates={FISH_TEMPLATES}
          selectedTemplateId={selectedTemplateId}
          canUndo={canUndo}
          canRedo={canRedo}
          drawError={drawError}
          brushSize={tool === "eraser" ? eraserSize : penSize}
          brushMin={BRUSH_MIN}
          brushMax={BRUSH_MAX}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onToolChange={setTool}
          onEraserModeChange={setEraserMode}
          onColorChange={(value) => {
            setColor(value);
            setCustomColor(value);
            if (tool === "eraser") {
              setTool("pen");
            }
          }}
          onCustomColorChange={(value) => {
            setCustomColor(value);
            setColor(value);
            if (tool === "eraser") {
              setTool("pen");
            }
          }}
          onBrushSizeChange={handleBrushSizeChange}
          onSelectTemplate={handleTemplateSelect}
          onComplete={handleCompleteDrawing}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          drawCanvasRef={drawCanvasRef}
          frameCanvasRef={frameCanvasRef}
        />
      )}

      {step === "name" && (
        <NameScreen
          draftImage={draftImage}
          name={name}
          message={message}
          nameError={nameError}
          messageError={messageError}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onNameChange={handleNameChange}
          onMessageChange={handleMessageChange}
          onSubmit={handleSubmit}
        />
      )}

      {step === "sent" && <SentScreen />}
    </AppWrapper>
  );
}

export default App;
