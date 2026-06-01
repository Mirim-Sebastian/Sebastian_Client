import styled, { keyframes, css } from "styled-components";
import { BaseScreen, shake, spin, IconButton } from "./ui.styles";

export { IconButton } from "./ui.styles";

// ─── Accent (블루로 확정) ──────────────────────────────────────────────────────
const BLUE = "#4aa3ff";
const BLUE_DEEP = "#2f7fe0";
const BLUE_RGB = "74, 163, 255";
const ON_BLUE = "#04162e";

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
  gap: 0;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(6, 18, 40, 0.55);
  backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(2, 8, 20, 0.45);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// ─── 표본 수조 (좌측) ───────────────────────────────────────────────────────────
export const Tank = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(13, 44, 78, 0.6), rgba(3, 12, 28, 0.85));
  border-right: 1px solid rgba(255, 255, 255, 0.08);
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
    radial-gradient(40% 30% at 30% 20%, rgba(120, 200, 255, 0.16), transparent 70%),
    radial-gradient(35% 25% at 72% 36%, rgba(120, 200, 255, 0.12), transparent 70%);
  animation: ${causticShift} 9s ease-in-out infinite alternate;
`;

export const FishImg = styled.img`
  position: relative;
  z-index: 2;
  width: 60%;
  max-height: 62%;
  object-fit: contain;
  animation: ${floaty} 4s ease-in-out infinite;
  filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.55));
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
  padding: 30px 40px 26px;
  min-height: 0;
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
  margin: 12px 0 4px;
  font-size: clamp(28px, 3.4vw, 38px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: #f4faff;
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
  gap: 18px;
`;

export const Row = styled.div<{ $error?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 7px;
  animation: ${({ $error }) => ($error ? css`${shake} 0.35s ease` : "none")};

  input,
  textarea {
    border-bottom-color: ${({ $error }) =>
      $error ? "var(--danger)" : "rgba(255, 255, 255, 0.12)"};
  }
`;

export const Label = styled.label`
  font-size: 10.5px;
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
  font-family: var(--title-font);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.01em;
`;

export const MessageInput = styled.textarea`
  ${underline};
  font-size: 16px;
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
  padding: 11px 0;
  border-radius: 11px;
  border: 1px solid
    ${({ $active }) => ($active ? BLUE : "rgba(255, 255, 255, 0.12)")};
  background: ${({ $active }) =>
    $active ? `rgba(${BLUE_RGB}, 0.14)` : "rgba(255, 255, 255, 0.03)"};
  color: ${({ $active }) => ($active ? BLUE : "rgba(234, 242, 255, 0.34)")};
  font-size: 14px;
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
  padding-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SendButton = styled.button<{ $error?: boolean }>`
  width: 100%;
  height: 56px;
  border-radius: 15px;
  border: none;
  background: linear-gradient(180deg, ${BLUE}, ${BLUE_DEEP});
  color: ${ON_BLUE};
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow:
    0 14px 30px rgba(${BLUE_RGB}, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: transform 0.12s, box-shadow 0.2s;
  animation: ${({ $error }) => ($error ? css`${shake} 0.35s ease` : "none")};

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
    box-shadow: 0 18px 38px rgba(${BLUE_RGB}, 0.36);
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
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 4px;
  cursor: pointer;

  &:not(:disabled):hover {
    color: rgba(234, 242, 255, 0.58);
  }
`;
