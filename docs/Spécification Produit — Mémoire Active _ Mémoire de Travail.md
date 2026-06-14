# **Spécification Produit — Mémoire Active / Mémoire de Travail**

## **Le Veilleur**

### **Version 1.0 — Mai 2026**

---

# **01 — Vision**

La Mémoire Active est l’espace de travail personnel du Veilleur.

Elle permet à l’utilisateur de :

* conserver des signaux importants,  
* organiser ses réflexions,  
* construire des pistes de veille,  
* annoter des articles,  
* relier des idées,  
* et externaliser progressivement sa mémoire stratégique.

La Mémoire n’est pas :

* un système de favoris,  
* un dossier de bookmarks,  
* un outil de gestion documentaire.

C’est une mémoire de travail cognitive.

---

# **02 — Positionnement dans le produit**

Le Veilleur repose sur deux espaces complémentaires :

## **Explorer**

Espace piloté par le système.

Le système :

* détecte,  
* relie,  
* cartographie,  
* fait émerger.

Objectif :  
comprendre ce qui se passe dans le domaine surveillé.

---

## **Mémoire Active**

Espace piloté par l’utilisateur.

L’utilisateur :

* sélectionne,  
* annote,  
* structure,  
* construit ses pistes,  
* conserve ses réflexions.

Objectif :  
transformer des signaux en compréhension durable.

---

# **03 — Philosophie UX**

## **3.1 — Espace personnel avant tout**

La Mémoire doit donner la sensation :

“C’est mon espace de réflexion.”

et jamais :

“Le système continue à me pousser du contenu.”

---

## **3.2 — Le système reste discret**

Le système peut :

* suggérer des connexions,  
* révéler des proximités,  
* enrichir le contexte.

Mais :

* il ne structure pas l’espace,  
* il ne domine jamais visuellement,  
* il reste en arrière-plan.

---

## **3.3 — Minimalisme cognitif**

La mémoire doit rester :

* calme,  
* dense,  
* lisible,  
* respirable.

Pas :

* spectaculaire,  
* surchargée,  
* “AI-first”,  
* ni orientée dashboard analytics.

L’esthétique cible est :

* éditoriale,  
* silencieuse,  
* proche d’un carnet de recherche ou d’un bureau de veille personnel.

---

# **04 — Objectifs fonctionnels**

La Mémoire Active doit permettre de :

* sauvegarder des signaux importants,  
* annoter des contenus,  
* construire des pistes de réflexion,  
* conserver des réflexions personnelles,  
* retrouver rapidement des éléments,  
* partager des ensembles cohérents,  
* améliorer implicitement le profil utilisateur,  
* améliorer la pertinence future du briefing.

---

# **05 — Entités**

---

# **05.1 — Articles**

Unité atomique principale.

Représente :

* un article sauvegardé,  
* une synthèse,  
* un contenu du briefing,  
* un signal conservé par l’utilisateur.

## **Capacités**

Un article peut :

* recevoir des notes,  
* appartenir à plusieurs pistes,  
* être partagé,  
* être marqué comme évènement,  
* recevoir une note épinglée.

---

# **05.2 — Pistes**

Regroupement créé volontairement par l’utilisateur.

Une piste représente :

* une exploration active,  
* un sujet suivi,  
* une problématique,  
* une tension intellectuelle,  
* un axe de veille.

## **Exemples**

* Agents IA autonomes  
* Fiabilité des benchmarks LLM  
* Europe défense  
* DBT \+ IA  
* Open-source AI economics

---

## **Capacités**

Une piste peut contenir :

* des articles,  
* des notes,  
* des évènements.

Une piste peut :

* recevoir une note épinglée,  
* être partagée,  
* être enrichie progressivement.

---

# **05.3 — Notes**

Les notes représentent la réflexion utilisateur.

Elles constituent :

* le cœur cognitif du système,  
* et la principale source de compréhension implicite du profil.

---

## **Types de notes**

### **Note attachée à une entité**

Attachée à :

* un article,  
* une piste,  
* un évènement.

---

### **Note contextuelle dans un article**

Attachée :

* à un passage précis,  
* une citation,  
* un paragraphe,  
* ou un élément du contenu.

---

## **Capacités**

Une note peut :

* être éditée,  
* être épinglée,  
* être partagée indirectement,  
* être reliée à plusieurs éléments.

---

# **05.4 — Évènements**

Type particulier d’article associé à :

* une rupture,  
* une annonce,  
* un lancement,  
* un incident,  
* une publication majeure,  
* un changement significatif.

---

## **Rôle**

Les évènements servent à :

* contextualiser des signaux,  
* structurer des timelines,  
* détecter des accélérations,  
* relier des changements dans le temps.

---

# **06 — Notes épinglées**

Chaque entité peut avoir :

* une seule note épinglée.

Entités compatibles :

* article,  
* piste,  
* évènement.

---

## **Rôle**

La note épinglée représente :

* le résumé mental actuel,  
* la réflexion principale,  
* ou la conclusion provisoire de l’utilisateur.

