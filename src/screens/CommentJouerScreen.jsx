import Navigation from '../components/Navigation'
import dataset from '../data/index.js'
import './CommentJouerScreen.css'

const ETAPES = [
  'Le contexte de l’année',
  'La décision et ses trois options',
  'La concertation en équipe',
  'L’annonce des réponses',
  'Le verdict et ses conséquences',
  'Le suivi des indicateurs',
]

/** Slide d'ouverture : le déroulé d'une manche, les deux jauges, le score. */
export default function CommentJouerScreen({ onPrev, onNext }) {
  const { jauges } = dataset.raw
  const [borneBasse, borneHaute] = jauges.bornes

  return (
    <div className="screen comment-jouer">
      <h1>Comment jouer&nbsp;?</h1>

      <ol className="comment-jouer__etapes">
        {ETAPES.map((etape, i) => (
          <li key={etape} className="comment-jouer__etape">
            <span className="comment-jouer__num">{i + 1}</span>
            <span className="comment-jouer__libelle">{etape}</span>
          </li>
        ))}
      </ol>

      <div className="comment-jouer__indicateurs">
        <div className="comment-jouer__indicateur">
          <span className="comment-jouer__cle">Santé financière</span>
          <span className="comment-jouer__cle">Indicateur sociétal</span>
          <span className="comment-jouer__detail">
            de {borneBasse} à {borneHaute}, départ à {jauges.depart}, {jauges.pas} points par décision
          </span>
        </div>
        <div className="comment-jouer__indicateur comment-jouer__indicateur--score">
          <span className="comment-jouer__cle">Score</span>
          <span className="comment-jouer__detail">
            moitié part de marché, moitié vos deux jauges
          </span>
        </div>
      </div>

      <Navigation onPrev={onPrev} onNext={onNext} nextLabel="Commencer la manche 1" />
    </div>
  )
}
