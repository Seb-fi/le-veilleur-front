# Review — Architecture UX/UI stratégique du frontend « Le Veilleur »

> Revue critique du dossier `new_front_design_to_review/`, confrontée aux documents de
> vérité produit : `charte_produit.md`, `cognitive_model.md`, `retrieval_invariant.md`,
> `PRD_master_architecture_multi_espaces.md`, `PRD_master_briefing_cognitif.md`,
> la *Spécification Produit — Mémoire Active / Mémoire de Travail*, le design-system,
> et la *Revue Produit — Alignement Site / Charte Produit* précédente.

> **Note de cadrage** : le dossier n'est pas *un* design — c'est un **ensemble d'explorations
> divergentes** (« 5 directions UX », « 5 vues » de l'écosystème, 3 variantes de zoom). La
> question stratégique centrale n'est donc pas « ce design est-il bon ? » mais **« vers
> laquelle de ces directions converger, et laquelle refuser ? »**. C'est l'axe de toute la revue.

---

## 1 — Lecture globale du produit exprimé par le frontend

Le frontend raconte, en réalité, **deux produits différents** selon l'artefact qu'on ouvre :

- **Produit A — le carnet de veille éditorial.** `Le Veilleur.html` (Briefing du matin →
  audio headline → Dossier du jour → Explorer → Mémoire active) et les écrans
  **Revue / Journal / Plan / Atelier**. Calme, dense, typographique, centré sur l'écriture de
  l'utilisateur. C'est *exactement* la charte et la Spécification Mémoire Active.

- **Produit B — l'atelier spatial / le graphe cognitif.** L'« Écosystème informationnel »
  décliné en 5 conteneurs (onglet plein écran, modale, drawer, encart inline,
  **constellation immersive dark avec étoiles**) et le **zoom sémantique continu**
  (`eco-zoom`) où l'état de base est le graphe et le « plan de travail » n'est qu'un zoom
  maximal. Spatial, démonstratif, piloté par le système.

Le Produit A exprime la vision. Le Produit B la trahit par endroits — et c'est sur lui qu'a
porté l'effort de conception le plus visible (un moteur de caméra analogique, 5 traitements de
conteneur, une vue dark immersive). **La gravité du projet tire vers l'artefact le moins fidèle
et le plus risqué.** C'est le diagnostic principal.

---

## 2 — Ce que le frontend réussit vraiment

1. **Le système de design est rigoureux et anti-dérive.** Le README DS interdit nommément
   « Dashboards / gros KPI / animations spectaculaires », « cartes bordure colorée + bg pastel
   (cliché AI) », « gradient backgrounds », et définit le graphe comme « **mémoire mentale, pas
   cartographie globale, positions semi-stables, pas de physics live** ». Les rôles couleur sont
   du vocabulaire cognitif pur : indigo = *tout ce que l'utilisateur crée*, amber =
   épinglé/évènement, moss = convergence, rose = tension. C'est `cognitive_model.md` traduit en
   CSS. Le DS est, ironiquement, **plus fidèle à la spec que plusieurs prototypes qu'il est censé
   servir** (cf. §3).

2. **Quatre des cinq directions Mémoire Active sont justes et différenciantes :**
   - **Atelier** (`screen-atelier`) : les colonnes *À trier → En réflexion → Thèse en formation
     → Prêt à partager* ne sont pas un kanban de tâches — c'est un **pipeline de maturation
     cognitive**. Traduction littérale de la spec (« transformer des signaux en compréhension
     durable »). Très fort.
   - **Journal** (`screen-journal`) : notes au premier plan, favoris en marge, spine temporel
     jour-par-jour. Seule surface qui répond à ce que la *Revue Produit* précédente réclamait
     (« §8 — montrer le temps »). Hiérarchie utilisateur > système correcte.
   - **Revue** (`screen-revue`) : inbox-zero, un favori à la fois, « rien d'autre à l'écran ».
     **Réduction de charge cognitive** au sens strict de `cognitive_model`.
   - **Plan** (`screen-plan`) : zettelkasten à backlinks — écrire pour relier, références liées
     sous la thèse. Externalisation de la mémoire de travail, exactement §01/§04 de la spec.

3. **La surface briefing (`Le Veilleur.html`) est la plus alignée de tout le dossier** : audio
   headline 8 min, dossier du jour, Explorer (Bibliothèque + Sujets). Ton « comme un journaliste
   qui vous connaît » de la charte. Aucun feed infini, aucun refresh-bait, aucune dopamine.

