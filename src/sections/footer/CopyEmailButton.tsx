import { useEffect, useRef, useState } from 'react'
import { canCopy } from './footerLogic'

const RESET_MS = 2000

/** Copies the address; offered only where the Clipboard API exists (spec §3). */
export function CopyEmailButton({ email }: { email: string }) {
  const [available] = useState(() => canCopy(globalThis.navigator))
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!available) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      return // Permission denied or similar: leave the label as it was.
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), RESET_MS)
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="cursor-pointer rounded-full border border-cream/45 px-5 py-3 font-medium text-cream hover:bg-cream/10"
      >
        {copied ? 'Copied ✓' : 'Copy email'}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied' : ''}
      </span>
    </>
  )
}
