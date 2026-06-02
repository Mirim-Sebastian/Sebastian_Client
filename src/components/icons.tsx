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

export const ResetIcon = () => (
  <svg className="line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h18" strokeLinecap="round" />
    <path d="M8 6V4h8v2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const EyeDropperIcon = () => (
  <svg className="line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m2 22 1-1h3l9-9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 21v-3l9-9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const SpinnerIcon = () => (
  <svg className="spinner line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" strokeWidth="2" opacity="0.3" />
    <path d="M21 12a9 9 0 00-9-9" strokeWidth="2" strokeLinecap="round" />
  </svg>
)