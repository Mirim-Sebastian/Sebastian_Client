import styled, { keyframes } from "styled-components";

// ─── Keyframes ───────────────────────────────────────────────────────────────

export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-6px); }
  50%       { transform: translateX(6px); }
  75%       { transform: translateX(-4px); }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Base screen ─────────────────────────────────────────────────────────────

export const BaseScreen = styled.div`
  position: relative;
  z-index: 1;
  width: min(1200px, 100%);
  height: min(86svh, 900px);
  display: grid;
  gap: 18px;

  @media (max-width: 900px) {
    height: auto;
  }
`;

// ─── Shared icon button ───────────────────────────────────────────────────────

export const IconButton = styled.button<{
  $active?: boolean;
  $primary?: boolean;
  $error?: boolean;
}>`
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: rgba(12, 40, 70, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  .line-icon {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .tool-icon-svg {
    width: 24px;
    height: 24px;
    display: block;
  }

  .tool-icon-img {
    width: 24px;
    height: 24px;
    display: block;
    filter: brightness(0) invert(1);
  }

  .spinner {
    animation: ${spin} 1s linear infinite;
  }

  &:not(:disabled):hover {
    background: rgba(25, 65, 108, 0.62);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  ${({ $active }) =>
    $active &&
    `
    background: var(--ink);
    color: var(--bg);
    border-color: transparent;
    .tool-icon-img { filter: brightness(0); }
    &:not(:disabled):hover {
      background: rgba(220, 235, 255, 0.82);
      border-color: transparent;
    }
  `}

  ${({ $primary }) =>
    $primary &&
    `
    background: rgba(18, 53, 92, 0.92);
    color: #e6f0ff;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 12px 26px rgba(2, 8, 20, 0.22);
  `}

  ${({ $primary, $error }) =>
    $primary &&
    $error &&
    `
    box-shadow: 0 0 0 2px var(--danger), 0 12px 26px rgba(255, 107, 107, 0.35);
  `}
`;
