const palmRejectionEnabled = 'touchType' in Touch.prototype

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const dpr = devicePixelRatio

const rect = canvas.getBoundingClientRect()
const width = rect.width * dpr
const height = rect.height * dpr
canvas.width = width
canvas.height = height

const ctx = canvas.getContext('2d')!
ctx.lineWidth = 2 * dpr

let ticking = false

type Point = { x: number; y: number }
let pendingPoints: Point[] = []

function frameCallback() {
  if (pendingPoints.length <= 1) return

  ctx.beginPath()

  let first = false
  for (const { x, y } of pendingPoints) {
    const realX = x * dpr
    const realY = y * dpr
    if (first) {
      ctx.moveTo(realX, realY)
      first = false
    } else {
      ctx.lineTo(realX, realY)
    }
  }

  ctx.stroke()

  ticking = false
  pendingPoints = pendingPoints.slice(-1)
}

function tick() {
  if (ticking) return

  ticking = true
  requestAnimationFrame(frameCallback)
}

function getTouch(event: TouchEvent): Touch | null {
  for (const touch of Array.from(event.changedTouches)) {
    if (!palmRejectionEnabled || touch.touchType === 'stylus') {
      return touch
    }
  }
  return null
}

canvas.addEventListener(
  'touchstart',
  (event: TouchEvent) => {
    const touch = getTouch(event)
    if (touch == null) return

    pendingPoints = []
    pendingPoints.push({ x: touch.clientX, y: touch.clientY })
  },
  { passive: true }
)

canvas.addEventListener(
  'touchmove',
  (event: TouchEvent) => {
    const touch = getTouch(event)
    if (touch == null) return

    pendingPoints.push({ x: touch.clientX, y: touch.clientY })
    tick()
  },
  { passive: true }
)

canvas.addEventListener(
  'touchend',
  (event: TouchEvent) => {
    const touch = getTouch(event)
    if (touch == null) return

    pendingPoints.push({ x: touch.clientX, y: touch.clientY })
    tick()
  },
  { passive: true }
)
