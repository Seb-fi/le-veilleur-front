<script setup lang="ts">
defineEmits<{ 'dismiss': [] }>()
</script>

<template>
  <div class="piste-whisper">
    <div class="pw-mark">Système</div>
    <div class="pw-body">
      Le système relie <em>5 lectures</em> de cette piste à
      <a href="#">Politiques d'approbation graduées</a>,
      un signal qui émerge ailleurs dans votre veille.
      Lien purement sémantique — il n'organise pas votre espace.
      <button class="pw-dismiss" @click="$emit('dismiss')">Ignorer</button>
    </div>
  </div>
</template>

<style scoped>
.piste-whisper {
  margin-top: 40px;
  padding: 18px 22px;
  background: var(--color-bg-2);
  border-radius: 3px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px dashed var(--color-rule);
}

.pw-mark {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  font-weight: var(--weight-medium);
  flex: none;
  padding-top: 3px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.pw-body {
  flex: 1;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--color-ink-3);
  text-wrap: pretty;
}

.pw-body a {
  color: var(--color-indigo);
  font-style: normal;
  text-decoration: underline;
  text-decoration-color: oklch(38% 0.09 265 / 0.35);
  text-underline-offset: 3px;
  font-weight: var(--weight-medium);
  transition: text-decoration-color var(--motion-quick) var(--ease-out);
}

.pw-body a:hover { text-decoration-color: var(--color-indigo); }

.pw-dismiss {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 3px;
  margin-left: 6px;
  font-weight: var(--weight-medium);
  background: none;
  border: none;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.pw-dismiss:hover { background: var(--color-paper); color: var(--color-ink-2); }
</style>
