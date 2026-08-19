import { useEffect, useState } from 'react'
import OptionCard from '../components/OptionCard'
import Timer from '../components/Timer'
import Navigation from '../components/Navigation'
import './DecisionScreens.css'

export default function DecisionReflexionScreen({ decision, durationSec, onPrev, onNext }) {
  // Le décompte est déclenché par l'animateur, jamais à l'affichage de la slide.
  const [lance, setLance] = useState(false)
  useEffect(() => setLance(false), [decision.id])

  return (
    <div className="screen decision-screen">
      <div className="decision-screen__eyebrow">Décision · {decision.notion}</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__options">
        {decision.options.map((option) => (
          <OptionCard key={option.lettre} option={option} visible />
        ))}
      </div>
      <div className="decision-screen__timer-row">
        <Timer durationSec={durationSec} resetKey={decision.id} demarre={lance} />
        {!lance && (
          <button type="button" className="decision-screen__lancer" onClick={() => setLance(true)}>
            Lancer le décompte
          </button>
        )}
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} nextLabel="Saisir les réponses" />
    </div>
  )
}
