import type { PointerEvent, RefObject } from "react";
import {
  CheckIcon,
  EraserIcon,
  EyeDropperIcon,
  FillIcon,
  PenIcon,
  RedoIcon,
  ResetIcon,
  UndoIcon,
} from "./icons";
import type { FishTemplate } from "./fishTemplates";
import {
  BrushGroup,
  BrushRange,
  BrushTrack,
  CanvasHint,
  CanvasLayer,
  CanvasWrap,
  ColorDot,
  CompleteButton,
  Controls,
  CustomColorLabel,
  DrawingCanvas,
  EraserModeGroup,
  FrameCanvas,
  IconButton,
  ModeChip,
  PaletteGroup,
  RailCard,
  RailSpacer,
  Screen,
  SizeDot,
  SizePreview,
  TemplateButton,
  TemplatesGroup,
  ToolRow,
} from "./DrawScreen.styles";

type ColorOption = {
  name: string;
  value: string;
};

type DrawScreenProps = {
  tool: "pen" | "eraser" | "fill";
  eraserMode: "stroke" | "brush";
  color: string;
  colorSource: "palette" | "custom";
  colors: ColorOption[];
  customColor: string;
  templates: FishTemplate[];
  selectedTemplateId: string;
  canUndo: boolean;
  canRedo: boolean;
  drawError: boolean;
  brushSize: number;
  brushMin: number;
  brushMax: number;
  onUndo: () => void;
  onRedo: () => void;
  onToolChange: (tool: "pen" | "eraser" | "fill") => void;
  onEraserModeChange: (mode: "stroke" | "brush") => void;
  onColorChange: (value: string) => void;
  onCustomColorChange: (value: string) => void;
  onBrushSizeChange: (value: number) => void;
  onSelectTemplate: (templateId: string) => void;
  onReset: () => void;
  onComplete: () => void;
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
  drawCanvasRef: RefObject<HTMLCanvasElement | null>;
  frameCanvasRef: RefObject<HTMLCanvasElement | null>;
};

export const DrawScreen = ({
  tool,
  eraserMode,
  color,
  colorSource,
  colors,
  customColor,
  templates,
  selectedTemplateId,
  canUndo,
  canRedo,
  drawError,
  brushSize,
  brushMin,
  brushMax,
  onUndo,
  onRedo,
  onToolChange,
  onEraserModeChange,
  onColorChange,
  onCustomColorChange,
  onBrushSizeChange,
  onSelectTemplate,
  onReset,
  onComplete,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  drawCanvasRef,
  frameCanvasRef,
}: DrawScreenProps) => {
  const isEraser = tool === "eraser";
  const isFill = tool === "fill";
  const dotPx = Math.max(6, Math.min(26, brushSize * 0.6));

  const handleEyedropperTool = async () => {
    if (!("EyeDropper" in window)) return;
    try {
      const eyeDropper = new (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper();
      const { sRGBHex } = await eyeDropper.open();
      onCustomColorChange(sRGBHex);
      onToolChange("pen");
    } catch {
      // 사용자가 취소
    }
  };

  return (
    <Screen>
      {/* 좌측 — 캔버스 수조 */}
      <CanvasWrap $error={drawError}>
        <CanvasLayer>
          <FrameCanvas ref={frameCanvasRef} aria-hidden="true" />
          <DrawingCanvas
            ref={drawCanvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ cursor: isFill ? "pointer" : "crosshair" }}
          />
        </CanvasLayer>
        {drawError && <CanvasHint>물고기를 그려주세요</CanvasHint>}
      </CanvasWrap>

      {/* 우측 — 도구 레일 */}
      <Controls role="toolbar">
        <RailCard>
          <ToolRow>
            <IconButton
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="되돌리기"
            >
              <UndoIcon />
            </IconButton>
            <IconButton
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="다시하기"
            >
              <RedoIcon />
            </IconButton>
            <IconButton type="button" onClick={onReset} aria-label="초기화">
              <ResetIcon />
            </IconButton>
            <IconButton
              type="button"
              $active={tool === "pen"}
              onClick={() => onToolChange("pen")}
              aria-label="펜"
            >
              <PenIcon />
            </IconButton>
            <IconButton
              type="button"
              $active={tool === "eraser"}
              onClick={() => onToolChange("eraser")}
              aria-label="지우개"
            >
              <EraserIcon />
            </IconButton>
            <IconButton
              type="button"
              $active={tool === "fill"}
              onClick={() => onToolChange("fill")}
              aria-label="채우기"
            >
              <FillIcon />
            </IconButton>
            {"EyeDropper" in window && (
              <IconButton
                type="button"
                onClick={handleEyedropperTool}
                aria-label="스포이드"
              >
                <EyeDropperIcon />
              </IconButton>
            )}
          </ToolRow>
        </RailCard>

        <RailCard>
          <PaletteGroup>
            {colors.map((swatch) => (
              <ColorDot
                key={swatch.value}
                type="button"
                $active={colorSource === "palette" && color === swatch.value}
                style={{ backgroundColor: swatch.value }}
                onClick={() => onColorChange(swatch.value)}
                aria-label={`색상 ${swatch.name}`}
              />
            ))}
            <CustomColorLabel
              $active={colorSource === "custom"}
              aria-label="커스텀 색상 선택"
            >
              <input
                type="color"
                value={customColor}
                onChange={(event) => onCustomColorChange(event.target.value)}
                aria-label="커스텀 색상 선택"
              />
            </CustomColorLabel>
          </PaletteGroup>
        </RailCard>

        <RailCard>
          <BrushGroup>
            <BrushTrack>
              <BrushRange
                id="brush-size"
                type="range"
                min={brushMin}
                max={brushMax}
                step={1}
                value={brushSize}
                onChange={(event) =>
                  onBrushSizeChange(Number(event.target.value))
                }
                aria-label={`${isEraser ? "지우개" : "브러쉬"} 크기 조절`}
                disabled={isFill}
              />
              <SizePreview>
                <SizeDot
                  style={{
                    width: dotPx,
                    height: dotPx,
                    background: isEraser ? "rgba(234,242,255,0.4)" : color,
                  }}
                />
              </SizePreview>
            </BrushTrack>
            {isEraser && (
              <EraserModeGroup role="group" aria-label="지우개 방식 선택">
                <ModeChip
                  type="button"
                  $active={eraserMode === "stroke"}
                  onClick={() => onEraserModeChange("stroke")}
                >
                  선으로 지우기
                </ModeChip>
                <ModeChip
                  type="button"
                  $active={eraserMode === "brush"}
                  onClick={() => onEraserModeChange("brush")}
                >
                  브러쉬로 지우기
                </ModeChip>
              </EraserModeGroup>
            )}
          </BrushGroup>
        </RailCard>

        <RailCard>
          <TemplatesGroup>
            {templates.map((template) => (
              <TemplateButton
                key={template.id}
                type="button"
                $active={selectedTemplateId === template.id}
                onClick={() => onSelectTemplate(template.id)}
                aria-label={`물고기 템플릿 ${template.id}`}
              >
                {template.icon}
              </TemplateButton>
            ))}
          </TemplatesGroup>
        </RailCard>

        <RailSpacer />

        <CompleteButton type="button" onClick={onComplete} aria-label="완료">
          <CheckIcon />
        </CompleteButton>
      </Controls>
    </Screen>
  );
};
