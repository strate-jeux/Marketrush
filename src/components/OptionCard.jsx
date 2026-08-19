import './OptionCard.css'

const LETTER_COLOR = { A: 'var(--c-mobisco)', B: 'var(--c-lignea)', C: 'var(--c-inclusia)' }

/** Carte détaillée d'une option A/B/C — utilisée aux écrans Présentation et Réflexion. */
export default function OptionCard({ option, visible }) {
  return (
    <div
      className={`option-card ${visible ? 'is-visible' : 'is-hidden'}`}
      style={{ '--letter-color': LETTER_COLOR[option.lettre] }}
    >
      <span className="option-card__letter">{option.lettre}</span>
      <div className="option-card__body">
        <p className="option-card__label">{option.libelle}</p>
        <p className="option-card__desc">{option.description}</p>
      </div>
    </div>
  )
}
