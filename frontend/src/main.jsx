import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PlantAssistant from './Views/PlantAssistant'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlantAssistant />
  </StrictMode>,
)
