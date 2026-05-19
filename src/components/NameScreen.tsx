import type { ChangeEvent } from "react";
import { BackIcon, CheckIcon, SpinnerIcon } from "./icons";
import {
  BackButton,
  FieldLabel,
  FormActions,
  FormCard,
  IconButton,
  MessageField,
  NameField,
  Preview,
  Screen,
  SizeButton,
  SizeSelector,
} from "./NameScreen.styles";

export type FishSize = "small" | "medium" | "large";

const SIZE_OPTIONS: { value: FishSize; label: string }[] = [
  { value: "small", label: "작게" },
  { value: "medium", label: "중간" },
  { value: "large", label: "크게" },
];

type NameScreenProps = {
  draftImage: string | null;
  name: string;
  message: string;
  fishSize: FishSize;
  nameError: boolean;
  messageError: boolean;
  submitError: boolean;
  isSubmitting: boolean;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMessageChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFishSizeChange: (size: FishSize) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export const NameScreen = ({
  draftImage,
  name,
  message,
  fishSize,
  nameError,
  messageError,
  submitError,
  isSubmitting,
  onNameChange,
  onMessageChange,
  onFishSizeChange,
  onBack,
  onSubmit,
}: NameScreenProps) => (
  <Screen>
    <BackButton type="button" onClick={onBack} aria-label="뒤로가기">
      <BackIcon />
    </BackButton>
    {draftImage && (
      <Preview>
        <img src={draftImage} alt="" />
      </Preview>
    )}
    <FormCard>
      <NameField $error={nameError}>
        <FieldLabel htmlFor="fish-name">물고기 이름</FieldLabel>
        <input
          id="fish-name"
          type="text"
          value={name}
          placeholder="이름을 입력하세요"
          onChange={onNameChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) onSubmit();
          }}
          aria-label="물고기 이름"
          disabled={isSubmitting}
        />
      </NameField>
      <MessageField $error={messageError}>
        <FieldLabel htmlFor="fish-message">메시지</FieldLabel>
        <textarea
          id="fish-message"
          value={message}
          placeholder="물고기가 할 말을 입력하세요"
          onChange={onMessageChange}
          aria-label="물고기 메시지"
          disabled={isSubmitting}
          rows={3}
        />
      </MessageField>
      <div>
        <FieldLabel as="span">물고기 크기</FieldLabel>
        <SizeSelector>
          {SIZE_OPTIONS.map(({ value, label }) => (
            <SizeButton
              key={value}
              type="button"
              $active={fishSize === value}
              onClick={() => onFishSizeChange(value)}
              disabled={isSubmitting}
            >
              {label}
            </SizeButton>
          ))}
        </SizeSelector>
      </div>
      <FormActions>
        <IconButton
          type="button"
          $primary
          $error={submitError}
          onClick={onSubmit}
          disabled={isSubmitting}
          aria-label="전송"
        >
          {isSubmitting ? <SpinnerIcon /> : <CheckIcon />}
        </IconButton>
      </FormActions>
    </FormCard>
  </Screen>
);
