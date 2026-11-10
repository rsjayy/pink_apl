import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const textEndRef = useRef<HTMLDivElement>(null)
  const [isAtTextEnd, setIsAtTextEnd] = useState(true)

  useEffect(() => {
    const textEnd = textEndRef.current
    if (!textEnd) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsAtTextEnd(entry.isIntersecting),
      { root: textEnd.parentElement },
    )
    observer.observe(textEnd)
    return () => observer.disconnect()
  }, [])

  return (
    <Stage>
      {/* Fixed to the screen on phones, so scrolling can't zoom it; shifted right to keep her face in the narrow slice. */}
      <img
        src={profile.profileArt}
        alt=""
        className="pointer-events-none fixed inset-0 h-dvh w-full object-cover object-right opacity-25 stage:absolute stage:h-full stage:object-center stage:opacity-60"
      />

      <div className="relative flex flex-col gap-4 stage:h-full stage:p-10 stage:pb-12">
        <h1 className="font-display text-5xl leading-none stage:text-8xl">
          {profile.name}
        </h1>

        {/* On phones the height limit stops the frame just above the fixed row of chibi and apple. */}
        <div className="relative flex max-h-[calc(100dvh-15rem)] min-h-0 flex-col border-4 border-hotpink bg-white/70 stage:max-h-none stage:w-[600px] stage:flex-1">
          <HomeIcon
            src={lobby.menuIcons.info}
            className="absolute -top-8 -right-3 size-16 stage:-top-14 stage:-right-12 stage:size-28"
            imageClassName="motion-safe:animate-float"
          />

          {/* Phones hide the scrollbar, so the fade is the only sign of more text. */}
          <div
            className={`min-h-0 flex-1 scroll-pink space-y-4 overflow-y-auto p-5 pr-14 text-sm stage:p-8 stage:pr-28 stage:text-base ${isAtTextEnd ? '' : 'mask-b-from-[calc(100%-3rem)] stage:mask-none'}`}
          >
            {children}
            <div ref={textEndRef} className="h-px" />
          </div>

          <div className="p-5 pt-0 stage:px-8 stage:pb-6">{footer}</div>

          <img
            src={profile.chibi}
            alt=""
            className="fixed bottom-4 left-4 w-28 stage:absolute stage:-right-24 stage:bottom-0 stage:left-auto stage:w-48"
          />
        </div>
      </div>
      <HomeApple />
    </Stage>
  )
}
