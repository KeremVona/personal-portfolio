export const srcSet = (variants: ImagetoolsMetadata[]) =>
  variants.map((v) => `${v.src} ${v.width}w`).join(', ')

/** The largest variant: its size gives an <img> its aspect ratio. */
export const largest = (variants: ImagetoolsMetadata[]) =>
  variants[variants.length - 1]
