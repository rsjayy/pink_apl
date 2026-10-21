import { useState, type ReactNode } from 'react'
import { Button } from './fields'

let lastId = 0
const newId = () => ++lastId

function arrayMove<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * A list of collapsible items. Only the first starts open, so a long list
 * stays short. Each row has a position number (click it to type a new one),
 * up/down arrows and a remove button; there's an add button at the end.
 */
export function ListEditor<T>({
  items,
  onChange,
  renderItem,
  summary,
  newItem,
  itemName,
}: {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, update: (item: T) => void) => ReactNode
  /** The row shown while the item is collapsed. */
  summary: (item: T) => ReactNode
  newItem: () => T
  /** "card", ... Used in button labels. */
  itemName: string
}) {
  // Stable keys, so the open items stay open when the list is reordered.
  const [ids, setIds] = useState(() => items.map(newId))
  const keys = items.map((_, i) => ids[i] ?? -i - 1)
  const [open, setOpen] = useState(() => new Set(keys.slice(0, 1)))

  const toggle = (key: number) =>
    setOpen((old) => {
      const next = new Set(old)
      if (!next.delete(key)) next.add(key)
      return next
    })
  const update = (index: number, item: T) =>
    onChange(items.map((old, i) => (i === index ? item : old)))
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
    setIds(keys.filter((_, i) => i !== index))
  }
  const moveTo = (from: number, to: number) => {
    onChange(arrayMove(items, from, to))
    setIds(arrayMove(keys, from, to))
  }
  const add = () => {
    const id = newId()
    onChange([...items, newItem()])
    setIds([...keys, id])
    setOpen((old) => new Set(old).add(id))
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const key = keys[i]
        const isOpen = open.has(key)
        return (
          <div
            key={key}
            className="rounded-xl border-2 border-bubblegum bg-white/70"
          >
            <div className="flex items-center gap-2 p-2">
              <ReorderControl
                index={i}
                total={items.length}
                onMoveTo={moveTo}
              />
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left hover:bg-blush"
                aria-expanded={isOpen}
                onClick={() => toggle(key)}
              >
                <span className="min-w-0 flex-1">{summary(item)}</span>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className={`size-6 shrink-0 fill-none stroke-hotpink stroke-[2.5] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <Button
                variant="quiet"
                aria-label={`Remove ${itemName} ${i + 1}`}
                title="Remove"
                className="text-red-700"
                onClick={() => remove(i)}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-current stroke-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </Button>
            </div>
            {isOpen && (
              <div className="flex flex-col gap-3 border-t-2 border-bubblegum p-4">
                {renderItem(item, (next) => update(i, next))}
              </div>
            )}
          </div>
        )
      })}
      <div>
        <Button
          onClick={add}
          aria-label={`Add ${itemName}`}
          title={`Add ${itemName}`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-6 fill-none stroke-current stroke-[2.5]"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

const reorderButton =
  'rounded border border-bubblegum px-1.5 py-0.5 text-[10px] leading-none text-hotpink transition-colors hover:not-disabled:border-hotpink hover:not-disabled:bg-hotpink hover:not-disabled:text-white disabled:cursor-not-allowed disabled:opacity-30'

const indexBox =
  'size-9 rounded border text-center text-xs font-semibold tabular-nums'

/** Up/down arrows plus the position number; click the number to type one. */
function ReorderControl({
  index,
  total,
  onMoveTo,
}: {
  index: number
  total: number
  onMoveTo: (from: number, to: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    const parsed = parseInt(draft ?? '', 10)
    if (!Number.isNaN(parsed)) {
      const target = Math.max(1, Math.min(total, parsed)) - 1
      if (target !== index) onMoveTo(index, target)
    }
    setDraft(null)
  }

  return (
    <div className="flex shrink-0 items-center gap-1 select-none">
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          className={reorderButton}
          disabled={index === 0}
          aria-label="Move up"
          title="Move up"
          onClick={() => onMoveTo(index, index - 1)}
        >
          ▲
        </button>
        <button
          type="button"
          className={reorderButton}
          disabled={index === total - 1}
          aria-label="Move down"
          title="Move down"
          onClick={() => onMoveTo(index, index + 1)}
        >
          ▼
        </button>
      </div>
      {draft === null ? (
        <button
          type="button"
          className={`${indexBox} border-bubblegum bg-white text-hotpink transition-colors hover:border-hotpink hover:bg-hotpink hover:text-white`}
          title={`Position ${index + 1} of ${total}. Click to move it somewhere else.`}
          aria-label={`Position ${index + 1} of ${total}. Click to move.`}
          onClick={() => setDraft(String(index + 1))}
        >
          {index + 1}
        </button>
      ) : (
        <input
          type="number"
          // Opened by a click, so taking focus is what the user expects.
          autoFocus
          onFocus={(e) => e.target.select()}
          className={`${indexBox} w-12 [appearance:textfield] border-hotpink bg-white outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          min={1}
          max={total}
          value={draft}
          aria-label={`Move to position (1 to ${total})`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setDraft(null)
            }
          }}
        />
      )}
    </div>
  )
}