4. **L'édition de note inline (`AutoNote`)** est *plus légère* que la modale dédiée prescrite par
   la spec §10 — divergence dans le bon sens.

---

## 3 — Contradictions majeures avec la philosophie produit

### C1 (critique) — Le graphe est devenu le protagoniste ; la spec en fait une vue secondaire.

La Spécification Mémoire Active est sans ambiguïté : **§07.1 Mode Arborescence = « Vue
principale »**, **§07.2 Mode Graphe = « Vue secondaire »**, qui doit rester « sobre, lisible,
lent » et **« ne jamais devenir une visualisation spectaculaire, un mindmap chaos, un graphe
technique »**.

Or :
- L'arborescence (vue principale) est **quasi absente** de `mem-explore` ; la métaphore
  spatiale/graphe domine (Écosystème + Établi + Zoom).
- L'« Écosystème » reçoit **5 traitements de conteneur**, dont une **`EcoConst` « constellation
  immersive » en dark avec `cst-stars`** — soit précisément l'« effet wow / spectaculaire » que
  la spec ET le DS interdisent.
- Dans `eco-zoom`, le graphe (« Écosystème », `KMIN`) est l'**état au repos** ; le travail
  éditorial n'est qu'un zoom. **La hiérarchie de la spec est inversée.**

### C2 (critique) — Le graphe affiche comme *structure assertée* ce que le backend refuse d'asserter.

`eco-graph` pose : *« Disposition spatiale = proximité d'embedding. Les liens encodent un article
partagé. »* L'interaction centrale est le **lien-pont** (« survolez un lien pour révéler l'article
partagé qui rapproche deux sujets »).

Mais les documents de vérité disent l'inverse :
- `retrieval_invariant.md` : « Clusters are exploratory, probabilistic, user-evaluated.
  **HDBSCAN output is not ground truth.** »
- `cognitive_model.md` + master PRD §11 : la **sur-fusion / la fausse corroboration est un « faux
  signal cognitif » proscrit**.
- Spec Mémoire Active **§08.3 — hiérarchie des liens** : niveau 1 = liens utilisateur (priorité
  forte), niveau 3 = liens système purement sémantiques (**priorité visuelle faible**). Et
  **§08.2 : « les liens système ne doivent jamais structurer l'espace, ni imposer une taxonomie ».**

Dans `eco-graph`, les liens **sont** la structure, dessinés avec halos/dash/emphase au hover, et
**aucun lien utilisateur n'est présent**. Le système structure l'espace — exactement ce que §3.2
et §08.2 interdisent. Pire : un « pont » entre deux clusters parce qu'**un seul article porte deux
tags** (`of: ['mcp','oss']`) est une co-occurrence, pas une tension ni une émergence. Le graphe
peut **fabriquer** des connexions que l'utilisateur lira comme du sens. Ce n'est pas du polish :
c'est une atteinte au modèle cognitif.

> **Trou de vérité backend** : Entity Resolution est en *shadow* (bascule estimée ~Q1 2027, master
> PRD §7.1), **Event Linking est « à rédiger »**, **Stories est DORMANT (pas de table en v1, D-5)**,
> le Cognitive Space (mémoire active) est **Phase 4 hors scope**. Le graphe promet donc une
> topologie de connaissances que le moteur **ne sait pas encore produire de façon validée**. Le
> livrer maintenant, c'est soit truquer la donnée (érode la confiance), soit exposer du bruit
> probabiliste comme de la structure (viole `cognitive_model`).

### C3 (critique) — Plusieurs surfaces font *penser le système à la place de l'utilisateur*.

Spec **§03.1** : la Mémoire doit donner « c'est mon espace de réflexion » et **jamais** « le
système continue à me pousser du contenu ». Or dans `eco-zoom` :
- Le bouton **« Synthèse · Le Veilleur »** (`doSynth` → `claude.complete`, « Le Veilleur lit 12
  sources… ») génère 2 paragraphes d'analyse **terminés par un angle**, en *centerpiece* de la
  fiche sujet.
- Les **« thèses » sont pré-écrites par le système** dans la donnée
  (`SUBJECTS[].note = "Le standard se forme par fait accompli…"`).

