import PieChart from '../components/PieChart'
import StatusCard from '../components/StatusCard'
import Navigation from '../components/Navigation'
import { computeCamembert, ranking } from '../engine/gameEngine'
import dataset from '../data'
import './SuiviScreen.css'

export default function SuiviScreen({ companies, manche, marcheKEUR, onPrev, onNext, isModal = false, onClose }) {
  const camembert = computeCamembert(dataset, companies, marcheKEUR)
  const slices = [...camembert.parts, camembert.reste]
  const rankedList = ranking(dataset, companies)

  return (
    <div className={isModal ? 'suivi-modal' : 'screen'}>
      {isModal && (
        <button type="button" className="suivi-modal__close" onClick={onClose} aria-label="Fermer">✕</button>
      )}
      <h1>Écran de suivi — après la manche {manche.manche}</h1>
      <div className="suivi-screen__top">
        <PieChart slices={slices} />
        <ol className="suivi-screen__ranking">
          {rankedList.map((c, i) => (
            <li key={c.id} style={{ '--company-color': c.couleur }}>
              <span className="suivi-screen__rank-pos">{i + 1}</span>
              <span className="suivi-screen__rank-name">{c.id}</span>
              <span className="suivi-screen__rank-score">{Math.round(c.score)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="suivi-screen__cards">
        {rankedList.map((c, i) => (
          <StatusCard
            key={c.id}
            company={c}
            sante={c.jauges.sante_financiere}
            societal={c.jauges.indicateur_societal}
            score={c.score}
            rank={i + 1}
          />
        ))}
      </div>
      {!isModal && <Navigation onPrev={onPrev} onNext={onNext} />}
    </div>
  )
}
