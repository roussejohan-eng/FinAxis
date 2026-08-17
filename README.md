# FinAxis

Plateforme SaaS française qui aide les entrepreneurs, TPE/PME et incubateurs à
produire des dossiers financiers prévisionnels de qualité bancaire : business
plan chiffré, prévisionnel 3 ans, trésorerie mensuelle, budget de TVA, plan de
financement — exportés en PDF et Excel professionnels.

Cette V2 est un rebuild complet de la version Base44 : niveau produit SaaS
pro, moteur de calcul testé, exports PDF/Excel sans bug de mise en forme, et
ajout du pilier B2B2C pour les incubateurs.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + composants shadcn/ui (copiés dans `components/ui/`)
- **Recharts** pour les graphiques interactifs du dashboard
- **react-hook-form** + **zod** pour la validation des formulaires
- **Zustand** (avec middleware `persist`) pour l'état du wizard et la liste
  des projets, sauvegardés en `localStorage`
- **@react-pdf/renderer** pour la génération du PDF, entièrement côté client
- **SheetJS (xlsx)** pour l'export Excel avec formules réelles
- **Lucide React** pour les icônes, **Framer Motion** pour les micro-animations
- **next-themes** pour le dark mode (optionnel, désactivé par défaut)
- **Vitest** pour les tests unitaires du moteur de calcul

Aucun backend : tout tourne côté client, les projets sont stockés dans le
`localStorage` du navigateur. Voir [Passer en multi-utilisateur](#passer-en-multi-utilisateur-supabase--prisma)
pour brancher une vraie persistance plus tard.

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm run test        # exécute les tests une fois
npm run test:watch  # mode watch
```

Le moteur de calcul financier (`lib/finance/`) est couvert par des tests
unitaires Vitest : TVA et crédit reporté, amortissement d'emprunt (PMT),
seuil de rentabilité, IS simplifié à cheval sur le seuil de 42 500 €, etc.
L'export Excel a également un test de fumée qui génère un classeur complet
et vérifie la présence des formules.

### Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
app/                      Routes App Router (landing, /tarifs, wizard, dashboard, /contact-b2b)
components/                Composants partagés (UI, marketing, wizard, dashboard)
components/ui/              Primitives shadcn/ui (button, card, table, dialog, ...)
lib/finance/                Moteur de calcul pur, testé (revenus, charges, compte de
                             résultat, trésorerie, TVA, financement, seuil de rentabilité)
lib/pdf/                    Génération du PDF (@react-pdf/renderer) : gabarits de page,
                             tableaux, polices Roboto embarquées, graphique vectoriel
lib/excel/                  Génération du classeur Excel (SheetJS) avec formules réelles
lib/pdf-import/              Lecture d'un PDF déposé (pdfjs-dist) : extraction de texte,
                             parseur FinAxis haute-fidélité, parseur générique best-effort
lib/wizard/                 Constantes et options du wizard
store/                      Stores Zustand (brouillon du wizard, projets sauvegardés)
public/fonts/                Police Roboto (regular/medium/bold/italic) embarquée pour le PDF
public/pdf.worker.min.mjs    Worker pdf.js (copié par scripts/copy-pdf-worker.js), servi tel
                             quel pour l'import PDF côté client
```

## Moteur de calcul financier

Toute la logique de calcul vit dans `lib/finance/`, sous forme de fonctions
pures TypeScript (aucun effet de bord, aucune mutation des entrées) :

- `revenues.ts` — interpolation linéaire M1→M12 par source, coefficients de
  saisonnalité, projections Années 2/3 (+30 % / +25 %, paramétrable)
- `expenses.ts` — agrégation des charges fixes et variables (% du CA ou
  montant unitaire × volume)
- `income-statement.ts` — compte de résultat 3 ans, IS simplifié (15 % / 25 %
  au seuil de 42 500 €)
- `cash-flow.ts` — budget de trésorerie mensuel (encaissements/décaissements
  TTC, TVA nette, flux cumulé)
- `vat.ts` — TVA collectée/déductible/nette, avec report de crédit
- `financing.ts` — plan de financement + tableau d'amortissement (formule PMT)
- `break-even.ts` — seuil de rentabilité et point mort
- `format.ts` — formatage des nombres à la française (séparateur de milliers,
  signe moins typographique, pourcentages)

`computeProjectResults(project)` (dans `lib/finance/index.ts`) orchestre
l'ensemble et renvoie un objet unique consommé par le dashboard, le PDF et
l'Excel — une seule source de vérité pour les trois.

### Hypothèses simplificatrices (documentées aussi dans le PDF)

- Les encaissements et décaissements interviennent le mois de la vente/de
  l'achat (pas de délai de règlement).
- Le BFR du plan de financement est estimé à un mois de charges d'exploitation.
- Aucun report en avant des déficits n'est modélisé pour l'IS.
- Les investissements sont supposés acquis en totalité au mois 1.

## Export PDF

Le PDF (`lib/pdf/`) est généré entièrement côté client avec
`@react-pdf/renderer`, en 12 pages : couverture, sommaire, synthèse
exécutive, hypothèses, compte de résultat 3 ans, détail mensuel (page
paysage), trésorerie (avec graphique vectoriel), TVA, plan de financement,
seuil de rentabilité, note méthodologique, contact/signature.

Points d'attention pris en compte :

- Police **Roboto** embarquée localement (`public/fonts/`, formats WOFF) pour
  un rendu contrôlé — accents français, symbole €, signe moins typographique
  "−". Les séparateurs de milliers d'`Intl.NumberFormat("fr-FR")` (espace fine
  insécable U+202F, espace insécable U+00A0) sont convertis en espace normale
  avant rendu PDF (`lib/pdf/pdf-format.ts`), car ces glyphes ne sont pas
  résolus par le sous-ensemble latin de la police embarquée.
