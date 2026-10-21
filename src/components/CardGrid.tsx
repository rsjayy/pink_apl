import type { Card } from '../content/site'

function CardBody({ card }: { card: Card }) {
  return (
    <>
      {card.name && (
        <span className="text-2xl stage:text-3xl">{card.name}</span>
      )}
      <img
        src={card.image}
        alt={card.name ?? card.caption ?? ''}
        className="aspect-square w-full border-4 border-hotpink bg-white object-cover transition-transform group-hover:-translate-y-1"
      />
      {card.caption && (
        <span className="text-center text-base stage:text-xl">
          {card.caption}
        </span>
      )}
    </>
  )
}

export function CardGrid({ cards }: { cards: Card[] }) {
  return (
    <ul className="mx-auto grid w-full max-w-xs grid-cols-1 gap-8 stage:max-w-none stage:grid-cols-3 stage:gap-16 stage:px-6">
      {cards.map((card, i) => (
        <li key={i}>
          {card.url ? (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <CardBody card={card} />
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <CardBody card={card} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
