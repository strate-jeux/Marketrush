import { useEffect, useState } from 'react'
import OptionCard from '../components/OptionCard'
import Navigation from '../components/Navigation'
import './DecisionScreens.css'

const LETTERS = ['A', 'B', 'C']

export default function DecisionPresentationScreen({ decision, onPrev, onNext }) {
  const [revealed, setRevealed] = useState(1)

  useEffect(() => setRevealed(1), [decision.id])

  const allRevealed = revealed >= LETTERS.length

  function handleReveal() {
    if (!allRevealed) setRevealed((r) => r + 1)
  }

  return (
    <div className="screen decision-screen" onClick={handleReveal}>
      <div className="decision-screen__eyebrow">Décision · {decision.notion}</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__options">
        {LETTERS.map((letter, i) => (
          <OptionCard key={letter} letter={letter} option={decision.options[letter]} visible={i < revealed} />
        ))}
      </div>
      {!allRevealed && (
        <p className="decision-screen__hint">Cliquez sur l'écran pour révéler la suite des options</p>
      )}
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
