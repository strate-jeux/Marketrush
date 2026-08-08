# Market Rush — Brief de patch du diaporama

**Destinataire :** Claude Code
**Dépôt :** `strate-jeux.github.io/Marketrush` (React + Vite)
**Version cible :** app v7.0 · données `content.json` v7.0
**Référence métier :** `MarketRush_Document_de_travail_v7.docx`

---

## 0. Principe directeur

**Ne pas toucher à la direction artistique.** Fond sombre, typo arrondie, cartes aux liserés colorés, densité faible : c'est réussi et ça reste. Tout ce qui suit est un ajout de contenu, une correction de comportement ou un réglage de taille — jamais une refonte visuelle.

Deux règles à tenir sur toute la livraison :

1. **Rien ne s'ajoute sans que quelque chose parte.** Chaque écran a un budget d'information ; si un bloc arrive, un autre est supprimé ou fusionné.
2. **L'animateur garde la main.** Aucune transition, aucun décompte, aucune révélation ne se déclenche tout seul.

---

## 1. `content.json` v7.0 — remplacement complet

Le fichier livré remplace intégralement l'actuel (v5.0). Il n'y a **pas de patch partiel à faire** : `content.json` v7.0 est autoportant et a été validé en rejouant le moteur depuis lui seul.

### Ce qui a changé

| Bloc | Changement |
|---|---|
| `meta.version_donnees` | `5.0` → `7.0` |
| `decisions[*].resolution` | **Les 132 phrases sont toutes remplacées.** Version projetée aux étudiants, tutoiement de l'équipe, « Bravo ! » sur chaque bon choix. Vocabulaire unifié en « bureaux ». |
| `decisions.m1d2.resolution.INCLUSIA` | **Correction de verdict** : A devient `mauvais`, C devient `moyen`. La v5.0 décrivait l'ancien « atelier actuel », qui n'est plus une option jouable. |
| `decisions[*].options[*].label` | Alignés sur les fiches imprimées. En particulier `m1d2` : `A. Sous-traiter` · `B. Internaliser (atelier intégré)` · `C. Solution intermédiaire`. |
| `decisions[*].question` | **Nouveau champ.** Question courte à afficher sous le titre de la décision. |
| `manches[*].evenement` | Nouveaux `titre` (courts), `sous_titre` (nom propre), `effet_mecanique` ramené à une ligne. |
| `entreprises[*]` | **Nouveaux champs financiers** : `tresorerie_depart`, `capacite_emprunt`, `charges_fixes`, `aides_annuelles`, `taux_marge`. |
| `moteur_financier` | **Nouveau bloc complet** (voir § 2). |
| `parametres` | Ajout de `minuteur_declenchement: "manuel"`, `options_revelation: "sequentielle"`, `affiche_ca`, `affiche_tresorerie`, `separateur_decimal`. |

### Ce qui n'a pas changé

`bareme_ca`, `score_final`, `jauges_depart`, `delta_jauge`, les durées de minuteur, les couleurs d'entreprise, les chemins d'images. **La logique de score est intacte** — ne pas y toucher.

---

## 2. Moteur financier — à implémenter

La trésorerie est calculée par l'app, à partir des options cliquées par l'animateur. **Elle n'entre pas dans le score.** Elle est affichée, commentée, et c'est tout.

### 2.1 Équations

```
résultat        = CA × taux_marge + aides_annuelles − charges_fixes − frais_financiers
frais_financiers = 0,04 × dette + 0,08 × découvert
trésorerie_fin  = trésorerie_début + résultat − investissements_de_la_manche
runway_mois     = trésorerie ÷ charges_fixes × 12
```

Le calcul se fait **une fois par manche**, après la dernière décision de la manche.

### 2.2 Ordre d'exécution, par manche

```
1. Pour chaque décision de la manche :
     appliquer bareme_ca[manche][verdict] au CA (multiplicatif, composé)
     déplacer la jauge concernée de ±10 (bornes 0 / 100)
     cumuler les investissements de l'option choisie      → voir R2
2. Calculer le taux de marge de l'année                    → voir 2.4
3. Appliquer la redevance MODULAB si applicable            → voir 2.4
4. résultat, puis trésorerie_fin
5. Si trésorerie < 0 : tirer sur l'emprunt, puis le découvert → voir R4/R5/R6
```

### 2.3 Les sept règles

| | Règle | Implémentation |
|---|---|---|
| **R1** | Seul le bon choix encaisse le bénéfice | Déjà encodé : les modulations de marge sont toutes conditionnées à l'option `bon`. Rien à coder en plus. |
| **R2** | Un même investissement n'est décaissé qu'une fois | Maintenir un `Set` de clés payées par entreprise, sur toute la partie. Chaque option porte une liste `[{cle, montant}]` ; ne débiter que si la clé est absente du Set. |
| **R3** | Recrutement proraté | **Déjà appliqué dans les montants du JSON.** Ne pas reproratiser. |
| **R4** | Trésorerie négative → emprunt à 4 % | `dette = min(besoin, capacite_emprunt)` |
| **R5** | Au-delà → découvert à 8 % | `decouvert = min(besoin − dette, plafond)` |
| **R6** | Découvert plafonné à 50 % du CA | `plafond = 0,5 × CA de l'exercice` |
| **R7** | **Aucune option n'est jamais bloquée** | Ne jamais griser, désactiver ou avertir avant un clic. L'équipe voit les conséquences, elle n'est jamais empêchée. |

