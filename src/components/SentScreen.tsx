import { useEffect, useState } from "react";
import { Countdown, Screen, SentMessage, SentSubtitle, TitleMain, TitleTop } from "./SentScreen.styles";

const COUNTDOWN_SEC = 5;

type SentScreenProps = {
  onDone: () => void;
};

export const SentScreen = ({ onDone }: SentScreenProps) => {
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

  return (
    <Screen>
      <SentMessage>
        <TitleTop>전시 화면으로</TitleTop>
        <TitleMain>물고기를 보냈어요!</TitleMain>
      </SentMessage>
      <SentSubtitle>잠시 후 전시 바다에서 만나보세요</SentSubtitle>
      <Countdown>{count}</Countdown>
    </Screen>
  );
};