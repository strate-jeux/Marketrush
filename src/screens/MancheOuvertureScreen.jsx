import Navigation from '../components/Navigation'
import './MancheOuvertureScreen.css'

export default function MancheOuvertureScreen({ manche, marche, onPrev, onNext }) {
  // v7.1 sépare le narratif (`manches`) du chiffré (`marche.manches`) : on affiche les deux.
  const evolutionPct = marche.evolution == null
    ? null
    : `${marche.evolution > 0 ? '+' : ''}${Math.round(marche.evolution * 100)} %`

  return (
    <div className="screen manche-ouverture">
      <div className="manche-ouverture__eyebrow">
        {marche.libelle} · {manche.manche}
      </div>
      <p className="manche-ouverture__accroche">{manche.accroche}</p>
      <div className="manche-ouverture__marche">
        <span className="manche-ouverture__marche-value">
          {marche.marche_k_eur.toLocaleString('fr-FR')} K€
        </span>
        <span className="manche-ouverture__marche-label">
          marché adressable{evolutionPct ? ` · ${evolutionPct}` : ''}
        </span>
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
