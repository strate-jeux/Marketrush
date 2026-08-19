# MAPPING.md — Lot 0 : cartographie v5.0 → v7.1

Comparaison entre `marketrush_data_v7.json` (v7.1, fourni par l'animateur) et le schéma
réellement en jeu dans ce dépôt. **Aucun fichier de code applicatif n'a été modifié pour produire ce document**, à l'exception d'une opération git de remise à niveau détaillée ci-dessous.

---

## ⚠️ Alerte préalable — la prémisse « production = v5.0 » est fausse aujourd'hui

Avant de cartographier quoi que ce soit, un fait doit être posé clairement car il change la portée du Lot 1 :

**`main` n'est plus en v5.0.** Une session précédente de cet agent a fusionné le
23/08 une PR (#2) qui remplaçait déjà `content.json` par un schéma **v7.0**
intermédiaire — construit à partir d'un *autre* brief technique
(`docs/Brief_diaporama_MarketRush_v7.md`, présent dans le dépôt), différent du
`MarketRush_Brief_Diaporama_v7.md` v1.1 fourni maintenant. Cette PR a aussi
implémenté un moteur financier, refondu l'écran de suivi, etc. — en résumé,
une bonne partie des lots 1 à 4 de *cet* ancien brief a déjà été livrée en
production, mais sur des **bases de données et des règles différentes** de
`marketrush_data_v7.json`.

Constat en chiffres :

| | `meta.version_donnees` | Source déclarée |
|---|---|---|
| v5.0 (récupérée depuis l'historique git, commit `358196b`, avant la fusion) | `5.0` | `MarketRush_Dossier_v5.docx` |
| **`main` aujourd'hui (production réelle)** | **`7.0`** | `MarketRush_Document_de_travail_v7.docx` |
| Fichier fourni pour ce lot | `7.1` | `MarketRush_Document_de_travail_v7.docx` |

Ce que j'ai fait pour ne pas fausser la suite : la branche de travail assignée
(`claude/market-rush-v7-patch-frf5e8`) a été **réinitialisée sur `main`**
(sa PR précédente étant déjà fusionnée, la conserver telle quelle aurait
empilé du travail sur un historique déjà intégré). Elle repart donc propre,
au même point que la production actuelle — c'est-à-dire le schéma « v7.0 »
intermédiaire, pas le v5.0 d'origine.

**Conséquence pour le Lot 1 :** « adapter les composants existants aux
nouveaux noms de champs » ne partira pas de composants alignés sur le v5.0
décrit dans le brief, mais de composants déjà réadaptés une fois vers un
schéma parent différent du v7.1 cible. Voir § 3 pour le détail des collisions.
Ce point mérite votre arbitrage avant que je ne touche au code en Lot 1 :
soit on adapte les composants actuels (état intermédiaire) directement vers
v7.1, soit on les fait d'abord régresser vers la forme v5.0 décrite dans le
brief pour suivre le lot 1 « à la lettre ». Le mapping ci-dessous compare
**v7.1 au v5.0 d'origine**, comme demandé, et signale en plus où l'état
intermédiaire actuel de `main` diverge des deux.

Le reste de ce document répond à la commande telle que formulée : v7.1
(`marketrush_data_v7.json`) en face du v5.0 d'origine.

---

## 1. Vue d'ensemble des clés racine

| Clé v7.1 | Type | Équivalent v5.0 | Statut |
|---|---|---|---|
| `meta` | objet | `meta` | conservée, champs enrichis (`hierarchie_sources`, `avertissement`, `note_version`) |
| `entreprises` | **objet** (clé = id) | `entreprises` : **tableau** | conservée, **type de collection changé** (tableau → objet) + champs financiers ajoutés |
| `marche` | objet (ca départ + 5 manches + coefficients) | éclaté entre `parametres.ca_depart_kEUR`, `bareme_ca`, et `manches[].marche_kEUR`/`evolution` | **nouvelle forme** — regroupe 3 clés v5 distinctes |
| `jauges` | objet (départ/pas/bornes + décisions par jauge) | éclaté entre `parametres.jauges_depart/jauge_min/jauge_max/delta_jauge` et le champ `jauge` de chaque décision v5 | **nouvelle forme** — relation décision→jauge inversée (portée par `jauges`, plus par `decisions[i].jauge`... voir note) |
| `score` | objet | `score_final` | conservée, renommée, + `invariant` et `trésorerie_dans_le_score` ajoutés |
| `moteur_financier` | objet | **absente en v5.0** | nouvelle (v5.0 n'a pas de moteur financier) |
| `decisions` | **tableau** (11) | `decisions` : **objet clé = id `m#d#`** | conservée, **type de collection changé** (objet → tableau), résolutions extraites (voir plus bas) |
| `manches` | tableau (5), narratif seul | `manches` : tableau (5), narratif **+** numérique | conservée, **scindée** : le numérique (`marche_kEUR`, coefficients) part dans `marche.manches[]` |
| `resolution` | **tableau plat** (132 entrées, triplet entreprise/décision/option) | imbriquée dans `decisions[id].resolution[entreprise][option]` | **nouvelle forme** — dénormalisée, porte aussi `cout_k_eur` (v5.0 n'a pas de coûts) |
| `recette` | objet (valeurs de test) | **absente en v5.0** | nouvelle — valeurs d'acceptation T1 à T5 |
| `anomalies_a_arbitrer` | tableau (vide) | absente | nouvelle |
| `arbitrages_rendus` | tableau (5) | absente | nouvelle — traçabilité des choix A1-A5 du brief |
| `reste_du_marche` | — | présente en v5.0 (`libelle`, `couleur`) | **supprimée** — v7.1 ne fournit plus la config d'affichage du « reste du marché » (voir § 3.7) |

---

## 2. Correspondance détaillée, clé par clé

### 2.1 `entreprises`

v5.0 (tableau, 3 champs par entrée) :
```json
{ "id": "MOBISCO", "nom": "MOBISCO", "couleur": "#2454FF" }
```

v7.1 (objet, clé = id, 9 champs) :
```json
"MOBISCO": {
  "couleur": "#2454FF", "baseline": "...", "tresorerie": 150,
  "capacite_emprunt": 120, "charges_fixes": 90, "aides": 0,
  "ressources_mobilisables": 270, "taux_marge_depart": 0.205,
  "autonomie_lancement_mois": 20.0, "note_aides": null
}
```

| Champ v7.1 | v5.0 | Statut |
|---|---|---|
| clé objet (`MOBISCO`, …) | `id` | conservé, devient la clé plutôt qu'un champ |
| — | `nom` | **supprimée** (redondante avec la clé objet ; à réintroduire si l'UI en a besoin telle quelle, ou dériver `nom = clé`) |
| `couleur` | `couleur` | conservée |
| `baseline` | — | nouvelle (accroche par entreprise) |
| `tresorerie` | — | nouvelle (point de départ du moteur financier) |
| `capacite_emprunt` | — | nouvelle |
| `charges_fixes` | — | nouvelle |
| `aides` | — | nouvelle |
| `ressources_mobilisables` | — | nouvelle (= `tresorerie + capacite_emprunt`, fournie précalculée) |
| `taux_marge_depart` | — | nouvelle |
| `autonomie_lancement_mois` | — | nouvelle (valeur de contrôle, dérivable) |
| `note_aides` | — | nouvelle (texte à afficher pour MODULAB, cf. § 9 du brief) |

### 2.2 `marche`

Regroupe trois zones dispersées en v5.0 :

| v7.1 | v5.0 |
|---|---|
| `marche.ca_depart_par_entreprise_k_eur` | `parametres.ca_depart_kEUR` |
| `marche.manches[i].marche_k_eur` | `manches[i].marche_kEUR` |
| `marche.manches[i].evolution` | `manches[i].evolution` — **type changé** : v5 = chaîne (`"+30 %"` ou `null`), v7.1 = nombre (`0.3` ou `null`) |
| `marche.manches[i].coef_ca` | `bareme_ca["1".."5"]` — **type changé** : v5 = pourcentages entiers (`5`, `-6`…), v7.1 = fractions décimales (`0.05`, `-0.06`…) |
| `marche.manches[i].manche` (clé `"N1"`…`"N5"`) | `manches[i].numero` (entier `1`…`5`) — **changement de type de clé, cassant** pour tout code qui indexe par entier |

### 2.3 `jauges`

```json
{
  "depart": 50, "pas": 10, "bornes": [0, 100], "amplitude_atteignable": [10, 90],
  "sante_financiere": ["outil_production", "modalite_croissance", "adaptation_conjoncturelle", "reponse_reglementaire"],
  "indicateur_societal": ["mode_organisation", "strategie_domaine", "politique_rse", "modele_perennite"],
  "sans_jauge": ["positionnement_marque", "reaction_concurrentielle", "strategie_globale"]
}
```

| v7.1 | v5.0 |
|---|---|
| `depart` | `parametres.jauges_depart` |
| `pas` | `parametres.delta_jauge` |
| `bornes` | `parametres.jauge_min` + `parametres.jauge_max` (fusionnés en tableau) |
| `amplitude_atteignable` | — nouvelle (valeur de contrôle T5 : jamais < 10 ni > 90) |
| `sante_financiere` / `indicateur_societal` / `sans_jauge` (listes d'id de décision) | `decisions[id].jauge` (un champ *sur* chaque décision, valeur `"part_de_marche"` pour « sans jauge ») | **relation inversée** : v5 porte l'info sur la décision, v7.1 la porte sur la jauge. Les deux sont équivalentes en contenu mais aucun code ne doit supposer l'une ou l'autre forme sans adaptation. |

### 2.4 `score`

| v7.1 | v5.0 |
|---|---|
| `formule` | `score_final.formule` |
| `part_relative` | `score_final.part_relative` |
| `indice_part_relative` | `score_final.indice` |
| `invariant` | nouvelle |
| `trésorerie_dans_le_score` (`false`) | nouvelle (garde-fou explicite) |

### 2.5 `decisions`

v5.0 : objet clé `m1d1`…`m5d2`, `options` = **objet** `{A:{label,description}, B:…, C:…}`.
v7.1 : tableau, `options` = **liste** `[{lettre, libelle, description}, …]`.

| Champ v7.1 | v5.0 | Statut |
|---|---|---|
| `id` (slug, ex. `positionnement_marque`) | clé de l'objet (`m1d1`) | **renommage + changement de forme d'identifiant**, voir table de correspondance ci-dessous |
| `manche` (`"N1"`) | `manche` (entier `1`) | type changé |
| `titre` | `titre` | conservé |
| `type` (`"stratégique"` **avec accent**) | `type` (`"strategique"` **sans accent**) | **valeur littérale changée** — tout switch/comparaison exacte sur cette chaîne casse |
| `notion` | `notion` | conservé, casse différente (v7.1 met une majuscule en tête) |
| `jauge` | `jauge` | conservé en tant que champ décoratif, mais désormais redondant avec `jauges.*` (§ 2.3) — laquelle fait foi ? à trancher en Lot 1 |
| `duree_concertation_s` | — (global : `parametres.minuteur_strategique_sec` / `minuteur_tactique_sec`) | **nouvelle**, portée par décision plutôt que globale par type |
| `options[].lettre` | clé de l'objet options (`A`) | changement de forme |
| `options[].libelle` | `options[X].label` | renommé |
| `options[].description` | `options[X].description` | conservé |
| — | `question` | n'existe pas en v5.0 ; **n'existe pas non plus en v7.1**. Le § 4.2 du brief v1.1 demande d'afficher « l'intitulé de la question, aujourd'hui absent : *"Positionnement de marque", "Outil de production"*… » — ces exemples sont en fait le champ `titre` lui-même. **Le v7.1 ne réintroduit donc pas de champ `question` séparé** ; c'est `titre` qui doit être révélé/affiché. |

**Table de correspondance des identifiants de décision (v5 → v7.1) :**

| v5.0 | v7.1 |
|---|---|
| `m1d1` | `positionnement_marque` |
| `m1d2` | `outil_production` |
| `m1d3` | `mode_organisation` |
| `m2d1` | `modalite_croissance` |
| `m2d2` | `reaction_concurrentielle` |
| `m3d1` | `strategie_domaine` |
| `m3d2` | `adaptation_conjoncturelle` |
| `m4d1` | `politique_rse` |
| `m4d2` | `reponse_reglementaire` |
| `m5d1` | `strategie_globale` |
| `m5d2` | `modele_perennite` |

### 2.6 `manches` (narratif)

| v7.1 | v5.0 |
|---|---|
| `manche` (`"N1"`) | `numero` (`1`) + `annee` (`"N1"`) — **deux champs v5 fusionnés en un, sous une clé texte** |
| `titre` (ex. `"Croissance (N2) · marché 2 600 K€ (+30 %)"`) | `phase` (`"Croissance"`) seul — **v7.1 compose un intitulé riche** là où v5 gardait la phase et le marché séparés |
| `accroche` | `accroche` | conservé |
| `evenement.titre` | `evenement.titre` — mais en v5 c'était le **nom propre** (« Arrivée de SCOLEUROP ») | **changement de sémantique**, pas seulement de nom |
| `evenement.sous_titre` | — absent en v5 | nouveau — c'est ici que le nom propre atterrit désormais |
| `evenement.texte` | `evenement.texte` | conservé |
| `evenement.effet` | `evenement.effet_mecanique` | renommé, et **reformulé en une ligne courte** (le brief l'exige explicitement en § 4.4) |
| — | `evenement.image` | **supprimée.** v7.1 ne fournit plus aucun chemin d'asset visuel pour les événements. Les fichiers existent déjà dans `public/assets/evenements/` (vérifié : `n2-scoleurop.png` etc.) ; il faudra soit les rattacher par convention de nommage sur `manche` (`N2` → `n2-*.png`), soit obtenir les nouveaux visuels, soit s'en passer. **Point à trancher avant le Lot 4.** |
| `decisions` (liste d'id slug) | `decisions` (liste d'id `m#d#`) | conservé dans la forme, valeurs à traduire via la table § 2.5 |
| `marche_kEUR`, `evolution` | — | **partis dans `marche.manches[]`** (§ 2.2), plus sur cet objet |

### 2.7 `resolution`

v5.0 : imbriquée, `decisions[id].resolution[ENTREPRISE][OPTION] = {verdict, phrase}`. Pas de coût — v5.0 n'a pas de moteur financier.

v7.1 : tableau plat de 132 entrées `{entreprise, decision, manche, option, verdict, cout_k_eur, phrase}`.

| Élément | v5.0 | v7.1 |
|---|---|---|
| Clé d'accès | `decisions[id].resolution[entreprise][option]` (imbriqué, 3 niveaux) | recherche dans un tableau plat par triplet `(entreprise, decision, option)` — **implique de reconstruire un index en mémoire au chargement** (`Map` ou objet imbriqué) pour un accès O(1) équivalent |
| `verdict` | présent | présent, mêmes valeurs (`bon`/`moyen`/`mauvais`) |
| `phrase` | présente | présente, texte entièrement réécrit (132 phrases, cf. brief § 4.5) |
| `cout_k_eur` | absent | nouveau — remplace la logique `moteur_financier.investissements[entreprise][decision][option]` que l'état intermédiaire actuel de `main` avait mise en place pour l'ancien brief (structure imbriquée avec des clés `cle`/`montant` par ligne d'investissement). **Incompatible tel quel** : le moteur financier actuellement en production lit `content.moteur_financier.investissements`, qui n'existe plus dans ce fichier — le coût est désormais directement sur la ligne de résolution concernée. |
| `manche` | dérivable via `decisions[id].manche` | porté directement sur chaque ligne (redondant mais pratique) |

### 2.8 `moteur_financier`

Absent en v5.0 (rien à mapper). Face à l'état **intermédiaire actuel de `main`** (qui a déjà un `moteur_financier`, construit pour l'ancien brief), les différences structurelles sont notables et devront être reprises entièrement en Lot 2, pas simplement renommées :

| v7.1 | `main` actuel (ancien brief) | Remarque |
|---|---|---|
| `equations` (texte descriptif) | `formule_resultat` / `formule_tresorerie` / `formule_runway_mois` (texte descriptif) | équivalent, formulation proche |
| `regles` (tableau `{id, enonce}`) | `regle_r2` / `regle_r3` (deux champs texte isolés) | v7.1 documente les 7 règles, pas seulement R2/R3 |
| `constantes.taux_emprunt` / `taux_decouvert` / `plafond_decouvert_pct_ca` | `taux_interet_emprunt` / `taux_interet_decouvert` / `plafond_decouvert_pct_ca` | **valeurs identiques (4 %, 8 %, 50 %)**, clés renommées |
| `deja_paye` (7 couples `si (décision,option) alors (décision,option) gratuite`, par entreprise, id de décision en slug) | `investissements[entreprise][decision_id][option] = [{cle, montant}]` + dédoublonnage par `cle` partagée entre deux entrées | **mécanisme entièrement différent.** L'ancien schéma dédoublonne par une clé de coût partagée ; le nouveau dédoublonne par une paire de couples décision/option explicites. Le moteur financier actuel (`src/engine/financeEngine.js`) devra être réécrit sur cette nouvelle logique, pas juste re-branché. |
| `modulations_marge` (`declencheur: [decision, option]`, `a_partir_de: "N3"`, `effet: "taux_marge = 0.190"` en **chaîne à interpréter**) | `modulations_marge` (`si: {decision, option}`, `a_partir_de: 3` **entier**, `taux`/`delta` **déjà en champs numériques séparés**) | Même intention, **format d'« effet » très différent** : v7.1 encode l'opération dans une chaîne (`"taux_marge = 0.190"`, `"taux_marge += 0.025"`, `"redevance = 0.09 * max(0, CA - 432)"`) qu'il faudra soit parser, soit — plus sûr — remapper en amont vers des champs structurés (`type: fixe/delta`, `valeur`) pendant la migration des données plutôt qu'au moment du calcul. |
| redevance MODULAB | portée par un `modulations_marge` avec `effet: "redevance = ..."` | l'ancien schéma avait un bloc `redevance` séparé et dédié ; v7.1 la traite comme une modulation de marge parmi d'autres, à isoler par code plutôt que par clé JSON |

### 2.9 `recette`

Absente en v5.0 et absente de l'état intermédiaire actuel. Nouvelle en totalité — ce sont les données du Lot 2/3 (tests T1 à T5 du brief). Rien à mapper, à consommer telle quelle dans les futurs scripts de vérification (sur le modèle de ce qui avait été fait pour l'ancien brief, à refaire avec ces valeurs).

**Note pour le Lot 2 : les valeurs de trésorerie ne sont pas identiques à celles de l'ancien brief**, bien que très proches (ex. LIGNEA N4 : 235 K€ ici contre 234 K€ dans l'ancien brief ; MODULAB N1 : 106 K€ contre 105 K€). Le moteur déjà en production a été calé et vérifié sur les anciennes valeurs — il faudra le revalider intégralement sur `recette`, sans supposer qu'il est déjà correct.

---

## 3. Écarts d'architecture à anticiper pour les lots suivants

1. **Collections objet ↔ tableau inversées à deux endroits.** `entreprises` passe de tableau (v5) à objet (v7.1) ; `decisions` passe d'objet (v5) à tableau (v7.1). Tout composant qui fait `content.entreprises.map(...)` (`DecisionSaisieScreen.jsx`, `DecisionConsequencesScreen.jsx`, `gameEngine.js`) ou `content.decisions[id]` (`App.jsx`, `gameEngine.js`, `financeEngine.js`) devra changer de forme d'itération/accès, dans les deux cas.

2. **Identifiants de décision entièrement renommés** (`m1d1` → `positionnement_marque`, etc., table § 2.5). Toute chaîne en dur référençant un id `m#d#` dans le code (aucune trouvée à ce stade, les id sont bien lus depuis les données) ou dans les futurs tests devra utiliser les nouveaux slugs.

3. **Clé de manche : entier `numero` → chaîne `"N1"`.** `bareme_ca` était indexé par `String(manche.numero)` (`"1"`…`"5"`) ; en v7.1 l'indexation naturelle serait par `"N1"`…`"N5"`. Tout code qui fait `String(numero)` ou compare `manche.numero >= x` doit être revu pour comparer des chaînes `"N3"`, `"N4"`… (ou reconstituer un entier au chargement — à trancher en Lot 1, cela affecte aussi `modulations_marge[].a_partir_de`).

4. **`type` de décision perd son accent en v5** (`strategique`) mais **le porte en v7.1** (`stratégique`). `App.jsx` teste actuellement `decision.type === 'strategique'` pour choisir la durée du minuteur — cette comparaison casserait silencieusement (mauvaise durée appliquée) si on branchait v7.1 sans corriger la chaîne. Point de vigilance élevé pour le Lot 1 : erreur silencieuse, pas de crash.

5. **Narratif et numérique des manches sont séparés** (`manches[]` vs `marche.manches[]`), alors qu'ils étaient portés par le même objet en v5.0. Les composants d'écran (`MancheOuvertureScreen`, `EventScreen`, `SuiviScreen`) devront joindre les deux tableaux par la clé `manche` au chargement, plutôt que de lire un seul objet manche comme aujourd'hui.

6. **`resolution` dénormalisée en tableau plat.** Nécessite un index construit une fois au chargement (`{entreprise: {decision: {option: {...}}}}` ou `Map` composite) pour retrouver les performances d'accès actuelles ; à faire dans le module de données, pas dans chaque composant.

7. **Pas de config d'affichage pour le « reste du marché » côté v7.1** (pas de `libelle`/`couleur` — voir § 1 tableau). Cette information devra soit être conservée depuis la version actuelle de `content.json` (elle est stable, aucune raison de changer), soit ajoutée en dur dans le code d'assemblage des données plutôt qu'attendue du fichier v7.1.

8. **Événements sans image.** Voir § 2.6 — à trancher avant le Lot 4, sans quoi `EventScreen.jsx` (qui lit `evt.image`) affichera une image cassée.

9. **Pas de section "paramètres UI" en v7.1** (pas de `minuteur_declenchement`, `options_revelation`, `affiche_ca`, `affiche_tresorerie`, `separateur_decimal` — ces clés existent dans l'état intermédiaire actuel de `main` mais n'ont pas d'équivalent ici). Cohérent avec le brief v1.1, qui pose ces comportements comme des **principes non négociables de l'application** (§ 1) plutôt que comme des indicateurs pilotés par la donnée. Pour le Lot 1/4, ces comportements (minuteur toujours manuel, révélation toujours séquentielle, séparateur toujours français) peuvent donc être codés en dur dans les composants sans clé JSON dédiée — mais cela veut dire qu'ils ne sont plus « données », ce qui touche de près le principe même du brief (« aucune donnée en dur dans le code », § 1) : à interpréter comme s'appliquant au contenu (textes, montants, verdicts), pas au comportement d'interface.

10. **Deux briefs distincts coexistent dans le dépôt.** `docs/Brief_diaporama_MarketRush_v7.md` (déjà implémenté, fusionné) et `MarketRush_Brief_Diaporama_v7.md` fourni cette session ne décrivent pas le même produit final dans le détail (schéma de données différent, tests de recette différents, découpage en lots différent — 6 lots vs 5, numérotés et nommés différemment). Recommandation : traiter le second comme remplaçant le premier pour la suite du travail, et envisager d'archiver ou de supprimer `docs/Brief_diaporama_MarketRush_v7.md` en Lot 1 pour éviter toute confusion future — sous votre validation.

---

## 4. Ce qui n'a pas changé

- Les 4 entreprises et leurs couleurs (`#2454FF`, `#FFA102`, `#E474B1`, `#F6664B`) — strictement identiques.
- Le CA de départ (400 K€/entreprise), le marché de départ (2 000 K€) — identiques.
- La formule de score (50 % part relative + 25 % santé financière + 25 % indicateur sociétal) — identique en substance.
- Les 3 jauges/indicateurs (part de marché, santé financière, indicateur sociétal), départ à 50, pas de 10, bornes 0-100 — identiques.
- Les 11 décisions et leur répartition par manche — mêmes décisions, mêmes options A/B/C, mêmes 3 fiches par manche pour N1 puis 2 par manche N2-N5.
- Les 4 entreprises démarrent toutes sans emprunt ni découvert (à confirmer au Lot 2, mais rien n'indique le contraire).

---

## 5. Ce que le Lot 0 ne tranche pas

Ces questions sont soulevées mais volontairement laissées ouvertes pour votre validation avant le Lot 1 :

- Repart-on du schéma v5.0 « pur » (régresser l'état actuel de `main`) ou adapte-t-on l'état intermédiaire actuel directement vers v7.1 (probablement plus rapide, mais alors le Lot 1 n'est plus vraiment « adapter les composants existants aux nouveaux noms de champs » depuis v5.0 — il l'est déjà partiellement) ?
- Convention de récupération des visuels d'événements (pas de champ `image` en v7.1).
- Sort de `docs/Brief_diaporama_MarketRush_v7.md` (l'ancien brief, déjà livré).
- Faut-il conserver `reste_du_marche.libelle/couleur` tel quel dans le fichier de données assemblé, ou le coder en dur ?

Aucune de ces questions ne bloque le Lot 0. Elles conditionnent la façon d'aborder le Lot 1.
