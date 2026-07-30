import ConsequenceCard from '../components/ConsequenceCard'
import Navigation from '../components/Navigation'
import content from '../data/content.json'
import './DecisionScreens.css'

const JAUGE_LABELS = {
  sante_financiere: 'Santé financière',
  indicateur_societal: 'Indicateur sociétal',
  part_de_marche: 'Part de marché',
}

export default function DecisionConsequencesScreen({ decision, results, onPrev, onNext }) {
  return (
    <div className="screen decision-screen">
      <div className="decision-screen__eyebrow">Conséquences</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__consequences-grid">
        {content.entreprises.map((company) => {
          const result = results[company.id]
          const optionLabel = decision.options[result.choice].label
          return (
            <ConsequenceCard
              key={company.id}
              company={company}
              result={result}
              optionLabel={optionLabel}
              jaugeLabel={JAUGE_LABELS[decision.jauge]}
            />
          )
        })}
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
