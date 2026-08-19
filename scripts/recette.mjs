import dataset from '../src/data/index.js'
import { computeState, computeScores, computeCamembert } from '../src/engine/gameEngine.js'
import { computeFinances } from '../src/engine/financeEngine.js'

const { decisionOrder: order, entreprises, getResolution } = dataset
const recette = dataset.raw.recette
const ids = entreprises.map((e) => e.id)
const LETTRES = ['A', 'B', 'C']

const bonOf = {}
for (const id of ids) {
  bonOf[id] = {}
  for (const d of order) bonOf[id][d] = LETTRES.find((o) => getResolution(id, d, o).verdict === 'bon')
}

const optimalHistory = order.map((decisionId) => ({
  decisionId,
  choices: Object.fromEntries(ids.map((id) => [id, bonOf[id][decisionId]])),
}))

let echecs = 0
const ligne = (ok) => { if (!ok) echecs++; return ok ? 'OK' : 'ECHEC' }

/* ---- T1 : invariant de score ---- */
const { companies } = computeState(dataset, optimalHistory)
const scores = computeScores(dataset, companies)
console.log('T1 — invariant de score')
for (const id of ids) {
  const got = Math.round(scores[id].score * 10) / 10
  console.log(`   ${id.padEnd(9)} ${String(got).padStart(5)}  attendu ${recette.score_chemin_optimal[id]}  ${ligne(got === recette.score_chemin_optimal[id])}`)
}

/* ---- T2 : reste du marche ---- */
console.log('\nT2 — reste du marché')
let cur = 0
for (const m of dataset.raw.manches) {
  cur += m.decisions.length
  const st = computeState(dataset, optimalHistory.slice(0, cur))
  const cam = computeCamembert(dataset, st.companies, dataset.marcheByManche[m.manche].marche_k_eur)
  const got = Math.round(cam.reste.pct * 10) / 10
  const exp = recette.reste_du_marche_si_tous_optimaux_pct[m.manche]
  console.log(`   ${m.manche}  ${String(got).padStart(5)} %  attendu ${exp} %  ${ligne(got === exp)}`)
}

/* ---- T3 : trajectoires de tresorerie ---- */
console.log('\nT3 — trajectoires de trésorerie (chemin optimal)')
const fin = computeFinances(dataset, optimalHistory)
for (const id of ids) {
  const exp = recette.tresorerie_chemin_optimal_k_eur[id]
  const got = fin[id].parManche.map((p) => Math.round(p.tresorerie))
  const attendu = dataset.raw.manches.map((m) => exp[m.manche])
  const okTraj = JSON.stringify(got) === JSON.stringify(attendu)
  console.log(`   ${id.padEnd(9)} ${JSON.stringify(got).padEnd(30)} attendu ${JSON.stringify(attendu).padEnd(30)} ${ligne(okTraj)}`)
  if (!okTraj) fin[id].parManche.forEach((p) => console.log(`      ${p.manche} treso ${p.tresorerie.toFixed(3)} (CA ${p.ca.toFixed(2)}, marge ${p.tauxMarge}, redev ${p.redevance.toFixed(2)}, invest ${p.investissements}, frais ${p.fraisFinanciers.toFixed(2)})`))
  const autoGot = Math.round(fin[id].autonomieMois)
  console.log(`             autonomie finale ${String(autoGot).padStart(3)} mois  attendu ${exp.autonomie_finale_mois}  ${ligne(autoGot === exp.autonomie_finale_mois)}`)
}
// Aucune entreprise irreprochable ne passe en decouvert
const aucunDecouvert = ids.every((id) => fin[id].parManche.every((p) => p.decouvert === 0 && p.dette === 0))
console.log(`   aucune entreprise irréprochable en découvert : ${ligne(aucunDecouvert)}`)

/* ---- T4 : tolerance a l'erreur ----
   Population : k decisions erronees parmi 11, chacune prenant sa premiere option
   de verdict « mauvais » (ordre A -> B -> C), les autres l'option bonne.        */
console.log('\nT4 — trésorerie finale médiane par nombre d\'erreurs')

