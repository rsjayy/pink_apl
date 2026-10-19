import { assets } from '../content/assets'
import { characters, species, thanks } from '../content/cards'
import { PAGES } from '../routes'
import { CardsLayout } from './CardsLayout'

export function Characters() {
  return (
    <CardsLayout
      title={PAGES.characters.title}
      icon={assets.pillOrange}
      cards={characters}
    />
  )
}

export function Species() {
  return (
    <CardsLayout
      title={PAGES.species.title}
      icon={assets.bandage}
      cards={species}
    />
  )
}

export function Pharmacy() {
  return (
    <CardsLayout
      title={PAGES.pharmacy.title}
      icon={assets.pillPink}
      subtitle="Special Thanks"
      cards={thanks}
    />
  )
}
