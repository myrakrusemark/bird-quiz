import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { QuizProvider } from './contexts/QuizContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QuizProvider birdCount={20}>
        <App />
      </QuizProvider>
    </ErrorBoundary>
  </StrictMode>,
)
