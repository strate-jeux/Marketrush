import VerdictIcon from './VerdictIcon'
import { decouperResolution } from '../engine/resolution.js'
import './ConsequenceCard.css'

/**
 * Carte de conséquence : option jouée, verdict, résolution projetée en plusieurs
 * temps, puis les variations de CA et de jauge.
 *
 * `revele` est le nombre de temps déjà dévoilés, piloté par l'animateur depuis
 * l'écran. Les variations n'apparaissent qu'une fois la phrase entièrement lue.
 */
export default function ConsequenceCard({ company, result, optionLabel, jaugeLabel, revele }) {
  // Les coefficients v7.1 sont des fractions : 0,12 se projette « +12 % ».
  const caPct = Math.round(result.coef * 100)
  const caUp = caPct > 0
  const caFlat = caPct === 0

  const temps = decouperResolution(result.phrase)
  const lus = temps.slice(0, revele)
  const complet = revele >= temps.length

  return (
    <div className={`conseq-card conseq-card--${result.verdict}`} style={{ '--company-color': company.couleur }}>
      <div className="conseq-card__head">
        <h3 className="conseq-card__name">{company.id}</h3>
        <VerdictIcon verdict={result.verdict} />
      </div>
      <p className="conseq-card__option">{optionLabel}</p>
      <div className="conseq-card__phrase">
        {lus.map((temp, i) => (
          <p key={temp} className={`conseq-card__temps ${i === 0 ? 'conseq-card__temps--constat' : ''}`}>
            {temp}
          </p>
        ))}
      </div>
      {complet && (
        <div className="conseq-card__deltas">
          <span className={`conseq-card__delta ${caFlat ? 'is-flat' : caUp ? 'is-up' : 'is-down'}`}>
            CA {caUp ? '+' : ''}{caPct} %
          </span>
          {result.jaugeAfter !== null && (
            <span className={`conseq-card__delta ${result.jaugeAfter === result.jaugeBefore ? 'is-flat' : result.jaugeAfter > result.jaugeBefore ? 'is-up' : 'is-down'}`}>
              {jaugeLabel} {result.jaugeAfter > result.jaugeBefore ? '+' : ''}{result.jaugeAfter - result.jaugeBefore}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
