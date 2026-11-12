import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './toastContext.js'

// Koliko dugo je poruka vidljiva (greska duze, da stigne da se procita).
const DURATION_MS = { success: 4000, error: 8000 }
// Najvise ovoliko poruka odjednom; starije nestaju.
const MAX_TOASTS = 4

const styles = {
  success: { box: 'border-green-200 bg-white', icon: 'bg-green-100 text-green-700', symbol: '✓' },
  error: { box: 'border-red-200 bg-white', icon: 'bg-red-100 text-red-700', symbol: '!' },
}

function ToastItem({ toast, onDismiss }) {
  // Dok je mis iznad poruke, ona ne nestaje.
  const [paused, setPaused] = useState(false)
  const style = styles[toast.type]

  useEffect(() => {
    if (paused) return

    const timer = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.type])
    return () => clearTimeout(timer)
  }, [paused, toast.id, toast.type, onDismiss])

  return (
    <div
      // Citaci ekrana: greske se izgovaraju odmah (alert), uspesi kad stignu (status).
      role={toast.type === 'error' ? 'alert' : 'status'}
      data-toast={toast.type}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`flex items-start gap-3 rounded-lg border p-3 text-sm shadow-lg ${style.box}`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${style.icon}`} aria-hidden="true">
        {style.symbol}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-gray-800">{toast.message}</p>
        {toast.action && (
          <button
            type="button"
            className="mt-1 font-medium text-blue-700 hover:underline"
            onClick={() => {
              toast.action.onClick()
              onDismiss(toast.id)
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label="Zatvori obaveštenje"
        className="text-lg leading-none text-gray-400 hover:text-gray-700"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  )
}

// Omotava celu aplikaciju (main.jsx): cuva listu poruka i crta ih gore desno, preko svih stranica.
// Posto je iznad svih ruta, poruka "prezivi" prelazak na drugu stranicu (npr. iz forme na listu).
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const next_id = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback((type, message, { action } = {}) => {
    const id = next_id.current++
    setToasts((current) => [...current, { id, type, message, action }].slice(-MAX_TOASTS))
    return id
  }, [])

  // useMemo: isti objekat izmedju crtanja, pa komponente koje koriste useToast() ne crtaju se bez potrebe.
  const toast = useMemo(
    () => ({
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Dole desno (gore desno bi prekrivale dugmad kao "+ Dodaj"); z-[60] je iznad modala (z-50). */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
