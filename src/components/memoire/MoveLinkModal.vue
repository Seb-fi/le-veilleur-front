<script setup lang="ts">
import type { PendingDrop } from '../../composables/useArticleDnD'

defineProps<{
  visible: boolean
  pendingDrop: PendingDrop | null
}>()

const emit = defineEmits<{
  'close': []
  'decide': [action: 'move' | 'link']
}>()
</script>

<template>
  <div
    class="dd-modal-overlay"
    :class="{ show: visible && pendingDrop }"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div v-if="pendingDrop" class="dd-modal">
      <div class="dd-modal-head">
        <div class="ddm-eyebrow">Cet article est déjà dans une piste</div>
        <h3>Que faire en l'ajoutant à <em>{{ pendingDrop.targetLabel }}</em> ?</h3>
        <p>
          Il appartient à <b>{{ pendingDrop.sourcePisteId ? "la piste d’origine" : 'vos favoris' }}</b>.
          Choisissez comment le rattacher.
        </p>
      </div>
      <div class="dd-modal-body">
        <button class="dd-choice" @click="emit('decide', 'move')">
          <span class="ddc-label">Le déplacer</span>
          <span class="ddc-title">Retirer de la piste d'origine et l'ajouter ici</span>
          <span class="ddc-sub">Il ne figurera plus que dans la piste cible.</span>
        </button>
        <button class="dd-choice" @click="emit('decide', 'link')">
          <span class="ddc-label">Le lier aux deux pistes</span>
          <span class="ddc-title">Le garder dans la piste d'origine et l'ajouter aussi ici</span>
          <span class="ddc-sub">Il restera relié aux deux pistes. Utile quand l'article éclaire plusieurs fils.</span>
        </button>
      </div>
      <div class="dd-modal-foot">
        <button @click="emit('close')">Annuler</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dd-modal-overlay {
  position: absolute;
  inset: 0;
  background: oklch(0% 0 0 / .42);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 30;
  animation: overlayIn .15s ease;
}

.dd-modal-overlay.show { display: flex; }

@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.dd-modal {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 6px;
  width: 480px;
  max-width: calc(100% - 32px);
  box-shadow: 0 24px 64px oklch(0% 0 0 / .28), 0 4px 12px oklch(0% 0 0 / .1);
  overflow: hidden;
  animation: modalIn .2s cubic-bezier(.2,.7,.3,1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(12px) scale(.97); }
  to   { opacity: 1; transform: none; }
}

.dd-modal-head {
  padding: 22px 24px 16px;
  border-bottom: 1px solid var(--color-rule-2);
}

.ddm-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-bottom: 10px;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
}

.ddm-eyebrow::before {
  content: "";
  width: 14px;
  height: 1px;
  background: var(--color-ink-4);
}

.dd-modal-head h3 {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: var(--weight-medium);
  letter-spacing: -.014em;
  line-height: 1.2;
  color: var(--color-ink);
  margin: 0;
  text-wrap: pretty;
}

.dd-modal-head h3 em {
  font-style: italic;
  color: var(--color-indigo);
  font-weight: 400;
}

.dd-modal-head p {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--color-ink-3);
  margin-top: 10px;
  text-wrap: pretty;
}

.dd-modal-head p b {
  font-style: normal;
  font-weight: var(--weight-medium);
  color: var(--color-ink-2);
}

.dd-modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dd-choice {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  text-align: left;
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  width: 100%;
}

.dd-choice:hover {
  border-color: var(--color-indigo);
  background: var(--color-paper);
}

.ddc-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--color-indigo);
  font-weight: var(--weight-medium);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ddc-label::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-indigo);
}

.ddc-title {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: var(--weight-medium);
  letter-spacing: -.008em;
  color: var(--color-ink);
  line-height: 1.25;
  text-wrap: pretty;
  transition: color .15s;
}

.dd-choice:hover .ddc-title { color: var(--color-indigo); }

.ddc-sub {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-ink-3);
  text-wrap: pretty;
}

.dd-modal-foot {
  padding: 14px 24px 18px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--color-rule-2);
}

.dd-modal-foot button {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--weight-medium);
  padding: 9px 16px;
  border-radius: 4px;
  color: var(--color-ink-3);
  background: transparent;
  border: 1px solid var(--color-rule);
  cursor: pointer;
  transition: color var(--motion-quick) var(--ease-out), border-color var(--motion-quick) var(--ease-out);
}

.dd-modal-foot button:hover {
  color: var(--color-ink);
  border-color: var(--color-ink-3);
}
</style>
