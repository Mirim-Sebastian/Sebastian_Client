import styled from "styled-components";

const BLUE = "#4aa3ff";

export const Bar = styled.header`
  width: min(1200px, 100%);
  height: 64px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: rgba(2, 8, 20, 0);
  backdrop-filter: blur(12px);
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const BrandMark = styled.span`
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  color: ${BLUE};

  svg {
    width: 30px;
    height: 30px;
  }
`;

export const BrandName = styled.span`
  font-weight: 800;
  font-size: 1.18rem;
  letter-spacing: 0.14em;
  color: #ffffff;
`;

export const BrandSub = styled.span`
  margin-left: 6px;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(234, 242, 255, 0.72);
`;

export const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

export const StepDot = styled.div<{ $state: "todo" | "on" | "done" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ $state }) =>
    $state === "todo" ? "rgba(234, 242, 255, 0.6)" : "#ffffff"};

  .num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 0.68rem;
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
    width: 13px;
    height: 13px;
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
  width: 26px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.35);

  @media (max-width: 480px) {
    width: 14px;
  }
`;
