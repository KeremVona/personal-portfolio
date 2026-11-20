import { describe, expect, it } from 'vitest'
import { windPhases } from './windShader'

const TAU = Math.PI * 2

describe('windPhases', () => {
  it('matches the agreed rates (0.55, 1.25, 2.05 rad/s) at small t', () => {
    const [a, b, c] = windPhases(1)
    expect(a).toBeCloseTo(0.55, 9)
    expect(b).toBeCloseTo(1.25, 9)
    expect(c).toBeCloseTo(2.05, 9)
  })

  it('stays within one turn after a long visit, so low-precision GPUs stay smooth', () => {
    const t = 3600
    const phases = windPhases(t)
    for (const p of phases) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThan(TAU)
    }
    // Same angle as the unwrapped phase.
    expect(Math.sin(phases[0])).toBeCloseTo(Math.sin(t * 0.55), 6)
    expect(Math.sin(phases[2])).toBeCloseTo(Math.sin(t * 2.05), 6)
  })
})
