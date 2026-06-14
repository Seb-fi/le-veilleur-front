import { api } from './client'

// Onboarding conversationnel STATELESS (PRD onboarding L3). Le front porte l'état
// (transcript / phase / draft) ; l'API expose, n'orchestre pas. Per-user (#49).
// Contrat = src/api/routes/onboarding.py (S2).

export interface TranscriptTurn {
  role: 'assistant' | 'user'
  content: string
}

export interface TurnOut {
  reply: string
  phase: string
  phase_complete: boolean
  turn_count: number
}

export interface DraftOut {
  draft_context: Record<string, unknown>
}

export interface ConfirmOut {
  ok: boolean
  context: Record<string, unknown>
}

// Un tour de l'entretien guidé : on renvoie le transcript complet + la phase courante.
export function onboardingTurn(
  transcript: TranscriptTurn[],
  phase = 'P0',
  domain = '',
): Promise<TurnOut> {
  return api.post<TurnOut>('/onboarding/turn', { transcript, phase, domain })
}

// Extraction du profil (draft non persisté, revu côté front avant confirm).
export function onboardingFinalize(transcript: TranscriptTurn[]): Promise<DraftOut> {
  return api.post<DraftOut>('/onboarding/finalize', { transcript })
}

// Persistance : re-validation Tier-1 serveur + merge préservant les réglages serveur.
export function onboardingConfirm(
  validatedContext: Record<string, unknown>,
): Promise<ConfirmOut> {
  return api.post<ConfirmOut>('/onboarding/confirm', { validated_context: validatedContext })
}
