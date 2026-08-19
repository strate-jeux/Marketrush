import OptionCard from '../components/OptionCard'
import Timer from '../components/Timer'
import Navigation from '../components/Navigation'
import './DecisionScreens.css'

export default function DecisionReflexionScreen({ decision, durationSec, onPrev, onNext }) {
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
        <Timer durationSec={durationSec} resetKey={decision.id} />
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} nextLabel="Saisir les réponses" />
    </div>
  )
}
