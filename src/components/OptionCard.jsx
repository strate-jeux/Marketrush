import { decouperSiTropLong } from '../engine/resolution.js'
import './OptionCard.css'

const LETTER_COLOR = { A: 'var(--c-mobisco)', B: 'var(--c-lignea)', C: 'var(--c-inclusia)' }

/**
 * Carte détaillée d'une option A/B/C — utilisée aux écrans Présentation et Réflexion.
 *
 * `tempsVisibles` pilote la révélation progressive d'une description qui dépasse
 * 25 mots (règle §1) ; omis, la description s'affiche en entier (écran Réflexion,
 * où l'option est déjà connue de l'équipe).
 */
export default function OptionCard({ option, visible, tempsVisibles }) {
  const temps = decouperSiTropLong(option.description)
  const nVisible = tempsVisibles ?? temps.length

  return (
    <div
      className={`option-card ${visible ? 'is-visible' : 'is-hidden'}`}
      style={{ '--letter-color': LETTER_COLOR[option.lettre] }}
    >
      <span className="option-card__letter">{option.lettre}</span>
      <div className="option-card__body">
        <p className="option-card__label">{option.libelle}</p>
        <div className="option-card__desc">
          {temps.slice(0, nVisible).map((t) => <p key={t}>{t}</p>)}
        </div>
      </div>
    </div>
  )
}
