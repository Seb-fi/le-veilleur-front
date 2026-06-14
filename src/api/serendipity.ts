import { api } from './client'

// Couche 3 aval — « À la frontière » (sérendipité), per-user (SHADOW, lecture seule).
// Contrat = src/api/routes/serendipity.py.

export interface Pont {
  pivot: string
  champ: string[]
}

export interface SurfacedDossier {
  dossier_id: string
  anchor: string
  column_label: string
  burst?: number | null
  score: number
  claims: string[]
  ponts: Pont[]
}

export function fetchSerendipity(k = 3): Promise<SurfacedDossier[]> {
  return api.get<SurfacedDossier[]>(`/serendipity?k=${k}`)
}
