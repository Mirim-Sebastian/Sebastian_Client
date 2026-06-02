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

const toastIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

// ─── Components ───────────────────────────────────────────────────────────────

export const AppWrapper = styled.div`
  min-height: 100vh;
  overflow: hidden;
  padding: 14px 8px 50px;
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
    background: rgba(0, 0, 0, 0.18);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    padding: 12px 8px 20px;
  }
`;

export const AppToast = styled.div`
  position: fixed;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  padding: 13px 26px;
  border-radius: 14px;
  background: rgba(8, 26, 50, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  box-shadow: 0 8px 32px rgba(2, 8, 20, 0.45);
  color: rgba(230, 240, 255, 0.92);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  pointer-events: none;
  animation: ${toastIn} 0.22s ease;
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
