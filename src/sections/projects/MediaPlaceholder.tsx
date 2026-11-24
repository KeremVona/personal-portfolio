/** Stands in for a project's screenshots until Kerem adds them. */
export function MediaPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center bg-linear-135 from-haze to-sky-light ${className}`}
    >
      <span className="font-mono text-xs text-ink">
        screenshots coming soon
      </span>
    </div>
  )
}
