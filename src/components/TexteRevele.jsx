import { useEffect, useState } from 'react'
import { decouperSiTropLong } from '../engine/resolution.js'

/**
 * Texte projeté : révélé en un seul temps s'il tient sous le budget de mots,
 * sinon découpé et révélé au clic de l'animateur, un temps à la fois.
 *
 * `cle` réinitialise la révélation quand le texte change (ex. changement de manche).
 * `onComplet` prévient le parent quand tout est révélé, pour activer la suite.
 */
export default function TexteRevele({ texte, cle, className, onComplet }) {
  const temps = decouperSiTropLong(texte)
  const [revele, setRevele] = useState(1)

  useEffect(() => setRevele(1), [cle])

  const complet = revele >= temps.length
  useEffect(() => { if (complet) onComplet?.() }, [complet, onComplet])

  function handleClic() {
    if (!complet) setRevele((r) => r + 1)
  }

  if (temps.length === 1) return <p className={className}>{texte}</p>

  return (
    <div className={className} onClick={handleClic}>
      {temps.slice(0, revele).map((t) => <p key={t}>{t}</p>)}
      {!complet && <p className="texte-revele__indice">Cliquez pour la suite</p>}
    </div>
  )
}
