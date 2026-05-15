import { Screen, SentMessage, SentSubtitle, TitleMain, TitleTop } from "./SentScreen.styles";

export const SentScreen = () => (
  <Screen>
    <SentMessage>
      <TitleTop>전시 화면으로</TitleTop>
      <TitleMain>물고기를 보냈어요!</TitleMain>
    </SentMessage>
    <SentSubtitle>잠시 후 전시 바다에서 만나보세요</SentSubtitle>
  </Screen>
);
