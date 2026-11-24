import { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { TAG_LABEL } from '../../components/labelStyle'
import type { ExperienceItem } from '../../content/types'
import { placeLabel, splitHighlights } from './experienceLogic'

/**
 * One role on the timeline: a computer-cream card. Its dates sit in the timeline,
 * and any headline numbers sit at the top right (above the bullets on phones).
 */
export function ExperienceCard({ item }: { item: ExperienceItem }) {
  const stats = item.stats ?? []
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
    <article className="rounded-[10px] bg-computer p-5 text-ink sm:p-6">
      <div className="md:flex md:items-start md:justify-between md:gap-6">
        <div>
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
          <p className="mt-0.5 text-sm text-ink-soft">{item.role}</p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5 text-ink-soft">
            {item.end === null && (
              <li className={`${TAG_LABEL} font-semibold text-sky-deep`}>
                Now
              </li>
            )}
            <li className={TAG_LABEL}>{placeLabel(item)}</li>
          </ul>
        </div>
        {stats.length > 0 && (
          <dl className="mt-4 flex gap-6 md:mt-0 md:shrink-0 md:text-right">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-0.5 text-xs text-ink-soft">{stat.label}</dt>
                <dd className="font-display text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-sky-deep">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <ul className="mt-3 list-disc space-y-1.5 pl-[18px] text-[0.875rem] leading-relaxed text-ink-soft marker:text-sky-deep">
        {shown.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      {hidden.length > 0 && (
        <>
          <ul
            id={moreId}
            hidden={!expanded}
            className="mt-1.5 list-disc space-y-1.5 pl-[18px] text-[0.875rem] leading-relaxed text-ink-soft marker:text-sky-deep"
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
        <ul className="mt-3.5 flex flex-wrap gap-1.5 text-ink-soft">
          {item.stack.map((tag) => (
            <li key={tag} className={TAG_LABEL}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
