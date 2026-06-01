import { useEffect, useState } from "react";
import {
  CountNumber,
  Countdown,
  FishFloat,
  Screen,
  SentMessage,
  SentSubtitle,
  TitleMain,
} from "./SentScreen.styles";

const COUNTDOWN_SEC = 5;
const RING_R = 34;
const RING_CIRC = 2 * Math.PI * RING_R;

type SentScreenProps = {
  onDone: () => void;
  /** 선택: 방금 그린 물고기 이미지 (data URL). 넘기면 둥실 떠오르는 미리보기로 보여줍니다. */
  draftImage?: string | null;
  /** 선택: 관람객이 지은 이름. 넘기면 안내 문구에 표시됩니다. */
  name?: string;
};

export const SentScreen = ({ onDone, draftImage, name }: SentScreenProps) => {
  const [count, setCount] = useState(COUNTDOWN_SEC);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCount((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count === 0) onDone();
  }, [count, onDone]);

  const dashOffset = (RING_CIRC * (COUNTDOWN_SEC - count)) / COUNTDOWN_SEC;

  return (
    <Screen>
      {draftImage && (
        <FishFloat>
          <img src={draftImage} alt="" />
        </FishFloat>
      )}

      <SentMessage>
        <TitleMain>
          {name ? `${name}을(를)` : "물고기를"} 방금 바다로 보냈어요
        </TitleMain>
      </SentMessage>

      <SentSubtitle>
        잠시 후 전시 화면의 바다에서 헤엄치는 모습을 만나보세요!
      </SentSubtitle>

      <Countdown>
        <svg viewBox="0 0 76 76" aria-hidden="true">
          <circle
            className="track"
            cx="38"
            cy="38"
            r={RING_R}
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="prog"
            cx="38"
            cy="38"
            r={RING_R}
            fill="none"
            strokeWidth="3"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <CountNumber>{count}</CountNumber>
      </Countdown>
    </Screen>
  );
};
