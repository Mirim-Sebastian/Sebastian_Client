import styled from "styled-components";
import { BaseScreen, shake, IconButton } from "./ui.styles";

export { IconButton };

// ─── Layout ──────────────────────────────────────────────────────────────────

export const Screen = styled(BaseScreen)`
  grid-template-rows: auto 1fr;
`;

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px 14px;
  flex-wrap: wrap;
  padding: 10px 16px;
  background: rgba(8, 26, 50, 0.62);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(2, 8, 20, 0.22);

  @media (max-width: 900px) {
    justify-content: center;
    gap: 8px 12px;
    padding: 10px 12px;
  }
`;

export const ControlDivider = styled.div`
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const ControlInnerDivider = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
`;

// ─── Control groups ───────────────────────────────────────────────────────────

export const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PaletteGroup = styled(ControlGroup)`
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 900px) {
    order: 3;
    width: 100%;
  }
`;

export const BrushGroup = styled(ControlGroup)`
  flex: 0 1 220px;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;

  @media (max-width: 900px) {
    flex: 0 1 auto;
    width: 100%;
  }
`;

export const TemplatesGroup = styled(ControlGroup)`
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
`;

// ─── Eraser mode toggle ───────────────────────────────────────────────────────

export const EraserModeGroup = styled.div<{ $hidden: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(11, 37, 67, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  align-items: center;
  align-self: flex-start;
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
  pointer-events: ${({ $hidden }) => ($hidden ? "none" : "auto")};
`;

export const ModeChip = styled.button<{ $active: boolean }>`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: ${({ $active }) => ($active ? "var(--ink)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--bg)" : "rgba(230, 240, 255, 0.84)")};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: ${({ $active }) =>
    $active ? "0 6px 16px rgba(2, 8, 20, 0.2)" : "none"};
`;

// ─── Color palette ────────────────────────────────────────────────────────────

export const ColorDot = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.65);
  box-shadow: inset 0 0 0 1px rgba(2, 16, 32, 0.4);
  cursor: pointer;
  outline-offset: 2px;
  ${({ $active }) => $active && `outline: 2px solid var(--accent);`}
`;

export const CustomColorLabel = styled.label<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.65);
  box-shadow: inset 0 0 0 1px rgba(2, 16, 32, 0.4);
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
  outline-offset: 2px;
  ${({ $active }) => $active && `outline: 2px solid var(--accent);`}

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

// ─── Template button ──────────────────────────────────────────────────────────

export const TemplateButton = styled.button<{ $active: boolean }>`
  width: 58px;
  height: 46px;
  border-radius: 13px;
  background: rgba(12, 40, 70, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  svg {
    width: 44px;
    height: 26px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  &:hover {
    background: rgba(25, 65, 108, 0.62);
    border-color: rgba(255, 255, 255, 0.3);
  }

  ${({ $active }) =>
    $active &&
    `
    background: rgba(33, 79, 129, 0.55);
    border-color: rgba(74, 163, 255, 0.55);
    box-shadow: 0 0 0 1px rgba(74, 163, 255, 0.35);
  `}
`;

// ─── Brush controls ───────────────────────────────────────────────────────────

export const BrushLabel = styled.label`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(230, 240, 255, 0.85);
`;

export const BrushValue = styled.span`
  color: #8ab7e5;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

export const BrushRange = styled.input`
  width: min(220px, 100%);
  accent-color: #214f81;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    width: 100%;
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
  animation: ${({ $error }) => ($error ? `${shake} 0.35s ease` : "none")};

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

export const DrawingCanvas = styled(BaseCanvas)<{ $fillMode: boolean }>`
  background: transparent;
  z-index: ${({ $fillMode }) => ($fillMode ? 1 : 2)};
`;

export const FrameCanvas = styled(BaseCanvas)<{ $fillMode: boolean }>`
  pointer-events: none;
  z-index: ${({ $fillMode }) => ($fillMode ? 2 : 1)};
`;