- Les tableaux ne sont jamais coupés au milieu d'une ligne (`wrap={false}` sur
  les lignes). La page « Hypothèses » plafonne l'affichage à 12 lignes par
  tableau (avec mention « + N autres, détail dans le tableau de bord et
  l'export Excel ») pour garantir qu'elle tient toujours sur une seule page,
  quelle que soit la taille du projet — et donc que les numéros de page du
  sommaire restent exacts.
- Le tableau d'amortissement de l'emprunt, dans le PDF, affiche les 12
  premières échéances avec une mention s'il y en a plus ; le tableau complet
  est disponible dans le tableau de bord et l'export Excel.
- Le graphique de trésorerie cumulée est dessiné en primitives vectorielles
  react-pdf (`Svg`/`Path`), pas en image PNG — plus net et sans dépendance à
  `html2canvas`.

Trois jeux de données de démonstration (petit / moyen / gros projet) ont été
générés et vérifiés visuellement page par page pendant le développement.

## Export Excel

Le classeur (`lib/excel/`) contient 8 onglets : **Guide**, **Hyp**
(hypothèses), **Revenus**, **CR** (compte de résultat), **Financement**,
**Tresorerie**, **Seuil**, **KPIs**. Les cellules calculées contiennent de
vraies formules Excel (interpolation, SUMIF, PMT, IF...) qui référencent
l'onglet Hypothèses : modifier un prix, un volume ou une charge dans cet
onglet recalcule automatiquement tous les autres.

Limites connues (documentées dans l'onglet Guide) :

- Les dotations aux amortissements s'arrêtent à la durée saisie par
  investissement (formule `SUMPRODUCT`), comme dans le tableau de bord.
- Le tableau d'amortissement de l'emprunt est généré sur un gabarit de 60
  périodes ; au-delà, complétez manuellement le modèle.
- Le classeur est généré avec la bibliothèque `xlsx` (édition communautaire) :
  les formats de nombre (`#,##0" €"`, `0.0%`) sont conservés, mais la mise en
  forme conditionnelle par couleur (bleu = entrée, noir = calcul, vert =
  résultat) n'est pas garantie à l'écriture — la convention est documentée en
  toutes lettres dans l'onglet Guide.

## Import d'un projet complet depuis Excel ou PDF (étape 1 du wizard)

En plus de la saisie manuelle, l'étape 1 du wizard (`ProjectImportCard`,
`components/wizard/project-import-card.tsx`) propose d'importer un projet
entier depuis un fichier **Excel ou PDF** déjà généré par FinAxis, ou depuis
le modèle Excel vierge :

1. L'utilisateur télécharge un modèle vierge (feuille « Hyp » + guide),
   pré-rempli avec une ligne d'exemple par tableau — ou repart directement
   d'un dossier déjà exporté par FinAxis (PDF ou Excel).
2. Il le complète avec ses propres données (projet, sources de revenus,
   charges fixes/variables, investissements, financement).
3. Il dépose le fichier : toutes les étapes du wizard se pré-remplissent
   automatiquement, avec des avertissements affichés pour toute donnée
   manquante ou plan de financement déséquilibré.

### Import Excel

Le modèle réutilise exactement le même gabarit de lignes/colonnes que la
feuille « Hyp » de l'export Excel (`lib/excel/project-sheet-layout.ts`, seule
source de vérité partagée par l'export et l'import) — un utilisateur peut
donc aussi bien remplir le modèle vierge que ré-importer un classeur déjà
exporté par FinAxis pour mettre à jour un projet. Le parsing est
volontairement strict sur cette structure : FinAxis ne peut pas deviner la
mise en page d'un tableur quelconque déjà existant chez l'utilisateur, d'où
le modèle fourni.

### Import PDF

Un PDF exporté par FinAxis peut être redéposé tel quel (`lib/pdf-import/`) :

- **Extraction de texte** (`lib/pdf-import/extract-text.ts`) : le PDF est lu
  entièrement côté client avec `pdfjs-dist`, page par page. `getTextContent()`
  restitue les blocs de texte dans leur ordre d'écriture, qui correspond
  exactement à l'ordre des cellules telles qu'écrites par
  `@react-pdf/renderer` — c'est ce qui rend un parsing positionnel fiable.
  Le worker `pdf.worker.min.mjs` est copié dans `public/` par
  `scripts/copy-pdf-worker.js` (exécuté automatiquement via le script
  `postinstall`) plutôt que résolu via `new URL(..., import.meta.url)` : cette
  dernière approche fait passer le fichier dans le pipeline webpack de
  Next.js, dont le minifieur de production (Terser) échoue sur les fichiers
  ESM contenant `import.meta`. Le servir tel quel depuis `public/` évite le
  problème.
