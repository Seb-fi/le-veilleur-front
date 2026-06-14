<script setup lang="ts">
/**
 * PisteCard.vue
 *
 * Élément cliquable dans l'index des pistes du rail gauche.
 * Composant pur : reçoit la piste, émet les évènements.
 */

import type { Piste } from "../types";

defineProps<{
  piste: Piste;
  /** Piste actuellement ouverte dans la colonne centrale. */
  open?: boolean;
}>();

defineEmits<{
  (e: "open", id: Piste["id"]): void;
}>();

function dotClass(piste: Piste): string {
  if (piste.status === "tension")  return "v-dot v-dot--rose";
  if (piste.status === "emerging") return "v-dot v-dot--moss";
  if (piste.status === "dormant")  return "v-dot";
  return piste.origin === "user" ? "v-dot v-dot--indigo" : "v-dot v-dot--amber";
}

function elapsedDays(iso: string): string {
  const d = Math.max(0, Math.floor((Date.now() - +new Date(iso)) / 86_400_000));
  return d < 1 ? "auj." : `${d}j`;
}
</script>

<template>
  <li
    class="v-piste-index__item"
    :class="{
      'v-piste-index__item--open': open,
      'v-piste-index__item--dormant': piste.status === 'dormant',
    }"
    @click="$emit('open', piste.id)"
  >
    <span :class="dotClass(piste)"></span>
    <span class="name">{{ piste.title }}</span>
    <span class="meta">{{ elapsedDays(piste.openedAt) }} · {{ piste.traceCount.toString().padStart(2, '0') }}</span>
  </li>
</template>
