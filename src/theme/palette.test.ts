import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

const css = readFileSync('src/index.css', 'utf8')
const theme = css.slice(
  css.indexOf('@theme'),
  css.indexOf('}', css.indexOf('@theme')),
)
const colours = new Map(
  [...theme.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
    m[1],
    m[2],
  ]),
)
const colour = (name: string) => {
  const hex = colours.get(name)
  if (!hex) throw new Error(`no --color-${name} in @theme`)
  return hex
}

/** Small text on each background it sits on must pass WCAG AA (4.5:1). */
const PAIRS: [string, string[]][] = [
  [
    'ink',
    ['cream', 'haze', 'haze-deep', 'sky-projects-end', 'computer', 'paper'],
  ],
  ['ink-soft', ['sky-projects-end', 'computer', 'paper']],
  ['sky-deep', ['cream', 'haze', 'computer', 'paper']],
  ['cream', ['sky-experience-top', 'sky-deep']],
]

describe('palette', () => {
  for (const [text, backgrounds] of PAIRS)
    for (const background of backgrounds)
      it(`${text} on ${background} passes AA`, () => {
        expect(
          contrastRatio(colour(text), colour(background)),
        ).toBeGreaterThanOrEqual(4.5)
      })

  it('has none of the retired meadow colours', () => {
    for (const name of ['meadow', 'sky-deep', 'haze', 'poppy', 'sky-deep'])
      expect(colours.has(name)).toBe(false)
  })
})
