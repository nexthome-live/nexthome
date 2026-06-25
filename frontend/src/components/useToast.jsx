import { useCallback, useState } from 'react'
import { Toast } from './Toast'

export function useToast() {
  const [toast, setToast] = useState(null)

  // Stable callbacks so consumers can safely include these in
  // useEffect / useMemo dependency arrays without retriggering effects.
  const showToast = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() })
  }, [])

  const success = useCallback((m) => showToast('success', m), [showToast])
  const error   = useCallback((m) => showToast('error',   m), [showToast])
  const info    = useCallback((m) => showToast('info',    m), [showToast])
  const warning = useCallback((m) => showToast('warning', m), [showToast])

  const ToastView = toast ? (
    <Toast
      key={toast.id}
      open
      type={toast.type}
      message={toast.message}
      onClose={() => setToast(null)}
    />
  ) : null

  return { showToast, success, error, info, warning, ToastView }
}
