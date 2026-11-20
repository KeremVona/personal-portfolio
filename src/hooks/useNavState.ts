import { useEffect, useRef, useState } from 'react'
import { NAV_HEIGHT, nextNavState, type NavState } from '../components/navState'

/** Solid / hidden state of the fixed nav, driven by scroll position and direction. */
export function useNavState(menuOpen: boolean, focusWithin: boolean): NavState {
  const [state, setState] = useState<NavState>({ solid: false, hidden: false })
  const current = useRef(state)
  const lastY = useRef(0)
  const flags = useRef({ menuOpen, focusWithin })

  const commit = (next: NavState) => {
    if (
      next.solid === current.current.solid &&
      next.hidden === current.current.hidden
    )
      return
    current.current = next
    setState(next)
  }

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const heroHeight = document.getElementById('top')?.offsetHeight ?? 0
      commit(
        nextNavState({
          y,
          lastY: lastY.current,
          hideAfter: heroHeight - NAV_HEIGHT,
          ...flags.current,
          hidden: current.current.hidden,
        }),
      )
      lastY.current = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Opening the menu or moving focus into the nav shows it straight away.
  useEffect(() => {
    flags.current = { menuOpen, focusWithin }
    if (menuOpen || focusWithin) commit({ ...current.current, hidden: false })
  }, [menuOpen, focusWithin])

  return state
}
