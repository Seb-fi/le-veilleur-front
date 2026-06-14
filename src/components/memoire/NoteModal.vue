<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  open: boolean
  context: string
  initialBody: string
}>()

const emit = defineEmits<{
  'close': []
  'save': [body: string]
}>()

const textBody = ref(props.initialBody)

watch(() => props.open, (val) => {
  if (val) textBody.value = props.initialBody
})

watch(() => props.initialBody, (val) => {
  textBody.value = val
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="modal-overlay"
      :class="{ show: open }"
      role="dialog"
      aria-modal="true"
      @click="handleOverlayClick"
    >
      <div class="modal">
        <div class="modal-head">
          <div class="modal-context">
            <span class="ctx-label">Note sur</span>{{ context }}
          </div>
          <button class="modal-close" aria-label="Fermer" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <textarea
          v-model="textBody"
          class="modal-body"
          placeholder="Votre note… (Markdown supporté)"
          autofocus
        />

        <div class="modal-foot">
          <button class="btn-ghost" @click="emit('close')">Annuler</button>
          <button
            class="btn-ghost"
            @click="emit('save', textBody); emit('close')"
          >
            Épingler
          </button>
          <button class="btn-primary" @click="emit('save', textBody)">Sauvegarder</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: oklch(0% 0 0 / 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  animation: overlayIn 0.18s ease;
}

.modal-overlay.show { display: flex; }

@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 6px;
  width: min(520px, calc(100vw - 48px));
  box-shadow: 0 30px 80px oklch(0% 0 0 / 0.25), 0 4px 12px oklch(0% 0 0 / 0.08);
  animation: modalIn 0.22s cubic-bezier(0.2, 0.7, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.97) translateY(4px); }
  to   { opacity: 1; transform: none; }
}

.modal-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--color-rule-2);
}

.modal-context {
  flex: 1;
  min-width: 0;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 15px;
  color: var(--color-ink-2);
  line-height: 1.35;
  letter-spacing: -0.005em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ctx-label {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-right: 8px;
  font-weight: var(--weight-medium);
}

.modal-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--color-ink-3);
  display: grid;
  place-items: center;
  flex: none;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
  background: none;
  border: none;
  cursor: pointer;
}

.modal-close:hover { background: var(--color-bg-2); color: var(--color-ink); }

.modal-close svg { width: 14px; height: 14px; }

.modal-body {
  display: block;
  width: calc(100% - 44px);
  margin: 18px 22px;
  min-height: 160px;
  max-height: 40vh;
  padding: 14px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-ink);
  outline: none;
  resize: vertical;
  transition: border-color var(--motion-quick) var(--ease-out);
}

.modal-body:focus { border-color: var(--color-ink-3); }

.modal-body::placeholder { color: var(--color-ink-4); font-style: italic; }

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px 18px;
  border-top: 1px solid var(--color-rule-2);
}

.btn-ghost, .btn-primary {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--weight-medium);
  padding: 9px 16px;
  border-radius: 5px;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out),
              border-color var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.btn-ghost {
  border: 1px solid var(--color-rule);
  color: var(--color-ink-2);
  background: transparent;
}

.btn-ghost:hover { border-color: var(--color-ink-3); color: var(--color-ink); }

.btn-primary {
  background: var(--color-ink);
  color: var(--color-bg);
  border: 1px solid var(--color-ink);
}

.btn-primary:hover { background: var(--color-indigo); border-color: var(--color-indigo); }
</style>
