import { useEffect, useRef, useState } from 'react'
import './Timer.css'

function formatTime(sec) {
  const s = Math.max(0, Math.ceil(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

/**
 * Minuteur de réflexion. Se relance depuis `durationSec` à chaque changement de décision
 * (via la prop `resetKey`). Contrôles discrets : pause, +1 min, reset.
 */
export default function Timer({ durationSec, resetKey, alertThresholdSec = 30, spaceToggles = true }) {
  const [remaining, setRemaining] = useState(durationSec)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(durationSec)
    setPaused(false)
  }, [durationSec, resetKey])

  useEffect(() => {
    if (paused) return undefined
    intervalRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused])

  useEffect(() => {
    if (!spaceToggles) return undefined
    function onKey(e) {
      if (e.code === 'Space' && !e.target.closest('button, input, textarea')) {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [spaceToggles])

  const isUrgent = remaining <= alertThresholdSec && remaining > 0
  const isDone = remaining <= 0

  return (
    <div className={`timer ${isUrgent ? 'timer--urgent' : ''} ${isDone ? 'timer--done' : ''}`}>
      <span className="timer__display">{formatTime(remaining)}</span>
      <div className="timer__controls">
        <button
          type="button"
          className="timer__btn"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Reprendre' : 'Mettre en pause'}
        >
          {paused ? '▶' : '⏸'}
        </button>
        <button
          type="button"
          className="timer__btn"
          onClick={() => setRemaining((r) => r + 60)}
          aria-label="Ajouter une minute"
        >
          +1 min
        </button>
        <button
          type="button"
          className="timer__btn"
          onClick={() => { setRemaining(durationSec); setPaused(false) }}
          aria-label="Réinitialiser le minuteur"
        >
          ↺
        </button>
      </div>
    </div>
  )
}
