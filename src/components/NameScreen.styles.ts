import styled, { keyframes, css } from "styled-components";
import { BaseScreen, shake, spin } from "./ui.styles";

// ─── Accent (블루로 확정) ──────────────────────────────────────────────────────
const BLUE = "#ffffff";
const BLUE_RGB = "255, 255, 255";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const floaty = keyframes`
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50%      { transform: translateY(-14px) rotate(1.5deg); }
`;
const causticShift = keyframes`
  from { transform: translate(-12px, -6px) scale(1); }
  to   { transform: translate(14px, 10px) scale(1.06); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
export const Screen = styled(BaseScreen)`
  display: grid;
  grid-template-columns: 1.32fr 1fr;
  gap: clamp(8px, 1.6vw, 20px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

// ─── 표본 수조 (좌측) ───────────────────────────────────────────────────────────
export const Tank = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  background: rgba(9, 28, 54, 0.18);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 60px rgba(0, 0, 0, 0.35),
    0 30px 70px rgba(2, 8, 20, 0.4);

  @media (max-width: 900px) {
    height: clamp(180px, 42vw, 260px);
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Specimen = styled.div`
  position: absolute;
  left: 22px;
  top: 20px;
  z-index: 4;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: rgba(234, 242, 255, 0.34);
  text-transform: uppercase;
`;

export const FishStage = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
`;

export const Caustic = styled.div`
  position: absolute;
  inset: -20%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
  background:
    radial-gradient(
      40% 30% at 30% 20%,
      rgba(120, 200, 255, 0.16),
      transparent 70%
    ),
    radial-gradient(
      35% 25% at 72% 36%,
      rgba(120, 200, 255, 0.12),
      transparent 70%
    );
  animation: ${causticShift} 9s ease-in-out infinite alternate;
`;

export const FishImg = styled.img<{ $fishSize?: "small" | "medium" | "large" }>`
  position: relative;
  z-index: 2;
  width: ${({ $fishSize }) =>
    $fishSize === "small" ? "38%" : $fishSize === "large" ? "82%" : "60%"};
  max-height: ${({ $fishSize }) =>
    $fishSize === "small" ? "42%" : $fishSize === "large" ? "84%" : "62%"};
  object-fit: contain;
  animation: ${floaty} 4s ease-in-out infinite;
  filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.55));
  transition:
    width 0.3s ease,
    max-height 0.3s ease;
`;

export const TankFloor = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38%;
  z-index: 1;
  background: linear-gradient(180deg, transparent, rgba(${BLUE_RGB}, 0.06));
`;

// ─── 명패 (우측) ────────────────────────────────────────────────────────────────
export const Placard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 2.2vw, 56px) clamp(28px, 2.8vw, 68px) clamp(20px, 1.8vw, 44px);
  min-height: 0;
  border-radius: clamp(14px, 1.4vw, 26px);
  background: rgba(9, 28, 54, 0.18);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 10px 30px rgba(2, 8, 20, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  @media (max-width: 900px) {
    padding: 24px 28px 20px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px 16px;
  }
`;

export const Rule = styled.div`
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, ${BLUE}, transparent);
`;

export const Eyebrow = styled.p`
  margin: 16px 0 0;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: ${BLUE};
  text-transform: uppercase;
`;

export const Title = styled.h1`
  font-family: var(--title-font);
  margin: clamp(16px, 1.8vh, 30px) 0 clamp(12px, 1.4vh, 22px);
  font-size: clamp(20px, 2.2vw, 52px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: #f4faff;

  @media (max-width: 640px) {
    margin: 14px 0 12px;
    font-size: clamp(18px, 5.5vw, 26px);
  }
`;

export const Lead = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  color: rgba(234, 242, 255, 0.34);
  letter-spacing: 0.02em;
`;

export const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 1.6vw, 30px);
`;

export const Row = styled.div<{ $error?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 7px;
  animation: ${({ $error }) =>
    $error
      ? css`
          ${shake} 0.35s ease
        `
      : "none"};

  input,
  textarea {
    border-bottom-color: ${({ $error }) =>
      $error ? "var(--danger)" : "rgba(255, 255, 255, 0.12)"};
  }
`;

export const Label = styled.label`
  font-size: clamp(10px, 0.85vw, 15px);
  font-weight: 800;
  letter-spacing: 0.2em;
  color: rgba(234, 242, 255, 0.34);
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

export const Count = styled.span`
  letter-spacing: 0.06em;
`;

const underline = css`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.12);
  color: var(--ink);
  padding: 6px 2px;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;

  &::placeholder {
    color: rgba(234, 242, 255, 0.16);
  }
  &:focus {
    border-bottom-color: ${BLUE};
  }
  &:disabled {
    opacity: 0.6;
  }
`;

export const NameInput = styled.input`
  ${underline};
  font-size: clamp(16px, 1.5vw, 30px);
  font-weight: 600;
`;

export const MessageInput = styled.textarea`
  ${underline};
  font-family: var(--title-font);
  font-size: clamp(16px, 1.5vw, 30px);
  font-weight: 600;
  resize: none;
  line-height: 1.5;
`;

// ─── 크기 선택 ──────────────────────────────────────────────────────────────────
export const SizeSeg = styled.div`
  display: flex;
  gap: 8px;
`;

export const SizeSegButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: clamp(9px, 1vw, 18px) 0;
  border-radius: clamp(9px, 0.9vw, 16px);
  border: 1px solid
    ${({ $active }) => ($active ? BLUE : "rgba(255, 255, 255, 0.12)")};
  background: ${({ $active }) =>
    $active ? `rgba(${BLUE_RGB}, 0.14)` : "rgba(255, 255, 255, 0.03)"};
  color: ${({ $active }) => ($active ? BLUE : "rgba(234, 242, 255, 0.34)")};
  font-size: clamp(13px, 1.1vw, 21px);
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.15s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ─── 하단 액션 ───────────────────────────────────────────────────────────────────
export const Foot = styled.div`
  margin-top: auto;
  padding-top: clamp(18px, 2vh, 40px);
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1vh, 18px);
`;

export const SendButton = styled.button<{ $error?: boolean }>`
  width: 100%;
  height: clamp(52px, 5.5vh, 84px);
  border-radius: clamp(13px, 1.2vw, 20px);
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #04162e;
  font-size: clamp(15px, 1.4vw, 24px);
  font-weight: 800;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 0.8vw, 14px);
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.12s,
    box-shadow 0.2s;
  animation: ${({ $error }) =>
    $error
      ? css`
          ${shake} 0.35s ease
        `
      : "none"};

  svg {
    width: 19px;
    height: 19px;
  }
  .line-icon {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
  .spinner {
    animation: ${spin} 1s linear infinite;
  }
  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
    background: #ffffff;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const BackLink = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: rgba(234, 242, 255, 0.34);
  font-size: clamp(12px, 1.1vw, 20px);
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: clamp(4px, 0.4vh, 8px);
  cursor: pointer;

  &:not(:disabled):hover {
    color: rgba(234, 242, 255, 0.58);
  }
`;
