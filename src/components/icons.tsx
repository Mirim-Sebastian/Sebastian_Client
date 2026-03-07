type IconProps = {
  className?: string
}

export const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.2 4.2L19 7.8" strokeLinecap="round" />
  </svg>
)

export const UndoIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 7l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11h9a6 6 0 110 12" strokeLinecap="round" />
  </svg>
)

export const PenIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4.5 19.5l4.8-1.4L18 9.4l-3.4-3.4L6 14.7l-1.5 4.8z"
      strokeLinejoin="round"
    />
    <path d="M13.8 5.6l3.4 3.4" strokeLinecap="round" />
  </svg>
)

export const EraserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3.5 15.5l6.2-6.2a2.2 2.2 0 013.1 0l5.7 5.7a2.2 2.2 0 010 3.1l-1.4 1.4H8.2L3.5 15.5z"
      strokeLinejoin="round"
    />
    <path d="M8.2 19.5h8.5" strokeLinecap="round" />
  </svg>
)

export const FillIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.5 14.5l7-7 6 6-7 7H4.5z" strokeLinejoin="round" />
    <path d="M12.5 5.5l3 3" strokeLinecap="round" />
    <path
      d="M18.5 14.5c1.2 1.3 1.8 2.1 1.8 3.1a1.8 1.8 0 11-3.6 0c0-1 .6-1.8 1.8-3.1z"
      strokeLinejoin="round"
    />
  </svg>
)

export const SpinnerIcon = () => (
  <svg className="spinner" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" strokeWidth="2" opacity="0.3" />
    <path d="M21 12a9 9 0 00-9-9" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
