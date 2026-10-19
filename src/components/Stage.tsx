import { useEffect, useState, type ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Must match the `stage` variant in index.css.
const STAGE_QUERY = '(min-width: 768px) and (min-height: 500px)'

// Pages are laid out at this size, then scaled to fit the window.
const DESIGN_WIDTH = 1280
const DESIGN_HEIGHT = 800
const MARGIN = 32

function fitScale() {
  return Math.min(
    (window.innerWidth - MARGIN) / DESIGN_WIDTH,
    (window.innerHeight - MARGIN) / DESIGN_HEIGHT,
  )
}

function useFitScale(enabled: boolean) {
  const [scale, setScale] = useState(fitScale)

  useEffect(() => {
    if (!enabled) return
    const update = () => setScale(fitScale())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [enabled])

  return scale
}

const CARD = 'relative bg-linear-to-b from-blush to-bubblegum'

/**
 * The pink card every page sits on. On wide screens it is a fixed 16:10
 * canvas scaled to fit (pages style it with `stage:` classes); on phones it
 * is a normal scrolling column (pages style it with base classes).
 */
export function Stage({ children }: { children: ReactNode }) {
  const isStage = useMediaQuery(STAGE_QUERY)
  const scale = useFitScale(isStage)

  if (!isStage) {
    return <div className={`${CARD} min-h-dvh px-4 pt-6 pb-28`}>{children}</div>
  }

  return (
    <div className="relative flex h-dvh items-center justify-center overflow-hidden">
      {/* Oversized by one tile on every side so sliding it never shows an edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 bg-crosses motion-safe:animate-drift"
      />
      <div
        className="relative shadow-2xl shadow-hotpink/30"
        style={{ width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale }}
      >
        <div
          className={`${CARD} absolute top-0 left-0 origin-top-left overflow-hidden`}
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
