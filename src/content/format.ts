const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "2027-06" → "June 2027" */
export function formatGraduation(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-')
  return `${MONTHS[Number(month) - 1]} ${year}`
}

const month = (yyyyMm: string) => {
  const [year, m] = yyyyMm.split('-')
  return { year, name: MONTHS[Number(m) - 1].slice(0, 3) }
}

/** "Jul – Aug 2026", "Dec 2025 – Feb 2026", "Oct 2026 – Present". */
export function formatDateRange(start: string, end: string | null): string {
  const from = month(start)
  if (end === null) return `${from.name} ${from.year} – Present`
  if (end === start) return `${from.name} ${from.year}`
  const to = month(end)
  return from.year === to.year
    ? `${from.name} – ${to.name} ${to.year}`
    : `${from.name} ${from.year} – ${to.name} ${to.year}`
}

/** True for a "YYYY-MM" date with a real month; content dates must match it. */
export const isYearMonth = (value: string): boolean =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
