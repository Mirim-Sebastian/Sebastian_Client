import penSvg from "../assets/images/icons/pen.svg"
import eraserSvg from "../assets/images/icons/eraser.svg"
import paintSvg from "../assets/images/icons/paint.svg"

type IconProps = {
  className?: string
}

export const CheckIcon = ({ className }: IconProps) => (
  <svg
    className={["line-icon", className].filter(Boolean).join(" ")}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.2 4.2L19 7.8" strokeLinecap="round" />
  </svg>
)

export const UndoIcon = () => (
  <svg className="line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 7l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11h9a6 6 0 110 12" strokeLinecap="round" />
  </svg>
)

export const RedoIcon = () => (
  <svg className="line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15 7l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 11h-9a6 6 0 100 12" strokeLinecap="round" />
  </svg>
)

export const PenIcon = () => (
  <img className="tool-icon-img" src={penSvg} aria-hidden="true" alt="" />
)

export const EraserIcon = () => (
  <img className="tool-icon-img" src={eraserSvg} aria-hidden="true" alt="" />
)

export const FillIcon = () => (
  <img className="tool-icon-img" src={paintSvg} aria-hidden="true" alt="" />
)

export const BackIcon = ({ className }: IconProps) => (
  <svg
    className={["line-icon", className].filter(Boolean).join(" ")}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const SpinnerIcon = () => (
  <svg className="spinner line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" strokeWidth="2" opacity="0.3" />
    <path d="M21 12a9 9 0 00-9-9" strokeWidth="2" strokeLinecap="round" />
  </svg>
)