- **Parseur haute-fidélité** (`lib/pdf-import/parse-finaxis-pdf.ts`) : si le
  PDF a la structure d'un export FinAxis (`looksLikeFinAxisPdf`), tous les
  champs sont retrouvés avec la même fiabilité que l'import Excel. Point
  d'attention si vous modifiez la mise en page du PDF exporté
  (`lib/pdf/pages/*.tsx`) : le titre de chaque section (ex. « Hypothèses du
  projet », « Plan de financement ») apparaît **aussi** dans le sommaire de
  la page 2 — chercher la page par ce seul titre retomberait donc sur le
  sommaire. `findPage()` exige en plus la présence d'un second repère propre
  à la page de contenu réelle (ex. « Secteur d'activité » pour la page
  Hypothèses, « Besoins » pour le Plan de financement) : à mettre à jour si
  vous renommez ces repères.
- **Parseur générique** (`lib/pdf-import/parse-generic-pdf.ts`) : pour tout
  autre PDF (prévisionnel externe, document non structuré), une recherche par
  mots-clés (« chiffre d'affaires », « apport », « emprunt »...) récupère les
  quelques montants explicitement indiqués — le reste se complète
  manuellement. Un avertissement rappelle systématiquement cette limite.
- Un PDF scanné (sans couche de texte) n'est pas lisible automatiquement —
  l'utilisateur est invité à utiliser le modèle Excel à la place.

L'étape 3 du wizard garde par ailleurs son import ciblé de charges (fichiers
`.xlsx` / `.csv` avec des colonnes `Nom`, `Montant`, `Catégorie`), pour ceux
qui n'ont qu'une liste de charges à ajouter sans repartir du modèle complet.

L'import de FEC (Fichier des Écritures Comptables) n'est **pas** géré dans
cette V2 — c'est noté ici comme TODO pour une itération future, le format FEC
demandant un mapping comptable plus complexe qui dépasse le périmètre de
cette version.

## Passer en multi-utilisateur (Supabase / Prisma)

Cette V2 n'a pas de backend : les projets sont stockés dans le
`localStorage` du navigateur via les stores Zustand `store/wizard-store.ts`
et `store/projects-store.ts` (middleware `persist`). Pour une vraie
persistance multi-utilisateur, l'ajout le plus direct est :

1. **Base de données** : créer un projet Supabase (Postgres géré) ou une
   base Postgres classique avec **Prisma** comme ORM. Reprendre les types de
   `lib/finance/types.ts` (`Project`, `RevenueSource`, `FixedExpense`,
   `VariableExpense`, `Investment`, `Financing`) comme point de départ du
   schéma Prisma — ils sont déjà normalisés et testés.
2. **Authentification** : Supabase Auth (ou NextAuth.js si Prisma/Postgres
   autogéré) pour associer un `userId` à chaque projet.
3. **Remplacer les stores** : dans `store/projects-store.ts`, remplacer les
   actions `saveProject` / `getProject` / `removeProject` par des appels à
   une API route Next.js (`app/api/projects/route.ts`) qui lit/écrit en base
   au lieu de `localStorage`. La forme des données ne change pas, donc le
   dashboard, le PDF et l'Excel n'ont **aucune** modification à subir.
4. **Migration douce** : au premier login, proposer d'importer les projets
   déjà présents dans le `localStorage` du navigateur vers le compte
   utilisateur nouvellement créé.
5. **Licence B2B2C incubateurs** : une fois le multi-utilisateur en place,
   ajouter un modèle `Organization` (incubateur/CCI) avec une relation
   1-N vers les porteurs de projet, pour alimenter le tableau de bord
   multi-porteurs promis sur la landing page.

## Règles de contenu à respecter si vous étendez le site

- **Aucune métrique marketing inventée** (pas de "94 % de dossiers acceptés",
  pas de nombre d'utilisateurs fictif, pas de logo de banque). C'est un choix
  produit délibéré : ce sont des preuves facilement vérifiées et donc
  disqualifiantes si fausses.
- **Précision juridique sur l'attestation** : toujours "attestation de
  cohérence délivrée par un expert-comptable partenaire inscrit à l'Ordre",
  jamais "certification FinAxis" ou "dossier certifié FinAxis" (risque
  d'exercice illégal de la profession comptable).
- Sentence case partout (pas de MAJUSCULES ni de Title Case, sauf le
  wordmark "FinAxis" lui-même), zéro emoji, icônes Lucide uniquement.

## Déploiement

Le projet est prêt pour un déploiement Vercel standard (`vercel deploy` ou
connexion du repo Git). Aucune variable d'environnement n'est requise pour
cette V2 (pas de backend). Pensez à mettre à jour `metadataBase` dans
`app/layout.tsx` si le domaine change.
