import type { ChangeEvent } from 'react'
import { CheckIcon, SpinnerIcon } from './icons'

type NameScreenProps = {
  draftImage: string | null
  name: string
  nameError: boolean
  submitError: boolean
  isSubmitting: boolean
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
}

export const NameScreen = ({
  draftImage,
  name,
  nameError,
  submitError,
  isSubmitting,
  onNameChange,
  onSubmit,
}: NameScreenProps) => (
  <div className="screen name-screen">
    {draftImage && (
      <div className="preview">
        <img src={draftImage} alt="" />
      </div>
    )}
    <div className={`name-field ${nameError ? 'error' : ''}`}>
      <input
        type="text"
        value={name}
        onChange={onNameChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSubmit()
          }
        }}
        aria-label="물고기 이름"
        disabled={isSubmitting}
      />
    </div>
    <button
      type="button"
      className={`icon-button primary ${submitError ? 'error' : ''}`}
      onClick={onSubmit}
      disabled={isSubmitting}
      aria-label="전송"
    >
      {isSubmitting ? <SpinnerIcon /> : <CheckIcon />}
    </button>
  </div>
)
