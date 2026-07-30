import RulesContent from '../components/RulesContent'
import Navigation from '../components/Navigation'

export default function RulesScreen({ onPrev, onNext }) {
  return (
    <div className="screen">
      <h1>Rappel des règles</h1>
      <RulesContent />
      <Navigation onPrev={onPrev} onNext={onNext} nextLabel="Commencer la manche 1" />
    </div>
  )
}
