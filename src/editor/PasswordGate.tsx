import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  clearPassword,
  getSavedPassword,
  saveAndPush,
  savePassword,
  verifyPassword,
} from './api'
import { EditorAuthContext } from './auth'
import { Button, inputClass } from './fields'

type Gate = 'checking' | 'locked' | 'unlocked'

/**
 * The editor is password-gated: children never render until the server has
 * accepted the stored password. A 401 on a later save clears it and drops
 * back to the lock screen.
 */
export function PasswordGate({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<Gate>(() =>
    getSavedPassword() ? 'checking' : 'locked',
  )
  const [password, setPassword] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const stored = getSavedPassword()
    if (!stored) return
    let cancelled = false
    verifyPassword(stored)
      .then((valid) => {
        if (cancelled) return
        if (valid) {
          setPassword(stored)
          setGate('unlocked')
        } else {
          clearPassword()
          setGate('locked')
        }
      })
      .catch(() => {
        if (cancelled) return
        setError('Cannot reach the editor server.')
        setGate('locked')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(() => {
    clearPassword()
    setPassword(null)
    setGate('locked')
  }, [])

  const saveToServer = useCallback(
    async (fileId: string, content: unknown) => {
      if (!password) {
        return { success: false, message: '', error: 'Not logged in' }
      }
      const result = await saveAndPush(fileId, content, password)
      if (result.error === 'Invalid password') logout()
      return result
    },
    [password, logout],
  )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!input.trim()) {
      setError('Password is required')
      return
    }
    setError('')
    setVerifying(true)
    try {
      if (await verifyPassword(input)) {
        savePassword(input)
        setPassword(input)
        setInput('')
        setGate('unlocked')
      } else {
        setError('Wrong password')
      }
    } catch {
      setError('Cannot reach the editor server.')
    } finally {
      setVerifying(false)
    }
  }

  if (gate === 'unlocked') {
    return (
      <EditorAuthContext value={{ saveToServer }}>{children}</EditorAuthContext>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-crosses p-4 font-sans text-neutral-800 normal-case">
      {gate === 'checking' ? (
        <p className="rounded-xl bg-white px-6 py-4 shadow-lg">
          Checking password…
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border-4 border-hotpink bg-white p-6 shadow-2xl shadow-hotpink/30"
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Password</span>
            <span className="flex gap-2">
              <input
                className={inputClass}
                type={showPassword ? 'text' : 'password'}
                value={input}
                autoFocus
                autoComplete="current-password"
                disabled={verifying}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </span>
          </label>
          <p role="alert" className="min-h-5 text-sm text-red-700">
            {error}
          </p>
          <Button type="submit" variant="primary" disabled={verifying}>
            {verifying ? 'Checking…' : 'Unlock'}
          </Button>
        </form>
      )}
    </div>
  )
}
