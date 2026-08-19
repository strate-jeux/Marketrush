import { useEffect, useState } from 'react'
import OptionCard from '../components/OptionCard'
import Navigation from '../components/Navigation'
import './DecisionScreens.css'

export default function DecisionPresentationScreen({ decision, onPrev, onNext }) {
  const [revealed, setRevealed] = useState(1)

  useEffect(() => setRevealed(1), [decision.id])

  const allRevealed = revealed >= decision.options.length

  function handleReveal() {
    if (!allRevealed) setRevealed((r) => r + 1)
  }

  return (
    <div className="screen decision-screen" onClick={handleReveal}>
      <div className="decision-screen__eyebrow">Décision · {decision.notion}</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__options">
        {decision.options.map((option, i) => (
          <OptionCard key={option.lettre} option={option} visible={i < revealed} />
        ))}
      </div>
      {!allRevealed && (
        <p className="decision-screen__hint">Cliquez sur l'écran pour révéler la suite des options</p>
      )}
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
