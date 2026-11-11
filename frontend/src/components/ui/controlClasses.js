// Zajednicke klase za input, select i textarea; crveni okvir kada polje ima gresku.
// U posebnom fajlu (a ne u FormField.jsx), jer Vite "fast refresh" radi samo za fajlove koji izvoze iskljucivo komponente.
export function controlClasses(has_error) {
  const base = 'block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2'

  return has_error
    ? `${base} border-red-500 focus:ring-red-200`
    : `${base} border-gray-300 focus:border-blue-500 focus:ring-blue-200`
}