C'est l'IA qui rédige la pensée de l'utilisateur. C'est l'« effet AI magique » que le contexte
produit proscrit explicitement, et l'inverse d'une mémoire de travail où **l'utilisateur**
externalise *sa* compréhension. C'est aussi ce qui ferait basculer le produit dans la catégorie
encombrée « AI workspace » (cf. §8).

---

## 4 — Analyse cognitive détaillée

**`eco-zoom` est le pic de charge cognitive du dossier.** Une seule surface expose : 3 modes
(Focus/Contexte/Écosystème), 3 variantes visuelles (Épuré/Repères/Éditorial), un rail de zoom à
détentes + pourcentage, une minimap, un mode-pill avec compteur d'entités, un focus-ring, le
pan/zoom à la molette « vers le curseur », le clic-pour-focaliser, le drag-pour-déplacer.
L'utilisateur doit **apprendre une grammaire spatiale sur-mesure avant de pouvoir penser à MCP**.
Cas d'école du prompt : *« l'utilisateur interprète l'outil au lieu de penser son sujet »* et
*« la navigation devient le travail »*.

**Compétition de paradigmes.** Le dossier juxtapose trois métaphores spatiales incompatibles
(caméra-zoom continue / établi board libre / constellation) + l'arborescence. Livrées ensemble,
elles imposent des modèles mentaux différents et des changements de paradigme implicites (perte de
repères). Ce sont des *explorations* — les empiler comme features cumulatives serait l'erreur.

**À l'inverse**, Revue / Journal / Plan ont un compte d'affordances faible et une **colonne de
lecture unique** — la respiration que la charte demande. Mesure simple : sur `eco-zoom`, ~12
affordances + une caméra physique ; sur `Revue`, ~4 affordances + une carte. Les deux prétendent
servir la même mémoire de travail. La spec tranche en faveur de la seconde (« calme, respirable,
minimalisme cognitif », §3.3).

---

## 5 — Système de navigation et transitions (le passage *focused → écosystème*)

C'est `eco-zoom` qui répond à la demande explicite du prompt. Évaluation honnête :

**Ce qui est juste :**
- C'est un **zoom continu**, pas un swap modal brutal : le sujet focal reste à l'écran quand on
  recule. Bonne intention.
- **Les notes/épingles/favoris persistent** dans l'état du composant à travers la transition
  (`notes`, `pinned`, `fav`). La continuité de la mémoire utilisateur est techniquement préservée
  — mieux qu'un saut de paradigme qui jetterait le contexte.

**Ce qui ne va pas :**
- **Erreur de catégorie.** « Zoom » est une opération *spatiale*. « Montre-moi les relations » est
  une opération d'*abstraction cognitive*. Les conflater — reculer la caméra = passer du document
  à l'écosystème — fait croire que les relations sont une version *réduite* du document. Elles ne
  le sont pas. La métaphore ment.
- **Instabilité du repère.** Le focal est recalculé **à chaque frame** par proximité au centre
  écran (`focal = entité la plus proche du centre`). Un simple pan peut changer silencieusement
  « ce sur quoi je suis concentré ». La spec veut « stabilité mentale de l'espace » ; une caméra
  qui re-dérive le focus de la physique du curseur la détruit.
- **Le spectaculaire revenu par la fenêtre.** Spec §11 : la bascule arborescence↔graphe doit être
  un **« bouton de bascule en haut à droite », « fluide, calme, NON spectaculaire ».** `eco-zoom`
  remplace ce toggle explicite et prévisible par une caméra analogique que l'utilisateur pilote —
  plus spectaculaire, moins prévisible.

**Verdict :** démo impressionnante, produit risqué. **Garder** l'idée de persistance du
contexte/notes à travers la transition ; **abandonner** la caméra analogique comme grammaire
d'entrée. Revenir au toggle explicite que la spec décrit littéralement, + contexte persistant. Le
zoom peut survivre en *option power-user*, jamais en mode par défaut.

---

## 6 — Analyse spécifique du graphe

