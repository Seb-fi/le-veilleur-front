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
