import { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { formatDateRange } from '../../content/format'
import type { ExperienceItem } from '../../content/types'
import { placeLabel, splitHighlights } from './experienceLogic'

const PILL = 'rounded-full px-2.5 py-0.5 text-[11.5px]'

/**
 * One role. The featured role gets a numbers column beside its content
 * (see docs/superpowers/specs/2026-11-21-experience-design.md §3).
 */
export function ExperienceCard({ item }: { item: ExperienceItem }) {
  const stats = item.featured ? (item.stats ?? []) : []
  const { shown, hidden } = splitHighlights(item.highlights)
  const [expanded, setExpanded] = useState(false)
  const moreId = useId()
  const firstHidden = useRef<HTMLLIElement>(null)

  const toggle = () => {
    if (expanded) return setExpanded(false)
    // The revealed bullets sit above the button, so move focus to them; otherwise
    // a screen reader hears "expanded" and reads on past the new content.
    flushSync(() => setExpanded(true))
    firstHidden.current?.focus()
  }

  return (
    <article
      className={`rounded-card bg-white p-5 text-ink shadow-card sm:p-6 ${
        stats.length > 0 ? 'md:grid md:grid-cols-[1fr_190px] md:gap-7' : ''
      }`}
    >
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">
            {item.companyUrl ? (
              <a
                href={item.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-deep hover:underline"
              >
                {item.company}
              </a>
            ) : (
              item.company
            )}
          </h3>
          <p className="text-[12.5px] text-ink/70">
            {formatDateRange(item.start, item.end)}
          </p>
        </div>
        <p className="mt-0.5 text-sm text-ink-soft">{item.role}</p>

        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {item.end === null && (
            <li className={`${PILL} bg-haze font-medium text-sky-deep`}>Now</li>
          )}
          <li className={`${PILL} border border-ink/14 text-ink/70`}>
            {placeLabel(item)}
          </li>
        </ul>

        <ul className="mt-3 list-disc space-y-1.5 pl-[18px] text-[0.875rem] leading-relaxed text-ink-soft marker:text-sky">
          {shown.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        {hidden.length > 0 && (
          <>
            <ul
              id={moreId}
              hidden={!expanded}
              className="mt-1.5 list-disc space-y-1.5 pl-[18px] text-[0.875rem] leading-relaxed text-ink-soft marker:text-sky"
            >
              {hidden.map((highlight, index) => (
                <li
                  key={highlight}
                  ref={index === 0 ? firstHidden : undefined}
                  tabIndex={index === 0 ? -1 : undefined}
                >
                  {highlight}
                </li>
              ))}
            </ul>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={moreId}
              onClick={toggle}
              className="mt-1.5 cursor-pointer text-[13px] font-medium text-sky-deep hover:underline"
            >
              {expanded ? 'Show less' : `Show ${hidden.length} more`}
            </button>
          </>
        )}

        {item.stack.length > 0 && (
          <ul className="mt-3.5 flex flex-wrap gap-1.5">
            {item.stack.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-haze px-2.5 py-1 text-xs text-sky-deep"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {stats.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink/10 pt-4 md:mt-0 md:grid-cols-1 md:content-start md:border-t-0 md:border-l md:pt-0 md:pl-7">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs text-ink-soft">{stat.label}</dt>
              <dd className="font-display text-3xl font-bold tracking-[-0.03em] text-sky-deep">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  )
}
