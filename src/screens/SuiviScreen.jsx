import PieChart from '../components/PieChart'
import StatusCard from '../components/StatusCard'
import Navigation from '../components/Navigation'
import { computeCamembert, ranking } from '../engine/gameEngine'
import content from '../data/content.json'
import './SuiviScreen.css'

export default function SuiviScreen({ companies, finances, manche, onPrev, onNext, isModal = false, onClose }) {
  const camembert = computeCamembert(content, companies, manche.marche_kEUR)
  const slices = [...camembert.parts, camembert.reste]
  const pctById = Object.fromEntries(camembert.parts.map((p) => [p.id, p.pct]))
  const rankedList = ranking(content, companies)

  return (
    <div className={isModal ? 'suivi-modal' : 'screen'}>
      {isModal && (
        <button type="button" className="suivi-modal__close" onClick={onClose} aria-label="Fermer">✕</button>
      )}
      <h1>Écran de suivi — après la manche {manche.numero}</h1>
      <div className="suivi-screen__top">
        <PieChart slices={slices} size={360} />
      </div>
      <div className="suivi-screen__cards">
        {rankedList.map((c, i) => (
          <StatusCard
            key={c.id}
            company={c}
            caPct={pctById[c.id] ?? 0}
            sante={c.jauges.sante_financiere}
            societal={c.jauges.indicateur_societal}
            score={c.score}
            rank={i + 1}
            tresorerie={finances[c.id]?.tresorerie ?? 0}
            runwayMois={finances[c.id]?.runwayMois ?? 0}
          />
        ))}
      </div>
      {!isModal && <Navigation onPrev={onPrev} onNext={onNext} />}
    </div>
  )
}
