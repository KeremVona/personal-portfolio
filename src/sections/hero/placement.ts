/**
 * Where each hero art layer sits on screen, and which image it loads.
 * Shared by the static <img> layers and the WebGL renderer so they always agree.
 * See docs/superpowers/specs/2026-11-21-hero-design.md §3–4.
 */

export interface Size {
  width: number
  height: number
}

/** CSS px, relative to the hero box. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageVariant {
  src: string
  width: number
  height: number
}

export type Anchor = 'cover' | 'centre' | 'left' | 'right'

export type LayerId =
  | 'sky'
  | 'meadow'
  | 'stems-left'
  | 'stems-right'
  | 'cluster-left'
  | 'cluster-right'

/** A full-height strip of the art; x0/x1 are fractions of the full art width. */
export interface CropDef {
  x0: number
  x1: number
  variant: ImageVariant
}

export interface LayerDef {
  id: LayerId
  bend: number
  anchor: Anchor
  /** Part of the art (fractions of its width) this layer draws. */
  clip: readonly [number, number]
  full: readonly ImageVariant[]
  crop?: CropDef
}

/** The image to load, and which span of the full art it covers (0–1 for a full layer). */
export interface Source {
  variant: ImageVariant
  x0: number
  x1: number
}

export const ART_ASPECT = 2730 / 1536
export const NARROW_ASPECT = 1.2
export const NARROW_SCALE = 0.72
export const MAX_DPR = 2

export function isNarrow(size: Size): boolean {
  return size.width / size.height < NARROW_ASPECT
}

/** The full art rectangle for a layer: covers the hero, bottom-anchored. */
export function artRect(size: Size, anchor: Anchor): Rect {
  const coverWidth = Math.max(size.width, size.height * ART_ASPECT)
  const scale = isNarrow(size) && anchor !== 'cover' ? NARROW_SCALE : 1
  const width = coverWidth * scale
  const height = width / ART_ASPECT

  let x = (size.width - width) / 2
  if (scale !== 1 && anchor === 'left') x = 0
  if (scale !== 1 && anchor === 'right') x = size.width - width

  return { x, y: size.height - height, width, height }
}

/** Which fractions of the art width are on screen, intersected with the clip. */
export function visibleSpan(
  size: Size,
  rect: Rect,
  clip: readonly [number, number],
): [number, number] {
  const onScreen0 = (0 - rect.x) / rect.width
  const onScreen1 = (size.width - rect.x) / rect.width
  return [Math.max(onScreen0, clip[0], 0), Math.min(onScreen1, clip[1], 1)]
}

export function chooseSource(size: Size, dpr: number, layer: LayerDef): Source {
  const rect = artRect(size, layer.anchor)

  if (isNarrow(size) && layer.crop) {
    const [v0, v1] = visibleSpan(size, rect, layer.clip)
    if (layer.crop.x0 <= v0 && v1 <= layer.crop.x1) {
      return {
        variant: layer.crop.variant,
        x0: layer.crop.x0,
        x1: layer.crop.x1,
      }
    }
  }

  const needed = rect.width * Math.min(dpr, MAX_DPR)
  const variant =
    layer.full.find((v) => v.width >= needed) ??
    layer.full[layer.full.length - 1]
  return { variant, x0: 0, x1: 1 }
}

/** The on-screen rectangle covered by a source (narrowed to its span). */
export function sourceRect(rect: Rect, source: Source): Rect {
  return {
    x: rect.x + source.x0 * rect.width,
    y: rect.y,
    width: (source.x1 - source.x0) * rect.width,
    height: rect.height,
  }
}

/** A layer's clip expressed in its source image's own 0–1 coordinates, clamped to the image. */
export function textureClip(
  clip: readonly [number, number],
  source: Source,
): [number, number] {
  const span = source.x1 - source.x0
  const a = (clip[0] - source.x0) / span
  const b = (clip[1] - source.x0) / span
  return [Math.max(0, a), Math.min(1, b)]
}