> **R7 est la règle à ne pas trahir.** Une équipe doit pouvoir financer un atelier à 320 K€ avec 270 K€ mobilisables, et découvrir le résultat à l'écran. Aucune modale du type « attention, trésorerie insuffisante ».

### 2.4 Modulations de marge et redevance

Elles sont déclaratives dans `moteur_financier.modulations_marge`. Sémantique :

- `taux` → **remplace** le taux de base à partir de la manche indiquée.
- `delta` → **s'ajoute** au taux courant.
- `a_partir_de: n` → s'applique de la manche `n` jusqu'à la fin.
- `manche: n` → s'applique à cette seule manche.
- `sinon_si … option_differente_de` → s'applique quand l'option jouée **n'est pas** celle citée (pénalité LIGNEA en N5).

La redevance MODULAB (`moteur_financier.redevance`) ponctionne 9 % de la **part de CA au-delà de 432 K€**, pas du CA total, à partir de N2, seulement si l'accord industriel a été signé.

### 2.5 Tests d'acceptation

Faire jouer aux quatre entreprises leur chemin optimal (toutes les options `verdict === "bon"`). Résultats attendus, **au K€ près** :

| Entreprise | N1 | N2 | N3 | N4 | N5 | CA final | Score |
|---|---|---|---|---|---|---|---|
| MOBISCO | 117 | 109 | 143 | 187 | 247 | 792 K€ | 70,0 |
| LIGNEA | 130 | 90 | 136 | 234 | 378 | 792 K€ | 70,0 |
| INCLUSIA | 70 | 137 | 190 | 301 | 406 | 792 K€ | 70,0 |
| MODULAB | 105 | 130 | 161 | 210 | 282 | 792 K€ | 70,0 |

Si un seul de ces chiffres diverge, le moteur est faux. Ce tableau est le contrat.

Deuxième test, plus dur : les 3¹¹ = 177 147 combinaisons d'une entreprise, les trois autres au chemin optimal. **Aucune ne doit dépasser 70,0.**

---

## 3. Écrans

### 3.1 Slide d'ouverture — scénario

Remplace le rappel des règles en position 1. Le rappel des règles n'est pas supprimé : il devient accessible en cours de partie (l'icône livre existe déjà en haut à droite).

> ### Vous prenez les commandes d'une start-up
>
> Vous venez de prendre la direction d'une jeune entreprise du mobilier scolaire.
>
> Le marché évolue vite. Les concurrents innovent. Les clients changent d'attentes. Et des événements imprévus viendront bousculer vos plans.
>
> Pendant cinq années, vous prendrez les décisions qui feront la différence.
>
> **Serez-vous capables de devenir le leader du marché ?**

Texte centré, apparition ligne à ligne au clic de l'animateur. Dernière ligne plus grande et en accent coloré. Pas d'illustration : le noir et le texte suffisent, c'est le moment le plus solennel du jeu.

### 3.2 Slide 2 — comment jouer

> ### Comment jouer ?
>
> **5 manches · 11 décisions en équipe · 3 indicateurs à surveiller**
>
> Vous êtes responsable d'un service : marketing, gestion opérationnelle ou ressources humaines. Lisez attentivement votre fiche : elle contient des informations que vos coéquipiers n'ont pas.
>
> Concertez-vous, croisez vos données, et choisissez ensemble la meilleure option.
>
> **Votre mission :** finir avec le meilleur score, en conciliant performance économique, solidité financière et impact sociétal.
>
> Il n'existe pas de stratégie parfaite. À vous de construire la vôtre.

La ligne « 5 manches · 11 décisions · 3 indicateurs » en bandeau, façon compteurs. Le reste en prose courte. Pas de puces : cet écran doit se lire, pas se scanner.

### 3.3 Slides de décision

Quatre corrections.

**a) Afficher la question.** Sous le titre de la décision, en plus petit et en gris clair :

```
Positionnement de marque
Quel positionnement adoptez-vous ?
```

Le champ `question` est dans `content.json` pour les onze décisions.

**b) Révélation séquentielle — bug à corriger.** Actuellement B et C apparaissent au même clic. Comportement attendu : un clic = une option. Quatre états (rien → A → A+B → A+B+C), puis le clic suivant arme le minuteur.

**c) Minuteur déclenché manuellement.** Il ne démarre plus à l'affichage de la slide. Une fois les trois options révélées, un bouton apparaît (`Lancer le décompte`). L'animateur le presse quand les équipes ont fini de lire. Prévoir pause et reprise — dans une vraie salle, on interrompt.

