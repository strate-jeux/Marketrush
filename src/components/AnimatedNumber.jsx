import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Compteur animé de 0 à `value` sur `durationMs`. Respecte prefers-reduced-motion. */
export default function AnimatedNumber({ value, durationMs = 600, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value)
      return undefined
    }
    const start = performance.now()
    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs)
      setDisplay(Math.round(value * t))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, durationMs])

  return <span className="animated-number">{prefix}{display}{suffix}</span>
}
