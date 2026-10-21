import {
  builtContent,
  CONTENT_FILES,
  type ContentFile,
  type SiteContent,
} from '../content/site'

// The editor starts from the content built into the site. Right after a
// save that is out of date: GitHub takes a few minutes to rebuild. So each
// save is also kept here, and used instead of the built copy until a build
// newer than the save comes out. Otherwise reloading the editor and saving
// again would quietly undo the first save.

const key = (file: ContentFile) => `pink_apl_saved_${file}`

interface SavedCopy {
  savedAt: number
  content: unknown
}

function read(file: ContentFile): SavedCopy | null {
  try {
    const raw = localStorage.getItem(key(file))
    return raw ? (JSON.parse(raw) as SavedCopy) : null
  } catch {
    return null
  }
}

export function rememberSave(file: ContentFile, content: unknown) {
  try {
    localStorage.setItem(
      key(file),
      JSON.stringify({ savedAt: Date.now(), content } satisfies SavedCopy),
    )
  } catch {
    // Storage full or blocked: the editor still works, just without this guard.
  }
}

/**
 * The latest saved content: the built copy, with any newer save on top.
 * `pending` lists the files whose save hasn't reached the live site yet.
 */
export function loadLatest(): { content: SiteContent; pending: ContentFile[] } {
  const content: Record<ContentFile, unknown> = { ...builtContent }
  const pending: ContentFile[] = []
  for (const file of CONTENT_FILES) {
    const copy = read(file)
    if (copy && copy.savedAt > __BUILD_TIME__) {
      content[file] = copy.content
      pending.push(file)
    } else if (copy) {
      localStorage.removeItem(key(file))
    }
  }
  return { content: content as SiteContent, pending }
}