---

## **Comportement**

Si une note est déjà épinglée :

* les autres boutons “épingler” sont désactivés.

Si la note actuelle est épinglée :

* le bouton apparaît actif / surligné.

Cliquer à nouveau :

* retire l’épinglage.

---

## **Affichage**

### **Mode Liste / Arborescence**

Affichée directement sous l’entité.

### **Mode Graphe**

Visible au hover / focus.

---

# **07 — Modes de visualisation**

---

# **07.1 — Mode Arborescence**

Vue principale.

Structure :

* calme,  
* hiérarchique,  
* éditoriale,  
* lisible.

---

## **Affiche principalement**

* pistes,  
* articles sauvegardés,  
* notes,  
* évènements.

---

## **Objectif**

Donner la sensation :

* d’un espace maîtrisé,  
* personnel,  
* organisé autour de l’utilisateur.

---

# **07.2 — Mode Graphe**

Vue secondaire orientée exploration cognitive.

---

## **Objectif**

Visualiser :

* les regroupements,  
* les proximités,  
* les relations,  
* les tensions,  
* les connexions entre pistes et signaux.

---

## **Principes UX**

Le graphe doit rester :

* sobre,  
* lisible,  
* lent,  
* respirable.

Il ne doit jamais devenir :

* une visualisation spectaculaire,  
* un “mindmap chaos”,  
* un graphe technique.

---

# **08 — Liens système**

Les liens système sont autorisés mais doivent rester :

* rares,  
* discrets,  
* pertinents,  
* secondaires.

---

# **08.1 — Rôle**

Le système peut suggérer :

* des proximités sémantiques,  
* des évènements liés,  
* des relations implicites,  
* des connexions potentielles.

---

# **08.2 — Règle fondamentale**

Les liens système ne doivent jamais :

* dominer visuellement,  
* structurer l’espace,  
* imposer une taxonomie.

L’espace reste centré utilisateur.

---

# **08.3 — Hiérarchie des liens**

## **Niveau 1 — Liens utilisateur**

Créés explicitement :

* ajout à une piste,  
* regroupement,  
* annotation,  
* partage.

Priorité visuelle forte.

---

## **Niveau 2 — Liens implicites**

Déduits du comportement :

* lectures rapprochées,  
* annotations similaires,  
* enrichissements récurrents.

Priorité visuelle moyenne.

---

## **Niveau 3 — Liens système**

Relations purement sémantiques détectées par le système.

Priorité visuelle faible.

---

# **09 — Partage**

Le partage se fait par contexte.

Partager une entité partage également :

* les notes liées,  
* les relations importantes,  
* les éléments associés pertinents.

---

## **Objectif**

Le partage doit transmettre :

* une compréhension,  
* une réflexion,  
* un angle d’analyse,  
* et pas uniquement un lien.

---

# **10 — Édition des notes**

---

## **Ouverture**

L’édition d’une note ouvre une modal dédiée.

Déclencheurs :

* créer une note,  
* éditer une note existante.

---

## **Actions disponibles**

* Save  
* Cancel  
* Épingler / Désépingler

---

## **Contraintes UX**

La modal doit :

* rester légère,  
* rapide,  
* sans surcharge fonctionnelle,  
* centrée sur l’écriture.

---

# **11 — Navigation entre vues**

Le passage :

* du mode Arborescence,  
* au mode Graphe,

se fait via :

* un bouton de bascule situé en haut à droite de l’écran.

La transition doit être :

* fluide,  
* calme,  
* non spectaculaire.

---

# **12 — Impact sur le profil utilisateur**

La Mémoire Active devient la principale source d’apprentissage du système.

Le profil utilisateur doit apprendre principalement via :

* les sauvegardes,  
* les annotations,  
* les pistes,  
* les regroupements,  
* les notes épinglées,  
* les partages.

Et non principalement via :

* les clics,  
* le temps de lecture,  
* les métriques d’engagement classiques.

---

# **13 — Boucle produit globale**

## **Explorer**

Détection de signaux.

↓

## **Sauvegarde utilisateur**

↓

## **Annotation / réflexion**

↓

## **Construction de pistes**

↓

## **Ajustement implicite du profil**

↓

## **Briefings plus pertinents**

↓

## **Meilleure détection future**

---

# **14 — Ressenti utilisateur cible**

La Mémoire Active doit progressivement donner la sensation :

“Le système comprend ce que j’essaie réellement de suivre.”

Puis :

“Je construis une mémoire stratégique externe.”

---

# **15 — Direction design**

Conserver les principes du design actuel :

* densité élégante,  
* palette crème / papier,  
* micro-interactions discrètes,  
* contraste doux,  
* profondeur légère,  
* sensation d’outil sérieux,  
* absence d’effets excessifs.

La mémoire doit évoquer :

* un bureau de veille,  
* un carnet vivant,  
* une table de recherche personnelle.

Pas :

* un réseau social,  
* un dashboard analytique,  
* ni un outil de productivité agressif.

