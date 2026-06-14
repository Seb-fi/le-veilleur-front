<script setup lang="ts">
/**
 * StreamItem.vue
 *
 * Trace unique dans le stream chronologique d'une piste :
 * note, article ou évènement. Slot pour l'annotation utilisateur.
 */

import type { Trace } from "../types";

defineProps<{
  trace: Trace;
  /** Format compact "21 mai" + heure éventuelle. */
  dateLabel: { day: string; time?: string };
}>();
</script>

<template>
  <article class="v-stream-item" :class="`v-stream-item--${trace.kind}`">
    <div class="v-stream-item__date">
      <b>{{ dateLabel.day }}</b>
      <template v-if="dateLabel.time">{{ dateLabel.time }}</template>
    </div>

    <div class="v-stream-item__body">
      <div
        class="v-stream-item__kind"
        :class="`v-stream-item__kind--${trace.kind}`"
      >
        <template v-if="trace.kind === 'note'">Note</template>
        <template v-else-if="trace.kind === 'article'">Article sauvegardé</template>
        <template v-else>Évènement</template>
      </div>

      <!-- ============ Note inline (citation) ============ -->
      <p
        v-if="trace.kind === 'note'"
        class="v-note-inline"
      >{{ trace.body }}</p>

      <!-- ============ Article ============ -->
      <template v-else-if="trace.kind === 'article'">
        <h4 class="v-stream-item__title">{{ trace.title }}</h4>
        <div class="v-stream-item__src">
          <b>{{ trace.source }}</b>
          <span class="sep"></span>
          <span>{{ trace.publishedAt }}</span>
        </div>
        <div v-if="trace.userNote" class="v-annotation">
          <span class="v-annotation__label">votre note</span>
          {{ trace.userNote }}
        </div>
      </template>

      <!-- ============ Event ============ -->
      <template v-else>
        <h4 class="v-stream-item__title">{{ trace.name }}</h4>
        <div class="v-stream-item__src">
          <b>{{ trace.source ?? "—" }}</b>
        </div>
        <slot name="annotation"></slot>
      </template>
    </div>
  </article>
</template>
