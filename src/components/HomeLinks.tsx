import { Link } from 'react-router'
import { PAGES } from '../routes'
import { builtContent } from '../content/site'

const WIGGLE =
  'transition-transform hover:-rotate-6 hover:scale-110 focus-visible:scale-110'

/** A decorative icon that doubles as a link back to the lobby. */
export function HomeIcon({
  src,
  className = '',
}: {
  src: string
  className?: string
}) {
  return (
    <Link
      to={PAGES.lobby.path}
      aria-label="Back to the lobby"
      className={`inline-block shrink-0 ${WIGGLE} ${className}`}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full rounded-lg object-cover shadow-md"
      />
    </Link>
  )
}

/**
 * The apple in the bottom-right corner of every page. On phones it is pinned
 * to the screen while the page scrolls; on the stage, which never scrolls, it
 * sits in the card's corner.
 */
export function HomeApple() {
  const { lobby } = builtContent
  return (
    <HomeIcon
      src={lobby.apple}
      className="fixed right-4 bottom-4 z-10 size-16 stage:absolute stage:right-6 stage:bottom-6 stage:size-20"
    />
  )
}
