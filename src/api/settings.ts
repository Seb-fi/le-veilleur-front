import { api } from './client'

// Réglages per-user (PRD #49) — endpoints déjà en prod (docs/openapi.json).
export interface Settings {
  voice: string
  max_articles: number
  schedule_time: string | null
  dev_mode?: boolean
}

export interface SettingsPatch {
  voice?: string | null
  max_articles?: number | null
  schedule_time?: string | null
}

export function fetchSettings(): Promise<Settings> {
  return api.get<Settings>('/settings')
}

export function patchSettings(patch: SettingsPatch): Promise<Settings> {
  return api.patch<Settings>('/settings', patch)
}

// GET /api/settings/download → blob authentifié (le Bearer ne passe pas via <a href>,
// d'où api.download qui porte l'en-tête, PRD #49 v2.9 fix download).
export function downloadSettings(): Promise<Blob> {
  return api.download('/settings/download')
}

// Le même endpoint renvoie le user_context complet en JSON — seule lecture du
// profil exposée au front (pas de GET /user-context dédié). Sert la synthèse Profil.
export type UserContext = Record<string, unknown>

export function fetchUserContext(): Promise<UserContext> {
  return api.get<UserContext>('/settings/download')
}

// POST /api/settings/import — upload d'un profil JSON (admin/test, INV-U10).
export function importUserContext(file: File): Promise<Settings> {
  const form = new FormData()
  form.append('file', file)
  return api.upload<Settings>('/settings/import', form)
}
