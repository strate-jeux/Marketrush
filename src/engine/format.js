// Formatage numérique — séparateur décimal français partout (brief § 1).

const entier = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const uneDecimale = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Entier, séparateur de milliers français : 2 600 */
export function formatEntier(valeur) {
  return entier.format(Math.round(valeur))
}

/** Montant en milliers d'euros : 247 K€ */
export function formatKEUR(valeur) {
  return `${formatEntier(valeur)} K€`
}

/** Pourcentage à une décimale : 20,2 % */
export function formatPct(valeur) {
  return `${uneDecimale.format(valeur)} %`
}

/** Autonomie : 33 mois */
export function formatMois(valeur) {
  return `${formatEntier(valeur)} mois`
}
