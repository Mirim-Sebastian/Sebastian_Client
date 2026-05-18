import styled from "styled-components";
import { BaseScreen, shake } from "./ui.styles";

export { IconButton } from "./ui.styles";

// ─── Layout ───────────────────────────────────────────────────────────────────

export const Screen = styled(BaseScreen)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

// ─── Fish preview ─────────────────────────────────────────────────────────────

export const Preview = styled.div`
  width: min(520px, 86%);
  padding: 16px;
  border-radius: 20px;
  background: rgba(8, 33, 61, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 20px 60px rgba(2, 8, 20, 0.24);
  display: flex;
  justify-content: center;
  backdrop-filter: blur(12px);

  img {
    width: 100%;
    max-height: 240px;
    object-fit: contain;
  }
`;

// ─── Form card ────────────────────────────────────────────────────────────────

export const FormCard = styled.div`
  width: min(520px, 86%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
  padding: 20px;
  border-radius: 22px;
  background: rgba(8, 26, 50, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(2, 8, 20, 0.22);
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(230, 240, 255, 0.45);
  margin-bottom: 6px;
`;

// ─── Input fields ─────────────────────────────────────────────────────────────

const InputField = styled.div<{ $error: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(6, 22, 44, 0.5);
  border: 1px solid
    ${({ $error }) => ($error ? "var(--danger)" : "rgba(255, 255, 255, 0.14)")};
  transition: border-color 0.15s;
  animation: ${({ $error }) => ($error ? `${shake} 0.35s ease` : "none")};

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const NameField = styled(InputField)`
  input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--ink);
    font-size: 1.3rem;
    outline: none;
    letter-spacing: 0.04em;

    &::placeholder {
      color: rgba(230, 240, 255, 0.3);
    }

    &:disabled {
      opacity: 0.6;
    }
  }
`;

export const MessageField = styled(InputField)`
  textarea {
    width: 100%;
    min-height: 80px;
    resize: none;
    background: transparent;
    border: none;
    color: var(--ink);
    font-size: 1rem;
    line-height: 1.6;
    outline: none;

    &::placeholder {
      color: rgba(230, 240, 255, 0.3);
    }

    &:disabled {
      opacity: 0.6;
    }
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;
