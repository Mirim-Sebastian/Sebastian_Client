import type { PointerEvent, RefObject } from "react";
import { CheckIcon, EraserIcon, FillIcon, PenIcon, UndoIcon } from "./icons";
import type { FishTemplate } from "./fishTemplates";

type ColorOption = {
  name: string;
  value: string;
};

type DrawScreenProps = {
  tool: "pen" | "eraser" | "fill";
  color: string;
  colors: ColorOption[];
  templates: FishTemplate[];
  selectedTemplateId: string;
  canUndo: boolean;
  drawError: boolean;
  brushSize: number;
  brushMin: number;
  brushMax: number;
  onUndo: () => void;
  onToolChange: (tool: "pen" | "eraser" | "fill") => void;
  onColorChange: (value: string) => void;
  onBrushSizeChange: (value: number) => void;
  onSelectTemplate: (templateId: string) => void;
  onComplete: () => void;
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
  drawCanvasRef: RefObject<HTMLCanvasElement>;
  frameCanvasRef: RefObject<HTMLCanvasElement>;
};

export const DrawScreen = ({
  tool,
  color,
  colors,
  templates,
  selectedTemplateId,
  canUndo,
  drawError,
  brushSize,
  brushMin,
  brushMax,
  onUndo,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onSelectTemplate,
  onComplete,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  drawCanvasRef,
  frameCanvasRef,
}: DrawScreenProps) => {
  const isFill = tool === "fill";
  const sizeLabel = tool === "eraser" ? "지우개 크기" : "브러쉬 크기";

  return (
    <div className="screen draw-screen">
      <div className="controls">
        <div className="control-group">
          <button
            type="button"
            className="icon-button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="되돌리기"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            className={`icon-button ${tool === "pen" ? "active" : ""}`}
            onClick={() => onToolChange("pen")}
            aria-label="펜"
          >
            <PenIcon />
          </button>
          <button
            type="button"
            className={`icon-button ${tool === "eraser" ? "active" : ""}`}
            onClick={() => onToolChange("eraser")}
            aria-label="지우개"
          >
            <EraserIcon />
          </button>
          <button
            type="button"
            className={`icon-button ${tool === "fill" ? "active" : ""}`}
            onClick={() => onToolChange("fill")}
            aria-label="채우기"
          >
            <FillIcon />
          </button>
        </div>
        <div className="control-group palette">
          {colors.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              className={`color-dot ${color === swatch.value ? "active" : ""}`}
              style={{ backgroundColor: swatch.value }}
              onClick={() => onColorChange(swatch.value)}
              aria-label={`색상 ${swatch.name}`}
            />
          ))}
        </div>
        <div className="control-group brush">
          <label className="brush-label" htmlFor="brush-size">
            <span>{isFill ? "채우기" : sizeLabel}</span>
          </label>
          <input
            id="brush-size"
            type="range"
            min={brushMin}
            max={brushMax}
            step={1}
            value={brushSize}
            onChange={(event) => onBrushSizeChange(Number(event.target.value))}
            className="brush-range"
            aria-label={`${sizeLabel} 조절`}
            disabled={isFill}
          />
        </div>
        <div className="control-group templates">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`template-button ${
                selectedTemplateId === template.id ? "active" : ""
              }`}
              onClick={() => onSelectTemplate(template.id)}
              aria-label={`물고기 템플릿 ${template.id}`}
            >
              {template.icon}
            </button>
          ))}
          <button
            type="button"
            className="icon-button primary"
            onClick={onComplete}
            aria-label="완료"
          >
            <CheckIcon />
          </button>
        </div>
      </div>
      <div className={`canvas-wrap ${drawError ? "error" : ""}`}>
        <div className="canvas-layer">
          <canvas
            ref={drawCanvasRef}
            className="canvas drawing-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <canvas
            ref={frameCanvasRef}
            className="canvas frame-canvas"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};
