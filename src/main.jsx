import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './utils/toast'

if (typeof window !== 'undefined') {
  window.alert = (msg) => {
    const lower = String(msg).toLowerCase();
    const isError = lower.includes('fail') || 
                    lower.includes('error') || 
                    lower.includes('invalid') || 
                    lower.includes('could not') || 
                    lower.includes('wrong') || 
                    lower.includes('cancelled') || 
                    lower.includes('bad') || 
                    lower.includes('reject') || 
                    lower.includes('unable');
    window.showToast(msg, isError ? 'error' : 'success');
  };
}

// Let Tailwind/components control layout; global CSS sets font/reset.
document.body.className = ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
