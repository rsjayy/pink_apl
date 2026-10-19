import { Link, type To } from 'react-router'
import type { ReactNode } from 'react'

/** The big "NEXT >" / "< BACK" style links. */
export function TextLink({ to, children }: { to: To; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="font-display text-3xl leading-none transition-opacity hover:opacity-70 stage:text-4xl"
    >
      {children}
    </Link>
  )
}

export function Pager({
  page,
  pageCount,
}: {
  page: number
  pageCount: number
}) {
  if (pageCount <= 1) return null

  // Page 1 is the bare URL, the same one the lobby links to.
  const searchFor = (target: number) => (target === 1 ? '' : `?page=${target}`)

  return (
    <nav aria-label="Pages" className="flex gap-8">
      {page > 1 && (
        <TextLink to={{ search: searchFor(page - 1) }}>&lt; Prev</TextLink>
      )}
      {page < pageCount && (
        <TextLink to={{ search: searchFor(page + 1) }}>Next &gt;</TextLink>
      )}
    </nav>
  )
}
