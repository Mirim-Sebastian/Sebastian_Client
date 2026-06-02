import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { postFish } from "./api/fish";
import { DrawScreen } from "./components/DrawScreen";
import { NameScreen, type FishSize } from "./components/NameScreen";
import { SentScreen } from "./components/SentScreen";
import { BrandBar } from "./components/BrandBar";
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
import { AppWrapper, AppBubble, AppToast } from "./App.styles";
import {
  type DrawAction,
  type EraseAction,
  type StrokeAction,
  cloneActions,
  checkFishCoverage,
  drawErase,
  drawFill,
  drawStroke,
  isPointNearStroke,
} from "./utils/canvas";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "draw" | "name" | "sent";

type Bubble = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  peakOpacity: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const APP_BUBBLE_COUNT = 18;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

function App() {
  // Canvas refs
  const drawCanvasRef     = useRef<HTMLCanvasElement | null>(null);
  const frameCanvasRef    = useRef<HTMLCanvasElement | null>(null);
  const strokesCanvasRef  = useRef<HTMLCanvasElement | null>(null);
  const contextRef        = useRef<CanvasRenderingContext2D | null>(null);
  const frameContextRef   = useRef<CanvasRenderingContext2D | null>(null);
  const strokesContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const templateImageRef  = useRef<HTMLImageElement | null>(null);

  // Drawing state refs
  const isDrawingRef     = useRef(false);
  const isErasingRef     = useRef(false);
  const hasDrawingRef    = useRef(false);
  const actionsRef       = useRef<DrawAction[]>([]);
  const currentStrokeRef = useRef<StrokeAction | null>(null);
  const currentEraseRef  = useRef<EraseAction | null>(null);
  const historyRef       = useRef<DrawAction[][]>([[]]);
  const redoHistoryRef   = useRef<DrawAction[][]>([]);

  // UI state
  const [step, setStep]               = useState<Step>("draw");
  const [tool, setTool]               = useState<"pen" | "eraser" | "fill">("pen");
  const [eraserMode, setEraserMode]   = useState<"stroke" | "brush">("stroke");
  const [color, setColor]             = useState(COLORS[0].value);
  const [customColor, setCustomColor] = useState(COLORS[0].value);
  const [colorSource, setColorSource] = useState<"palette" | "custom">("palette");
  const [penSize, setPenSize]         = useState(PEN_SIZE_DEFAULT);
  const [eraserSize, setEraserSize]   = useState(ERASER_SIZE_DEFAULT);
  const [hasDrawing, setHasDrawing]   = useState(false);
  const [draftImage, setDraftImage]   = useState<string | null>(null);
  const [name, setName]               = useState("");
  const [message, setMessage]         = useState("");
  const [fishSize, setFishSize]       = useState<FishSize>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawError, setDrawError]     = useState(false);
  const [canvasHint, setCanvasHint]   = useState<string | null>(null);
  const [nameError, setNameError]     = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(FISH_TEMPLATES[0].id);
  const [canUndo, setCanUndo]         = useState(false);
  const [canRedo, setCanRedo]         = useState(false);
  const [bubbles]                     = useState<Bubble[]>(generateBubbles);

  useEffect(() => { hasDrawingRef.current = hasDrawing; }, [hasDrawing]);

  // ─── Canvas helpers ──────────────────────────────────────────────────────────

  const updateFrame = (width?: number, height?: number) => {
    const frameCanvas = frameCanvasRef.current;
    const frameCtx    = frameContextRef.current;
    const drawCanvas  = drawCanvasRef.current;
    if (!frameCanvas || !frameCtx || !drawCanvas) return;
    const rect = drawCanvas.getBoundingClientRect();
    const w = width ?? rect.width;
    const h = height ?? rect.height;
    const img = templateImageRef.current;
    frameCtx.clearRect(0, 0, w, h);
    if (!img?.complete || !img.naturalWidth) return;
    const scale = Math.min((w * 0.85) / img.naturalWidth, (h * 0.85) / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    frameCtx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  const redrawCanvas = (actions: DrawAction[]) => {
    const canvas     = drawCanvasRef.current;
    const ctx        = contextRef.current;
    const frameCtx   = frameContextRef.current;
    const strokesCtx = strokesContextRef.current;
    if (!canvas || !ctx || !frameCtx || !strokesCtx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesCtx.clearRect(0, 0, canvas.width, canvas.height);
    for (const action of actions) {
      if (action.type === "fill") {
        drawFill(ctx, action, frameCtx, strokesCtx);
      } else if (action.type === "erase") {
        drawErase(ctx, action, width, height);
        drawErase(strokesCtx, action, width, height);
      } else {
        drawStroke(ctx, action, width, height);
        drawStroke(strokesCtx, action, width, height);
      }
    }
  };

  const setActions = (actions: DrawAction[]) => {
    actionsRef.current = actions;
    setHasDrawing(actions.length > 0);
    redrawCanvas(actions);
  };

  const MAX_HISTORY = 30;

  const commitActions = (actions: DrawAction[]) => {
    const next = cloneActions(actions);
    setActions(next);
    setCanvasHint(null);
    historyRef.current.push(cloneActions(next));
    if (historyRef.current.length > MAX_HISTORY + 1) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY - 1);
    }
    redoHistoryRef.current = [];
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(false);
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

  const flashError = (setter: (v: boolean) => void) => {
    setter(true);
    window.setTimeout(() => setter(false), 600);
  };

  // ─── Pointer helpers ─────────────────────────────────────────────────────────

  const getPoint = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getRelativePoint = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const findActionIndexAtPoint = (x: number, y: number): number => {
    const canvas   = drawCanvasRef.current;
    const ctx      = contextRef.current;
    const frameCtx = frameContextRef.current;
    if (!canvas || !ctx) return -1;
    const { width, height } = canvas.getBoundingClientRect();
    let lastFillIndex = -1;

    const isInsideFillShape = (() => {
      if (!frameCtx) return false;
      const ratio = window.devicePixelRatio || 1;
      try {
        const pixel = frameCtx.getImageData(Math.round(x * ratio), Math.round(y * ratio), 1, 1);
        return pixel.data[3] > 10;
      } catch { return false; }
    })();

    for (let i = actionsRef.current.length - 1; i >= 0; i--) {
      const action = actionsRef.current[i];
      if (action.type === "fill") {
        if (isInsideFillShape && lastFillIndex === -1) lastFillIndex = i;
        continue;
      }
      if (action.type === "erase") continue;
      const threshold = Math.max(action.size * 0.5 + 6, eraserSize * 0.7);
      if (isPointNearStroke({ x, y }, action, width, height, threshold)) return i;
    }
    return lastFillIndex;
  };

  // ─── Draw event handlers ─────────────────────────────────────────────────────

  const handleEraseAction = (e: PointerEvent<HTMLCanvasElement>) => {
    if (eraserMode !== "stroke") return;
    const { x, y } = getPoint(e);
    const idx = findActionIndexAtPoint(x, y);
    if (idx < 0) return;
    commitActions(actionsRef.current.filter((_, i) => i !== idx));
  };

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (step !== "draw") return;
    if (tool === "fill") {
      const { x, y } = getRelativePoint(e);
      commitActions([...actionsRef.current, { type: "fill", color, x, y }]);
      return;
    }
    const canvas = drawCanvasRef.current;
    const ctx    = contextRef.current;
    if (!canvas || !ctx) return;

    if (tool === "eraser") {
      isErasingRef.current = true;
      canvas.setPointerCapture(e.pointerId);
      if (eraserMode === "brush") {
        const { x, y } = getPoint(e);
        currentEraseRef.current = { type: "erase", size: eraserSize, points: [getRelativePoint(e)] };
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = eraserSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.1, y + 0.1);
        ctx.stroke();
        setHasDrawing(true);
      } else {
        handleEraseAction(e);
      }
      return;
    }

    const { x, y } = getPoint(e);
    currentStrokeRef.current = { type: "stroke", color, size: penSize, points: [getRelativePoint(e)] };
    isDrawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    setHasDrawing(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (isErasingRef.current) {
      if (eraserMode === "brush") {
        const ctx = contextRef.current;
        if (!ctx) return;
        const { x, y } = getPoint(e);
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = eraserSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        currentEraseRef.current?.points.push(getRelativePoint(e));
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        handleEraseAction(e);
      }
      return;
    }
    if (!isDrawingRef.current) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    const { x, y } = getPoint(e);
    currentStrokeRef.current?.points.push(getRelativePoint(e));
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    const ctx    = contextRef.current;
    if (!canvas) return;

    if (isErasingRef.current) {
      isErasingRef.current = false;
      if (eraserMode === "brush" && currentEraseRef.current) {
        if (ctx) { ctx.closePath(); ctx.globalCompositeOperation = "source-over"; }
        commitActions([...actionsRef.current, currentEraseRef.current]);
        currentEraseRef.current = null;
      }
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      return;
    }

    if (!ctx || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    ctx.closePath();
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (currentStrokeRef.current) {
      commitActions([...actionsRef.current, currentStrokeRef.current]);
      currentStrokeRef.current = null;
    }
  };

  // ─── History ─────────────────────────────────────────────────────────────────

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop();
    if (current) redoHistoryRef.current.push(cloneActions(current));
    const prev = historyRef.current[historyRef.current.length - 1] ?? [];
    setActions(cloneActions(prev));
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

  // ─── Navigation & submission ──────────────────────────────────────────────────

  const exportImage = (): string | null => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width  = w;
    exportCanvas.height = h;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(canvas, 0, 0, w, h);
    const webp = exportCanvas.toDataURL("image/webp", 0.85);
    return webp.startsWith("data:image/webp") ? webp : exportCanvas.toDataURL("image/png");
  };

  const handleCompleteDrawing = () => {
    if (actionsRef.current.length === 0) {
      flashError(setDrawError);
      setCanvasHint("물고기를 그려주세요");
      return;
    }
    const canvas   = drawCanvasRef.current;
    const ctx      = contextRef.current;
    const frameCtx = frameContextRef.current;
    if (selectedTemplateId !== "free" && canvas && ctx && frameCtx && checkFishCoverage(canvas, ctx, frameCtx) < 0.5) {
      flashError(setDrawError);
      setCanvasHint("그림틀의 50% 이상을 채워주세요");
      return;
    }
    const image = exportImage();
    if (!image) { flashError(setDrawError); return; }
    setCanvasHint(null);
    setDraftImage(image);
    setStep("name");
  };

  const handleSubmit = async () => {
    if (!draftImage) { setStep("draw"); return; }
    const nameLen = name.trim().length;
    if (!(nameLen >= MIN_NAME && nameLen <= MAX_NAME) || !message.trim()) {
      if (!(nameLen >= MIN_NAME && nameLen <= MAX_NAME)) flashError(setNameError);
      if (!message.trim()) flashError(setMessageError);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      await postFish({ name: name.trim(), image: draftImage, message: message.trim(), size: fishSize });
      setStep("sent");
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSentDone = () => {
    setStep("draw");
    setName(""); setMessage(""); setFishSize("medium"); setDraftImage(null);
    resetDrawing();
    setNameError(false); setMessageError(false); setSubmitError(false);
  };

  // ─── Field handlers ───────────────────────────────────────────────────────────

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.slice(0, MAX_NAME));
    setNameError(false);
    setSubmitError(false);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, MAX_MESSAGE));
    setMessageError(false);
    setSubmitError(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (step !== "draw") return;
    setSelectedTemplateId(templateId);
    setTool("pen");
  };

  const handleBrushSizeChange = (value: number) => {
    if (tool === "eraser") setEraserSize(value);
    else if (tool === "pen") setPenSize(value);
  };

  const handleColorChange = (value: string) => {
    setColor(value);
    setColorSource("palette");
    if (tool === "eraser") setTool("pen");
  };

  const handleCustomColorChange = (value: string) => {
    setColor(value);
    setCustomColor(value);
    setColorSource("custom");
    if (tool === "eraser") setTool("pen");
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const drawCanvas  = drawCanvasRef.current;
    const frameCanvas = frameCanvasRef.current;
    if (!drawCanvas || !frameCanvas) return;
    const drawCtx  = drawCanvas.getContext("2d");
    const frameCtx = frameCanvas.getContext("2d");
    if (!drawCtx || !frameCtx) return;
    contextRef.current = drawCtx;
    frameContextRef.current = frameCtx;

    // Off-screen canvas holds only strokes/erases (no fills)
    // so that subsequent fills in the same region work correctly
    const strokesCanvas = document.createElement("canvas");
    const strokesCtx = strokesCanvas.getContext("2d");
    if (!strokesCtx) return;
    strokesCanvasRef.current = strokesCanvas;
    strokesContextRef.current = strokesCtx;

    const resizeCanvas = () => {
      const { width, height } = drawCanvas.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      for (const [c, ctx] of [
        [drawCanvas, drawCtx] as const,
        [frameCanvas, frameCtx] as const,
        [strokesCanvas, strokesCtx] as const,
      ]) {
        c.width  = Math.round(width * ratio);
        c.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      updateFrame(width, height);
      redrawCanvas(actionsRef.current);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(drawCanvas);
    resizeCanvas();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const template = FISH_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? FISH_TEMPLATES[0];
    if (!template.imageUrl) {
      templateImageRef.current = null;
      window.requestAnimationFrame(() => { updateFrame(); redrawCanvas(actionsRef.current); });
      return;
    }
    const img = new Image();
    img.onload = () => {
      templateImageRef.current = img;
      window.requestAnimationFrame(() => { updateFrame(); redrawCanvas(actionsRef.current); });
    };
    img.src = template.imageUrl;
  }, [selectedTemplateId]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AppWrapper>
      {bubbles.map((b) => (
        <AppBubble
          key={b.id}
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--bubble-peak": b.peakOpacity,
          } as CSSProperties}
        />
      ))}

      {canvasHint && <AppToast>{canvasHint}</AppToast>}

      {step !== "sent" && <BrandBar step={step} />}

      <div style={{ position: "relative", width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* DrawScreen 항상 마운트 유지 (캔버스 보존) */}
        <motion.div
          style={{ position: "absolute", width: "100%", display: "flex", justifyContent: "center" }}
          animate={{
            opacity: step === "draw" ? 1 : 0,
            pointerEvents: step === "draw" ? "auto" : "none",
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
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
            colorSource={colorSource}
            onColorChange={handleColorChange}
            onCustomColorChange={handleCustomColorChange}
            onBrushSizeChange={handleBrushSizeChange}
            onSelectTemplate={handleTemplateSelect}
            onReset={resetDrawing}
            onComplete={handleCompleteDrawing}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            drawCanvasRef={drawCanvasRef}
            frameCanvasRef={frameCanvasRef}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ position: "absolute", width: "100%", display: "flex", justifyContent: "center" }}
            >
              <NameScreen
                draftImage={draftImage}
                name={name}
                message={message}
                fishSize={fishSize}
                nameError={nameError}
                messageError={messageError}
                submitError={submitError}
                isSubmitting={isSubmitting}
                onNameChange={handleNameChange}
                onMessageChange={handleMessageChange}
                onFishSizeChange={setFishSize}
                onBack={() => setStep("draw")}
                onSubmit={handleSubmit}
              />
            </motion.div>
          )}
          {step === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ position: "absolute", width: "100%", display: "flex", justifyContent: "center" }}
            >
              <SentScreen onDone={handleSentDone} draftImage={draftImage} name={name} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppWrapper>
  );
}

export default App;
