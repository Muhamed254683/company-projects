import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter prati URL u browseru i omogucava <Routes> i <Link> u celoj aplikaciji. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
