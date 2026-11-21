/** "© 2026 Kerem Can Bas", with the year from the given date. */
export function copyrightLine(name: string, now: Date): string {
  return `© ${now.getFullYear()} ${name}`
}

/** "Copy email" is offered only where the async Clipboard API exists. */
export function canCopy(
  nav: { clipboard?: { writeText?: unknown } } | undefined,
): boolean {
  return typeof nav?.clipboard?.writeText === 'function'
}