- **Valeur cognitive réelle : faible à conditionnelle.** Le graphe répond à « lesquels de mes
  sujets partagent un article ? » — question marginale pour une mémoire de travail. La charge
  d'insight (le pont, la tension) est **textuelle**, pas spatiale : le tooltip/encart
  (« *Why MCP wins* relie MCP à l'open-source ») porte 100 % du sens ; le ressort de positionnement
  des nœuds en porte ~0 %. Le graphe est donc **largement décoratif** vis-à-vis de la compréhension.
- **Fréquence d'usage probable : basse.** On consulte une mémoire de travail pour écrire/retrouver,
  pas pour admirer une topologie. Graphe permanent/dominant = « graphe vision produit mais pas
  usage réel » (mise en garde exacte du prompt).
- **Coût attentionnel : élevé**, et 5 conteneurs + une constellation dark trahissent une
  fascination d'équipe pour l'objet.
- **Où il doit vivre :** secondaire, **temporaire, contextuel** — comme la spec §07.2 et le README
  DS le disent déjà. Bonnes instances : **l'encart inline** (`EcoInline`) et **le drawer**
  (`EcoDrawer`) — graphe *convoqué* à côté d'un document, *renvoyable*. Mauvaises instances :
  **l'onglet plein écran** (`EcoTab`) et **la constellation immersive** (`EcoConst`) — graphe
  *destination*. → **Supprimer la constellation.**
- **Risque actif (pas esthétique) :** un graphe qui trace des arêtes de proximité d'embedding
  **fabrique de la fausse corroboration**. Deux clusters « connectés » par un tag partagé →
  l'utilisateur lit une tension/causalité inexistante. Le graphe peut **dégrader** le modèle
  cognitif. Problème de justesse vis-à-vis de `retrieval_invariant`, à traiter avant tout.

---

## 7 — Analyse spécifique de la Mémoire Active

- **« C'est mon espace » ? Réponse clivée.** Plan/Journal/Atelier/Revue : oui. `eco-zoom` / graphe
  / constellation : non (synthèses auto-rédigées par le système, clusters détectés comme squelette,
  thèses pré-écrites).
- **Le système trop visible ?** Dans les surfaces graphe : oui (bouton Synthèse en centerpiece,
  « Le Veilleur lit N sources », « Clusters détectés · 5 »). Dans les surfaces d'écriture : non. La
  spec §3.2 veut le système « en arrière-plan, jamais dominant » — seules les secondes le respectent.
- **Risque « Notion-bis » concentré dans l'Établi** (`screen-etabli`) : canvas spatial libre, notes
  adhésives, connecteurs, toolbar *main/déplacer/relier*. Le plus proche d'un Miro/tldraw générique
  — le moins différenciant, le plus « outil de productivité » (que la spec §15 récuse). Il
  **réintroduit l'entretien spatial manuel** (l'utilisateur range les cartes) = « l'organisation
  devient le travail ».
- **Notes épinglées (une par entité, §06)** : bien gérées (DS `v-pinned`, `togglePin` dans zoom).
- **Modales :** la spec §10 prescrit une modale légère ; le dossier édite *inline* — plus léger,
  donc *mieux*, mais à réconcilier avec la spec écrite.

---

## 8 — Risques stratégiques à moyen terme

1. **Gravité du graphe.** L'effort se concentre sur l'artefact à plus faible valeur et plus haut
   risque. Le produit risque de se faire identifier comme « l'outil de veille avec le joli graphe » :
   générateur de captures d'écran, pas de rétention — et il verrouille la roadmap sur la maintenance
   d'un moteur spatial que le backend ne peut pas alimenter en vérité (Events/Stories Phase
   B/dormant ; Entity en shadow).
2. **Écart de vérité back/front.** Le graphe implique entités-ponts / events / stories qui sont
   **dormants ou non validés**. Le livrer maintenant crée une promesse que le moteur ne peut tenir,
   et une dette de migration quand Event Linking v1 arrivera avec d'autres sémantiques.
3. **Prolifération de paradigmes.** Livrer plusieurs métaphores spatiales sans choisir fragmente le
   modèle mental et la base de code.
4. **Dérive vers « AI workspace ».** Synthèse auto + clusters IA poussent vers la catégorie
   encombrée où le moat est faible (Notion AI, etc.). La catégorie défendable (cf. Revue Produit §7)
   est la **continuité cognitive temporelle** — qu'expriment Journal/Atelier, *pas* le graphe.

---

## 9 — Ce qui pourrait devenir un moat produit fort

Le moat n'est pas le graphe. C'est **la boucle de maturation cognitive rendue visible** : signal →
sauvegarde → annotation → *thèse en formation* → feedback de pertinence → briefing de demain
(spec §13). Aucun concurrent ne couple un **briefing éditorial quotidien** à une **mémoire de
travail personnelle qui le personnalise**.

