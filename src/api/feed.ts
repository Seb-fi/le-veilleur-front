import { api } from './client'

// Flux podcast audio per-user (PRD « Flux podcast audio »). Le flux RSS est protégé
// par un token-capability dans l'URL ; ces endpoints /api/feed/* sont derrière
// current_user() (le user_id est résolu serveur). INV-F3 : GET = lecture pure, la
// création/rotation d'un secret passe TOUJOURS par POST regenerate (jamais un GET).

export interface FeedMe {
  // null = aucun token actif → le front propose de générer (via regenerate).
  feed_url: string | null
}

export interface FeedRegenerated {
  feed_url: string
}

// Apps instrumentées (§5.6). Doit rester aligné sur le contrat serveur.
export type SubscribeApp =
  | 'apple'
  | 'podcastaddict'
  | 'pocketcasts'
  | 'overcast'
  | 'podcastguru'
  | 'autre'

export type SubscribeAction = 'copy_url' | 'deeplink_tap' | 'regenerate'

// GET /api/feed/me — LECTURE PURE (corrigé itér. 1, m4). Renvoie l'URL du flux si un
// token actif existe, sinon { feed_url: null }. Ne crée jamais de token.
export function fetchMyFeed(): Promise<FeedMe> {
  return api.get<FeedMe>('/feed/me')
}

// POST /api/feed/regenerate — révoque l'ancien token, en insère un nouveau, renvoie
// l'URL complète du flux. Seule écriture du périmètre (INV-F3). Sert aussi de
// création initiale quand fetchMyFeed renvoie null.
export function regenerateFeed(): Promise<FeedRegenerated> {
  return api.post<FeedRegenerated>('/feed/regenerate')
}

// POST /api/feed/subscribe-intent — instrumentation haut d'entonnoir (§5.6).
// Best-effort : on ne bloque jamais l'UX si le log échoue (.catch en appelant).
export function postSubscribeIntent(
  app: SubscribeApp,
  action: SubscribeAction,
): Promise<void> {
  return api.post<void>('/feed/subscribe-intent', { app, action })
}
