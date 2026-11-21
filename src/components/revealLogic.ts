/** One IntersectionObserver callback can carry several entries; reveal if any is in view. */
export function anyIntersecting(
  entries: readonly Pick<IntersectionObserverEntry, 'isIntersecting'>[],
): boolean {
  return entries.some((entry) => entry.isIntersecting)
}
