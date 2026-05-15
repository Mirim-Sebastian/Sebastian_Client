import styled, { keyframes } from "styled-components";
import bgOcean from "./assets/images/bg_ocean.jpg";

// ─── Keyframes ────────────────────────────────────────────────────────────────

const appBubbleUp = keyframes`
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: var(--bubble-peak, 0.7); }
  25%  { transform: translateY(-22vh) translateX(5px); opacity: var(--bubble-peak, 0.7); }
  50%  { transform: translateY(-48vh) translateX(-5px); opacity: var(--bubble-peak, 0.7); }
  75%  { transform: translateY(-72vh) translateX(4px); opacity: var(--bubble-peak, 0.7); }
  90%  { opacity: 0.15; }
  100% { transform: translateY(-105vh) translateX(0); opacity: 0; }
`;

// ─── Components ───────────────────────────────────────────────────────────────

export const AppWrapper = styled.div`
  min-height: 100vh;
  overflow: hidden;
  padding: 32px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  background-image: url(${bgOcean});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(3, 17, 37, 0.16), rgba(3, 17, 37, 0.34)),
      radial-gradient(circle at top, rgba(255, 255, 255, 0.1), transparent 28%);
    pointer-events: none;
  }
`;

export const AppBubble = styled.div`
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.75),
    rgba(255, 255, 255, 0.12)
  );
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.45),
    0 0 8px rgba(255, 255, 255, 0.18);
  animation-name: ${appBubbleUp};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
`;
