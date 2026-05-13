import type { ChangeEvent } from "react";
import { CheckIcon, SpinnerIcon } from "./icons";
import {
  IconButton,
  MessageField,
  NameField,
  Preview,
  Screen,
} from "./NameScreen.styles";

type NameScreenProps = {
  draftImage: string | null;
  name: string;
  message: string;
  nameError: boolean;
  messageError: boolean;
  submitError: boolean;
  isSubmitting: boolean;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMessageChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
};

export const NameScreen = ({
  draftImage,
  name,
  message,
  nameError,
  messageError,
  submitError,
  isSubmitting,
  onNameChange,
  onMessageChange,
  onSubmit,
}: NameScreenProps) => (
  <Screen>
    {draftImage && (
      <Preview>
        <img src={draftImage} alt="" />
      </Preview>
    )}
    <NameField $error={nameError}>
      <input
        type="text"
        value={name}
        placeholder="이름 입력하기"
        onChange={onNameChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit();
        }}
        aria-label="물고기 이름"
        disabled={isSubmitting}
      />
    </NameField>
    <MessageField $error={messageError}>
      <textarea
        value={message}
        placeholder="물고기가 할 말을 입력하기"
        onChange={onMessageChange}
        aria-label="물고기 메시지"
        disabled={isSubmitting}
        rows={3}
      />
    </MessageField>
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
  </Screen>
);
