import LigneDeDepart from '../components/LigneDeDepart'
import Navigation from '../components/Navigation'
import './ScenarioScreen.css'

/** Slide d'ouverture : le décor, en une phrase. Visuel dominant, texte court. */
export default function ScenarioScreen({ onPrev, onNext }) {
  return (
    <div className="screen scenario-screen">
      <h1 className="scenario-screen__titre">Le marché s'ouvre</h1>
      <div className="scenario-screen__visuel">
        <LigneDeDepart />
      </div>
      <p className="scenario-screen__texte">
        Un plan national d'équipement ouvre le marché du mobilier scolaire.
        Quatre start-up prennent le départ. Aucune position n'est acquise.
      </p>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
