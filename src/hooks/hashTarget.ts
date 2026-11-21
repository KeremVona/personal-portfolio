/** The element id a location hash points at. A malformed hash (e.g. "#100%") never throws. */
export function hashTarget(hash: string): string {
  const raw = hash.replace(/^#/, '')
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
