/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { initialTheme, readSaved, save } from './themeLogic'

const throwing = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('initialTheme', () => {
  it('uses a saved choice over the device', () => {
    expect(initialTheme('night', false)).toBe('night')
    expect(initialTheme('day', true)).toBe('day')
  })

  it('follows the device when nothing valid is saved', () => {
    expect(initialTheme(null, true)).toBe('night')
    expect(initialTheme('bogus', false)).toBe('day')
  })
})

describe('storage', () => {
  it('never throws when storage is blocked', () => {
    expect(readSaved(throwing)).toBeNull()
    expect(() => save(throwing, 'night')).not.toThrow()
    expect(readSaved(null)).toBeNull()
  })
})

describe('index.html', () => {
  it('sets the theme before first paint with the same key and rule', () => {
    const html = readFileSync('index.html', 'utf8')
    expect(html).toContain("localStorage.getItem('theme')")
    expect(html).toContain('prefers-color-scheme: dark')
    expect(html).toContain('dataset.theme')
  })
})
