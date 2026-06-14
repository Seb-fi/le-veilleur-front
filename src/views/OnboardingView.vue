<script setup lang="ts">
// Onboarding conversationnel (PRD onboarding) : entretien guidé P0→P6, puis écran
// de synthèse éditable → persistance. Le front porte l'état (API stateless).
import { onMounted, ref, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore, PHASE_ORDER } from '../stores/useOnboardingStore'

const store = useOnboardingStore()
const router = useRouter()

const input = ref('')
const scroller = ref<HTMLElement | null>(null)

// Brouillon éditable : on sérialise le draft pour correction libre, reparse au confirm.
const draftText = ref('')
const draftError = ref<string | null>(null)

onMounted(() => store.start())

watch(
  () => store.transcript.length,
  async () => {
    await nextTick()
    scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
  },
)

watch(
  () => store.draft,
  (d) => {
    if (d) draftText.value = JSON.stringify(d, null, 2)
  },
)

function submit() {
  const text = input.value
  input.value = ''
  store.send(text)
}

const phaseLabels = computed(() => PHASE_ORDER)

async function confirmProfile() {
  draftError.value = null
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(draftText.value)
  } catch {
    draftError.value = 'Le profil corrigé n’est pas valide. Vérifiez la structure.'
    return
  }
  await store.confirm(parsed)
  if (store.stage === 'done') router.push('/briefing')
}
</script>

<template>
  <div class="onb">
    <header class="onb-head">
      <p class="onb-eyebrow">Configuration de votre veille</p>
      <div class="onb-phases" aria-hidden="true">
        <span
          v-for="(p, i) in phaseLabels"
          :key="p"
          class="onb-phase"
          :class="{ 'onb-phase--done': i < store.phaseIndex || store.stage !== 'chat', 'onb-phase--now': i === store.phaseIndex && store.stage === 'chat' }"
        />
      </div>
    </header>

    <!-- Entretien -->
    <section v-if="store.stage === 'chat'" class="onb-chat">
      <div ref="scroller" class="onb-stream">
        <div
          v-for="(m, i) in store.transcript"
          :key="i"
          class="onb-msg"
          :class="`onb-msg--${m.role}`"
        >
          <p>{{ m.content }}</p>
        </div>
        <div v-if="store.sending" class="onb-msg onb-msg--assistant onb-typing">…</div>
      </div>

      <form class="onb-input" @submit.prevent="submit">
        <textarea
          v-model="input"
          class="onb-textarea"
          rows="2"
          placeholder="Votre réponse…"
          :disabled="store.sending"
          @keydown.enter.exact.prevent="submit"
        />
        <button class="onb-send" type="submit" :disabled="store.sending || !input.trim()">
          Envoyer
        </button>
      </form>
      <p v-if="store.error" class="onb-err">{{ store.error }}</p>
    </section>

    <!-- Synthèse éditable -->
    <section v-else-if="store.stage === 'synthesis'" class="onb-synth">
      <h1 class="onb-title">Voici le profil que j’ai compris</h1>
      <p class="onb-sub">Relisez, corrigez si besoin, puis validez. Vos réglages serveur (voix, format) sont préservés.</p>

      <textarea v-model="draftText" class="onb-draft" spellcheck="false" />
      <p v-if="draftError" class="onb-err">{{ draftError }}</p>

      <div class="onb-actions">
        <button class="onb-confirm" :disabled="store.sending" @click="confirmProfile">
          Valider mon profil
        </button>
      </div>
    </section>

    <!-- Confirmé -->
    <section v-else class="onb-confirmed">
      <h1 class="onb-title">C’est noté.</h1>
      <p class="onb-sub">Votre profil est enregistré. Votre premier briefing arrive.</p>
    </section>
  </div>
</template>

<style scoped>
.onb {
  max-width: 44rem;
  margin: 0 auto;
  padding: 3.5rem 2rem 4rem;
  position: relative;
  z-index: 1;
}
.onb-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}
.onb-phases { display: flex; gap: 6px; margin-top: 1rem; }
.onb-phase {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--color-rule);
  transition: background var(--motion-quick, 180ms) ease;
}
.onb-phase--done { background: var(--color-indigo); }
.onb-phase--now { background: var(--color-amber); }

.onb-chat { margin-top: 2rem; }
.onb-stream {
  max-height: 58vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-right: 0.5rem;
}
.onb-msg { max-width: 86%; }
.onb-msg p {
  font-size: 1.0625rem;
  line-height: 1.5;
  margin: 0;
}
.onb-msg--assistant {
  align-self: flex-start;
  font-family: var(--font-serif);
  color: var(--color-ink);
}
.onb-msg--user {
  align-self: flex-end;
  background: var(--color-indigo-tint);
  color: var(--color-ink);
  padding: 0.7rem 1rem;
  border-radius: 14px 14px 2px 14px;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
}
.onb-typing { opacity: 0.5; font-family: var(--font-serif); }

.onb-input {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  align-items: flex-end;
}
.onb-textarea {
  flex: 1;
  resize: none;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--color-rule);
  border-radius: 12px;
  background: var(--color-paper);
  color: var(--color-ink);
}
.onb-textarea:focus { outline: none; border-color: var(--color-indigo); }
.onb-send, .onb-confirm {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 12px;
  background: var(--color-indigo);
  color: var(--color-paper);
  cursor: pointer;
}
.onb-send:disabled, .onb-confirm:disabled { opacity: 0.45; cursor: default; }

.onb-synth { margin-top: 2rem; }
.onb-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--color-ink);
}
.onb-sub { font-family: var(--font-sans); color: var(--color-ink-3); margin: 0.5rem 0 1.5rem; }
.onb-draft {
  width: 100%;
  min-height: 22rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
  padding: 1rem;
  border: 1px solid var(--color-rule);
  border-radius: 12px;
  background: var(--color-paper);
  color: var(--color-ink-2);
  resize: vertical;
}
.onb-draft:focus { outline: none; border-color: var(--color-indigo); }
.onb-actions { margin-top: 1.5rem; }
.onb-err { color: var(--color-rose); font-family: var(--font-sans); font-size: 0.875rem; margin-top: 0.75rem; }
.onb-confirmed { margin-top: 4rem; text-align: center; }
</style>
