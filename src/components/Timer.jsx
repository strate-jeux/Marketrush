import { useEffect, useRef, useState } from 'react'
import './Timer.css'

function formatTime(sec) {
  const s = Math.max(0, Math.ceil(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

/**
 * Minuteur de concertation. Se recharge depuis `durationSec` à chaque changement
 * de décision (via `resetKey`).
 *
 * Il ne démarre jamais tout seul : tant que `demarre` est faux, il affiche sa
 * durée sans décompter — les équipes doivent avoir fini de lire avant que le
 * temps ne coure. Une fois lancé : pause, +1 min, remise à zéro.
 */
export default function Timer({ durationSec, resetKey, demarre = true, alertThresholdSec = 30, spaceToggles = true }) {
  const [remaining, setRemaining] = useState(durationSec)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(durationSec)
    setPaused(false)
  }, [durationSec, resetKey])

  useEffect(() => {
    if (!demarre || paused) return undefined
    intervalRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [demarre, paused])

  useEffect(() => {
    if (!spaceToggles || !demarre) return undefined
    function onKey(e) {
      if (e.code === 'Space' && !e.target.closest('button, input, textarea')) {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [spaceToggles, demarre])

  const isUrgent = demarre && remaining <= alertThresholdSec && remaining > 0
  const isDone = demarre && remaining <= 0

  return (
    <div className={`timer ${isUrgent ? 'timer--urgent' : ''} ${isDone ? 'timer--done' : ''} ${demarre ? '' : 'timer--en-attente'}`}>
      <span className="timer__display">{formatTime(remaining)}</span>
      {demarre && (
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
      )}
    </div>
  )
}
