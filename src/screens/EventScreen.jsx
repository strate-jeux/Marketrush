import Navigation from '../components/Navigation'
import { EVENEMENT_IMAGES } from '../data'
import './EventScreen.css'

export default function EventScreen({ manche, onPrev, onNext }) {
  const evt = manche.evenement
  // v7.1 ne porte plus de chemin d'image : rattachement par clé de manche.
  const image = EVENEMENT_IMAGES[manche.manche]

  return (
    <div className="screen event-screen">
      <div className="event-screen__eyebrow">Événement · Manche {manche.manche}</div>
      <h1 className="event-screen__title">{evt.titre}</h1>
      {evt.sous_titre && <p className="event-screen__sous-titre">{evt.sous_titre}</p>}
      <div className="event-screen__body">
        {image && (
          <img className="event-screen__image" src={`${import.meta.env.BASE_URL}${image}`} alt={evt.titre} />
        )}
        <p className="event-screen__texte">{evt.texte}</p>
      </div>
      <div className="event-screen__effet">
        <span className="event-screen__effet-label">Effet mécanique</span>
        <p>{evt.effet}</p>
      </div>
      <Navigation onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
