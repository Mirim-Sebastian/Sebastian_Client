import styled from "styled-components";
import { BaseScreen } from "./ui.styles";

export const Screen = styled(BaseScreen)`
  place-items: center;
  position: relative;
  overflow: hidden;
  padding-inline: 24px;
  font-size: 24px;

  &::before {
    content: "";
    position: absolute;
    inset: 8% 18%;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(56, 217, 169, 0.2), transparent 62%);
    filter: blur(24px);
    pointer-events: none;
  }
`;

export const SentTitle = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: clamp(1.8rem, 4.8vw, 3.6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #f7fbff;
  text-shadow:
    0 0 24px rgba(74, 163, 255, 0.35),
    0 0 72px rgba(56, 217, 169, 0.22),
    0 18px 44px rgba(0, 0, 0, 0.35);
`;
