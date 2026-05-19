import styled, { css } from "styled-components";
import { BaseScreen, shake, IconButton } from "./ui.styles";

export { IconButton };

// ─── Layout ──────────────────────────────────────────────────────────────────

export const Screen = styled(BaseScreen)`
  grid-template-rows: auto 1fr;
`;

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(8, 26, 50, 0.62);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(2, 8, 20, 0.22);
`;

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
`;

export const ControlDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  margin-inline: 2px;
`;

export const ControlInnerDivider = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

// ─── Control groups ───────────────────────────────────────────────────────────

export const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PaletteGroup = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 7px;
`;

export const BrushGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

export const TemplatesGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
`;

// ─── Eraser mode toggle ───────────────────────────────────────────────────────

export const EraserModeGroup = styled.div`
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
`;

export const ModeChip = styled.button<{ $active: boolean }>`
  padding: 5px 10px;
  border-radius: 7px;
  border: none;
  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.14)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--ink)" : "rgba(230, 240, 255, 0.5)"};
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
`;

// ─── Color palette ────────────────────────────────────────────────────────────

export const ColorDot = styled.button<{ $active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 2px solid
    ${({ $active }) =>
      $active ? "rgba(255,255,255,0.9)" : "rgba(255, 255, 255, 0.35)"};
  box-shadow: ${({ $active }) =>
    $active
      ? "0 0 0 2px var(--accent), inset 0 0 0 1px rgba(2,16,32,0.3)"
      : "inset 0 0 0 1px rgba(2,16,32,0.3)"};
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
`;

export const CustomColorLabel = styled.label<{ $active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 2px solid
    ${({ $active }) =>
      $active ? "rgba(255,255,255,0.9)" : "rgba(255, 255, 255, 0.35)"};
  box-shadow: ${({ $active }) =>
    $active
      ? "0 0 0 2px var(--accent), inset 0 0 0 1px rgba(2,16,32,0.3)"
      : "inset 0 0 0 1px rgba(2,16,32,0.3)"};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: block;
  flex-shrink: 0;
  background: conic-gradient(
    #ff3b3b,
    #ffb347,
    #ffe066,
    #7acb6e,
    #38d9a9,
    #4aa3ff,
    #7b6cff,
    #ff7ab6,
    #ff3b3b
  );
  transition: border-color 0.15s, box-shadow 0.15s;

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

// ─── Template button ──────────────────────────────────────────────────────────

export const TemplateButton = styled.button<{ $active: boolean }>`
  width: 52px;
  height: 38px;
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? "rgba(56, 217, 169, 0.15)" : "rgba(255, 255, 255, 0.05)"};
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(56, 217, 169, 0.5)" : "rgba(255, 255, 255, 0.1)"};
  color: ${({ $active }) => ($active ? "var(--accent)" : "rgba(230,240,255,0.6)")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  img {
    width: 38px;
    height: 22px;
    object-fit: contain;
    filter: ${({ $active }) =>
      $active ? "brightness(0) invert(0.9)" : "brightness(0) invert(0.5)"};
    transition: filter 0.15s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    img { filter: brightness(0) invert(0.85); }
  }
`;

// ─── Brush controls ───────────────────────────────────────────────────────────

export const BrushLabel = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(230, 240, 255, 0.5);
  white-space: nowrap;
`;

export const BrushValue = styled.span`
  color: rgba(230, 240, 255, 0.9);
  font-weight: 700;
  font-size: 0.82rem;
  min-width: 1.6ch;
`;

export const BrushRange = styled.input`
  width: min(160px, 100%);
  accent-color: var(--accent);
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

// ─── Canvas area ──────────────────────────────────────────────────────────────

export const CanvasWrap = styled.div<{ $error: boolean }>`
  flex: 1;
  background: rgba(8, 33, 61, 0.42);
  border-radius: 22px;
  padding: 14px;
  border: 2px solid
    ${({ $error }) => ($error ? "var(--danger)" : "rgba(255, 255, 255, 0.2)")};
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 30px 80px rgba(2, 8, 20, 0.24);
  min-height: 360px;
  backdrop-filter: blur(12px);
  animation: ${({ $error }) => ($error ? css`${shake} 0.35s ease` : "none")};

  @media (max-width: 900px) {
    min-height: 300px;
  }
`;

export const CanvasLayer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const BaseCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  display: block;
  touch-action: none;
  position: absolute;
  inset: 0;
`;

export const DrawingCanvas = styled(BaseCanvas)`
  background: transparent;
  z-index: 1;
`;

export const FrameCanvas = styled(BaseCanvas)`
  pointer-events: none;
  z-index: 2;
`;

export const CanvasHint = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(230, 240, 255, 0.55);
  letter-spacing: 0.04em;
`;