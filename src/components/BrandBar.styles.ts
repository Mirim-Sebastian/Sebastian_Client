import styled from "styled-components";

const BLUE = "#4aa3ff";

export const Bar = styled.header`
  width: min(clamp(1200px, 80vw, 2300px), calc(100% - clamp(16px, 4vw, 180px)));
  height: clamp(56px, 5.5vh, 100px);
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(6px, 0.8vw, 16px);
  background: rgba(2, 8, 20, 0);
  backdrop-filter: blur(12px);
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(10px, 0.9vw, 18px);
`;

export const BrandMark = styled.span`
  width: clamp(26px, 2.2vw, 46px);
  height: clamp(26px, 2.2vw, 46px);
  display: grid;
  place-items: center;
  color: ${BLUE};

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const BrandName = styled.span`
  font-weight: 800;
  font-size: clamp(1rem, 1.1vw, 1.9rem);
  letter-spacing: 0.14em;
  color: #ffffff;
`;

export const BrandSub = styled.span`
  margin-left: clamp(4px, 0.4vw, 10px);
  font-size: clamp(0.64rem, 0.65vw, 1.05rem);
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(234, 242, 255, 0.72);
`;

export const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(7px, 0.7vw, 14px);
`;

export const StepDot = styled.div<{ $state: "todo" | "on" | "done" }>`
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.6vw, 12px);
  font-size: clamp(0.72rem, 0.75vw, 1.15rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ $state }) =>
    $state === "todo" ? "rgba(234, 242, 255, 0.6)" : "#ffffff"};

  .num {
    width: clamp(20px, 1.8vw, 36px);
    height: clamp(20px, 1.8vw, 36px);
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: clamp(0.6rem, 0.65vw, 1rem);
    border: 1.5px solid rgba(255, 255, 255, 0.45);
    flex-shrink: 0;

    ${({ $state }) =>
      $state === "on" &&
      `
      border-color: #ffffff;
      color: #ffffff;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
    `}
    ${({ $state }) =>
      $state === "done" &&
      `
      background: rgba(255, 255, 255, 0.9);
      border-color: #ffffff;
      color: #04162e;
    `}
  }

  .num svg {
    width: clamp(11px, 1vw, 18px);
    height: clamp(11px, 1vw, 18px);
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
  }

  @media (max-width: 480px) {
    font-size: 0;
    gap: 0;
    .num {
      font-size: 0.64rem;
    }
  }
`;

export const StepLine = styled.div`
  width: clamp(22px, 2vw, 40px);
  height: 1.5px;
  background: rgba(255, 255, 255, 0.35);

  @media (max-width: 480px) {
    width: 14px;
  }
`;
