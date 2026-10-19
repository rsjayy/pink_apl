import type { ReactNode } from 'react'
import { CardGrid } from '../components/CardGrid'
import { HomeApple } from '../components/HomeLinks'
import { PageTitle } from '../components/PageTitle'
import { Stage } from '../components/Stage'
import { Pager } from '../components/TextLink'
import type { Card } from '../content/cards'
import { usePagedItems } from '../hooks/usePagedItems'

/** Shared by the OC, Species and Pharmacy pages: a title and three cards per page. */
export function CardsLayout({
  title,
  icon,
  subtitle,
  cards,
}: {
  title: ReactNode
  icon: string
  subtitle?: ReactNode
  cards: Card[]
}) {
  const { page, pageCount, pageItems } = usePagedItems(cards)

  return (
    <Stage>
      <div className="flex flex-col gap-8 stage:h-full stage:p-10">
        <PageTitle icon={icon}>{title}</PageTitle>
        {subtitle && (
          <h2 className="-mt-2 text-center font-display text-3xl stage:-mt-6 stage:text-4xl">
            {subtitle}
          </h2>
        )}
        <div className="stage:flex stage:flex-1 stage:items-center">
          <CardGrid cards={pageItems} />
        </div>
        <Pager page={page} pageCount={pageCount} />
      </div>
      <HomeApple />
    </Stage>
  )
}
