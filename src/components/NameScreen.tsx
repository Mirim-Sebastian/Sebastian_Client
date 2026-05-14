import type { ChangeEvent } from "react";
import { CheckIcon, SpinnerIcon } from "./icons";
import {
  FieldLabel,
  FormActions,
  FormCard,
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
            if (event.key === "Enter") onSubmit();
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