const mauvaisOf = {}
for (const id of ids) {
  mauvaisOf[id] = {}
  for (const d of order) mauvaisOf[id][d] = LETTRES.find((o) => getResolution(id, d, o).verdict === 'mauvais')
}

const mediane = (arr) => {
  const s = [...arr].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

for (const id of ids) {
  const exp = recette.tresorerie_finale_mediane_par_nb_erreurs_k_eur[id]
  const got = exp.map((_, k) => {
    const vals = []
    const sel = []
    const rec = (start) => {
      if (sel.length === k) {
        const hist = order.map((decisionId) => ({
          decisionId,
          choices: { [id]: sel.includes(decisionId) ? mauvaisOf[id][decisionId] : bonOf[id][decisionId] },
        }))
        vals.push(computeFinances(dataset, hist)[id].tresorerie)
        return
      }
      for (let i = start; i < order.length; i++) { sel.push(order[i]); rec(i + 1); sel.pop() }
    }
    rec(0)
    return Math.round(mediane(vals))
  })
  const ok = JSON.stringify(got) === JSON.stringify(exp)
  console.log(`   ${id.padEnd(9)} ${JSON.stringify(got).padEnd(34)} attendu ${JSON.stringify(exp).padEnd(34)} ${ligne(ok)}`)
}

/* ---- T5 : bornes et cas limites ---- */
console.log('\nT5 — bornes et cas limites')
const caFinal = Math.round(companies[ids[0]].ca)
console.log(`   CA final sans faute ${caFinal}  attendu ${recette.ca_final_sans_faute_k_eur}  ${ligne(caFinal === recette.ca_final_sans_faute_k_eur)}`)

const pireHistory = order.map((decisionId) => ({
  decisionId,
  choices: Object.fromEntries(ids.map((id) => [id, LETTRES.find((o) => getResolution(id, decisionId, o).verdict === 'mauvais')])),
}))
const caPire = Math.round(computeState(dataset, pireHistory).companies[ids[0]].ca)
console.log(`   CA final tout faux  ${caPire}  attendu ${recette.ca_final_toutes_erreurs_k_eur}  ${ligne(caPire === recette.ca_final_toutes_erreurs_k_eur)}`)

const [ampMin, ampMax] = dataset.raw.jauges.amplitude_atteignable
let jaugesOk = true
for (const hist of [optimalHistory, pireHistory]) {
  const st = computeState(dataset, hist)
  for (const id of ids)
    for (const j of ['sante_financiere', 'indicateur_societal'])
      if (st.companies[id][j] < ampMin || st.companies[id][j] > ampMax) jaugesOk = false
}
console.log(`   jauges dans [${ampMin}, ${ampMax}]  ${ligne(jaugesOk)}`)

// R2 : INCLUSIA outil_production B puis modalite_croissance A ne decaisse 95 K€ qu'une fois
{
  const hist = order.map((decisionId) => ({
    decisionId,
    choices: { INCLUSIA: decisionId === 'outil_production' ? 'B' : decisionId === 'modalite_croissance' ? 'A' : bonOf.INCLUSIA[decisionId] },
  }))
  const f = computeFinances(dataset, hist).INCLUSIA
  const n1 = f.parManche.find((p) => p.manche === 'N1').investissements
  const n2 = f.parManche.find((p) => p.manche === 'N2').investissements
  const coutB = getResolution('INCLUSIA', 'outil_production', 'B').cout_k_eur
  const coutA = getResolution('INCLUSIA', 'modalite_croissance', 'A').cout_k_eur
  console.log(`   R2 INCLUSIA : N1 invest ${n1} (dont atelier ${coutB}), N2 invest ${n2} (atelier ${coutA} non redécaissé)  ${ligne(n2 === 0)}`)
}

// R7 : aucune option n'est jamais bloquee, quelle que soit la tresorerie.
{
  const modulab = dataset.entreprises.find((e) => e.id === 'MODULAB')
  const cout = getResolution('MODULAB', 'politique_rse', 'A').cout_k_eur
  console.log(`   R7 : MODULAB a ${modulab.tresorerie} K€ et ${modulab.capacite_emprunt} K€ d'emprunt ; politique_rse A coûte ${cout} K€`)

  // a) sur un parcours par ailleurs optimal, l'option passe et reste finançable
  const histOpt = order.map((decisionId) => ({
    decisionId,
    choices: { MODULAB: decisionId === 'politique_rse' ? 'A' : bonOf.MODULAB[decisionId] },
  }))
  const n4opt = computeFinances(dataset, histOpt).MODULAB.parManche.find((p) => p.manche === 'N4')
  console.log(`      parcours optimal + RSE A : N4 trésorerie ${n4opt.tresorerie.toFixed(2)}  ${ligne(n4opt !== undefined)}`)

  // b) sur un parcours degrade, la meme option fait plonger sans jamais etre empechee
  const histPire = order.map((decisionId) => ({
    decisionId,
    choices: { MODULAB: decisionId === 'politique_rse' ? 'A' : mauvaisOf.MODULAB[decisionId] },
  }))
  const fPire = computeFinances(dataset, histPire).MODULAB
  const n4pire = fPire.parManche.find((p) => p.manche === 'N4')
  const cinqManches = fPire.parManche.length === 5
  console.log(`      parcours dégradé + RSE A : N4 trésorerie ${n4pire.tresorerie.toFixed(2)} | dette ${n4pire.dette.toFixed(2)} | découvert ${n4pire.decouvert.toFixed(2)}`)
  console.log(`      les 5 manches sont calculées malgré la trésorerie négative (option jamais bloquée)  ${ligne(cinqManches && n4pire.tresorerie < 0)}`)

  // R6 : le solde ne descend jamais sous capacite_emprunt + 50 % du CA
  let r6 = true
  for (const id of ids) {
    const h = order.map((decisionId) => ({ decisionId, choices: { [id]: mauvaisOf[id][decisionId] } }))
    const comp = dataset.entreprises.find((e) => e.id === id)
    for (const p of computeFinances(dataset, h)[id].parManche) {
      const maxi = comp.capacite_emprunt + dataset.raw.moteur_financier.constantes.plafond_decouvert_pct_ca * p.ca
      if (p.tresorerie < -maxi - 1e-9) r6 = false
      if (p.decouvert > dataset.raw.moteur_financier.constantes.plafond_decouvert_pct_ca * p.ca + 1e-9) r6 = false
      if (p.dette > comp.capacite_emprunt + 1e-9) r6 = false
    }
  }
  console.log(`   R4/R5/R6 : dette ≤ capacité, découvert ≤ 50 % du CA, solde ≥ −(capacité + plafond)  ${ligne(r6)}`)
}

/* ---- Instruction des deux cellules T3 divergentes ---- */
console.log('\nInstruction des écarts T3 (cohérence interne de la table de recette)')
for (const [id, mancheCible] of [['MODULAB', 'N1'], ['LIGNEA', 'N4']]) {
  const p = fin[id].parManche
  const i = p.findIndex((x) => x.manche === mancheCible)
  const exp = recette.tresorerie_chemin_optimal_k_eur[id]
  const calc = p[i].tresorerie
  const attendu = exp[mancheCible]
  console.log(`   ${id} ${mancheCible} : calculé ${calc.toFixed(4)} (→ ${Math.round(calc)}), table ${attendu}`)
  // On rejoue les manches suivantes en partant de la valeur de la table.
  let t = attendu
  const suite = []
  for (let j = i + 1; j < p.length; j++) {
    t += p[j].tresorerie - p[j - 1].tresorerie
    suite.push(`${p[j].manche}=${Math.round(t)} (table ${exp[p[j].manche]})${Math.round(t) === exp[p[j].manche] ? '' : '  <-- CONTRADICTION'}`)
  }
  console.log(`      en partant de ${attendu} : ${suite.join(' | ')}`)
}

console.log(`\n===== ${echecs === 0 ? 'RECETTE LOT 2 : TOUT PASSE' : `RECETTE LOT 2 : ${echecs} ECART(S) SUR T3`} =====`)
process.exit(echecs === 0 ? 0 : 1)
