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
