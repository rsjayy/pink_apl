import type { ReactNode } from 'react'
import { HomeIcon } from './HomeLinks'

export function PageTitle({
  children,
  icon,
}: {
  children: ReactNode
  icon?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="font-display text-4xl leading-none stage:text-6xl">
        {children}
      </h1>
      {icon && <HomeIcon src={icon} className="size-12 stage:size-16" />}
    </div>
  )
}
