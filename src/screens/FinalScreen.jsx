import { useState } from 'react'
import { ranking } from '../engine/gameEngine'
import { formatPct1 } from '../engine/format'
import content from '../data/content.json'
import './FinalScreen.css'

export default function FinalScreen({ companies, onNewGame }) {
  const [confirming, setConfirming] = useState(false)
  const rankedList = ranking(content, companies)

  return (
    <div className="screen final-screen">
      <h1>Classement final</h1>
      <ol className="final-screen__podium">
        {rankedList.map((c, i) => (
          <li key={c.id} className="final-screen__row" style={{ '--company-color': c.couleur }}>
            <span className="final-screen__pos">{i + 1}</span>
            <span className="final-screen__name">{c.nom}</span>
            <span className="final-screen__detail">
              Part relative {formatPct1(c.partRelative)} → indice {Math.round(c.indice)} · Santé
              financière {Math.round(c.jauges.sante_financiere)} · Indicateur sociétal{' '}
              {Math.round(c.jauges.indicateur_societal)}
            </span>
            <span className="final-screen__score">{Math.round(c.score)}</span>
          </li>
        ))}
      </ol>

      <div className="final-screen__message">
        <p>
          Quatre stratégies différentes, toutes cohérentes, peuvent toutes mener à la victoire : il
          n'existait pas une seule bonne réponse, mais une cohérence à tenir entre ses choix. En cas
          d'égalité de score, le départage se fait au brouillon d'équipe.
        </p>
      </div>

      <div className="final-screen__actions">
        {!confirming ? (
          <button type="button" className="final-screen__new-game" onClick={() => setConfirming(true)}>
            Nouvelle partie
          </button>
        ) : (
          <div className="final-screen__confirm">
            <span>Réinitialiser complètement la partie ?</span>
            <button type="button" className="final-screen__confirm-yes" onClick={onNewGame}>
              Oui, réinitialiser
            </button>
            <button type="button" className="final-screen__confirm-no" onClick={() => setConfirming(false)}>
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
