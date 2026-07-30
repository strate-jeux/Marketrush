import ChoiceButtons from '../components/ChoiceButtons'
import content from '../data/content.json'
import './DecisionScreens.css'

export default function DecisionSaisieScreen({ decision, choices, onChoiceChange, onPrev, onValidate }) {
  const complete = content.entreprises.every((e) => choices[e.id])

  return (
    <div className="screen decision-screen">
      <div className="decision-screen__eyebrow">Saisie des réponses</div>
      <h1 className="decision-screen__title">{decision.titre}</h1>
      <div className="decision-screen__saisie-grid">
        {content.entreprises.map((company) => (
          <ChoiceButtons
            key={company.id}
            company={company}
            options={decision.options}
            selected={choices[company.id]}
            onSelect={(letter) => onChoiceChange(company.id, letter)}
          />
        ))}
      </div>
      <div className="decision-screen__validate">
        <button
          type="button"
          className="decision-screen__validate-btn"
          disabled={!complete}
          onClick={onValidate}
        >
          Valider les décisions →
        </button>
      </div>
      <button type="button" className="nav-bar__btn nav-bar__btn--ghost" onClick={onPrev} style={{ alignSelf: 'flex-start' }}>
        ← Précédent
      </button>
    </div>
  )
}
