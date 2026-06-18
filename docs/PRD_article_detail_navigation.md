# PRD — Vue Article & navigation (workflows manquants du briefing/explorer)

> Statut : **PROPOSITION — à valider avant implémentation.** Rédigé 2026-06-18 (S3 front).
> Source de référence : ancien front `/home/seb_dev/llm-lab/frontend/app` (`ArticleDetailView.vue`).
> Cible : nouveau front `le-veilleur-front` — **reprendre les workflows, pas le style**
> (charte éditoriale crème + design system, jamais le thème sombre dev).

## 1. Contexte & problème

Dans le nouveau front, les cartes article (briefing + explorer) ont `cursor: pointer`
mais **ne mènent nulle part** : aucun routeur n'est branché, « N articles liés » est un
`@click.prevent` (feedback seul), et **il n'existe aucune vue de détail d'article**.

L'ancien front avait une `ArticleDetailView` (route `/articles/:id`) atteinte :
- en cliquant un **article du briefing** ;
- en cliquant **« articles liés »** (navigue vers le détail, ancré sur la section liés) ;
- en cliquant un **article de l'Explorer** ;
- en cliquant un **article lié** depuis le détail (navigation en chaîne).

Ces workflows ne sont **pas portés**. Ce PRD les spécifie.

## 2. Objectif

Permettre de **lire un article et explorer ses voisins** depuis le briefing et l'Explorer,
dans une **vue de détail éditoriale** cohérente avec la charte, sans rien emprunter à
l'UI admin/dev.

## 3. Périmètre

**Dans le périmètre :**
1. Nouvelle **vue détail d'article** `/explorer/articles/:id` (design system éditorial).
2. Navigation **entrante** : carte article briefing (dossier + secondaires) → détail ;
   carte Explorer → détail ; « N articles liés » → détail (ancré section liés).
3. Navigation **interne** : article lié dans le détail → détail de cet article (chaînage).
4. **Section « Articles liés »** dans le détail (depuis `related_ids`).
5. Intégration **feedback** existante : `source_clicked` au clic « lire l'original »,
   `related_clicked` au clic d'un lié, favori/pertinent réutilisés.

**Hors périmètre (NE PAS reproduire) :**
- Tout l'**onglet admin** et les panneaux dev de l'ancien détail : `EntityValidator`,
  `EvaluatorNotePanel`, table `score-detail` brute, badge `DEV`, devMode.
- « Synthèse du sujet » (était `disabled`/sprint 3).
- Section **« En tension »** (contradictions) : **expérimentale** → *option*, par défaut
  **différée** (cf. §9, décision ouverte).

## 4. Vue détail d'article — spécification

Route `/explorer/articles/:id(.*)` (id = URL/arXiv → segment libre ; hash history).

Sections (de haut en bas), toutes en charte éditoriale (Newsreader / IBM Plex / crème) :

| Bloc | Contenu | Source données |
|---|---|---|
| **Retour** | « ← retour au briefing » / « ← retour aux articles » (contextuel selon provenance) | historique routeur |
| **Méta** | `source` · date longue (`published`) · type | `ArticleOut` |
| **Titre** | `title` (serif large) | `ArticleOut` |
| **Métriques** | Pertinence (barre + libellé Essentiel/Très pertinent/…), Type, Contexte, Tendance | `ArticleOut.score/content_type/context/trending` |
| **Labels** | puces `labels[]` (badges existants) | `ArticleOut.labels` |
| **Corps** | `summary` découpé en paragraphes (3 phrases) | `ArticleOut.summary` |
| **Pourquoi pour vous** | encart éditorial (indigo-tint) — `reranker_justification` du score-detail **si présent**, sinon masqué (jamais de table dev, jamais inventé) | `GET /articles/{id}/score-detail` |
| **Action** | bouton primaire « Lire l'article original » (ouvre `link`/URL résolue, `target=_blank`) → émet `source_clicked` | `ArticleOut.link` |
| **Articles liés** | titre « Articles liés — sujet « X » » (label cluster si dispo) + liste de cartes liées cliquables | `related_ids` + `GET /articles/{id}/clusters` |

Réutilise les composants existants : `SourceBadge`, `ScoreBadge`, badges d'axe/type,
`ArticleSecondCard` (ou une carte liée légère) pour la liste des liés.

## 5. Navigation (règles)

