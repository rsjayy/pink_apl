// Cherry-blossom petals drifting down over the profile art, which has sakura trees.
// ProfileLayout puts one canvas behind the text box (most petals, small and far
// away) and one in front of everything (a few big, out-of-focus petals).
// Each petal look is drawn once into a small, slightly blurred sprite with its
// own uneven shape; every frame stamps those sprites with a swing and a sideways
// squeeze, which fakes a petal rocking and turning over as it falls.
// Only the canvas changes, so the page never re-lays out. Phones get fewer
// petals because the count follows the screen area. With "reduce motion"
// switched on, the petals are drawn once and stay still.

import { useEffect, useRef } from 'react'

// #region Config
interface LayerOptions {
  /** Square pixels of screen per petal, so a phone gets fewer than a desktop. */
  areaPerPetal: number
  fewest: number
  most: number
  size: [number, number]
  /** Pixels per second, slow far-away petals to faster close ones. */
  fallSpeed: [number, number]
  sway: number
  /** In sprite pixels; a petal is shown at a fifth to half the sprite's size. */
  blur: [number, number]
  opacity: [number, number]
}

const LAYERS: Record<'back' | 'front', LayerOptions> = {
  back: {
    areaPerPetal: 22000,
    fewest: 14,
    most: 48,
    size: [9, 19],
    fallSpeed: [24, 52],
    sway: 18,
    blur: [6, 1.8],
    opacity: [0.55, 0.95],
  },
  front: {
    areaPerPetal: 320000,
    fewest: 1,
    most: 4,
    size: [26, 38],
    fallSpeed: [58, 82],
    sway: 28,
    blur: [9, 8],
    opacity: [0.55, 0.65],
  },
}

// Base, middle and tip colours. The first set is jhammann/sakura's default petal colour.
const PETAL_COLOURS = [
  ['#ffb7c5', '#ffc5d0', '#fff4f6'],
  ['#f3a3bd', '#fac6d6', '#fff0f4'],
  ['#f6b4ca', '#ffd6e4', '#fffafc'],
  ['#eea0b8', '#f9c3d3', '#fdeef2'],
]

const SHAPES_PER_LAYER = 8
const SPRITE_SIZE = 96
const LONGEST_FRAME_SECONDS = 0.05
const FADE_IN_DISTANCE = 80

interface Sprite {
  front: HTMLCanvasElement
  back: HTMLCanvasElement
}

interface Petal {
  x: number
  y: number
  size: number
  depth: number
  fallSpeed: number
  sway: number
  swaySpeed: number
  phase: number
  angle: number
  spin: number
  flip: number
  flipSpeed: number
  opacity: number
  sprite: Sprite
}
// #endregion

export function FallingPetals({ layer }: { layer: 'back' | 'front' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    return startPetals(canvasRef.current, LAYERS[layer])
  }, [layer])

  return (
    // Fixed to the screen on phones, like the art behind it; inside the stage on wide screens.
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-dvh w-full stage:absolute stage:h-full"
    />
  )
}

