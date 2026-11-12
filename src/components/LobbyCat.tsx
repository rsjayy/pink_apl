// The lobby's little desktop-pet cat.
// PeekingCat waits for every GIF to download, then rises slowly out of the
// banner. Clicking it swaps it for RoamingCat, which falls to the bottom of the
// screen and walks back and forth. Each click makes it flash, hop and wobble,
// and pops out a random item that bounces, lands at a tilt and gently fades
// away, like loot in a game; clicking an item collects it, and it floats away.
// One animation loop moves the cat and its items. Images come from `cat` in
// content/lobby.json; the Lobby page leaves the cat out until all three GIF
// links are set.

import { useEffect, useRef, useState } from 'react'
import { builtContent } from '../content/site'

// #region Config
const { cat } = builtContent.lobby

// Peek, fall and walk share one square frame, so the cat doesn't jump between them.
const CAT_SIZE = 'size-24 stage:size-36'

// Speeds are in page pixels: the stage is always 1280 wide before scaling.
const GRAVITY = 600
const HOP_SPEED = -200
const WALK_SPEED = 75
const TURN_CHANCE_PER_SECOND = 0.12
const LONGEST_FRAME_SECONDS = 0.05

// Keeps the cat from covering the apple link in the bottom-right corner.
const APPLE_CLEARANCE = 110

// A click: a quick hop, and a jelly wobble that springs back to shape.
const CLICK_HOP_SPEED = -150
const HOP_GRAVITY = 2200
const WOBBLE_STIFFNESS = 500
const WOBBLE_DAMPING = 30
const FLASH_SECONDS = 0.08

// Items are thrown up out of the cat and bounce a few times before settling.
const ITEM_SIZE = 48
const MOST_ITEMS_ON_SCREEN = 12
const ITEM_GRAVITY = 1500
const ITEM_THROW_SPEED = 400
const ITEM_THROW_SPREAD = 170
const ITEM_BOUNCINESS = 0.35
const ITEM_SETTLE_SPEED = 120
const ITEM_POP_IN_SECONDS = 0.18
const ITEM_LIFE_SECONDS = 6
const ITEM_FADE_SECONDS = 1.5

// Clicking an item collects it: it floats up and fades out.
const ITEM_COLLECT_SECONDS = 0.6
const ITEM_COLLECT_RISE = 40

interface DroppedItem {
  element: HTMLImageElement
  age: number
  x: number
  y: number
  speedX: number
  speedY: number
  angle: number
  spin: number
  squash: number
  isResting: boolean
  collectedFor: number | null
}

// Kept for the life of the page so the browser can swap GIFs from memory.
const loadedImages: HTMLImageElement[] = []
let catImagesLoading: Promise<unknown> | undefined
// #endregion

// #region Components
export function PeekingCat({ onPoke }: { onPoke: (start: DOMRect) => void }) {
  const [isLoaded, setIsLoaded] = useState(false)

  // The cat can't be clicked until now, so the fall and walk GIFs are always ready.
  useEffect(() => {
    let isMounted = true
    loadCatImages()
      .then(() => {
        if (isMounted) setIsLoaded(true)
      })
      .catch(console.warn)
    return () => {
      isMounted = false
    }
  }, [])

  if (!isLoaded) return null

  return (
    <button
      type="button"
      aria-label="Poke the cat"
      onClick={(event) => onPoke(event.currentTarget.getBoundingClientRect())}
      className={`absolute bottom-0 left-4 origin-bottom cursor-pointer motion-safe:animate-cat-rise ${CAT_SIZE}`}
    >
      <img
        src={cat.peek}
        alt=""
        className="size-full object-contain object-bottom"
      />
    </button>
  )
}

