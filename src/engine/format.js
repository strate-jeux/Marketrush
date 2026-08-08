// Formatage numérique unifié — virgule française partout (cf. brief §3.6).

const intFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const oneDecimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function formatInt(value) {
  return intFormatter.format(Math.round(value))
}

export function formatKEUR(value) {
  return `${formatInt(value)} K€`
}

export function formatPct1(value) {
  return `${oneDecimalFormatter.format(value)} %`
}

export function formatMonths(value) {
  const rounded = Math.round(value)
  return `${formatInt(rounded)} mois`
}
