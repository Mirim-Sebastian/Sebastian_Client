import styled, { keyframes } from "styled-components";
import { BaseScreen } from "./ui.styles";

// ─── Accent (블루로 확정) ──────────────────────────────────────────────────────
const BLUE = "#ffffff";
const BLUE_RGB = "255, 255, 255";

const floaty = keyframes`
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50%      { transform: translateY(-14px) rotate(1.5deg); }
`;

export const Screen = styled(BaseScreen)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  position: relative;
  overflow: hidden;
  padding-inline: 32px;
  text-align: center;

  @media (max-width: 640px) {
    padding-inline: 16px;
  }

  /* 중앙 글로우 */
  &::before {
    content: "";
    position: absolute;
    inset: 12% 6%;
    border-radius: 999px;
    background: radial-gradient(ellipse, rgba(${BLUE_RGB}, 0.2), transparent 62%);
    filter: blur(48px);
    pointer-events: none;
  }
`;

export const FishFloat = styled.div`
  position: relative;
  z-index: 1;
  width: 200px;
  height: 150px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  animation: ${floaty} 3.4s ease-in-out infinite;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 14px 30px rgba(0, 0, 0, 0.5));
  }

  @media (max-width: 480px) {
    width: 160px;
    height: 120px;
  }
`;

export const Eyebrow = styled.p`
  position: relative;
  z-index: 1;
  margin: 0 0 10px;
  font-size: clamp(0.92rem, 1.6vw, 1.05rem);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(230, 240, 255, 0.55);
`;

export const SentMessage = styled.div`
  position: relative;
  z-index: 1;
`;

export const TitleMain = styled.h1`
  margin: 0;
  font-family: var(--title-font);
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #f4faff;

  em {
    font-style: normal;
    color: ${BLUE};
  }
`;

export const SentSubtitle = styled.p`
  position: relative;
  z-index: 1;
  margin: 18px 0 0;
  font-size: clamp(1.05rem, 2.2vw, 1.25rem);
  color: rgba(230, 240, 255, 0.4);
  letter-spacing: 0.02em;
`;

// ─── 카운트다운 링 ───────────────────────────────────────────────────────────────
export const Countdown = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 34px;
  width: 76px;
  height: 76px;

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  .track {
    stroke: rgba(255, 255, 255, 0.12);
  }
  .prog {
    stroke: ${BLUE};
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
  }
`;

export const CountNumber = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ink);
`;

// (구버전 호환용 — 더 이상 사용 안 함)
export const TitleTop = styled.p``;
