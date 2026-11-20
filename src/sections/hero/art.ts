/**
 * The hero's art layers, back to front. Masters and crops come from
 * `npm run art:hero`; vite-imagetools builds the size variants.
 * See docs/superpowers/specs/2026-11-21-hero-design.md §3.
 */
import clusterLeftCropMeta from '../../assets/hero/cluster-left-left.webp?w=864&format=webp&quality=80&as=metadata'
import clusterLeftMeta from '../../assets/hero/cluster-left.webp?w=1280;1920;2730&format=webp&quality=80&as=metadata'
import clusterRightCropMeta from '../../assets/hero/cluster-right-right.webp?w=864&format=webp&quality=80&as=metadata'
import clusterRightMeta from '../../assets/hero/cluster-right.webp?w=1280;1920;2730&format=webp&quality=80&as=metadata'
import meadowCropMeta from '../../assets/hero/meadow-centre.webp?w=864&format=webp&quality=80&as=metadata'
import meadowMeta from '../../assets/hero/meadow.webp?w=1280;1920;2730&format=webp&quality=80&as=metadata'
import skyCropMeta from '../../assets/hero/sky-centre.webp?w=864&format=webp&quality=80&as=metadata'
import skyMeta from '../../assets/hero/sky.webp?w=1280;1920;2730&format=webp&quality=80&as=metadata'
import stemsLeftCropMeta from '../../assets/hero/stems-left.webp?w=864&format=webp&quality=80&as=metadata'
import stemsRightCropMeta from '../../assets/hero/stems-right.webp?w=864&format=webp&quality=80&as=metadata'
import stemsMeta from '../../assets/hero/stems.webp?w=1280;1920;2730&format=webp&quality=80&as=metadata'
import type { CropDef, ImageVariant, LayerDef } from './placement'

type Meta = ImagetoolsMetadata | ImagetoolsMetadata[]

const variants = (meta: Meta): ImageVariant[] =>
  (Array.isArray(meta) ? meta : [meta])
    .map(({ src, width, height }) => ({ src, width, height }))
    .sort((a, b) => a.width - b.width)

const ART_WIDTH = 2730
// Crop bounds in px of the 2730-wide art; must match scripts/prepare-hero-art.mjs.
const CENTRE = [751, 1979] as const
const LEFT = [0, 1229] as const
const RIGHT = [1501, 2730] as const

const crop = ([x0, x1]: readonly [number, number], meta: Meta): CropDef => ({
  x0: x0 / ART_WIDTH,
  x1: x1 / ART_WIDTH,
  variant: variants(meta)[0],
})

const stems = variants(stemsMeta)

export const LAYERS: readonly LayerDef[] = [
  {
    id: 'sky',
    bend: 0,
    anchor: 'cover',
    clip: [0, 1],
    full: variants(skyMeta),
    crop: crop(CENTRE, skyCropMeta),
  },
  {
    id: 'meadow',
    bend: 0.006,
    anchor: 'centre',
    clip: [0, 1],
    full: variants(meadowMeta),
    crop: crop(CENTRE, meadowCropMeta),
  },
  {
    id: 'stems-left',
    bend: 0.016,
    anchor: 'left',
    clip: [0, 0.5],
    full: stems,
    crop: crop(LEFT, stemsLeftCropMeta),
  },
  {
    id: 'stems-right',
    bend: 0.016,
    anchor: 'right',
    clip: [0.5, 1],
    full: stems,
    crop: crop(RIGHT, stemsRightCropMeta),
  },
  {
    id: 'cluster-left',
    bend: 0.011,
    anchor: 'left',
    clip: [0, 1],
    full: variants(clusterLeftMeta),
    crop: crop(LEFT, clusterLeftCropMeta),
  },
  {
    id: 'cluster-right',
    bend: 0.011,
    anchor: 'right',
    clip: [0, 1],
    full: variants(clusterRightMeta),
    crop: crop(RIGHT, clusterRightCropMeta),
  },
]
