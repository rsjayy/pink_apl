// All the site's words, links and images. The data is in the three JSON files
// next to this one; the editor (/editor) rewrites them, one file per save.
// Every image is a full link (https://...).

import type { PageId } from '../routes'
import cards from './cards.json'
import lobby from './lobby.json'
import profile from './profile.json'

export interface Card {
  /** Shown above the image. */
  name?: string
  /** Shown under the image. */
  caption?: string
  image: string
  /** Opens in a new tab. No url means the card is not a link. */
  url?: string
}

/** Any page the lobby can link to. */
export type NavPage = Exclude<PageId, 'lobby'>

/** The lobby's menu buttons, in order. Only their icons can be changed. */
export const MENU = [
  { label: 'Info', page: 'info' },
  { label: 'OC', page: 'characters' },
  { label: 'Species', page: 'species' },
  { label: 'Pharmacy', page: 'pharmacy' },
] as const satisfies { label: string; page: NavPage }[]

export type MenuPage = (typeof MENU)[number]['page']

export interface LobbyContent {
  heading: string
  /** BBCode, socials included. */
  description: string
  disclaimer: string
  /** The wide picture at the top of the lobby. */
  banner: string
  /** The corner button back to the lobby, on every page. */
  apple: string
  /** Each menu button's icon, also shown on that page (by its title, or on the Bio box). */
  menuIcons: Record<MenuPage, string>
}

export interface ProfileContent {
  name: string
  // Both are BBCode, edited with SCEditor and shown by components/BBCode.tsx.
  about: string
  lore: string
  /** Behind the profile and lore pages. */
  profileArt: string
  /** The little figure by the profile box. */
  chibi: string
}

export interface CardsContent {
  // Main characters, each linking to its Toyhouse page.
  characters: Card[]
  // Species, each linking to a Pinterest board.
  species: Card[]
  pharmacySubtitle: string
  // Pharmacy: special thanks.
  thanks: Card[]
}

export interface SiteContent {
  lobby: LobbyContent
  profile: ProfileContent
  cards: CardsContent
}

/** One entry per JSON file. Each key is also the file's id on the editor server. */
export type ContentFile = keyof SiteContent

export const CONTENT_FILES: ContentFile[] = ['lobby', 'profile', 'cards']

/** The content as it was built into this copy of the site. */
export const builtContent: SiteContent = {
  lobby,
  profile,
  cards,
}
