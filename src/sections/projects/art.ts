import leftMeta from '../../assets/projects/bouquet-left.webp?w=200;360;520;760&format=webp&quality=80&as=metadata'
import rightMeta from '../../assets/projects/bouquet-right.webp?w=200;360;520;760&format=webp&quality=80&as=metadata'

const sorted = (meta: ImagetoolsMetadata | ImagetoolsMetadata[]) =>
  (Array.isArray(meta) ? meta : [meta]).toSorted((a, b) => a.width - b.width)

/** Painted bouquets for the section's corners and the panel's foot (spec §3, §4). */
export const BOUQUET_LEFT = sorted(leftMeta)
export const BOUQUET_RIGHT = sorted(rightMeta)

export const srcSet = (variants: ImagetoolsMetadata[]) =>
  variants.map((v) => `${v.src} ${v.width}w`).join(', ')

/** The largest variant: its size gives an <img> its aspect ratio. */
export const largest = (variants: ImagetoolsMetadata[]) =>
  variants[variants.length - 1]