Les graines sont déjà là : les colonnes-stades de l'**Atelier**, la colonne temporelle du
**Journal**, et le langage couleur **indigo = ce que vous créez**. Ensemble, ils dessinent une
catégorie neuve : *une mémoire de travail qui apprend ce que vous suivez et le réinjecte dans le
briefing*. Le frontend devrait **dramatiser cette boucle** (« votre thèse a modifié votre
briefing ») — ce qui, aujourd'hui, n'est toujours pas montré (la *Revue Produit* §3.2 reste vraie).
C'est là qu'il faut mettre l'énergie investie dans le graphe.

---

## 10 — Recommandations priorisées

### Critiques
1. **Déclasser le graphe de protagoniste à aide contextuelle.** Supprimer la constellation
   immersive `EcoConst` ; ne garder que l'**encart inline** + le **drawer** ; jamais de vue graphe
   par défaut ou destination. (Aligne spec §07.2 + DS.)
2. **Empêcher le système d'écrire la pensée de l'utilisateur.** La « Synthèse · Le Veilleur » en un
   clic et les thèses pré-écrites contredisent §03.1. Si on les garde : synthèse *invoquée* par
   l'utilisateur, étiquetée « brouillon système », visuellement **subordonnée** à la note de
   l'utilisateur, jamais centrée. État par défaut d'un sujet = la note de l'utilisateur (vide s'il
   n'a rien écrit).
3. **Résoudre l'écart de vérité backend avant tout graphe.** Ne pas rendre la proximité d'embedding
   / les « ponts » de cluster comme structure assertée tant que HDBSCAN « n'est pas ground truth »
   et qu'Events/Stories sont dormants. Soit les marquer explicitement « suggestions système (faible
   confiance) » en poids visuel niveau 3 (§08.3), soit différer le graphe jusqu'à validation des
   espaces Entity/Event.
4. **Choisir UNE direction Mémoire Active primaire** = l'équivalent « arborescence / vue
   principale » que la spec impose. Recommandation : **Journal** (ou Atelier) comme colonne
   vertébrale + **Plan** (zettelkasten) comme surface d'écriture. Graphe et Établi = secondaires/
   optionnels.

### Importantes
5. **Remplacer la caméra analogique de `eco-zoom`** comme nav primaire par le toggle calme et
   explicite de la spec §11 ; **conserver** sa seule bonne idée (persistance note/contexte à la
   transition). Zoom = option, pas grammaire d'entrée.
6. **Rendre la boucle cognitive visible** (le vrai moat) : montrer « ce que vous avez
   sauvegardé/annoté a changé votre briefing ». Aujourd'hui invisible.
7. **Faire du DS la barrière (gate).** Le README DS interdit déjà ce que font la constellation et
   le zoom — un prototype qui le viole ne ship pas.
8. **Dé-risquer l'Établi** : s'il est gardé, le contraindre (snap-to-cluster, pas de canvas infini)
   pour que ranger ne devienne pas le travail ; sinon c'est du Notion-bis.

### Opportunités futures
9. **Capitaliser sur la temporalité (Journal)** : montrer l'évolution d'une thèse dans le temps —
   le « montrer le temps » réclamé, et ce que le graphe ne sait pas faire.
10. **Brancher les colonnes de l'Atelier sur la capture de signaux implicites** que le PRD impose
    (D-12 : `read_time`, `skip`, `favorite`, `related_clicked`, et le sous-PRD #7 « frontend
    instrumenté »). Les stades de maturation deviennent alors aussi le **pipeline d'annotation**
    dont le backend a besoin pour valider ses gates §10.1. Le frontend serait à la fois l'espace de
    l'utilisateur **et** l'instrument de validation — un alignement rare.

---

**En une phrase :** le dossier contient déjà l'interface juste (Journal/Atelier/Plan/Revue + la
surface briefing) ; le risque n'est pas un manque de qualité mais un **mauvais centre de gravité**
— l'énergie de conception est aspirée par le graphe et le zoom spectaculaire, c'est-à-dire
l'artefact le plus éloigné de « moteur de stabilisation cognitive » et le plus proche de « graphe
gadget / AI toy ». La décision de convergence compte plus que n'importe quel écran isolé.
