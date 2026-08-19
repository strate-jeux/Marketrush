import './ChoiceButtons.css'

/** Les 3 gros boutons A/B/C pour la saisie d'une entreprise. */
export default function ChoiceButtons({ company, options, selected, onSelect }) {
  return (
    <div className="choice-card" style={{ '--company-color': company.couleur }}>
      <h3 className="choice-card__name">{company.id}</h3>
      <div className="choice-card__options">
        {options.map((option) => (
          <button
            key={option.lettre}
            type="button"
            className={`choice-card__btn ${selected === option.lettre ? 'is-selected' : ''}`}
            onClick={() => onSelect(option.lettre)}
          >
            {option.lettre}
          </button>
        ))}
      </div>
    </div>
  )
}
