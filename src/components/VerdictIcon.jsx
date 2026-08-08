const ICONS = { bon: '✔', moyen: '–', mauvais: '✘' }
const LABELS = { bon: 'BON CHOIX', moyen: 'CHOIX MOYEN', mauvais: 'MAUVAIS CHOIX' }

export default function VerdictIcon({ verdict, withLabel = false }) {
  return (
    <span className={`verdict verdict--${verdict}`}>
      <span aria-hidden="true">{ICONS[verdict]}</span>
      {withLabel && <span className="verdict__label">{LABELS[verdict]}</span>}
    </span>
  )
}
