import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'
import { EDITOR_PATH, SET_PASSWORD_PATH } from './routes.ts'

// Owner-only, lazy so visitors never download the editor.
const Editor = lazy(() => import('./editor/Editor.tsx'))
const SetPassword = lazy(() => import('./editor/SetPassword.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path={EDITOR_PATH}
          element={
            <Suspense fallback={null}>
              <Editor />
            </Suspense>
          }
        />
        <Route
          path={SET_PASSWORD_PATH}
          element={
            <Suspense fallback={null}>
              <SetPassword />
            </Suspense>
          }
        />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
