import styled, { css } from "styled-components";
import { BaseScreen, shake, IconButton } from "./ui.styles";

export { IconButton } from "./ui.styles";

// ─── Layout ───────────────────────────────────────────────────────────────────

export const Screen = styled(BaseScreen)`
  display: flex;
  flex-direction: column;
`;

export const BackButton = styled(IconButton)`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
`;

// ─── 단일 카드 (미리보기 + 폼 통합) ─────────────────────────────────────────

export const FormCard = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: rgba(8, 26, 50, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 20px 60px rgba(2, 8, 20, 0.4);
  overflow: hidden;
`;

// ─── 물고기 미리보기 (카드 상단) ──────────────────────────────────────────────

export const Preview = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 20, 44, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  img {
    max-width: 70%;
    max-height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 8px 20px rgba(2, 8, 20, 0.5));
  }
`;

// ─── 폼 영역 (카드 하단) ──────────────────────────────────────────────────────

export const FormBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(230, 240, 255, 0.38);
  margin-bottom: 6px;
`;

// ─── 입력 필드 ────────────────────────────────────────────────────────────────

const InputField = styled.div<{ $error: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(4, 14, 32, 0.5);
  border: 1px solid
    ${({ $error }) => ($error ? "var(--danger)" : "rgba(255, 255, 255, 0.1)")};
  transition: border-color 0.18s, box-shadow 0.18s;
  animation: ${({ $error }) => ($error ? css`${shake} 0.35s ease` : "none")};

  &:focus-within {
    border-color: rgba(100, 180, 255, 0.45);
    box-shadow: 0 0 0 3px rgba(74, 163, 255, 0.08);
  }
`;

export const NameField = styled(InputField)`
  input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--ink);
    font-size: 1.25rem;
    outline: none;
    letter-spacing: 0.03em;

    &::placeholder { color: rgba(230, 240, 255, 0.22); }
    &:disabled { opacity: 0.6; }
  }
`;

export const MessageField = styled(InputField)`
  textarea {
    width: 100%;
    min-height: 72px;
    resize: none;
    background: transparent;
    border: none;
    color: var(--ink);
    font-size: 0.98rem;
    line-height: 1.6;
    outline: none;

    &::placeholder { color: rgba(230, 240, 255, 0.22); }
    &:disabled { opacity: 0.6; }
  }
`;

// ─── 크기 선택 ────────────────────────────────────────────────────────────────

export const SizeSelector = styled.div`
  display: flex;
  gap: 8px;
`;

export const SizeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 0;
  border-radius: 12px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(100, 180, 255, 0.55)" : "rgba(255, 255, 255, 0.09)"};
  background: ${({ $active }) =>
    $active ? "rgba(74, 163, 255, 0.16)" : "rgba(4, 14, 32, 0.4)"};
  color: ${({ $active }) =>
    $active ? "rgba(160, 220, 255, 1)" : "rgba(230, 240, 255, 0.38)"};
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.15s;

  &:not(:disabled):hover {
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(230, 240, 255, 0.7);
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ─── 제출 버튼 행 ────────────────────────────────────────────────────────────

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;
