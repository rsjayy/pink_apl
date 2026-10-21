import type { ReactNode } from 'react'
import { HomeApple, HomeIcon } from '../components/HomeLinks'
import { Stage } from '../components/Stage'
import { builtContent } from '../content/site'

/** Shared by the profile and lore pages: they differ only in the box's text. */
export function ProfileLayout({
  children,
  footer,
}: {
  children: ReactNode
  footer: ReactNode
}) {
  const { profile, lobby } = builtContent
  return (
    <Stage>
      <img
        src={profile.profileArt}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 stage:opacity-60"
      />

      <div className="relative flex flex-col gap-4 stage:h-full stage:p-10 stage:pb-12">
        <h1 className="font-display text-5xl leading-none stage:text-8xl">
          {profile.name}
        </h1>

        <div className="relative flex flex-col border-4 border-hotpink bg-white/70 stage:min-h-0 stage:w-[600px] stage:flex-1">
          <HomeIcon
            src={lobby.menuIcons.info}
            className="absolute -top-8 -right-3 size-16 stage:-top-14 stage:-right-12 stage:size-28"
          />

          {/* On the stage the box has a fixed height, so long text scrolls inside it. */}
          <div className="scroll-pink space-y-4 p-5 pr-10 text-sm stage:flex-1 stage:overflow-y-auto stage:p-8 stage:pr-28 stage:text-base">
            {children}
          </div>

          <div className="p-5 pt-0 stage:px-8 stage:pb-6">{footer}</div>

          <img
            src={profile.chibi}
            alt=""
            className="mx-auto mb-4 w-32 stage:absolute stage:-right-24 stage:bottom-0 stage:mb-0 stage:w-48"
          />
        </div>
      </div>
      <HomeApple />
    </Stage>
  )
}
