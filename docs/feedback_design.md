# Feedback — cadrage design (avant implémentation)

> Cadré 2026-06-14 (S3 front). Décisions produit prises par Sébastien.
> Statut : **spec validée** (signal négatif tranché → option A, §4).

## 1. Intention

Le feedback est un **réglage**, pas une récompense. Aligné charte (calme, anti-addictif,
anti-dashboard) : aucun compteur, aucun streak, aucune animation gratifiante, aucune
mémoire client séparée. Toggle réversible, écriture **optimiste**, **idempotent**, état
persisté côté serveur uniquement.

## 2. Signaux backend (`POST /articles/{id}/feedback`, `FeedbackIn.type`)

`relevant`, `not_relevant`, `favorite`, `skipped`, `source_clicked`, `related_clicked`
+ écoute audio `POST /briefings/{date}/listen { percent }`.

## 3. Mapping affordance → signal (décidé)

| Affordance | Signal | Geste |
|---|---|---|
| ⭐ Favori | `favorite` | explicite, toggle (« je veux retrouver ») |
| ✓ Pertinent | `relevant` | explicite, toggle (« bien ciblé ») |
| ↗ Ouvrir la source | `source_clicked` | **implicite** sur clic (ouvre aussi le lien) |
| « N articles liés » | `related_clicked` | **implicite** sur clic |
| Player audio | `listen(percent)` | **implicite** à la fin / l'abandon |

`favorite` et `relevant` sont **indépendants**.

### Signaux implicites retenus (décidé)
`source_clicked`, `related_clicked`, `listen %`. **`skipped` écarté** du MVP
(nécessiterait un suivi de défilement/visibilité — intrusif et bruité).

## 4. Signal négatif — DÉCIDÉ (option A)

« Moins comme ça » → `not_relevant`, **discret** : révélé **au survol** de la carte,
pas affiché en permanence. Le système apprend des rejets sans imposer un micro-jugement
constant à l'écran. Mutuellement exclusif avec `relevant` (tri-état none/relevant/not_relevant).

## 5. Périmètre des boutons explicites (décidé)

| Surface | Boutons explicites | Implicites |
|---|---|---|
| **Explorer · ArticleCard** | ⭐ ✓ ↗ (+ négatif §4) | source, related |
| **Briefing · ArticleSecondCard** | ⭐ ✓ ↗ (+ négatif §4) | source, related |
| **Briefing · DossierCard** | — (lecture pure) | source, related |
| **Briefing · AudioPlayer** | — | listen % |

Le dossier principal reste en lecture linéaire calme (mode briefing) ; seuls les
signaux implicites y jouent.

## 6. Notes d'implémentation (pour plus tard)

- Plomberie prête : `src/api/feedback.ts` (`postArticleFeedback`, `postListen`).
- États toggle : un petit store ou état local par carte, **réconcilié au serveur**
  (pas de source de vérité client). Au montage, l'état initial vient du back si/quand
  un endpoint de lecture des feedbacks par article existe ; sinon état neutre + optimiste.
- `ArticleSecondCard` n'a pas encore la rangée d'actions d'`ArticleCard` → à ajouter
  en réutilisant le markup `.actions` (cohérence visuelle).
- Audio : émettre `listen` sur `ended` et sur `pause`/quitte-page avec le `%` courant
  (un seul envoi par session de lecture, dernier % connu).
