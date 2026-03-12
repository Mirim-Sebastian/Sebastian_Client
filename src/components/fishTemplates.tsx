export type FishTemplate = {
  id: string
  icon: JSX.Element
  createPath: (centerX: number, centerY: number, size: number) => Path2D
}

export const FISH_TEMPLATES: FishTemplate[] = [
  {
    id: 'classic',
    icon: (
      <svg viewBox="0 0 64 40" aria-hidden="true">
        <ellipse cx="34" cy="20" rx="16" ry="10" />
        <path d="M18 20L6 10v20z" />
        <path d="M36 12l8-6 6 8" strokeLinecap="round" />
      </svg>
    ),
    createPath: (centerX, centerY, size) => {
      const bodyRx = size * 0.35
      const bodyRy = size * 0.22
      const tailW = size * 0.2
      const tailH = size * 0.16
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
        <circle cx="32" cy="20" r="12" />
        <path d="M20 20L8 12v16z" />
        <path d="M36 24l8 4" strokeLinecap="round" />
      </svg>
    ),
    createPath: (centerX, centerY, size) => {
      const radius = size * 0.25
      const tailW = size * 0.18
      const tailH = size * 0.14
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
        <path d="M40 14l10-6 6 6" strokeLinecap="round" />
      </svg>
    ),
    createPath: (centerX, centerY, size) => {
      const bodyRx = size * 0.48
      const bodyRy = size * 0.16
      const tailW = size * 0.2
      const tailH = size * 0.12
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
