import dataset from '../data/index.js'
import './LigneDeDepart.css'

/**
 * Visuel de la slide scénario : quatre bureaux aux couleurs des entreprises,
 * alignés sur la ligne de départ. Composé en vectoriel — le dépôt ne porte
 * aucune illustration de scénario, seulement le logo et les quatre visuels
 * d'événement.
 */
export default function LigneDeDepart() {
  const couleurs = dataset.entreprises.map((e) => e.couleur)
  const pas = 100
  const marge = 60

  return (
    <svg
      className="ligne-depart"
      viewBox="0 0 460 200"
      role="img"
      aria-label="Quatre start-up sur la ligne de départ"
    >
      {couleurs.map((couleur, i) => {
        const x = marge + i * pas - 40
        return (
          <g key={couleur} style={{ '--retard': `${i * 120}ms` }} className="ligne-depart__bureau">
            {/* plateau */}
            <rect x={x} y={96} width={76} height={14} rx={7} fill={couleur} />
            {/* piétement */}
            <rect x={x + 10} y={110} width={9} height={44} rx={4.5} fill={couleur} opacity="0.75" />
            <rect x={x + 57} y={110} width={9} height={44} rx={4.5} fill={couleur} opacity="0.75" />
            {/* dossier de chaise, en retrait */}
            <rect x={x + 26} y={72} width={34} height={10} rx={5} fill={couleur} opacity="0.4" />
          </g>
        )
      })}

      {/* ligne de départ */}
      <line
        x1="20" y1="162" x2="440" y2="162"
        stroke="var(--c-text-muted)" strokeWidth="3" strokeDasharray="10 9" strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}
