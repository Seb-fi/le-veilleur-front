import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchUserContext,
  fetchSettings,
  patchSettings,
  downloadSettings,
  type UserContext,
  type Settings,
  type SettingsPatch,
} from '../api/settings'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_CONTEXT: UserContext = {
  domaine: 'investissement deeptech AI',
  profil: { role: 'Investisseur', trajectoire: 'thèse agents LLM en production' },
  axes_de_veille: {
    'Pro · Boulot': 'agents en production, MCP, gouvernance d’exécution',
    'Pro · Dev': 'outillage d’exécution des agents',
    'Pro · Data': 'gouvernance des données',
    'Signaux faibles': 'compute hétérogène (Cerebras, Groq)',
  },
  frequence_par_axe: { 'Pro · Boulot': 'quotidien', 'Pro · Dev': 'hebdomadaire' },
  axes_de_lecture: {
    signal_recherche: 'décisions d’allocation, pas de tutoriels',
    niveau_abstraction: 'stratégique',
    ce_que_je_refuse: 'communication produit / marketing',
  },
  tracked_entities: {
    sujets: ['MCP Protocol', 'Agents LLM', 'Gouvernance IA', 'Inference hardware', 'AlphaEvolve'],
  },
  tts: { voice: 'nova' },
}

const MOCK_SETTINGS: Settings = { voice: 'nova', max_articles: 8, schedule_time: '06:14' }

export const useProfileStore = defineStore('profile', () => {
  const context = ref<UserContext | null>(null)
  const settings = ref<Settings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function load() {
    if (context.value && settings.value) return
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        context.value = MOCK_CONTEXT
        settings.value = MOCK_SETTINGS
      } else {
        const [ctx, set] = await Promise.all([fetchUserContext(), fetchSettings()])
        context.value = ctx
        settings.value = set
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement du profil'
    } finally {
      loading.value = false
    }
  }

  async function saveSettings(patch: SettingsPatch) {
    saving.value = true
    error.value = null
    try {
      settings.value = USE_MOCK
        ? { ...(settings.value as Settings), ...patch } as Settings
        : await patchSettings(patch)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Échec de l’enregistrement'
    } finally {
      saving.value = false
    }
  }

  async function downloadProfile() {
    if (USE_MOCK) return
    const blob = await downloadSettings()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_context.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return { context, settings, loading, error, saving, load, saveSettings, downloadProfile }
})
