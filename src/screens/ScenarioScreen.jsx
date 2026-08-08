import { useState } from 'react'
import Navigation from '../components/Navigation'
import './ScenarioScreen.css'

const LINES = [
  "Vous venez de prendre la direction d'une jeune entreprise du mobilier scolaire.",
  "Le marché évolue vite. Les concurrents innovent. Les clients changent d'attentes. Et des événements imprévus viendront bousculer vos plans.",
  'Pendant cinq années, vous prendrez les décisions qui feront la différence.',
  'Serez-vous capables de devenir le leader du marché ?',
]

export default function ScenarioScreen({ onPrev, onNext }) {
  const [revealed, setRevealed] = useState(0)
  const allRevealed = revealed >= LINES.length

  function handleReveal() {
    if (!allRevealed) setRevealed((r) => r + 1)
  }

  return (
    <div className="screen scenario-screen">
      <div className="scenario-screen__zone" onClick={handleReveal}>
        <h1 className="scenario-screen__title">Vous prenez les commandes d'une start-up</h1>
        <div className="scenario-screen__lines">
          {LINES.map((line, i) => (
            <p
              key={line}
              className={`scenario-screen__line ${i === LINES.length - 1 ? 'scenario-screen__line--accent' : ''} ${i < revealed ? 'is-visible' : 'is-hidden'}`}
            >
              {line}
            </p>
          ))}
        </div>
        {!allRevealed && (
          <p className="scenario-screen__hint">Cliquez sur l'écran pour révéler la suite</p>
        )}
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
