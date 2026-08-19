import { useEffect, useState } from 'react'
import ConsequenceCard from '../components/ConsequenceCard'
import Navigation from '../components/Navigation'
import dataset from '../data/index.js'
import { decouperResolution } from '../engine/resolution.js'
import './DecisionScreens.css'

const JAUGE_LABELS = {
  sante_financiere: 'Santé financière',
  indicateur_societal: 'Indicateur sociétal',
  part_de_marche: 'Part de marché',
}

export default function DecisionConsequencesScreen({ decision, results, onPrev, onNext }) {
  // La résolution se projette en deux temps : le constat, puis la conséquence.
  // Les quatre entreprises avancent ensemble, à la main de l'animateur.
  const [revele, setRevele] = useState(1)
  useEffect(() => setRevele(1), [decision.id])

  const totalTemps = Math.max(
    1,
    ...dataset.entreprises
      .map((c) => results[c.id])
      .filter(Boolean)
      .map((r) => decouperResolution(r.phrase).length),
  )
  const tout = revele >= totalTemps

  return (
    <div className="screen decision-screen" onClick={() => !tout && setRevele((r) => r + 1)}>
      <div className="decision-screen__eyebrow">Conséquences</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__consequences-grid">
        {dataset.entreprises.map((company) => {
          const result = results[company.id]
          const optionLabel = decision.options.find((o) => o.lettre === result.choice)?.libelle
          return (
            <ConsequenceCard
              key={company.id}
              company={company}
              result={result}
              optionLabel={optionLabel}
              jaugeLabel={JAUGE_LABELS[decision.jauge]}
              revele={revele}
            />
          )
        })}
      </div>
      {!tout && (
        <p className="decision-screen__hint">Cliquez sur l'écran pour dévoiler la conséquence</p>
      )}
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
