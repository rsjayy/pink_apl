import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  CONTENT_FILES,
  type ContentFile,
  type SiteContent,
} from '../content/site'
import { documentTitle, EDITOR_TITLE } from '../routes'
import { useEditorAuth } from './auth'
import { Button } from './fields'
import { PasswordGate } from './PasswordGate'
import { loadLatest, rememberSave } from './savedCopies'
import { sectionChanged, SECTIONS, type SectionProps } from './sections'
import { findProblems } from './validate'

type Status =
  | { kind: 'idle' }
  | { kind: 'saving'; file: ContentFile }
  | { kind: 'saved'; warnings: string[] }
  | { kind: 'error'; message: string }

const FILE_NAMES: Record<ContentFile, string> = {
  lobby: 'Lobby',
  profile: 'Bio',
  cards: 'Cards',
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function Workspace() {
  const { saveToServer } = useEditorAuth()
  const [initial] = useState(loadLatest)
  /** What the server has: the draft is compared against this. */
  const [saved, setSaved] = useState<SiteContent>(initial.content)
  const [draft, setDraft] = useState<SiteContent>(initial.content)
  const [pending, setPending] = useState(initial.pending)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  // Where you are is in the URL, so a reload keeps your place.
  const [params, setParams] = useSearchParams()
  const section =
    SECTIONS.find((s) => s.id === params.get('section')) ?? SECTIONS[0]
  const open = (next: (typeof SECTIONS)[number]) =>
    setParams({ section: next.id }, { replace: true })

  const dirty = CONTENT_FILES.filter((f) => !same(draft[f], saved[f]))
  const problems = useMemo(() => findProblems(draft), [draft])
  const blocking = problems.filter((p) => dirty.includes(p.file))
  const saving = status.kind === 'saving'

  useEffect(() => {
    if (dirty.length === 0) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty.length])

  // One save per changed file: each one is a commit and a push.
  const save = async () => {
    const warnings: string[] = []
    for (const file of dirty) {
      setStatus({ kind: 'saving', file })
      const content = draft[file]
      let result
      try {
        result = await saveToServer(file, content)
      } catch {
        result = { success: false, error: 'Cannot reach the editor server.' }
      }
      if (!result.success) {
        setStatus({
          kind: 'error',
          message: `${FILE_NAMES[file]} wasn't saved: ${result.error ?? 'unknown error'}`,
        })
        return
      }
      rememberSave(file, content)
      setSaved((old) => ({ ...old, [file]: content }))
      setPending((old) => [...new Set([...old, file])])
      warnings.push(...(result.warnings ?? []))
    }
    setStatus({ kind: 'saved', warnings })
  }

  // Each section edits one file; TypeScript can't follow that through the
  // union of sections, hence the casts.
  const Form = section.Form as (
    props: SectionProps<ContentFile>,
  ) => React.ReactNode
  const setFile = (value: SiteContent[ContentFile]) => {
    setDraft((old) => ({ ...old, [section.file]: value }))
    if (status.kind !== 'saving') setStatus({ kind: 'idle' })
  }

  return (
    <div className="flex h-dvh flex-col bg-blush font-sans text-neutral-800 normal-case">
      {/* Phones: title and Save on one row, status underneath. */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b-4 border-hotpink bg-white px-4 py-2 lg:py-3">
        <h1 className="mr-auto font-display text-lg text-hotpink uppercase lg:mr-0 lg:text-2xl">
          Welcome, Hazukrist!
        </h1>
        <div
          className="order-last w-full min-w-0 text-xs lg:order-none lg:mr-auto lg:w-auto lg:text-sm"
          role="status"
        >
          <StatusLine status={status} dirty={dirty} />
          <span className="text-neutral-500 lg:hidden">
            {' '}
            · It may take a few minutes to update
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="primary"
            disabled={dirty.length === 0 || blocking.length > 0 || saving}
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <span className="hidden text-xs text-neutral-500 lg:block">
            It may take a few minutes to update
          </span>
        </div>
      </header>

      {pending.length > 0 && (
        <p className="border-b-2 border-bubblegum bg-white/70 px-4 py-2 text-sm">
          Saved and on its way: {pending.map((f) => FILE_NAMES[f]).join(', ')}.
          The live site shows it once GitHub has rebuilt it, usually within a
          few minutes.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav
          aria-label="Sections"
          className="flex shrink-0 gap-1 overflow-x-auto border-b-2 border-bubblegum p-2 lg:flex-col lg:border-r-2 lg:border-b-0"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={s.id === section.id ? 'page' : undefined}
              onClick={() => open(s)}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                s.id === section.id ? 'bg-hotpink text-white' : 'hover:bg-white'
              }`}
            >
              {s.label}
              {sectionChanged(s, draft, saved) && (
                <span
                  className={`size-2 rounded-full ${s.id === section.id ? 'bg-white' : 'bg-hotpink'}`}
                  title="Unsaved changes"
                />
              )}
            </button>
          ))}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <h2 className="font-display text-3xl text-hotpink uppercase">
              {section.label}
            </h2>
            {problems.length > 0 && (
              <ul className="rounded-xl border-2 border-red-300 bg-red-50 p-3 text-sm text-red-800">
                {problems.map((p, i) => (
                  <li key={i}>{p.message}</li>
                ))}
              </ul>
            )}
            <Form value={draft[section.file]} onChange={setFile} />
          </div>
        </main>
      </div>
    </div>
  )
}

function StatusLine({
  status,
  dirty,
}: {
  status: Status
  dirty: ContentFile[]
}) {
  switch (status.kind) {
    case 'saving':
      return <>Saving {FILE_NAMES[status.file]}…</>
    case 'error':
      return <span className="text-red-700">{status.message}</span>
    case 'saved':
      return (
        <span className="text-green-700">
          Saved.
          {status.warnings.length > 0 && (
            <span className="text-amber-700">
              {' '}
              Warning: {status.warnings.join(' ')}
            </span>
          )}
        </span>
      )
    default:
      return dirty.length > 0 ? (
        <>Unsaved changes</>
      ) : (
        <span className="text-neutral-500">No unsaved changes</span>
      )
  }
}

export default function Editor() {
  useEffect(() => {
    document.title = documentTitle(EDITOR_TITLE)
  }, [])

  return (
    <PasswordGate>
      <Workspace />
    </PasswordGate>
  )
}
