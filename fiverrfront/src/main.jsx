/**
 * Entry point: loads global CSS and mounts the single App.jsx component.
 * Keeping this tiny makes it easy to follow what VS Code should run.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Attach the application to the div#root element.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