// #region Petal animation
function startPetals(canvas: HTMLCanvasElement, options: LayerOptions) {
  const context = canvas.getContext('2d')
  if (!context) return

  const isMotionReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  // Far sprites first, so a petal's depth picks a sprite that is as blurred as it is far.
  const sprites: Sprite[] = []
  for (let i = 0; i < SHAPES_PER_LAYER; i++) {
    const depth = i / (SHAPES_PER_LAYER - 1)
    const blur = options.blur[0] + (options.blur[1] - options.blur[0]) * depth
    const colours = PETAL_COLOURS[i % PETAL_COLOURS.length]
    const shape = {
      width: 0.8 + Math.random() * 0.25,
      notch: 0.1 + Math.random() * 0.18,
      lean: (Math.random() - 0.5) * 0.25,
    }
    sprites.push({
      front: drawPetalSprite(colours, shape, blur, false),
      back: drawPetalSprite(colours, shape, blur, true),
    })
  }

  const petals: Petal[] = []
  let width = 0
  let height = 0
  let pixelRatio = 1
  let time = Math.random() * 100
  let lastTime = performance.now()
  let frame = 0

  const resize = () => {
    width = canvas.clientWidth
    height = canvas.clientHeight
    if (width === 0) return
    // On wide screens the stage is scaled down; draw at the size it is shown, not its layout size.
    const shownScale = canvas.getBoundingClientRect().width / width
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2) * shownScale
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)

    const wanted = Math.round(
      Math.min(
        options.most,
        Math.max(options.fewest, (width * height) / options.areaPerPetal),
      ),
    )
    while (petals.length < wanted) petals.push(newPetal(true))
    petals.length = wanted
    if (isMotionReduced) draw()
  }
  // The stage's scale changes with the window while the canvas's own size stays the same.
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  window.addEventListener('resize', resize)
  resize()

  if (!isMotionReduced) frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    window.removeEventListener('resize', resize)
  }

  function tick(now: number) {
    const seconds = Math.min((now - lastTime) / 1000, LONGEST_FRAME_SECONDS)
    lastTime = now
    time += seconds

    // Two slow waves make a light breeze; about once a minute it picks up for a few seconds.
    const breeze = 6 * Math.sin(time * 0.11) + 4 * Math.sin(time * 0.29 + 1.7)
    const gust = Math.max(0, Math.sin(time * 0.09)) ** 8 * 55

    for (const petal of petals) {
      // Like a falling leaf: it rocks side to side and drops fastest in the middle of each swing.
      const swing = Math.sin(time * petal.swaySpeed + petal.phase)
      const edgeOn = 1 - Math.abs(Math.cos(petal.flip))
      const drop = (0.7 + 0.45 * (1 - Math.abs(swing))) * (0.9 + 0.35 * edgeOn)
      petal.x +=
        ((breeze + gust) * (0.4 + petal.depth) + petal.sway * swing) * seconds
      petal.y += petal.fallSpeed * drop * seconds
      petal.angle += (petal.spin + gust / 300) * seconds
      petal.flip += petal.flipSpeed * (1 + gust / 80) * seconds

      const margin = petal.size * 2
      if (petal.y > height + margin) Object.assign(petal, newPetal(false))
      if (petal.x > width + margin) petal.x = -margin
      if (petal.x < -margin) petal.x = width + margin
    }

    draw()
    frame = requestAnimationFrame(tick)
  }

  function draw() {
    context!.setTransform(1, 0, 0, 1, 0, 0)
    context!.clearRect(0, 0, canvas.width, canvas.height)
    for (const petal of petals) {
      const turn = Math.cos(petal.flip)
      const squeeze = Math.sign(turn || 1) * Math.max(Math.abs(turn), 0.25)
      const angle =
        petal.angle + 0.5 * Math.sin(time * petal.swaySpeed + petal.phase)
      const cos = Math.cos(angle) * pixelRatio
      const sin = Math.sin(angle) * pixelRatio
      context!.setTransform(
        cos * squeeze,
        sin * squeeze,
        -sin,
        cos,
        petal.x * pixelRatio,
        petal.y * pixelRatio,
      )
      const fadeIn = Math.min(
        1,
        Math.max(0, (petal.y + petal.size * 2) / FADE_IN_DISTANCE),
      )
      context!.globalAlpha = petal.opacity * fadeIn
      context!.drawImage(
        turn >= 0 ? petal.sprite.front : petal.sprite.back,
        -petal.size,
        -petal.size,
        petal.size * 2,
        petal.size * 2,
      )
    }
  }

  function newPetal(startsOnScreen: boolean): Petal {
    const depth = Math.random()
    const size = options.size[0] + (options.size[1] - options.size[0]) * depth
    const between = ([far, near]: [number, number]) =>
      far + (near - far) * depth
    return {
      x: Math.random() * width,
      y: startsOnScreen
        ? Math.random() * height
        : -size * (2 + Math.random() * 4),
      size,
      depth,
      fallSpeed: between(options.fallSpeed) * (0.85 + Math.random() * 0.3),
      sway: options.sway * (0.5 + depth * 0.5) * (0.7 + Math.random() * 0.6),
      swaySpeed: 0.6 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.8,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.4 + Math.random() * 0.9,
      opacity: between(options.opacity),
      sprite:
        sprites[
          Math.min(SHAPES_PER_LAYER - 1, Math.floor(depth * SHAPES_PER_LAYER))
        ],
    }
  }
}

function drawPetalSprite(
  [baseColour, middleColour, tipColour]: string[],
  shape: { width: number; notch: number; lean: number },
  blur: number,
  isBackSide: boolean,
) {
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = SPRITE_SIZE
  const context = sprite.getContext('2d')
  if (!context) return sprite
  const half = SPRITE_SIZE / 2
  // Leaves room inside the sprite for the blur to spread.
  const length = half - 2.5 * blur - 2
  const side = length * shape.width
  const lean = length * shape.lean
  context.translate(half, half)
  // Browsers without canvas filters just get sharp petals.
  context.filter = `blur(${blur}px)`

  // A sakura petal: round sides, a narrow base, and a notch at the tip, never quite symmetrical.
  context.beginPath()
  context.moveTo(0, length)
  context.bezierCurveTo(
    -side * 1.05,
    length * 0.4,
    -side * 0.9 + lean,
    -length * 0.8,
    -side * 0.32 + lean,
    -length,
  )
  context.quadraticCurveTo(
    -side * 0.1 + lean,
    -length,
    lean,
    -length * (1 - shape.notch),
  )
  context.quadraticCurveTo(
    side * 0.1 + lean,
    -length,
    side * 0.32 + lean,
    -length * 0.97,
  )
  context.bezierCurveTo(
    side * 0.9 + lean,
    -length * 0.8,
    side * 1.05,
    length * 0.4,
    0,
    length,
  )
  context.closePath()

  const gradient = context.createLinearGradient(0, length, lean, -length)
  gradient.addColorStop(0, baseColour)
  gradient.addColorStop(0.5, middleColour)
  gradient.addColorStop(1, tipColour)
  context.fillStyle = gradient
  context.fill()

  if (isBackSide) {
    context.globalCompositeOperation = 'source-atop'
    context.fillStyle = 'rgba(200, 90, 130, 0.14)'
    context.fillRect(-half, -half, SPRITE_SIZE, SPRITE_SIZE)
  }
  return sprite
}
// #endregion
