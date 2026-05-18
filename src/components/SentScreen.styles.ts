import styled from "styled-components";
import { BaseScreen } from "./ui.styles";

export const Screen = styled(BaseScreen)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  padding-inline: 32px;

  &::before {
    content: "";
    position: absolute;
    inset: 15% 5%;
    border-radius: 999px;
    background: radial-gradient(
      ellipse,
      rgba(56, 217, 169, 0.18),
      transparent 65%
    );
    filter: blur(48px);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 25% 20%;
    border-radius: 999px;
    background: radial-gradient(
      ellipse,
      rgba(74, 163, 255, 0.13),
      transparent 65%
    );
    filter: blur(64px);
    pointer-events: none;
  }
`;

export const SentMessage = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const TitleTop = styled.p`
  margin: 0;
  font-size: clamp(1.4rem, 3.2vw, 2rem);
  font-weight: 600;
  color: rgba(230, 240, 255, 0.55);
  letter-spacing: 0.06em;
  text-align: center;
`;

export const TitleMain = styled.h1`
  margin: 0;
  font-family: var(--title-font);
  font-size: clamp(2.4rem, 5.8vw, 4.4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-align: center;
  color: #f7fbff;
`;

export const SentSubtitle = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(1.2rem, 2.4vw, 1.4rem);
  color: rgba(230, 240, 255, 0.36);
  letter-spacing: 0.03em;
  text-align: center;
`;
