/** Bounded decorative motion; the original artwork remains the fallback. */
export const HERO_ART = { width: 1774, height: 887 } as const
export const HERO_MOTION_LIMITS = { maxPixels: 1_250_000, maxWidth: 1800, maxDpr: 1.25, desktopFps: 24, mobileFps: 20 } as const

export function isHeroMotionEnabled(search: string) {
  return new URLSearchParams(search).get('motion') !== '0'
}

/** Match the existing hero's object-fit: cover, including its mobile crop. */
export function heroCoverCrop(width: number, height: number, mobile: boolean) {
  const scale = Math.max(width / HERO_ART.width, height / HERO_ART.height)
  const w = width / (HERO_ART.width * scale)
  const h = height / (HERO_ART.height * scale)
  return [(1 - w) * (mobile ? 0.78 : 0.68), (1 - h) * (mobile ? 0.57 : 0.5), w, h] as const
}

export function heroRenderSize(width: number, height: number, deviceDpr: number) {
  const ratio = Math.min(deviceDpr, HERO_MOTION_LIMITS.maxDpr,
    HERO_MOTION_LIMITS.maxWidth / Math.max(width, 1),
    Math.sqrt(HERO_MOTION_LIMITS.maxPixels / Math.max(width * height, 1)))
  return [Math.max(1, Math.floor(width * ratio)), Math.max(1, Math.floor(height * ratio))] as const
}