- **Clic sur une carte article** (titre/corps/vignette) → `push('/explorer/articles/{id}')`.
  Les **boutons feedback** et le **lien source** à l'intérieur **stoppent la propagation**
  (pas de navigation parasite).
- **« N articles liés »** → `push('/explorer/articles/{id}?related=1')` ; la vue **scrolle**
  vers la section liés (comportement de l'ancien front). Émet `related_clicked`.
- **Article lié dans le détail** → `push('/explorer/articles/{relatedId}')` (chaînage).
- **Retour** : `router.back()` si historique, sinon `/briefing` (depuis briefing) ou
  `/explorer/articles` (depuis explorer).
- Cartes concernées : `DossierCard`, `ArticleSecondCard` (briefing) ; `ArticleCard` (explorer).

## 6. Données & endpoints (tous déjà en prod)

- `GET /articles/{id}` → `ArticleOut` (titre, summary, source, published, score, labels,
  context, content_type, trending, **related_ids**, link, thumbnail, contradiction_*).
- `GET /articles/{id}/related` → `list[str]` (IDs) — *redondant avec `related_ids`* ; on
  utilise `related_ids` de l'article + fetch unitaire des liés (`/articles/{id}`), bornés.
- `GET /articles/{id}/clusters` → `ClusterMembershipOut[]` → libellé de sujet (max similarité).
- `GET /articles/{id}/score-detail` → `{ available, score_detail{ reranker_justification? } }`
  → **uniquement** la justification narrative (le reste = dev, ignoré).

**Approche store** : un `useArticleStore` (ou extension `useExplorerStore`) avec
`loadOne(id)` (cache + fetch), `getById`, et hydratation des liés à la demande
(N appels bornés, parallèles). Pas de chargement du corpus entier (12 k articles).

## 7. Design system / charte

- Aucune couleur/typo de l'ancien thème sombre. Tokens existants uniquement
  (`--color-ink/-2/-3`, `--color-paper/bg`, `--color-indigo/amber`, fonts serif/sans/mono).
- Largeur de lecture confortable (≈ 70ch pour le corps), titres Newsreader, méta IBM Plex Mono.
- Encart « Pourquoi pour vous » = `--color-indigo-tint`, ton calme (pas de table, pas de score brut).
- États : **loading** (« Chargement… »), **introuvable** (EmptyState éditorial → retour),
  **liés vides** (« Aucun article lié »), **erreur réseau** (message sobre, jamais de mock en réel).

## 8. Feedback (réutilise `useFeedbackStore`)

- « Lire l'article original » → `markImplicit(id, 'source_clicked')`.
- Clic d'un article lié → `markImplicit(id, 'related_clicked')` sur l'article **courant**.
- Favori / Pertinent / « moins comme ça » disponibles sur le détail (mêmes affordances que les cartes).

## 9. Décisions ouvertes (à trancher avant code)

1. **Section « En tension » (contradictions)** : la reporter ou non ? Étiquetée
   *expérimentale* dans l'ancien front. **Reco : différer** (hors MVP de ce lot) — la
   donnée existe (`contradiction_ids/scores`) mais l'affordance « tension » mérite son
   propre cadrage UX. *À confirmer.*
2. **Route** : `/explorer/articles/:id` (sous Explorer) vs `/article/:id` (racine).
   **Reco : sous Explorer** (cohérent avec la nav existante).

## 10. Plan d'implémentation

1. `api/articles.ts` : `fetchArticle(id)`, `fetchArticleClusters(id)`, `fetchScoreDetail(id)`
   (+ types). Réutilise l'adapter `ArticleOut → ExplorerArticle` existant.
2. `stores/useArticleStore.ts` : `loadOne`, `getById`, `loadRelated`.
3. `views/ArticleDetailView.vue` : la vue §4 (charte éditoriale).
4. `router` : route `/explorer/articles/:id(.*)` + scroll `?related=1`.
5. Navigation cartes : `ArticleCard`, `ArticleSecondCard`, `DossierCard` → clic carte +
   « liés » ; `stop`/`prevent` sur feedback & source.
6. Type-check + build ; e2e : clic briefing → détail, clic lié → chaînage.

## 11. Definition of Done

Depuis le briefing **et** l'Explorer, un clic article ouvre une vue détail éditoriale
alimentée en réel ; « articles liés » y mène (ancré) ; les liés se chaînent ; feedback
source/related émis ; zéro élément admin/dev ; type-check + build verts ; e2e de navigation.
