// The lobby's little desktop-pet cat.
// PeekingCat sits in the banner. Clicking it swaps it for RoamingCat, which
// falls to the bottom of the screen, walks back and forth and drops a random
// item when clicked. Images come from `cat` in content/lobby.json; the Lobby
// page leaves the cat out until all three GIF links are set.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { builtContent } from '../content/site'

// #region Config
const { cat } = builtContent.lobby

// Peek, fall and walk share one square frame, so the cat doesn't jump between them.
const CAT_SIZE = 'size-24 stage:size-36'

// Speeds are in page pixels: the stage is always 1280 wide before scaling.
const GRAVITY = 1800
const HOP_SPEED = -420
const WALK_SPEED = 75
const TURN_CHANCE_PER_SECOND = 0.12
const LONGEST_FRAME_SECONDS = 0.05

// Keeps the cat from covering the apple link in the bottom-right corner.
const APPLE_CLEARANCE = 110

const ITEM_SIZE = 48
const MOST_ITEMS_ON_SCREEN = 12
// #endregion

// #region Components
export function PeekingCat({ onPoke }: { onPoke: (start: DOMRect) => void }) {
  // Without this the new sprites flash blank the first time the cat falls.
  useEffect(() => {
    for (const src of [cat.fall, cat.walk, ...cat.items]) {
      new Image().src = src
    }
  }, [])

  return (
    <button
      type="button"
      aria-label="Poke the cat"
      onClick={(event) => onPoke(event.currentTarget.getBoundingClientRect())}
      className={`absolute bottom-0 left-4 origin-bottom cursor-pointer transition-transform hover:scale-105 focus-visible:scale-105 ${CAT_SIZE}`}
    >
      <img
        src={cat.peek}
        alt=""
        className="size-full object-contain object-bottom"
      />
    </button>
  )
}

interface DroppedItem {
  id: number
  src: string
  left: number
  drift: number
  dropHeight: number
  spin: number
}

export function RoamingCat({ start }: { start: DOMRect }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLButtonElement>(null)
  const catLeft = useRef(0)
  const nextItemId = useRef(0)
  const [isFalling, setIsFalling] = useState(true)
  const [items, setItems] = useState<DroppedItem[]>([])

  useEffect(() => {
    const layer = layerRef.current
    const button = catRef.current
    if (!layer || !button) return
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
    let lastTime = performance.now()
    let frame = requestAnimationFrame(tick)

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

      catLeft.current = x
      button!.style.translate = `${x}px ${y}px`
      // The sprites are drawn facing right.
      button!.style.scale = `${direction} 1`
      frame = requestAnimationFrame(tick)
    }

    return () => cancelAnimationFrame(frame)
  }, [start])

  const dropItem = () => {
    const layer = layerRef.current
    const button = catRef.current
    if (isFalling || !layer || !button || cat.items.length === 0) return

    const left = catLeft.current + (button.offsetWidth - ITEM_SIZE) / 2
    const wantedLanding = left + (Math.random() - 0.5) * 360
    const landing = Math.max(
      0,
      Math.min(wantedLanding, layer.clientWidth - ITEM_SIZE),
    )
    const item: DroppedItem = {
      id: nextItemId.current++,
      src: cat.items[Math.floor(Math.random() * cat.items.length)],
      left,
      drift: landing - left,
      dropHeight: button.offsetHeight * 0.6,
      spin: (Math.random() - 0.5) * 720,
    }
    setItems((old) => [...old, item].slice(-MOST_ITEMS_ON_SCREEN))
  }

  return (
    // Fixed to the screen on phones, where the page scrolls; the stage never scrolls.
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden stage:absolute"
    >
      <button
        ref={catRef}
        type="button"
        aria-label="Pet the cat"
        onClick={dropItem}
        className={`pointer-events-auto absolute top-0 left-0 cursor-pointer ${CAT_SIZE}`}
      >
        <img
          src={isFalling ? cat.fall : cat.walk}
          alt=""
          className="size-full object-contain object-bottom"
        />
      </button>

      {items.map((item) => (
        <span
          key={item.id}
          className="absolute bottom-0 animate-item-fade motion-safe:animate-item-drift"
          style={
            {
              left: item.left,
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              '--item-drift': `${item.drift}px`,
              '--item-drop-height': `${item.dropHeight}px`,
              '--item-spin': `${item.spin}deg`,
            } as CSSProperties
          }
          onAnimationEnd={(event) => {
            if (event.animationName !== 'item-fade') return
            setItems((old) => old.filter((other) => other.id !== item.id))
          }}
        >
          <img
            src={item.src}
            alt=""
            className="size-full object-contain motion-safe:animate-item-arc"
          />
        </span>
      ))}
    </div>
  )
}
// #endregion
