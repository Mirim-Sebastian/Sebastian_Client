import styled, { css } from "styled-components";
import { BaseScreen, shake, IconButton } from "./ui.styles";

export { IconButton };

// ─── Accent (블루로 확정) ──────────────────────────────────────────────────────
const BLUE = "#ffffff";
const BLUE_RGB = "255, 255, 255";

// ─── Layout : 좌(수조 캔버스) · 우(도구 레일) ───────────────────────────────────
// 사이드바는 최대 268px, 뷰포트가 좁아지면 비율에 맞게 줄어듦
export const Screen = styled(BaseScreen)`
  grid-template-columns: 1fr clamp(140px, 22vw, 268px);
  gap: clamp(8px, 1.6vw, 20px);
`;

// ─── 캔버스 수조 (좌) ────────────────────────────────────────────────────────────
export const CanvasWrap = styled.div<{ $error: boolean }>`
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  background: rgba(9, 28, 54, 0.18);
  backdrop-filter: blur(16px);
  border: 1px solid
    ${({ $error }) => ($error ? "var(--danger)" : "rgba(255, 255, 255, 0.12)")};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 60px rgba(0, 0, 0, 0.35),
    0 30px 70px rgba(2, 8, 20, 0.4);
  transition: border-color 0.2s;
  animation: ${({ $error }) =>
    $error
      ? css`
          ${shake} 0.36s ease
        `
      : "none"};

  /* height: auto 구간(≤900px)에서 캔버스가 찌그러지지 않도록 */
  @media (max-width: 900px) {
    min-height: clamp(200px, calc(100svh - 240px), 520px);
  }

  /* 유리 반사 */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    border-radius: 26px;
    background:
      linear-gradient(125deg, rgba(255, 255, 255, 0.06) 0%, transparent 22%),
      radial-gradient(
        80% 50% at 50% 0%,
        rgba(120, 200, 255, 0.06),
        transparent 60%
      );
  }
`;

export const CanvasLayer = styled.div`
  position: absolute;
  inset: 0;
`;

const BaseCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 26px;
  display: block;
`;

export const DrawingCanvas = styled(BaseCanvas)`
  z-index: 2;
  touch-action: none;
  cursor: crosshair;
`;

export const FrameCanvas = styled(BaseCanvas)`
  z-index: 1;
  pointer-events: none;
`;

export const CanvasHint = styled.div`
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 4;
  pointer-events: none;
  padding: 9px 18px;
  border-radius: 12px;
  background: rgba(6, 20, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(234, 242, 255, 0.7);
  white-space: nowrap;
`;

// ─── 도구 레일 (우) ──────────────────────────────────────────────────────────────
export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;

  ${IconButton} {
    width: 34px;
    height: 34px;
    border-radius: 9px;
  }
`;

export const RailCard = styled.div`
  background: rgba(9, 28, 54, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 9px;
  backdrop-filter: blur(16px);
  box-shadow:
    0 10px 30px rgba(2, 8, 20, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
`;

export const RailTitle = styled.p`
  margin: 0 0 7px 2px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(234, 242, 255, 0.34);
  text-transform: uppercase;
`;

export const ToolRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;

  ${IconButton} {
    width: auto;
    height: 44px;
  }
`;

export const RailSpacer = styled.div`
  flex: 1;

  @media (max-width: 900px) {
    display: none;
  }
`;

// ─── 색상 팔레트 ─────────────────────────────────────────────────────────────────
// auto-fill로 사이드바 너비에 맞게 자동 줄 바꿈
export const PaletteGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  gap: 4px;
`;

export const ColorDot = styled.button<{ $active: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  justify-self: center;
  border-radius: 50%;
  border: 2px solid
    ${({ $active }) => ($active ? "#fff" : "rgba(255, 255, 255, 0.28)")};
  box-shadow: ${({ $active }) =>
    $active
      ? `0 0 0 3px rgba(${BLUE_RGB}, 0.55), inset 0 0 0 1px rgba(2,16,32,0.3)`
      : "inset 0 0 0 1px rgba(2,16,32,0.35)"};
  transform: ${({ $active }) => ($active ? "scale(1.06)" : "none")};
  cursor: pointer;
  transition:
    transform 0.12s,
    box-shadow 0.15s,
    border-color 0.15s;
`;

export const CustomColorLabel = styled.label<{ $active: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  justify-self: center;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  display: block;
  cursor: pointer;
  border: 2px solid
    ${({ $active }) => ($active ? "#fff" : "rgba(255, 255, 255, 0.28)")};
  box-shadow: ${({ $active }) =>
    $active
      ? `0 0 0 3px rgba(${BLUE_RGB}, 0.55)`
      : "inset 0 0 0 1px rgba(2,16,32,0.35)"};
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

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

// ─── 브러쉬 굵기 ─────────────────────────────────────────────────────────────────
export const BrushGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BrushTrack = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BrushLabel = styled.label`
  display: none;
`;

export const BrushRange = styled.input`
  flex: 1;
  min-width: 0;
  accent-color: ${BLUE};
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export const SizePreview = styled.div`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
`;

export const SizeDot = styled.span`
  border-radius: 50%;
  display: block;
`;

// ─── 지우개 방식 토글 ─────────────────────────────────────────────────────────────
export const EraserModeGroup = styled.div`
  display: flex;
  gap: 4px;
`;

export const ModeChip = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 6px 0;
  border-radius: 8px;
  border: 1px solid
    ${({ $active }) => ($active ? BLUE : "rgba(255, 255, 255, 0.1)")};
  background: ${({ $active }) =>
    $active ? `rgba(${BLUE_RGB}, 0.14)` : "rgba(255, 255, 255, 0.04)"};
  color: ${({ $active }) => ($active ? BLUE : "rgba(230, 240, 255, 0.5)")};
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
`;

// ─── 물고기 틀 ───────────────────────────────────────────────────────────────────
export const TemplatesGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`;

export const TemplateButton = styled.button<{ $active: boolean }>`
  aspect-ratio: 1.35;
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? `rgba(${BLUE_RGB}, 0.12)` : "rgba(255, 255, 255, 0.04)"};
  border: 1px solid
    ${({ $active }) => ($active ? BLUE : "rgba(255, 255, 255, 0.07)")};
  display: grid;
  place-items: center;
  padding: 2px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: ${({ $active }) =>
      $active ? "brightness(0) invert(1)" : "brightness(0) invert(0.5)"};
    transition: filter 0.15s;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    img {
      filter: ${({ $active }) =>
        $active ? "brightness(0) invert(1)" : "brightness(0) invert(0.8)"};
    }
  }
`;

// ─── 완료 버튼 ───────────────────────────────────────────────────────────────────
export const CompleteButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #04162e;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.12s,
    box-shadow 0.2s;

  svg {
    width: 17px;
    height: 17px;
  }
  .line-icon {
    width: 17px;
    height: 17px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
  }
  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
    background: #ffffff;
  }
  &:active {
    transform: translateY(0);
  }
`;

// (구버전 호환용 — 더 이상 사용 안 함)
export const ControlsRow = styled.div``;
export const ControlDivider = styled.div``;
export const ControlInnerDivider = styled.div``;
export const ToolGroup = styled.div``;
export const ControlGroup = styled.div``;
export const BrushValue = styled.span``;
