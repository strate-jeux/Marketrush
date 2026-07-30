import './ChoiceButtons.css'

/** Les 3 gros boutons A/B/C pour la saisie d'une entreprise. */
export default function ChoiceButtons({ company, options, selected, onSelect }) {
  return (
    <div className="choice-card" style={{ '--company-color': company.couleur }}>
      <h3 className="choice-card__name">{company.nom}</h3>
      <div className="choice-card__options">
        {Object.keys(options).map((letter) => (
          <button
            key={letter}
            type="button"
            className={`choice-card__btn ${selected === letter ? 'is-selected' : ''}`}
            onClick={() => onSelect(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  )
}
