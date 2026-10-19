import { placeholder } from './assets'

export interface Card {
  /** Shown above the image. */
  name?: string
  /** Shown under the image. */
  caption?: string
  image: string
  /** Opens in a new tab. No url means the card is not a link. */
  url?: string
}

// Main characters, each linking to its Toyhouse page.
export const characters: Card[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  name: `Name ${n}`,
  image: placeholder(400, 400, `OC ${n}`),
  url: 'https://toyhou.se/',
}))

// Species, each linking to a Pinterest board.
export const species: Card[] = [1, 2, 3, 4].map((n) => ({
  name: `Name ${n}`,
  image: placeholder(400, 400, `Species ${n}`),
  url: 'https://www.pinterest.com/',
}))

// Pharmacy: special thanks.
export const thanks: Card[] = [
  {
    caption: "If u don't mind hehe (web dev)",
    image: placeholder(400, 400, 'Thanks 1'),
  },
  { caption: 'Someone (idk)', image: placeholder(400, 400, 'Thanks 2') },
  { caption: 'Friend (yes)', image: placeholder(400, 400, 'Thanks 3') },
]