**d) Effet « carte ».** Chaque option apparaît par un retournement de carte (flip 3D sur l'axe Y, ~350 ms, décalage de 80 ms). C'est le seul effet ajouté. À réserver aux options : le reste du diaporama garde ses transitions actuelles. Respecter `prefers-reduced-motion`.

### 3.4 Slides d'événement

- **Titre court en très grand** (`evenement.titre`), nom propre en sous-titre discret (`evenement.sous_titre`).
- Corps de texte **agrandi d'environ 30 %** par rapport à l'actuel : c'est lu depuis le fond de la salle.
- **`effet_mecanique` sur une seule ligne**, détaché, en accent coloré. Les formulations longues actuelles sont supprimées dans le JSON.
- **Visuel agrandi** : viser environ 40 % de la hauteur utile, contre ~25 % aujourd'hui.

### 3.5 Slides de résolution

L'effet sur le CA (`+12 %`, `−8 %`…) doit devenir l'élément le plus visible de l'écran, avant même la phrase : c'est la conséquence, et c'est ce que les équipes attendent.

- Chiffre en très grand, vert / ambre / rouge selon le verdict.
- Apparition en compteur animé (0 → valeur, ~600 ms).
- La phrase de résolution reste sous le chiffre, taille actuelle.
- Le marqueur de verdict (`✔ BON CHOIX` / `– CHOIX MOYEN` / `✘ MAUVAIS CHOIX`) est conservé.

### 3.6 Écran de suivi — refonte

C'est l'écran le plus regardé de la partie. Il faut y loger le CA et la trésorerie **sans le charger** : on gagne la place en supprimant les doublons.

**Corrections de format**

| Défaut | Correction |
|---|---|
| `14. %` sur MODULAB (valeur réelle 14,9 %) | Le libellé est tronqué. Corriger le calcul de largeur et forcer une décimale. |
| `20.2 %` — point décimal anglais | Virgule française partout : `Intl.NumberFormat('fr-FR')` sur tous les nombres de l'app. |
| Camembert sans légende des quatre entreprises | Ajouter les quatre entrées ; seul « Reste du marché » est légendé aujourd'hui. |
| Classement en haut à droite | **Supprimer** : il redit exactement ce que portent les quatre cartes du bas (rang + score). C'est la place qu'on récupère. |

**Nouvelle composition**

- **Camembert centré**, agrandi, avec sa légende complète en dessous. Il devient l'objet principal de l'écran, tout seul sur la bande haute.
- **Quatre cartes en bande basse**, inchangées dans leur style, enrichies de deux lignes :

```
#1  MOBISCO
CA            747 K€   (20,2 %)
Trésorerie    187 K€   ·  25 mois d'autonomie
Santé financière            70   ▓▓▓▓▓▓▓░░░
Indicateur sociétal         80   ▓▓▓▓▓▓▓▓░░
Score                       67
```

- CA et trésorerie **côte à côte, en haut de carte** : c'est la leçon centrale du jeu. On peut gagner des parts de marché et vider sa caisse.
- L'autonomie en mois est plus parlante qu'un solde brut. Elle se dit à voix haute : « il vous reste six mois de charges devant vous ».
- **Trésorerie négative** : afficher en rouge avec la mention `découvert`. Ne pas dramatiser au-delà — pas d'alerte, pas d'icône d'avertissement. Le chiffre suffit.
- Les quatre trésoreries sont visibles de toutes les équipes, comme le reste de l'écran.

---

## 4. Brouillon de suivi d'équipe

Ajouter une colonne **Trésorerie**, renseignée par l'équipe après chaque manche depuis l'écran de suivi.

| Manche | Décisions prises | Verdicts | CA | **Trésorerie** | Part de marché | Score |
|---|---|---|---|---|---|---|

Sans cette colonne, les étudiants voient la trésorerie bouger sans jamais la suivre — et le lien entre décision et caisse se perd. C'est le support qui fait exister la nouvelle mécanique.

---

## 5. Ordre de livraison

| # | Lot | Pourquoi cet ordre |
|---|---|---|
| 1 | `content.json` v7.0 + moteur financier | Sans le moteur, l'écran de suivi n'a rien à afficher. Les tests du § 2.5 valident le tout. |
| 2 | Écran de suivi | Le lot le plus visible en séance, et le plus dépendant du lot 1. |
| 3 | Slides de décision (b, c, d) | Corrige un vrai bug de jeu (options B+C simultanées). |
| 4 | Slides d'ouverture et d'événement | Confort et immersion, sans effet sur le déroulé. |
| 5 | Slides de résolution | Réglages de taille, cosmétique. |

Le lot 1 est bloquant. Les lots 3 à 5 sont indépendants entre eux.

---

## 6. Journal de recette

*À remplir par Kenza au fil des tests. Une ligne par observation, même mineure.*

| # | Écran / moment | Ce qui se passe | Ce qui devrait se passer | Gravité |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |

**Gravité** — `bloquant` : empêche de jouer · `gênant` : ralentit ou trouble l'animation · `confort` : à faire si le temps le permet.

Un défaut noté pendant une partie réelle vaut dix relectures. Écrire même quand c'est flou : « la manche 3 traîne, je ne sais pas pourquoi » est une observation utile.
