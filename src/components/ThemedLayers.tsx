import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'
import type { Theme } from '../theme/themeLogic'

const FADE_MS = 400

interface Layer {
  theme: Theme
  id: number
  leaving: boolean
}

const reducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Renders a picture for the current theme only, so the other theme's files are never
 * requested until the visitor switches. On a switch the new picture loads underneath
 * the old one, which then fades out (instantly with reduced motion) and is removed.
 * `children` gets the layer's theme, its onLoad, and a class to put on the element.
 */
export function ThemedLayers({
  theme,
  children,
}: {
  theme: Theme
  children: (
    theme: Theme,
    props: { onLoad: () => void; className: string },
  ) => ReactNode
}) {
  // Bottom to top: the newest layer is first, so older ones paint over it until it loads.
  const [layers, setLayers] = useState<Layer[]>(() => [
    { theme, id: 0, leaving: false },
  ])
  const nextId = useRef(1)

  useEffect(() => {
    setLayers((current) =>
      current[0].theme === theme
        ? current
        : [{ theme, id: nextId.current++, leaving: false }, ...current],
    )
  }, [theme])

  // Remove layers once they have faded out.
  useEffect(() => {
    if (!layers.some((layer) => layer.leaving)) return
    const timer = setTimeout(
      () => setLayers((current) => current.filter((layer) => !layer.leaving)),
      reducedMotion() ? 0 : FADE_MS,
    )
    return () => clearTimeout(timer)
  }, [layers])

  const loaded = (id: number) =>
    setLayers((current) =>
      current[0].id === id && current.length > 1
        ? current.map((layer, i) =>
            i === 0 ? layer : { ...layer, leaving: true },
          )
        : current,
    )

  return layers.map((layer) => (
    <Fragment key={layer.id}>
      {children(layer.theme, {
        onLoad: () => loaded(layer.id),
        className: `transition-opacity duration-[400ms] ease-out motion-reduce:transition-none ${layer.leaving ? 'opacity-0' : ''}`,
      })}
    </Fragment>
  ))
}
