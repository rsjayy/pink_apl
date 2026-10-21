import { createContext, useContext } from 'react'
import type { SaveResult } from './api'

export interface EditorAuth {
  /** Writes one file and pushes it. */
  saveToServer: (fileId: string, content: unknown) => Promise<SaveResult>
}

export const EditorAuthContext = createContext<EditorAuth | null>(null)

export function useEditorAuth(): EditorAuth {
  const auth = useContext(EditorAuthContext)
  if (!auth) throw new Error('useEditorAuth must be used inside <PasswordGate>')
  return auth
}
