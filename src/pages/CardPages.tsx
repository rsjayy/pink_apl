import { PAGES } from '../routes'
import { CardsLayout } from './CardsLayout'
import { builtContent } from '../content/site'

export function Characters() {
  const { cards, lobby } = builtContent
  return (
    <CardsLayout
      title={PAGES.characters.title}
      icon={lobby.menuIcons.characters}
      cards={cards.characters}
    />
  )
}

export function Species() {
  const { cards, lobby } = builtContent
  return (
    <CardsLayout
      title={PAGES.species.title}
      icon={lobby.menuIcons.species}
      cards={cards.species}
    />
  )
}

export function Pharmacy() {
  const { cards, lobby } = builtContent
  return (
    <CardsLayout
      title={PAGES.pharmacy.title}
      icon={lobby.menuIcons.pharmacy}
      subtitle={cards.pharmacySubtitle}
      cards={cards.thanks}
    />
  )
}
