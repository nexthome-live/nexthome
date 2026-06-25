import { useEffect, useState } from 'react'
import './Toast.css'

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'i',
  warning: '!',
}

export function Toast({ open, type = 'info', message, onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    setVisible(true)
    if (duration > 0) {
      const t = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(t)
    }
    return undefined
    // onClose is intentionally excluded — we want the timer to be stable per toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duration])

  if (!visible) return null

  return (
    <div
      className={`toast toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast__icon" aria-hidden="true">{TOAST_ICONS[type] || 'i'}</span>
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => { setVisible(false); onClose?.() }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}
