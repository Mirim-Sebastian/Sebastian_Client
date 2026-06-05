import styled, { keyframes } from "styled-components";
import bgOcean from "../assets/images/bg_ocean.jpg";

// ─── Keyframes ────────────────────────────────────────────────────────────────

const wiggle = keyframes`
  0%   { transform: scaleX(var(--fish-direction, 1)) rotate(0deg); }
  25%  { transform: scaleX(var(--fish-direction, 1)) rotate(1.5deg); }
  50%  { transform: scaleX(var(--fish-direction, 1)) rotate(0deg); }
  75%  { transform: scaleX(var(--fish-direction, 1)) rotate(-1.5deg); }
  100% { transform: scaleX(var(--fish-direction, 1)) rotate(0deg); }
`;

const clickBubbleRise = keyframes`
  0%   { opacity: 0;    transform: translate(0, 0)                            scale(0.2); }
  15%  { opacity: 0.85; transform: translate(0, -10px)                        scale(1); }
  85%  { opacity: 0.35; }
  100% { opacity: 0;    transform: translate(var(--cb-drift, 0px), -120px)    scale(0.4); }
`;

const bubblePop = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(6px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
`;

const bubbleUp = keyframes`
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: var(--bubble-peak, 0.7); }
  25%  { transform: translateY(-22vh) translateX(5px); opacity: var(--bubble-peak, 0.7); }
  50%  { transform: translateY(-48vh) translateX(-5px); opacity: var(--bubble-peak, 0.7); }
  75%  { transform: translateY(-72vh) translateX(4px); opacity: var(--bubble-peak, 0.7); }
  90%  { opacity: 0.15; }
  100% { transform: translateY(-105vh) translateX(0); opacity: 0; }
`;

// ─── Components ───────────────────────────────────────────────────────────────

export const Ocean = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-image: url(${bgOcean});
  background-size: cover;
  background-position: center;
`;

export const FishWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  cursor: grab;
  will-change: left, top;
`;

export const FishImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  animation: ${wiggle} 1.6s ease-in-out infinite;
  transform-origin: center;
  pointer-events: none;
  user-select: none;
`;

export const FishLabel = styled.span`
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-shadow:
    0 2px 1px rgba(0, 0, 0, 0.6),
    0 0 100px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
`;

export const FishSpeechBubble = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  display: inline-block;
  width: max-content;
  max-width: 220px;
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  color: #0b2b45;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
  z-index: 4;
  animation: ${bubblePop} 0.18s ease-out;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -8px;
    width: 16px;
    height: 16px;
    background: rgba(255, 255, 255, 0.94);
    transform: translateX(-50%) rotate(45deg);
  }
`;

export const SharkWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  pointer-events: none;
  transform-origin: center;
  will-change: transform;
`;

export const SharkImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
`;

export const ClickBubble = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 5;
  width: var(--cb-size, 8px);
  height: var(--cb-size, 8px);
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.9),
    rgba(180, 220, 255, 0.25)
  );
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.55),
    0 0 6px rgba(180, 220, 255, 0.2);
  animation: ${clickBubbleRise} var(--cb-duration, 1s) ease-out forwards;
  animation-delay: var(--cb-delay, 0s);
`;

export const OceanBubble = styled.div`
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.75),
    rgba(255, 255, 255, 0.12)
  );
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.45),
    0 0 8px rgba(255, 255, 255, 0.18);
  animation-name: ${bubbleUp};
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
`;

export const MagnifierOuter = styled.div`
  position: absolute;
  width: 260px;
  height: 260px;
  z-index: 20;
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active { cursor: grabbing; }
`;

/* z-index: 2 — ring sits ON TOP of handle so the border hides the join */
export const MagnifierRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 2;
  box-sizing: border-box;
  border: 9px solid #e8e0d0;
  box-shadow:
    0 0 0 3px #b09050,
    0 0 0 5px #7a6030,
    0 12px 32px rgba(0, 0, 0, 0.55),
    inset 0 2px 6px rgba(255, 255, 255, 0.35);
  pointer-events: none;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export const MagnifierGlint = styled.div`
  position: absolute;
  top: 9%;
  left: 13%;
  width: 36%;
  height: 24%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 35% 35%,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.12) 55%,
    transparent 70%
  );
  pointer-events: none;
  transform: rotate(-20deg);
`;

/* 4:30(135°) 위치, 같은 방향(SE 45°)으로 대각선 뻗는 손잡이. */
export const MagnifierHandle = styled.div`
  position: absolute;
  z-index: 1;
  width: 26px;
  height: 90px;
  border-radius: 13px;
  top: 210px;            /* 4:30 위치, 링 내부 12px 겹침 */
  left: 209px;           /* 222 − 13 */
  transform: rotate(-45deg);
  transform-origin: top center;
  background: linear-gradient(
    to right,
    #5a3800,
    #c88010 28%,
    #f0c050 50%,
    #c88010 72%,
    #5a3800
  );
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.6),
    inset 0 1px 3px rgba(255, 220, 100, 0.45);
  pointer-events: none;
`;
