import {
  Bar,
  Brand,
  BrandMark,
  BrandName,
  StepDot,
  StepLine,
  Stepper,
} from "./BrandBar.styles";

export type Step = "draw" | "name" | "sent";

const STEPS: { key: Step; label: string }[] = [
  { key: "draw", label: "그리기" },
  { key: "name", label: "이름 짓기" },
  { key: "sent", label: "보내기" },
];

const WaveMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M2 9c2.4-2.6 4.6-2.6 7 0s4.6 2.6 7 0 4.6-2.6 6 0" />
    <path d="M2 15c2.4-2.6 4.6-2.6 7 0s4.6 2.6 7 0 4.6-2.6 6 0" />
  </svg>
);

const CheckMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type BrandBarProps = {
  step: Step;
};

export const BrandBar = ({ step }: BrandBarProps) => {
  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <Bar>
      <Brand>
        <BrandMark>
          <WaveMark />
        </BrandMark>
        <BrandName>SEBASTIAN</BrandName>
      </Brand>

      <Stepper>
        {STEPS.map((s, i) => {
          const state = i === activeIndex ? "on" : i < activeIndex ? "done" : "todo";
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <StepDot $state={state}>
                <span className="num">{state === "done" ? <CheckMark /> : i + 1}</span>
                {s.label}
              </StepDot>
              {i < STEPS.length - 1 && <StepLine />}
            </div>
          );
        })}
      </Stepper>
    </Bar>
  );
};
