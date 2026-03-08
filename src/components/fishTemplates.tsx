export type FishTemplate = {
  id: string
  icon: JSX.Element
  createPath: (centerX: number, centerY: number, size: number) => Path2D
  bounds: {
    width: number
    height: number
    centerOffsetX: number
  }
}

const CLASSIC_METRICS = {
  bodyRx: 0.35,
  bodyRy: 0.22,
  tailW: 0.2,
  tailH: 0.16,
}

const ROUND_METRICS = {
  radius: 0.25,
  tailW: 0.18,
  tailH: 0.14,
}

const LONG_METRICS = {
  bodyRx: 0.48,
  bodyRy: 0.16,
  tailW: 0.2,
  tailH: 0.12,
}

export const FISH_TEMPLATES: FishTemplate[] = [
  {
    id: 'classic',
    icon: (
      <svg viewBox="0 0 64 40" aria-hidden="true">
        <g transform="translate(4 0)">
          <ellipse cx="34" cy="20" rx="16" ry="10" />
          <path d="M18 20L6 10v20z" />
        </g>
      </svg>
    ),
    bounds: {
      width: CLASSIC_METRICS.bodyRx * 2 + CLASSIC_METRICS.tailW,
      height: CLASSIC_METRICS.bodyRy * 2,
      centerOffsetX: CLASSIC_METRICS.tailW / 2,
    },
    createPath: (centerX, centerY, size) => {
      const bodyRx = size * CLASSIC_METRICS.bodyRx
      const bodyRy = size * CLASSIC_METRICS.bodyRy
      const tailW = size * CLASSIC_METRICS.tailW
      const tailH = size * CLASSIC_METRICS.tailH
      const path = new Path2D()
      path.ellipse(centerX, centerY, bodyRx, bodyRy, 0, 0, Math.PI * 2)
      path.moveTo(centerX - bodyRx, centerY)
      path.lineTo(centerX - bodyRx - tailW, centerY - tailH)
      path.lineTo(centerX - bodyRx - tailW, centerY + tailH)
      path.closePath()
      return path
    },
  },
  {
    id: 'round',
    icon: (
      <svg viewBox="0 0 64 40" aria-hidden="true">
        <g transform="translate(6 0)">
          <circle cx="32" cy="20" r="12" />
          <path d="M20 20L8 12v16z" />
        </g>
      </svg>
    ),
    bounds: {
      width: ROUND_METRICS.radius * 2 + ROUND_METRICS.tailW,
      height: ROUND_METRICS.radius * 2,
      centerOffsetX: ROUND_METRICS.tailW / 2,
    },
    createPath: (centerX, centerY, size) => {
      const radius = size * ROUND_METRICS.radius
      const tailW = size * ROUND_METRICS.tailW
      const tailH = size * ROUND_METRICS.tailH
      const path = new Path2D()
      path.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2)
      path.moveTo(centerX - radius, centerY)
      path.lineTo(centerX - radius - tailW, centerY - tailH)
      path.lineTo(centerX - radius - tailW, centerY + tailH)
      path.closePath()
      return path
    },
  },
  {
    id: 'long',
    icon: (
      <svg viewBox="0 0 64 40" aria-hidden="true">
        <ellipse cx="36" cy="20" rx="20" ry="7" />
        <path d="M16 20L4 12v16z" />
      </svg>
    ),
    bounds: {
      width: LONG_METRICS.bodyRx * 2 + LONG_METRICS.tailW,
      height: LONG_METRICS.bodyRy * 2,
      centerOffsetX: LONG_METRICS.tailW / 2,
    },
    createPath: (centerX, centerY, size) => {
      const bodyRx = size * LONG_METRICS.bodyRx
      const bodyRy = size * LONG_METRICS.bodyRy
      const tailW = size * LONG_METRICS.tailW
      const tailH = size * LONG_METRICS.tailH
      const path = new Path2D()
      path.ellipse(centerX, centerY, bodyRx, bodyRy, 0, 0, Math.PI * 2)
      path.moveTo(centerX - bodyRx, centerY)
      path.lineTo(centerX - bodyRx - tailW, centerY - tailH)
      path.lineTo(centerX - bodyRx - tailW, centerY + tailH)
      path.closePath()
      return path
    },
  },
]
