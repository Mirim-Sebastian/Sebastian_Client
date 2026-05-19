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
  transition: left 0.05s linear, top 0.3s ease-in-out;
  z-index: 2;
  cursor: pointer;
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
  z-index: 3;
  pointer-events: none;
  transform-origin: center;
`;

export const SharkImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
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
