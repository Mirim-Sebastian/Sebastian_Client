import type { ChangeEvent } from 'react'
import { CheckIcon, SpinnerIcon } from './icons'

type NameScreenProps = {
  draftImage: string | null
  name: string
  message: string
  nameError: boolean
  messageError: boolean
  submitError: boolean
  isSubmitting: boolean
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void
  onMessageChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: () => void
}

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
        placeholder="이름 입력하기"
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
    <div className={`message-field ${messageError ? 'error' : ''}`}>
      <textarea
        value={message}
        placeholder="물고기가 할 말을 입력하기"
        onChange={onMessageChange}
        aria-label="물고기 메시지"
        disabled={isSubmitting}
        rows={3}
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