export function RoamingCat({ start }: { start: DOMRect }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLButtonElement>(null)
  const catImageRef = useRef<HTMLImageElement>(null)
  const [isFalling, setIsFalling] = useState(true)

  useEffect(() => {
    const layer = layerRef.current
    const button = catRef.current
    const catImage = catImageRef.current
    if (!layer || !button || !catImage) return
    button.focus({ preventScroll: true })

    const layerBox = layer.getBoundingClientRect()
    const scale = layerBox.width / layer.offsetWidth
    const isMotionReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let x = (start.left - layerBox.left) / scale
    let y = (start.top - layerBox.top) / scale
    let fallSpeed = HOP_SPEED
    let direction = 1
    let falling = true
    let hopHeight = 0
    let hopSpeed = 0
    let wobble = 0
    let wobbleSpeed = 0
    let flashLeft = 0
    const items: DroppedItem[] = []
    let lastTime = performance.now()
    let frame = requestAnimationFrame(tick)

    // Wired here, not with onClick, because a click changes the loop's own state.
    const onClick = () => {
      if (falling) return
      flashLeft = FLASH_SECONDS
      if (!isMotionReduced) {
        wobbleSpeed -= 1.5
        if (hopHeight === 0) hopSpeed = CLICK_HOP_SPEED
      }
      if (cat.items.length === 0) return

      const element = new Image()
      element.src = cat.items[Math.floor(Math.random() * cat.items.length)]
      element.alt = ''
      element.className =
        'pointer-events-auto absolute top-0 left-0 cursor-pointer object-contain'
      element.style.width = element.style.height = `${ITEM_SIZE}px`
      layer.append(element)

      const itemFloor = layer.clientHeight - ITEM_SIZE
      const item: DroppedItem = {
        element,
        age: 0,
        x: x + (button.offsetWidth - ITEM_SIZE) / 2,
        y: isMotionReduced
          ? itemFloor
          : y + hopHeight + button.offsetHeight * 0.3,
        speedX: (Math.random() - 0.5) * 2 * ITEM_THROW_SPREAD,
        speedY: -ITEM_THROW_SPEED * (0.8 + Math.random() * 0.4),
        angle: 0,
        spin: (Math.random() - 0.5) * 600,
        squash: 0,
        isResting: isMotionReduced,
        collectedFor: null,
      }
      items.push(item)
      element.addEventListener('click', () => {
        element.style.pointerEvents = 'none'
        item.collectedFor = isMotionReduced ? ITEM_COLLECT_SECONDS : 0
      })
      if (items.length > MOST_ITEMS_ON_SCREEN) items.shift()!.element.remove()
    }
    button.addEventListener('click', onClick)

    function tick(now: number) {
      const seconds = Math.min((now - lastTime) / 1000, LONGEST_FRAME_SECONDS)
      lastTime = now
      const floor = layer!.clientHeight - button!.offsetHeight
      const rightEdge =
        layer!.clientWidth - button!.offsetWidth - APPLE_CLEARANCE

      if (falling) {
        fallSpeed += GRAVITY * seconds
        y += fallSpeed * seconds
        if (y >= floor || isMotionReduced) {
          y = floor
          falling = false
          wobble = 0.04
          setIsFalling(false)
        }
      } else {
        y = floor
        if (!isMotionReduced) {
          x += direction * WALK_SPEED * seconds
          if (Math.random() < TURN_CHANCE_PER_SECOND * seconds) direction *= -1
        }
        if (x <= 0) direction = 1
        if (x >= rightEdge) direction = -1
        x = Math.max(0, Math.min(x, rightEdge))
      }

      if (hopSpeed !== 0 || hopHeight < 0) {
        hopSpeed += HOP_GRAVITY * seconds
        hopHeight += hopSpeed * seconds
        // Stretch tall going up, squash flat on landing.
        if (hopSpeed < 0) wobble = Math.min(wobble, -0.03)
        if (hopHeight >= 0) {
          hopHeight = 0
          hopSpeed = 0
          wobble = 0.05
        }
      }
      wobbleSpeed +=
        (-WOBBLE_STIFFNESS * wobble - WOBBLE_DAMPING * wobbleSpeed) * seconds
      wobble += wobbleSpeed * seconds
      flashLeft -= seconds

      button!.style.translate = `${x}px ${y + hopHeight}px`
      // The sprites are drawn facing right.
      button!.style.scale = `${direction * (1 + wobble)} ${1 - wobble}`
      catImage!.style.filter = flashLeft > 0 ? 'brightness(1.4)' : ''

      for (const item of [...items]) {
        item.age += seconds

        if (item.collectedFor !== null) {
          item.collectedFor += seconds
          const progress = item.collectedFor / ITEM_COLLECT_SECONDS
          if (progress >= 1) {
            item.element.remove()
            items.splice(items.indexOf(item), 1)
            continue
          }
          const rise = ITEM_COLLECT_RISE * (1 - (1 - progress) ** 2)
          item.element.style.translate = `${item.x}px ${item.y - rise}px`
          // Never brighter than it was, in case it was already fading out.
          const shownOpacity = Number(item.element.style.opacity || 1)
          item.element.style.opacity = `${Math.min(shownOpacity, 1 - progress)}`
          continue
        }

        // A tilted item reaches further out than its box, so it rests on its lowest corner.
        const radians = (item.angle * Math.PI) / 180
        const reach =
          ((Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) *
            ITEM_SIZE) /
          2
        const itemFloor = layer!.clientHeight - ITEM_SIZE / 2 - reach
        const itemLeftEdge = reach - ITEM_SIZE / 2
        const itemRightEdge = layer!.clientWidth - ITEM_SIZE / 2 - reach

        if (!item.isResting) {
          item.speedY += ITEM_GRAVITY * seconds
          item.x += item.speedX * seconds
          item.y += item.speedY * seconds
          item.angle += item.spin * seconds
          if (item.x < itemLeftEdge || item.x > itemRightEdge) {
            item.x = Math.max(itemLeftEdge, Math.min(item.x, itemRightEdge))
            item.speedX *= -0.6
          }
          if (item.y >= itemFloor) {
            item.y = itemFloor
            item.squash = Math.min(item.speedY / 2000, 0.2)
            item.speedY *= -ITEM_BOUNCINESS
            item.speedX *= 0.6
            item.spin *= 0.5
            if (-item.speedY < ITEM_SETTLE_SPEED) item.isResting = true
          }
        }
        item.squash *= 1 - Math.min(1, 12 * seconds)

        const fadeTime = item.age - ITEM_LIFE_SECONDS
        if (fadeTime > ITEM_FADE_SECONDS) {
          item.element.remove()
          items.splice(items.indexOf(item), 1)
          continue
        }

        // Pops in a little too big, like loot appearing, then settles to full size.
        const popIn = Math.min(item.age / ITEM_POP_IN_SECONDS, 1)
        const grow = isMotionReduced
          ? 1
          : 1 + 1.8 * (popIn - 1) ** 3 + 0.8 * (popIn - 1) ** 2
        // A soft flicker while fading out, a quiet "about to vanish" hint.
        const opacity =
          fadeTime <= 0
            ? 1
            : (1 - fadeTime / ITEM_FADE_SECONDS) *
              (isMotionReduced ? 1 : 0.85 + 0.15 * Math.cos(fadeTime * 10))

        // Squashing shrinks toward the middle; push it down so it stays on the floor.
        const squashDrop = item.squash * reach
        item.element.style.translate = `${item.x}px ${item.y + squashDrop}px`
        item.element.style.rotate = `${item.angle}deg`
        item.element.style.scale = `${grow * (1 + item.squash)} ${grow * (1 - item.squash)}`
        item.element.style.opacity = `${opacity}`
      }

      frame = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(frame)
      button.removeEventListener('click', onClick)
      for (const item of items) item.element.remove()
    }
  }, [start])

  return (
    // Fixed to the screen on phones, where the page scrolls; the stage never scrolls.
    // Items are added to this layer by the loop, under the cat.
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden stage:absolute"
    >
      <button
        ref={catRef}
        type="button"
        aria-label="Pet the cat"
        className={`pointer-events-auto absolute top-0 left-0 z-10 origin-bottom cursor-pointer ${CAT_SIZE}`}
      >
        <img
          ref={catImageRef}
          src={isFalling ? cat.fall : cat.walk}
          alt=""
          className="size-full object-contain object-bottom"
        />
      </button>
    </div>
  )
}
// #endregion

// #region Image loading
function loadCatImages() {
  if (catImagesLoading) return catImagesLoading

  // Items don't hold the cat back: a slow or broken one only affects that item.
  for (const item of cat.items) loadImage(item).catch(console.warn)
  catImagesLoading = Promise.all([cat.peek, cat.fall, cat.walk].map(loadImage))
  return catImagesLoading
}

function loadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()
    loadedImages.push(image)
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(`Cat image didn't load: ${src}`))
    image.src = src
  })
}
// #endregion
