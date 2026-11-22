/** "Copy email" is offered only where the async Clipboard API exists. */
export function canCopy(
  nav: { clipboard?: { writeText?: unknown } } | undefined,
): boolean {
  return typeof nav?.clipboard?.writeText === 'function'
}
