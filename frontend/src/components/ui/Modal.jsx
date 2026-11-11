import { useEffect } from 'react'

// Prozor preko stranice. Zatvara se na Escape i klikom na tamnu pozadinu.
// footer: dugmad na dnu (npr. Otkazi / Obrisi). wide: siri prozor (npr. za veliku sliku).
function Modal({ open, title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    // "Cleanup": kada se modal zatvori, prestajemo da slusamo tastaturu.
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full rounded-lg bg-white shadow-xl ${wide ? 'max-w-4xl' : 'max-w-md'}`}
        // Klik unutar prozora ne sme da "procuri" do pozadine i zatvori modal.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        </div>

        <div className="space-y-3 px-5 py-4 text-sm text-gray-700">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 rounded-b-lg border-t border-gray-200 bg-gray-50 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  )
}

export default Modal
