import { useSearchParams } from 'react-router'

/** Slices items into pages of `perPage`, with the current page in `?page=`. */
export function usePagedItems<T>(items: T[], perPage = 3) {
  const [searchParams] = useSearchParams()
  const pageCount = Math.max(1, Math.ceil(items.length / perPage))
  const requested = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isNaN(requested)
    ? 1
    : Math.min(Math.max(requested, 1), pageCount)

  return {
    page,
    pageCount,
    pageItems: items.slice((page - 1) * perPage, page * perPage),
  }
}
