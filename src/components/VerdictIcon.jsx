const ICONS = { bon: '✅', moyen: '⚠️', mauvais: '❌' }
const LABELS = { bon: 'Bonne décision', moyen: 'Décision moyenne', mauvais: 'Mauvaise décision' }

export default function VerdictIcon({ verdict, withLabel = false }) {
  return (
    <span className={`verdict verdict--${verdict}`}>
      <span aria-hidden="true">{ICONS[verdict]}</span>
      {withLabel && <span className="verdict__label">{LABELS[verdict]}</span>}
    </span>
  )
}
