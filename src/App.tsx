import {
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
import { FISH_TEMPLATES, type FishTemplate } from "./components/fishTemplates";
import {
  BRUSH_MAX,
  BRUSH_MIN,
  CANVAS_BG,
  COLORS,
  ERASER_SIZE_DEFAULT,
  MAX_NAME,
  MIN_NAME,
  PEN_SIZE_DEFAULT,
} from "./constants";
import "./App.css";

type Step = "draw" | "name" | "sent";

function App() {
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const hasDrawingRef = useRef(false);
  const framePathRef = useRef<Path2D | null>(null);
  const historyRef = useRef<string[]>([]);
  const selectedTemplateRef = useRef(FISH_TEMPLATES[0]);

  const [step, setStep] = useState<Step>("draw");
  const [tool, setTool] = useState<"pen" | "eraser" | "fill">("pen");
  const [color, setColor] = useState(COLORS[0].value);
  const [penSize, setPenSize] = useState(PEN_SIZE_DEFAULT);
  const [eraserSize, setEraserSize] = useState(ERASER_SIZE_DEFAULT);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawError, setDrawError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    FISH_TEMPLATES[0].id,
  );
  const [canUndo, setCanUndo] = useState(false);

  const selectedTemplate =
    FISH_TEMPLATES.find((template) => template.id === selectedTemplateId) ??
    FISH_TEMPLATES[0];

  useEffect(() => {
    hasDrawingRef.current = hasDrawing;
  }, [hasDrawing]);

  useEffect(() => {
    selectedTemplateRef.current = selectedTemplate;
  }, [selectedTemplate]);

  const getTemplateSize = (
    template: FishTemplate,
    width: number,
    height: number,
  ) => {
    const { bounds } = template;
    const maxByWidth = width / bounds.width;
    const maxByHeight = height / bounds.height;
    return Math.min(maxByWidth, maxByHeight) * 0.98;
  };

  const buildTemplatePath = (
    template: FishTemplate,
    width: number,
    height: number,
    size: number,
  ) => {
    const centerX = width / 2 + template.bounds.centerOffsetX * size;
    return template.createPath(centerX, height / 2, size);
  };

  const updateFrame = (width?: number, height?: number) => {
    const frameCanvas = frameCanvasRef.current;
    const frameCtx = frameContextRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!frameCanvas || !frameCtx || !drawCanvas) return;
    const rect = drawCanvas.getBoundingClientRect();
    const frameWidth = width ?? rect.width;
    const frameHeight = height ?? rect.height;
    const baseSize = getTemplateSize(
      selectedTemplateRef.current,
      frameWidth,
      frameHeight,
    );
    const path = buildTemplatePath(
      selectedTemplateRef.current,
      frameWidth,
      frameHeight,
      baseSize,
    );
    const frameLine = 2;
    const frameInset = frameLine * 2;
    const frameSize = Math.max(0, baseSize - frameInset);
    const framePath = buildTemplatePath(
      selectedTemplateRef.current,
      frameWidth,
      frameHeight,
      frameSize,
    );
    framePathRef.current = framePath;
    frameCtx.clearRect(0, 0, frameWidth, frameHeight);
    frameCtx.strokeStyle = "rgba(230, 240, 255, 0.75)";
    frameCtx.lineWidth = frameLine;
    frameCtx.lineJoin = "round";
    frameCtx.lineCap = "round";
    frameCtx.save();
    frameCtx.clip(path);
    frameCtx.stroke(framePath);
    frameCtx.restore();
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
      const snapshot = hasDrawingRef.current
        ? drawCanvas.toDataURL("image/png")
        : null;
      drawCanvas.width = Math.round(width * ratio);
      drawCanvas.height = Math.round(height * ratio);
      frameCanvas.width = Math.round(width * ratio);
      frameCanvas.height = Math.round(height * ratio);
      drawCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      frameCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      if (snapshot) {
        const img = new Image();
        img.onload = () => {
          drawCtx.drawImage(img, 0, 0, width, height);
        };
        img.src = snapshot;
      }
      updateFrame(width, height);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(drawCanvas);
    resizeCanvas();

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => updateFrame());
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

  const applyTool = (ctx: CanvasRenderingContext2D) => {
    const size = tool === "eraser" ? eraserSize : penSize;
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
  };

  const pushHistory = (dataUrl: string) => {
    historyRef.current.push(dataUrl);
    setCanUndo(historyRef.current.length > 0);
  };

  const restoreFromSnapshot = (dataUrl?: string) => {
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!dataUrl) {
      setHasDrawing(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = dataUrl;
    setHasDrawing(true);
  };

  const resetDrawing = () => {
    restoreFromSnapshot();
    historyRef.current = [];
    setCanUndo(false);
    setDrawError(false);
  };

  const flashError = (setter: (value: boolean) => void) => {
    setter(true);
    window.setTimeout(() => setter(false), 600);
  };

  const handleFill = () => {
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    const fillPath = framePathRef.current;
    if (!canvas || !ctx || !fillPath) return;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.fill(fillPath);
    ctx.restore();
    setHasDrawing(true);
    const snapshot = canvas.toDataURL("image/png");
    pushHistory(snapshot);
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (step !== "draw") return;
    if (tool === "fill") {
      handleFill();
      return;
    }
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(event);
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
    if (!isDrawingRef.current) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    ctx.closePath();
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    const snapshot = canvas.toDataURL("image/png");
    pushHistory(snapshot);
  };

  const exportImage = () => {
    const canvas = drawCanvasRef.current;
    const frameCanvas = frameCanvasRef.current;
    if (!canvas) return null;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return null;
    exportCtx.fillStyle = CANVAS_BG;
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    if (frameCanvas) {
      exportCtx.drawImage(
        frameCanvas,
        0,
        0,
        exportCanvas.width,
        exportCanvas.height,
      );
    }
    exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    return exportCanvas.toDataURL("image/png");
  };

  const handleCompleteDrawing = () => {
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
    if (!canUndo) return;
    historyRef.current.pop();
    const previous = historyRef.current[historyRef.current.length - 1];
    restoreFromSnapshot(previous);
    setCanUndo(historyRef.current.length > 0);
  };

  const nameLength = name.trim().length;
  const isNameValid = nameLength >= MIN_NAME && nameLength <= MAX_NAME;

  const handleSubmit = async () => {
    if (!draftImage) {
      setStep("draw");
      return;
    }
    if (!isNameValid) {
      flashError(setNameError);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      await postFish({ name: name.trim(), image: draftImage });
      setStep("sent");
    } catch (error) {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      {step === "draw" && (
        <DrawScreen
          tool={tool}
          color={color}
          colors={COLORS}
          templates={FISH_TEMPLATES}
          selectedTemplateId={selectedTemplateId}
          canUndo={canUndo}
          drawError={drawError}
          brushSize={tool === "eraser" ? eraserSize : penSize}
          brushMin={BRUSH_MIN}
          brushMax={BRUSH_MAX}
          onUndo={handleUndo}
          onToolChange={setTool}
          onColorChange={(value) => {
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
          nameError={nameError}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onNameChange={handleNameChange}
          onSubmit={handleSubmit}
        />
      )}

      {step === "sent" && <SentScreen />}
    </div>
  );
}

export default App;
