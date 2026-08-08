import Navigation from '../components/Navigation'
import './CommentJouerScreen.css'

const COMPTEURS = [
  { valeur: '5', label: 'manches' },
  { valeur: '11', label: 'décisions en équipe' },
  { valeur: '3', label: 'indicateurs à surveiller' },
]

export default function CommentJouerScreen({ onPrev, onNext }) {
  return (
    <div className="screen comment-jouer-screen">
      <h1>Comment jouer ?</h1>

      <div className="comment-jouer-screen__compteurs">
        {COMPTEURS.map((c) => (
          <div key={c.label} className="comment-jouer-screen__compteur">
            <span className="comment-jouer-screen__compteur-valeur">{c.valeur}</span>
            <span className="comment-jouer-screen__compteur-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="comment-jouer-screen__prose">
        <p>
          Vous êtes responsable d'un service : marketing, gestion opérationnelle ou ressources
          humaines. Lisez attentivement votre fiche : elle contient des informations que vos
          coéquipiers n'ont pas.
        </p>
        <p>Concertez-vous, croisez vos données, et choisissez ensemble la meilleure option.</p>
        <p>
          <strong>Votre mission :</strong> finir avec le meilleur score, en conciliant performance
          économique, solidité financière et impact sociétal.
        </p>
        <p>Il n'existe pas de stratégie parfaite. À vous de construire la vôtre.</p>
      </div>

      <Navigation onPrev={onPrev} onNext={onNext} nextLabel="Commencer la manche 1" />
    </div>
  )
}
