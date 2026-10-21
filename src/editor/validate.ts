import {
  MENU,
  type Card,
  type ContentFile,
  type SiteContent,
} from '../content/site'
import { PAGES } from '../routes'

export interface Problem {
  file: ContentFile
  message: string
}

const CARD_LISTS = [
  ['characters', PAGES.characters.title],
  ['species', PAGES.species.title],
  ['thanks', PAGES.pharmacy.title],
] as const

function isLink(url: string) {
  return /^https?:\/\/\S+$/.test(url)
}

/** Mistakes that would show up broken on the site. Any of these blocks saving. */
export function findProblems(content: SiteContent): Problem[] {
  const problems: Problem[] = []
  const add = (file: ContentFile, message: string) =>
    problems.push({ file, message })

  for (const { label, page } of MENU) {
    if (!isLink(content.lobby.menuIcons[page]))
      add('lobby', `The ${label} menu button needs an icon link.`)
  }

  for (const [list, title] of CARD_LISTS) {
    content.cards[list].forEach((card: Card, i) => {
      if (!isLink(card.image))
        add('cards', `${title}: card ${i + 1} needs an image link.`)
      if (card.url !== undefined && !isLink(card.url)) {
        add('cards', `${title}: card ${i + 1}'s link must start with https://.`)
      }
    })
  }

  const images: [ContentFile, string, string][] = [
    ['lobby', 'Lobby banner', content.lobby.banner],
    ['lobby', 'Apple', content.lobby.apple],
    ['profile', 'Bio background art', content.profile.profileArt],
    ['profile', 'Chibi', content.profile.chibi],
  ]
  for (const [file, name, link] of images) {
    if (!isLink(link)) add(file, `${name} needs an image link (https://...).`)
  }

  return problems
}
