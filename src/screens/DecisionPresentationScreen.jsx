import { useEffect, useMemo, useState } from 'react'
import OptionCard from '../components/OptionCard'
import Navigation from '../components/Navigation'
import { decouperSiTropLong } from '../engine/resolution.js'
import './DecisionScreens.css'

/**
 * Révélation séquentielle des options : A, puis B, puis C. Une description qui
 * dépasse 25 mots (règle §1) se révèle elle aussi en plusieurs clics, avant de
 * passer à l'option suivante — `revealed` compte les temps au total, toutes
 * options confondues, pas les options elles-mêmes.
 */
export default function DecisionPresentationScreen({ decision, onPrev, onNext }) {
  const tempsParOption = useMemo(
    () => decision.options.map((o) => decouperSiTropLong(o.description).length),
    [decision],
  )
  const totalTemps = tempsParOption.reduce((a, b) => a + b, 0)

  const [revealed, setRevealed] = useState(1)
  useEffect(() => setRevealed(1), [decision.id])

  const allRevealed = revealed >= totalTemps

  function handleReveal() {
    if (!allRevealed) setRevealed((r) => r + 1)
  }

  let cumul = 0

  return (
    <div className="screen decision-screen" onClick={handleReveal}>
      <div className="decision-screen__eyebrow">Décision · {decision.notion}</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__options">
        {decision.options.map((option, i) => {
          const debut = cumul
          cumul += tempsParOption[i]
          const tempsVisibles = Math.min(tempsParOption[i], Math.max(0, revealed - debut))
          return (
            <OptionCard
              key={option.lettre}
              option={option}
              visible={tempsVisibles > 0}
              tempsVisibles={tempsVisibles}
            />
          )
        })}
      </div>
      {!allRevealed && (
        <p className="decision-screen__hint">Cliquez sur l'écran pour révéler la suite des options</p>
      )}
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
