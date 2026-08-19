import Gauge from './Gauge'
import { formatKEUR, formatPct, formatMois } from '../engine/format.js'
import './StatusCard.css'

/**
 * Carte de suivi d'une entreprise : part de marché, CA, trésorerie et autonomie,
 * les deux jauges officielles, le score courant.
 *
 * `situation` est l'exercice clos le plus récent tel que le rend le moteur
 * financier, ou `null` tant qu'aucune manche n'est entièrement jouée.
 */
export default function StatusCard({ company, partDeMarche, sante, societal, score, rank, situation }) {
  const tresorerie = situation ? situation.tresorerie : company.tresorerie
  const autonomie = situation ? situation.autonomieMois : (company.tresorerie / company.charges_fixes) * 12
  const negative = tresorerie < 0
  // R4 puis R5 : on nomme la ligne réellement mobilisée.
  const ligneMobilisee = !negative ? null : (situation && situation.decouvert > 0 ? 'découvert' : 'emprunt')

  return (
    <div className="status-card" style={{ '--company-color': company.couleur }}>
      <div className="status-card__head">
        {rank && <span className="status-card__rank">#{rank}</span>}
        <h3 className="status-card__name">{company.id}</h3>
      </div>

      <div className="status-card__finances">
        <div className="status-card__ligne">
          <span className="status-card__cle">Chiffre d'affaires</span>
          <span className="status-card__valeur">{formatKEUR(company.ca)}</span>
        </div>
        <div className="status-card__ligne">
          <span className="status-card__cle">Part de marché</span>
          <span className="status-card__valeur">{formatPct(partDeMarche)}</span>
        </div>
        <div className={`status-card__ligne ${negative ? 'is-negative' : ''}`}>
          <span className="status-card__cle">Trésorerie</span>
          <span className="status-card__valeur">
            {formatKEUR(tresorerie)}
            {ligneMobilisee && <span className="status-card__mention"> · {ligneMobilisee}</span>}
          </span>
        </div>
        <div className={`status-card__ligne ${negative ? 'is-negative' : ''}`}>
          <span className="status-card__cle">Autonomie</span>
          <span className="status-card__valeur">{formatMois(autonomie)}</span>
        </div>
      </div>

      <Gauge label="Santé financière" value={sante} color="var(--company-color)" />
      <Gauge label="Indicateur sociétal" value={societal} color="var(--company-color)" />
      <div className="status-card__score">
        <span>Score</span>
        <strong>{Math.round(score)}</strong>
      </div>
    </div>
  )
}
