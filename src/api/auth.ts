// Auth front (PRD #49 — Fondation per-user + accès par token).
// Capture du lien présigné (?token=) au bootstrap → stockage localStorage →
// injecté en Authorization: Bearer sur tous les appels API. Le token est retiré
// de l'URL (history.replaceState) : pas de JWT persistant dans la barre d'adresse.
// Impersonation admin via X-Act-As (honorée serveur ssi role=admin, INV-U5).

const TOKEN_KEY = 'leveilleur_token'
const ACT_AS_KEY = 'leveilleur_act_as'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ACT_AS_KEY)
}

export function hasToken(): boolean {
  return getToken() !== null
}

// Impersonation (admin) — user_id cible, honoré côté serveur ssi role=admin (INV-U5).
export function getActAs(): string | null {
  return localStorage.getItem(ACT_AS_KEY)
}

export function setActAs(userId: string | null): void {
  if (userId) localStorage.setItem(ACT_AS_KEY, userId)
  else localStorage.removeItem(ACT_AS_KEY)
}

// À appeler au bootstrap, AVANT le router : capture ?token= du lien présigné,
// le stocke, puis le retire de l'URL — pas de JWT persistant dans la barre d'adresse.
export function captureTokenFromUrl(): void {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (!token) return
  setToken(token)
  params.delete('token')
  const qs = params.toString()
  const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
  window.history.replaceState({}, '', url)
}
