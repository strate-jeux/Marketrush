import VerdictIcon from './VerdictIcon'
import './ConsequenceCard.css'

/** Carte de conséquence : option jouée, verdict, phrase explicative, variation CA/jauge. */
export default function ConsequenceCard({ company, result, optionLabel, jaugeLabel }) {
  const caUp = result.caPct > 0
  const caFlat = result.caPct === 0

  return (
    <div className={`conseq-card conseq-card--${result.verdict}`} style={{ '--company-color': company.couleur }}>
      <div className="conseq-card__head">
        <h3 className="conseq-card__name">{company.nom}</h3>
        <VerdictIcon verdict={result.verdict} />
      </div>
      <p className="conseq-card__option">{optionLabel}</p>
      <p className="conseq-card__phrase">{result.phrase}</p>
      <div className="conseq-card__deltas">
        <span className={`conseq-card__delta ${caFlat ? 'is-flat' : caUp ? 'is-up' : 'is-down'}`}>
          CA {caUp ? '+' : ''}{result.caPct} %
        </span>
        {result.jaugeAfter !== null && (
          <span className={`conseq-card__delta ${result.jaugeAfter === result.jaugeBefore ? 'is-flat' : result.jaugeAfter > result.jaugeBefore ? 'is-up' : 'is-down'}`}>
            {jaugeLabel} {result.jaugeAfter > result.jaugeBefore ? '+' : ''}{result.jaugeAfter - result.jaugeBefore}
          </span>
        )}
      </div>
    </div>
  )
}
