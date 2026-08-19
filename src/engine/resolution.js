// Découpage des textes projetés en temps de lecture.
//
// Deux règles distinctes du brief, à ne pas confondre :
//
// 1. Résolutions (§4.2) — TOUJOURS en deux temps, quelle que soit la longueur :
//    le constat, puis la conséquence. La coupure se fait sur la première
//    ponctuation forte (point ou deux-points). `decouperResolution`.
//
// 2. Règle générale (§1) — 25 mots maximum par écran projeté. Un texte n'est
//    découpé QUE s'il dépasse ce budget ; en dessous, il reste en un seul
//    temps. `decouperSiTropLong`, pour les accroches de manche, les textes
//    d'événement et les descriptions d'option.
//
// Les deux partagent le même mécanisme de découpe : le premier segment forme
// un temps à lui seul, les segments suivants se regroupent tant qu'ils
// tiennent dans le budget de mots.

const MOTS_MAX = 25

/** La ponctuation doit être suivie d'une espace : « 37.5 » ou « 3 200 » restent intacts. */
const SEPARATEUR = /(?<=[.:])\s+/

export function compterMots(texte) {
  return texte.split(/\s+/).filter(Boolean).length
}

function decouperEnTemps(texte, motsMax) {
  const segments = texte.split(SEPARATEUR).map((s) => s.trim()).filter(Boolean)
  if (segments.length <= 1) return [texte.trim()]

  const [premier, ...reste] = segments
  const temps = [premier]

  for (const segment of reste) {
    const dernier = temps[temps.length - 1]
    const fusion = `${dernier} ${segment}`
    // On n'agrège jamais au premier temps : il forme un temps à lui seul
    // (c'est le constat, dans le cas d'une phrase de résolution).
    if (temps.length > 1 && compterMots(fusion) <= motsMax) temps[temps.length - 1] = fusion
    else temps.push(segment)
  }

  return temps
}

/**
 * Découpe une phrase de résolution en temps de projection : constat, puis
 * conséquence. Toujours appliqué, indépendamment du nombre de mots.
 * Retourne toujours au moins un temps.
 */
export function decouperResolution(phrase, motsMax = MOTS_MAX) {
  return decouperEnTemps(phrase, motsMax)
}

/**
 * Découpe un texte projeté seulement s'il dépasse `motsMax` mots — sous le
 * budget, il reste en un seul temps. Pour les accroches, les textes
 * d'événement, les descriptions d'option.
 */
export function decouperSiTropLong(texte, motsMax = MOTS_MAX) {
  if (compterMots(texte) <= motsMax) return [texte.trim()]
  return decouperEnTemps(texte, motsMax)
}
