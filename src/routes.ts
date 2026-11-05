// The one list of pages. The router (App.tsx) and the build (vite.config.ts,
// which writes one index.html per page so deep links load on GitHub Pages)
// both read it, so keep this file free of React imports.

export const PAGES = {
  lobby: { path: '/', title: 'Hospital Lobby' },
  info: { path: '/info', title: 'Dr. Jayy' },
  lore: { path: '/info/lore', title: 'Dr. Jayy – Lore' },
  characters: { path: '/oc', title: 'Main Characters' },
  species: { path: '/species', title: 'Species' },
  pharmacy: { path: '/pharmacy', title: 'Pharmacy' },
} as const satisfies Record<string, { path: string; title: string }>

export type PageId = keyof typeof PAGES

export const PAGE_IDS = Object.keys(PAGES) as PageId[]

export const NOT_FOUND_TITLE = 'Page not found'

/** The owner-only content editor. Not in PAGES: it isn't part of the site. */
export const EDITOR_PATH = '/editor'

/** Where the owner sets the editor password and their GitHub token. */
export const SET_PASSWORD_PATH = '/set-password'
