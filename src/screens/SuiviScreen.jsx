import PieChart from '../components/PieChart'
import StatusCard from '../components/StatusCard'
import Navigation from '../components/Navigation'
import { computeCamembert, ranking } from '../engine/gameEngine'
import dataset from '../data/index.js'
import './SuiviScreen.css'

/**
 * Situation financière à afficher pour une manche donnée : l'exercice clos de
 * cette manche, ou le dernier exercice clos avant elle (cas du suivi ouvert en
 * cours de manche). `null` tant qu'aucune manche n'est entièrement jouée.
 */
function situationPourManche(finance, mancheKey) {
  if (!finance) return null
  const rangs = dataset.raw.manches.map((m) => m.manche)
  const cible = rangs.indexOf(mancheKey)
  let trouvee = null
  for (const exercice of finance.parManche) {
    if (rangs.indexOf(exercice.manche) <= cible) trouvee = exercice
  }
  return trouvee
}

export default function SuiviScreen({ companies, finances, manche, marcheKEUR, onPrev, onNext, isModal = false, onClose }) {
  const camembert = computeCamembert(dataset, companies, marcheKEUR)
  const slices = [...camembert.parts, camembert.reste]
  const partParEntreprise = Object.fromEntries(camembert.parts.map((p) => [p.id, p.pct]))
  // Le classement se lit dans l'ordre des cartes : pas de liste séparée qui le répète.
  const rankedList = ranking(dataset, companies)

  return (
    <div className={isModal ? 'suivi-modal' : 'screen suivi-screen'}>
      {isModal && (
        <button type="button" className="suivi-modal__close" onClick={onClose} aria-label="Fermer">✕</button>
      )}
      <h1>Écran de suivi — après la manche {manche.manche}</h1>
      <div className="suivi-screen__top">
        <PieChart slices={slices} />
      </div>
      <div className="suivi-screen__cards">
        {rankedList.map((c, i) => (
          <StatusCard
            key={c.id}
            company={c}
            partDeMarche={partParEntreprise[c.id] ?? 0}
            sante={c.jauges.sante_financiere}
            societal={c.jauges.indicateur_societal}
            score={c.score}
            rank={i + 1}
            situation={situationPourManche(finances?.[c.id], manche.manche)}
          />
        ))}
      </div>
      {!isModal && <Navigation onPrev={onPrev} onNext={onNext} />}
    </div>
  )
}
