import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  onboardingTurn,
  onboardingFinalize,
  onboardingConfirm,
  type TranscriptTurn,
} from '../api/onboarding'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Front porte l'état (PRD onboarding : API stateless). Phases P0→P6 puis "done".
export const PHASE_ORDER = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const

export type OnboardingStage = 'chat' | 'synthesis' | 'done'

export const useOnboardingStore = defineStore('onboarding', () => {
  const transcript = ref<TranscriptTurn[]>([])
  const phase = ref<string>('P0')
  const domain = ref<string>('')
  const stage = ref<OnboardingStage>('chat')
  const draft = ref<Record<string, unknown> | null>(null)
  const sending = ref(false)
  const error = ref<string | null>(null)

  const phaseIndex = computed(() => Math.max(0, PHASE_ORDER.indexOf(phase.value as never)))
  const progress = computed(() =>
    phase.value === 'done' ? 1 : phaseIndex.value / (PHASE_ORDER.length - 1),
  )

  // Amorce : un tour à transcript vide produit le message d'ouverture (P0).
  async function start() {
    if (transcript.value.length || sending.value) return
    await runTurn()
  }

  async function send(text: string) {
    const content = text.trim()
    if (!content || sending.value || stage.value !== 'chat') return
    transcript.value.push({ role: 'user', content })
    await runTurn()
  }

  // Un tour : envoie le transcript + la phase courante, range la réponse, avance la phase.
  async function runTurn() {
    sending.value = true
    error.value = null
    const requestPhase = phase.value
    try {
      if (USE_MOCK) {
        await mockTurn(requestPhase)
      } else {
        const res = await onboardingTurn(transcript.value, requestPhase, domain.value)
        // L'entrée assistant est taguée avec la phase TRAITÉE (cap de tours par phase serveur).
        transcript.value.push({ role: 'assistant', content: res.reply } as TranscriptTurn)
        tagLastAssistant(requestPhase)
        phase.value = res.phase
      }
      if (phase.value === 'done') await finalize()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur réseau'
    } finally {
      sending.value = false
    }
  }

  function tagLastAssistant(p: string) {
    const last = transcript.value[transcript.value.length - 1] as TranscriptTurn & { phase?: string }
    if (last?.role === 'assistant') last.phase = p
  }

  async function finalize() {
    stage.value = 'synthesis'
    if (USE_MOCK) {
      draft.value = MOCK_DRAFT
      return
    }
    const res = await onboardingFinalize(transcript.value)
    draft.value = res.draft_context
  }

  // Persiste le profil corrigé. Le serveur re-valide Tier-1 + merge (on fait confiance au merge).
  async function confirm(edited: Record<string, unknown>) {
    sending.value = true
    error.value = null
    try {
      if (!USE_MOCK) await onboardingConfirm(edited)
      stage.value = 'done'
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Échec de l’enregistrement'
    } finally {
      sending.value = false
    }
  }

  // ── Mode mock (dev sans backend) : script linéaire pour itérer l'UI ──────────
  async function mockTurn(requestPhase: string) {
    const idx = PHASE_ORDER.indexOf(requestPhase as never)
    const opening = transcript.value.length === 0
    transcript.value.push({
      role: 'assistant',
      content: opening
        ? 'Bonjour. Pour composer votre veille, racontez-moi simplement sur quoi vous travaillez en ce moment.'
        : MOCK_REPLIES[idx] ?? 'Merci, c’est noté.',
    } as TranscriptTurn)
    tagLastAssistant(requestPhase)
    if (opening) domain.value = 'tech'
    // Avance d'une phase à chaque tour utilisateur (sauf l'amorce).
    phase.value = opening ? 'P0' : (PHASE_ORDER[idx + 1] ?? 'done')
  }

  return {
    transcript, phase, domain, stage, draft, sending, error,
    phaseIndex, progress,
    start, send, finalize, confirm,
  }
})

const MOCK_REPLIES = [
  'Très bien. Quel est votre rôle, et dans quelle organisation ?',
  'Avec quels outils et référentiels travaillez-vous au quotidien ?',
  'Sur quels axes voulez-vous être tenu informé, et à quelle fréquence ?',
  'Quel type de signal cherchez-vous — et qu’est-ce que vous ne voulez surtout pas lire ?',
  'Dans quel contexte écoutez-vous votre briefing, et quelle voix préférez-vous ?',
  'Voici la synthèse de votre profil — relisez et corrigez si besoin.',
]

const MOCK_DRAFT: Record<string, unknown> = {
  domaine: 'tech',
  profil: { role: 'Tech lead', trajectoire: 'IC senior → encadrement' },
  axes_de_veille: {
    axe_1: 'gouvernance & souveraineté des données',
    axe_2: 'ingénierie data & plateformes',
  },
  frequence_par_axe: { axe_1: 'quotidien', axe_2: 'hebdomadaire' },
  axes_de_lecture: { signal_recherche: 'décisions structurantes', ce_que_je_refuse: 'hype produit' },
  tts: { voice: 'nova' },
}
