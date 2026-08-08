import Gauge from './Gauge'
import { formatKEUR, formatPct1, formatMonths } from '../engine/format'
import './StatusCard.css'

/** Carte de suivi d'une entreprise : CA + trésorerie, 2 jauges officielles, score courant. */
export default function StatusCard({ company, caPct, sante, societal, score, rank, tresorerie, runwayMois }) {
  const enDecouvert = tresorerie < 0

  return (
    <div className="status-card" style={{ '--company-color': company.couleur }}>
      <div className="status-card__head">
        {rank && <span className="status-card__rank">#{rank}</span>}
        <h3 className="status-card__name">{company.nom}</h3>
      </div>

      <div className="status-card__finances">
        <div className="status-card__fin-row">
          <span className="status-card__fin-label">CA</span>
          <span className="status-card__fin-value">
            {formatKEUR(company.ca)} <span className="status-card__fin-sub">({formatPct1(caPct)})</span>
          </span>
        </div>
        <div className="status-card__fin-row">
          <span className="status-card__fin-label">Trésorerie</span>
          <span className={`status-card__fin-value ${enDecouvert ? 'is-decouvert' : ''}`}>
            {formatKEUR(tresorerie)}
            {enDecouvert
              ? <span className="status-card__fin-sub status-card__fin-sub--decouvert"> · découvert</span>
              : <span className="status-card__fin-sub"> · {formatMonths(runwayMois)} d'autonomie</span>}
          </span>
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
