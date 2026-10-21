import { useEffect, useState, type FormEvent } from 'react'
import { EDITOR_API_URL, PROJECT_ID } from './api'
import { Button, inputClass } from './fields'

// Ported from kataa-homescreen's set-password page. The operator sends
// `<site>/set-password#<tokenId>`; the key stays in the hash so it never
// reaches a server log or a Referer header.
const PASSWORD_ENDPOINT = `${EDITOR_API_URL}/set-password/${PROJECT_ID}`
const TOKEN_ENDPOINT = `${EDITOR_API_URL}/set-github-token/${PROJECT_ID}`
const TOKEN_GUIDE_URL = 'https://rainbowcockroach.github.io/make-that-web/#ch4'

function readKeyFromHash(): string {
  return location.hash.replace(/^#/, '')
}

type View = 'menu' | 'password' | 'token'

type Status =
  | { kind: 'idle' }
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string }

/** The server answers `{ error }` with a sentence meant for the site owner. */
async function readError(response: Response): Promise<string> {
  const text = await response.text().catch(() => '')
  try {
    const body = JSON.parse(text) as { error?: unknown }
    if (typeof body.error === 'string') return body.error
  } catch {
    // Not JSON: fall through to the raw text.
  }
  return text || `Request failed (${response.status})`
}

async function post(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(body),
  })
}

function Banner({ status }: { status: Status }) {
  if (status.kind === 'idle') return null
  const tone =
    status.kind === 'success'
      ? 'border-green-400 bg-green-50 text-green-800'
      : 'border-red-300 bg-red-50 text-red-700'
  return (
    <p
      role={status.kind === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border-2 px-3 py-2 text-sm break-words ${tone}`}
    >
      {status.text}
    </p>
  )
}

export default function SetPassword() {
  const [hasKey, setHasKey] = useState(() => readKeyFromHash().length > 0)
  const [view, setView] = useState<View>('menu')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<Status>({ kind: 'idle' })
  const [githubToken, setGithubToken] = useState('')
  const [tokenBusy, setTokenBusy] = useState(false)
  const [tokenStatus, setTokenStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    const onHashChange = () => setHasKey(readKeyFromHash().length > 0)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    const key = readKeyFromHash()
    if (!key || passwordBusy) return
    setPasswordBusy(true)
    setPasswordStatus({ kind: 'idle' })
    try {
      const response = await post(`${PASSWORD_ENDPOINT}/${key}`, { password })
      if (response.ok) {
        setPassword('')
        setPasswordStatus({ kind: 'success', text: 'Password set.' })
      } else {
        setPasswordStatus({ kind: 'error', text: await readError(response) })
      }
    } catch {
      setPasswordStatus({
        kind: 'error',
        text: 'Cannot reach the editor server.',
      })
    } finally {
      setPasswordBusy(false)
    }
  }

  const submitToken = async (event: FormEvent) => {
    event.preventDefault()
    const key = readKeyFromHash()
    if (!key || tokenBusy) return
    setTokenBusy(true)
    setTokenStatus({ kind: 'idle' })
    try {
      const response = await post(`${TOKEN_ENDPOINT}/${key}`, {
        githubToken: githubToken.trim(),
      })
      if (response.ok) {
        const body = (await response.json()) as { githubLogin: string }
        setGithubToken('')
        setTokenStatus({
          kind: 'success',
          text: `Connected. Edits will be saved as @${body.githubLogin}.`,
        })
      } else {
        setTokenStatus({ kind: 'error', text: await readError(response) })
      }
    } catch {
      setTokenStatus({ kind: 'error', text: 'Cannot reach the editor server.' })
    } finally {
      setTokenBusy(false)
    }
  }

  if (!hasKey) {
    return (
      <Page>
        <Banner
          status={{
            kind: 'error',
            text: 'This link is missing its key. Open the full link you were sent.',
          }}
        />
      </Page>
    )
  }

  // Leaving a form clears its result, so coming back shows a fresh form.
  const backToMenu = () => {
    setPasswordStatus({ kind: 'idle' })
    setTokenStatus({ kind: 'idle' })
    setView('menu')
  }

  if (view === 'menu') {
    return (
      <Page title="Editor settings">
        <Button variant="primary" onClick={() => setView('password')}>
          Set password
        </Button>
        <Button variant="primary" onClick={() => setView('token')}>
          Set editor token
        </Button>
      </Page>
    )
  }

  if (view === 'password') {
    return (
      <Page
        title="Set password"
        onBack={backToMenu}
        backDisabled={passwordBusy}
      >
        <form onSubmit={submitPassword} className="flex flex-col gap-3">
          <Banner status={passwordStatus} />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">New password</span>
            <span className="flex gap-2">
              <input
                className={inputClass}
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoComplete="new-password"
                spellCheck={false}
                autoFocus
                disabled={passwordBusy}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </span>
          </label>
          <Button type="submit" variant="primary" disabled={passwordBusy}>
            {passwordBusy ? 'Setting…' : 'Set password'}
          </Button>
        </form>
      </Page>
    )
  }

  return (
    <Page title="Set editor token" onBack={backToMenu} backDisabled={tokenBusy}>
      <form onSubmit={submitToken} className="flex flex-col gap-3">
        <p className="text-sm text-neutral-600">
          You need a "token" to make the editor works. Read{' '}
          <a
            href={TOKEN_GUIDE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-hotpink underline"
          >
            this guide
          </a>
          .
        </p>
        <Banner status={tokenStatus} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">GitHub token</span>
          <input
            className={inputClass}
            type="password"
            value={githubToken}
            placeholder="github_pat_…"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            disabled={tokenBusy}
            onChange={(e) => setGithubToken(e.target.value)}
          />
        </label>
        <Button
          type="submit"
          variant="primary"
          disabled={tokenBusy || !githubToken.trim()}
        >
          {tokenBusy ? 'Checking with GitHub…' : 'Save token'}
        </Button>
      </form>
    </Page>
  )
}

function Page({
  title = 'Editor settings',
  onBack,
  backDisabled = false,
  children,
}: {
  title?: string
  onBack?: () => void
  backDisabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-crosses p-4 font-sans text-neutral-800 normal-case">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border-4 border-hotpink bg-white p-6 shadow-2xl shadow-hotpink/30">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="self-start text-sm text-hotpink hover:underline disabled:opacity-60"
          >
            ← Back
          </button>
        )}
        <div>
          <h1 className="font-display text-3xl text-hotpink uppercase">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
