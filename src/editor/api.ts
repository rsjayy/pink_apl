// Talks to the static-page-editors server, which writes a content file,
// commits it and pushes it (content branch, then merged into main, which
// redeploys the site). Ported from kataa-homescreen's editor-api.ts.

/**
 * Both are overridable so the editor can be pointed at a locally running
 * static-page-editors instance (and a scratch repo) without touching the code
 * that ships. Defaults are the deployed server and the real project.
 */
export const EDITOR_API_URL =
  import.meta.env.VITE_EDITOR_API_URL ??
  'https://09176645.xyz/github-pages-editor'
export const PROJECT_ID = import.meta.env.VITE_EDITOR_PROJECT_ID ?? 'pink_apl'

const storageKey = `editor_password_${PROJECT_ID}`

export function getSavedPassword(): string | null {
  return localStorage.getItem(storageKey)
}

export function savePassword(password: string) {
  localStorage.setItem(storageKey, password)
}

export function clearPassword() {
  localStorage.removeItem(storageKey)
}

export async function verifyPassword(password: string): Promise<boolean> {
  const response = await fetch(`${EDITOR_API_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: PROJECT_ID, password }),
  })
  return response.ok
}

export interface SaveResult {
  success: boolean
  message: string
  warnings?: string[]
  error?: string
  /** Set on 429 so the UI can offer a retry rather than reporting a hard failure. */
  rateLimited?: boolean
}

export async function saveAndPush(
  fileId: string,
  content: unknown,
  password: string,
): Promise<SaveResult> {
  const response = await fetch(`${EDITOR_API_URL}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      fileId,
      content,
      password,
      timestamp: new Date().toISOString(),
    }),
  })

  if (response.status === 401) {
    clearPassword()
    return { success: false, message: '', error: 'Invalid password' }
  }

  if (response.status === 429) {
    return {
      success: false,
      message: '',
      error: 'Too many saves. Wait a minute and try again.',
      rateLimited: true,
    }
  }

  try {
    return (await response.json()) as SaveResult
  } catch {
    return {
      success: false,
      message: '',
      error: `The server answered ${response.status} without details.`,
    }
  }
}
