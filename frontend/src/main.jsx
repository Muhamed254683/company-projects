import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import ToastProvider from './components/toast/ToastProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter prati URL u browseru i omogucava <Routes> i <Link> u celoj aplikaciji. */}
    <BrowserRouter>
      {/* ToastProvider: notifikacije (useToast) dostupne su na svim stranicama. */}
      <ToastProvider>
        {/* AuthProvider: ko je prijavljen (useAuth); unutar ToastProvider-a, jer javlja "Odjavljen si" i sl. */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
