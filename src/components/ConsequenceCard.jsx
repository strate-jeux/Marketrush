import VerdictIcon from './VerdictIcon'
import AnimatedNumber from './AnimatedNumber'
import './ConsequenceCard.css'

/** Carte de conséquence : effet CA en avant, verdict, phrase, option jouée, variation de jauge. */
export default function ConsequenceCard({ company, result, optionLabel, jaugeLabel }) {
  return (
    <div className={`conseq-card conseq-card--${result.verdict}`} style={{ '--company-color': company.couleur }}>
      <div className="conseq-card__head">
        <h3 className="conseq-card__name">{company.nom}</h3>
        <VerdictIcon verdict={result.verdict} withLabel />
      </div>

      <div className="conseq-card__ca-hero">
        <AnimatedNumber value={result.caPct} prefix={result.caPct > 0 ? '+' : ''} suffix=" %" />
      </div>

      <p className="conseq-card__option">{optionLabel}</p>
      <p className="conseq-card__phrase">{result.phrase}</p>

      {result.jaugeAfter !== null && (
        <div className="conseq-card__deltas">
          <span className={`conseq-card__delta ${result.jaugeAfter === result.jaugeBefore ? 'is-flat' : result.jaugeAfter > result.jaugeBefore ? 'is-up' : 'is-down'}`}>
            {jaugeLabel} {result.jaugeAfter > result.jaugeBefore ? '+' : ''}{result.jaugeAfter - result.jaugeBefore}
          </span>
        </div>
      )}
    </div>
  )
}
