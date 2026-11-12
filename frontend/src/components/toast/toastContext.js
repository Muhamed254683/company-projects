import { createContext, useContext } from 'react'

// React Context: "kanal" kroz koji svaka komponenta u aplikaciji dobija toast funkcije,
// bez prosledjivanja kroz props. Vrednost postavlja <ToastProvider> (u main.jsx).
export const ToastContext = createContext(null)

// Upotreba u bilo kojoj komponenti:
//   const toast = useToast()
//   toast.success('Kompanija je dodata.')
//   toast.error('Server ne odgovara.')
//   toast.success('Projekat je u korpi.', { action: { label: 'Poništi', onClick: () => ... } })
export function useToast() {
  const toast = useContext(ToastContext)

  if (!toast) {
    throw new Error('useToast() radi samo unutar <ToastProvider>.')
  }

  return toast
}
