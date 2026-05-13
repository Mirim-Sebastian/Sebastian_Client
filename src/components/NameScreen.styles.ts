import styled from "styled-components";
import { BaseScreen, shake } from "./ui.styles";

export { IconButton } from "./ui.styles";

// ─── Layout ───────────────────────────────────────────────────────────────────

export const Screen = styled(BaseScreen)`
  grid-template-rows: 1fr auto auto auto;
  place-items: center;
`;

// ─── Fish preview ─────────────────────────────────────────────────────────────

export const Preview = styled.div`
  width: min(640px, 86%);
  padding: 20px;
  border-radius: 20px;
  background: rgba(8, 33, 61, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 20px 60px rgba(2, 8, 20, 0.24);
  display: flex;
  justify-content: center;
  backdrop-filter: blur(12px);

  img {
    width: 100%;
    max-height: 380px;
    object-fit: contain;
  }
`;

// ─── Input fields ─────────────────────────────────────────────────────────────

export const NameField = styled.div<{ $error: boolean }>`
  width: min(420px, 80%);
  border-bottom: 2px solid
    ${({ $error }) => ($error ? "var(--danger)" : "rgba(255, 255, 255, 0.3)")};
  padding-bottom: 6px;
  animation: ${({ $error }) => ($error ? `${shake} 0.35s ease` : "none")};

  input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--ink);
    font-size: 1.6rem;
    text-align: center;
    outline: none;
    letter-spacing: 0.08em;

    &::placeholder {
      color: rgba(230, 240, 255, 0.42);
    }
  }
`;

export const MessageField = styled.div<{ $error: boolean }>`
  width: min(520px, 86%);
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(8, 33, 61, 0.36);
  border: 1px solid
    ${({ $error }) => ($error ? "var(--danger)" : "rgba(255, 255, 255, 0.2)")};
  backdrop-filter: blur(10px);
  animation: ${({ $error }) => ($error ? `${shake} 0.35s ease` : "none")};

  textarea {
    width: 100%;
    min-height: 88px;
    resize: none;
    background: transparent;
    border: none;
    color: var(--ink);
    font-size: 1rem;
    line-height: 1.6;
    outline: none;

    &::placeholder {
      color: rgba(230, 240, 255, 0.42);
    }
  }
`;
