import Gauge from './Gauge'
import './StatusCard.css'

/** Carte de suivi d'une entreprise : 2 jauges officielles + score courant. */
export default function StatusCard({ company, sante, societal, score, rank }) {
  return (
    <div className="status-card" style={{ '--company-color': company.couleur }}>
      <div className="status-card__head">
        {rank && <span className="status-card__rank">#{rank}</span>}
        <h3 className="status-card__name">{company.nom}</h3>
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
