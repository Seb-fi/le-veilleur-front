<script setup lang="ts">
/**
 * MoveLinkModal.vue
 *
 * Modal de décision quand l'utilisateur dépose un article sur une
 * piste qui n'est pas sa piste d'origine.
 *
 * Formulations clés (validées) :
 *   - "Le retirer de « source »"     → action `move`
 *   - "Le garder dans « source »
 *      et le relier aussi à « cible »" → action `link`
 *
 * Le copywriting est la plus grosse contribution de ce composant —
 * éviter les "déplacer/copier" qui ne disent rien à l'utilisateur.
 */

import { computed } from "vue";
import type { DropDecision, PendingDrop } from "../types";

const props = defineProps<{
  /** Présence d'un drop en attente = modal ouverte. */
  pending: PendingDrop | null;
  /** Label d'une piste — fourni par le parent. */
  pisteLabel: (id: string | null) => string;
}>();

const emit = defineEmits<{
  (e: "decide", decision: DropDecision, pending: PendingDrop): void;
}>();

const sourceName = computed(() => props.pisteLabel(props.pending?.sourcePisteId ?? null));
const targetName = computed(() => props.pisteLabel(props.pending?.targetPisteId ?? null));

function decide(d: DropDecision) {
  if (props.pending) emit("decide", d, props.pending);
}
</script>

<template>
  <div
    v-if="pending"
    class="v-modal-overlay is-open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="ddTitle"
    @click.self="decide('cancel')"
  >
    <div class="v-modal">
      <header class="v-modal__head">
        <div class="v-modal__eyebrow">Cet article est déjà dans une piste</div>
        <h3 id="ddTitle" class="v-modal__title">
          Que faire en l'ajoutant à <em>{{ targetName }}</em> ?
        </h3>
        <p class="v-modal__lead">
          Il appartient à <b>{{ sourceName }}</b>. Choisissez comment le rattacher à
          <b>{{ targetName }}</b>.
        </p>
      </header>

      <div class="v-modal__body">
        <button class="v-choice" @click="decide('move')">
          <span class="v-choice__label">Le déplacer</span>
          <span class="v-choice__title">Le retirer de «&nbsp;{{ sourceName }}&nbsp;»</span>
          <span class="v-choice__sub">Il ne figurera plus que dans «&nbsp;{{ targetName }}&nbsp;».</span>
        </button>

        <button class="v-choice" @click="decide('link')">
          <span class="v-choice__label">Le lier aux deux pistes</span>
          <span class="v-choice__title">
            Le garder dans «&nbsp;{{ sourceName }}&nbsp;» et le relier aussi à
            «&nbsp;{{ targetName }}&nbsp;»
          </span>
          <span class="v-choice__sub">
            Il restera relié aux deux pistes. Utile quand l'article éclaire plusieurs fils en même temps.
          </span>
        </button>
      </div>

      <footer class="v-modal__foot">
        <button class="v-btn-ghost" @click="decide('cancel')">Annuler</button>
      </footer>
    </div>
  </div>
</template>
