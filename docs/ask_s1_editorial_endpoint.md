# Demande à S1 — endpoint éditorial structuré pour le briefing (front)

> De : Session 3 (front). Pour : Session 1 (corpus/sélection/éditorial).
> Contexte : Couche C (`briefing_generator.py` + `editorial_context.py`) enrichit la
> **narration audio** mais n'expose rien de structuré. Le front consomme déjà l'audio
> (`audio_url`) et a câblé threads (`/threads`) + sérendipité (`/serendipity`). Il manque
> la **matière éditoriale structurée** pour la carte « Dossier du jour » et les brèves.

## Besoin

Le `DossierCard` du briefing affiche un dossier éditorial **décomposé** :
`headline`, `lede`, `synthesis`, `tensions`, `matters` (« pourquoi ça compte »),
`sourceCount`, `relatedCount`. Aujourd'hui, `BriefingOut` n'expose que
`{id, date, date_label, article_ids, article_count, has_audio, audio_url}` — la Une,
les synthèses multi-article et le contexte d'émergence restent **internes au prompt**.

## Proposition de contrat (à ajuster côté S1)

`GET /api/briefings/today/editorial` (per-user, `current_user`, lecture seule) :

```jsonc
{
  "une": {                       // editorial_context.select_une
    "article_id": "…",
    "headline": "…",             // titre éditorialisé (ou titre article si pas de réécriture)
    "lede": "…",                 // chapeau (1-2 phrases)
    "source_count": 5,
    "related_ids": ["…"]
  },
  "syntheses": [                 // _build_synthesis_block : dossiers partagés (≥2 articles)
    { "dossier_id": "…", "anchor": "…", "synthesis": "…",
      "tensions": "…", "matters": "…", "burst": 2.9, "article_ids": ["…"] }
  ],
  "emergence_by_article": {      // build_emergence_context (voix non-oracle / hedging)
    "<article_id>": { "anchor": "…", "burst": 2.9, "is_emerging": true, "note": "…" }
  },
  "greeting_name": "…"           // optionnel : nom d'affichage (sinon dérivé user_context)
}
```

## Notes / invariants à préserver

- **Lecture seule**, SHADOW : narrer ≠ promouvoir (sélection intacte, statut shadow inchangé).
- Respecter le **flag** `briefing_editorial.enabled` : si OFF/gate non passé, renvoyer
  `une=null`, `syntheses=[]` → le front **omet** la carte dossier (jamais de mock en prod).
- Hedging déjà géré côté Couche C (burst < seuil franc → voix « activité soutenue ») :
  exposer le texte déjà hedgé, le front n'interprète pas le burst.
- Champs absents (pas de réécriture de titre, mono-source) → omis, jamais inventés.

## En attendant

Le front câble dès maintenant les parts réelles (`date_label`, audio, articles secondaires
via `/articles/{id}`, greeting via `user_context`) et **omet** dossier + brèves. Ce contrat
livré, le `DossierCard` et la synthèse se branchent sans changement de surface front.
