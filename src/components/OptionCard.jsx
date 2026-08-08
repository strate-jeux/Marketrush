import './OptionCard.css'

const LETTER_COLOR = { A: 'var(--c-mobisco)', B: 'var(--c-lignea)', C: 'var(--c-inclusia)' }

/** Carte détaillée d'une option A/B/C — utilisée aux écrans Présentation et Réflexion. */
export default function OptionCard({ letter, option, visible, index = 0 }) {
  return (
    <div
      className={`option-card ${visible ? 'is-visible' : 'is-hidden'}`}
      style={{ '--letter-color': LETTER_COLOR[letter], '--reveal-delay': `${index * 80}ms` }}
    >
      <span className="option-card__letter">{letter}</span>
      <div className="option-card__body">
        <p className="option-card__label">{option.label.replace(/^[A-C]\.\s*/, '')}</p>
        <p className="option-card__desc">{option.description}</p>
      </div>
    </div>
  )
}
