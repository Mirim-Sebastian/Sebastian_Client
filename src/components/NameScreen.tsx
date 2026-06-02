import type { ChangeEvent } from "react";
import { CheckIcon, SpinnerIcon } from "./icons";
import { MAX_MESSAGE, MAX_NAME } from "../constants";
import {
  BackLink,
  Caustic,
  Count,
  FishImg,
  FishStage,
  Foot,
  Label,
  MessageInput,
  NameInput,
  Placard,
  Row,
  Rows,
  Rule,
  Screen,
  SendButton,
  SizeSeg,
  SizeSegButton,
  Tank,
  TankFloor,
  Title,
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
    {/* 표본 수조 (좌측) */}
    <Tank>
      <FishStage>
        <Caustic />
        {draftImage && <FishImg src={draftImage} alt="" $fishSize={fishSize} />}
      </FishStage>
      <TankFloor />
    </Tank>

    {/* 명패 (우측) */}
    <Placard>
      <Rule />
      <Title>바다를 헤엄칠 준비를 해볼까요?</Title>
      <Rows>
        <Row $error={nameError}>
          <Label htmlFor="fish-name">이름</Label>
          <NameInput
            id="fish-name"
            type="text"
            value={name}
            maxLength={MAX_NAME}
            placeholder="세바스찬"
            onChange={onNameChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing)
                onSubmit();
            }}
            aria-label="물고기 이름"
            disabled={isSubmitting}
          />
        </Row>

        <Row $error={messageError}>
          <Label htmlFor="fish-message">
            한 마디
            <Count>
              {message.length}/{MAX_MESSAGE}
            </Count>
          </Label>
          <MessageInput
            id="fish-message"
            value={message}
            rows={1}
            maxLength={MAX_MESSAGE}
            placeholder="안녕! 난 세바스찬이야"
            onChange={onMessageChange}
            aria-label="물고기 메시지"
            disabled={isSubmitting}
          />
        </Row>

        <Row>
          <Label as="span">크기</Label>
          <SizeSeg role="group" aria-label="물고기 크기 선택">
            {SIZE_OPTIONS.map(({ value, label }) => (
              <SizeSegButton
                key={value}
                type="button"
                $active={fishSize === value}
                onClick={() => onFishSizeChange(value)}
                disabled={isSubmitting}
              >
                {label}
              </SizeSegButton>
            ))}
          </SizeSeg>
        </Row>
      </Rows>

      <Foot>
        <SendButton
          type="button"
          $error={submitError}
          onClick={onSubmit}
          disabled={isSubmitting}
          aria-label="전송"
        >
          {isSubmitting ? <SpinnerIcon /> : <CheckIcon />}
        </SendButton>
        <BackLink type="button" onClick={onBack} disabled={isSubmitting}>
          ← 다시 그리기
        </BackLink>
      </Foot>
    </Placard>
  </Screen>
);
