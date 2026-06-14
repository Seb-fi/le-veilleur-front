<script setup lang="ts">
/**
 * ActionPopover.vue
 *
 * Popover contextuel — affiche un set d'actions ou un picker
 * selon le contexte ouvert dans usePopover().
 *
 * Le parent contrôle l'ouverture via usePopover().open(…).
 * Ici on rend uniquement la coque et le bon contenu selon
 * `context.type`.
 */

import { computed } from "vue";
import type { PopoverApi } from "../composables/usePopover";
import type { Article, PisteId } from "../types";

const props = defineProps<{
  /** Instance de popover partagée avec le parent. */
  api: PopoverApi;
  /** Catalogue d'articles sauvegardés — pour le picker. */
  savedArticles: Article[];
  /** Label d'une piste — pour l'affichage. */
  pisteLabel: (id: PisteId) => string;
}>();

const emit = defineEmits<{
  /** Action "Créer une note" sur une entité. */
  (e: "create-note", ctx: { kind: "article" | "event"; entityId: string; label: string }): void;
  /** Action "Éditer la note". */
  (e: "edit-note",   ctx: { noteId: string; label: string }): void;
  /** Action "Épingler / désépingler" une note. */
  (e: "toggle-pin",  ctx: { noteId: string }): void;
  /** Création d'une piste à partir d'un clic dans le vide. */
  (e: "create-piste", payload: { name: string; svgPoint: { x: number; y: number } }): void;
  /** Sélection d'un article dans le picker. */
  (e: "pick-article", payload: { articleId: string; pisteId: PisteId }): void;
}>();

const ctx = computed(() => props.api.context.value);
const isPicker = computed(() => ctx.value?.type === "picker");

// -- empty canvas: input controllé localement
const newName = ref("");
const onConfirmPiste = () => {
  if (ctx.value?.type !== "empty") return;
  emit("create-piste", {
    name: newName.value.trim() || "Nouvelle piste",
    svgPoint: ctx.value.svgPoint,
  });
  newName.value = "";
  props.api.close();
};

// -- picker
const search = ref("");
const filteredArticles = computed(() => {
  if (!isPicker.value) return [];
  const q = search.value.trim().toLowerCase();
  return props.savedArticles.filter(a =>
    !q || a.title.toLowerCase().includes(q) || a.source.toLowerCase().includes(q),
  );
});
</script>

<template>
  <div
    ref="api.elRef"
    class="v-popover"
    :class="{ 'v-popover--picker': isPicker, 'is-open': api.isOpen.value }"
    role="dialog"
    :style="{ left: api.position.value.x + 'px', top: api.position.value.y + 'px' }"
  >
    <!-- ============ Entity (article / event) ============ -->
    <template v-if="ctx?.type === 'entity'">
      <div class="v-popover__head">
        <span>{{ ctx.entityKind === "event" ? "Évènement" : "Article" }}</span>
        <span class="ctx">{{ ctx.label }}</span>
      </div>
      <button
        class="v-popover__item v-popover__item--primary"
        @click="emit('create-note', { kind: ctx.entityKind, entityId: ctx.entityId, label: ctx.label }); api.close()"
      >
        <svg class="v-popover__item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>
        Créer une note
      </button>
      <button class="v-popover__item" @click="api.close()">
        <svg class="v-popover__item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
        Ouvrir
      </button>
    </template>

    <!-- ============ Note ============ -->
    <template v-else-if="ctx?.type === 'note'">
      <div class="v-popover__head">
        <span>Note</span>
        <span class="ctx">{{ ctx.label }}</span>
      </div>
      <button
        class="v-popover__item v-popover__item--primary"
        @click="emit('edit-note', { noteId: ctx.noteId, label: ctx.label }); api.close()"
      >
        <svg class="v-popover__item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z"/></svg>
        Éditer
      </button>
      <button
        class="v-popover__item v-popover__item--pinned"
        @click="emit('toggle-pin', { noteId: ctx.noteId }); api.close()"
      >
        <svg class="v-popover__item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v15M9 7l3-5 3 5M8 22h8"/></svg>
        Épingler
      </button>
    </template>

    <!-- ============ Empty canvas — créer une piste ============ -->
    <template v-else-if="ctx?.type === 'empty'">
      <div class="v-popover__head"><span>Nouveau · espace vide</span></div>
      <div class="v-popover__input-row">
        <input
          v-model="newName"
          type="text"
          placeholder="Nom de la nouvelle piste…"
          maxlength="60"
          @keydown.enter.prevent="onConfirmPiste"
        />
        <button class="v-btn v-btn--primary" @click="onConfirmPiste">Créer</button>
      </div>
      <div class="v-popover__foot">
        Une piste est un fil que vous décidez de suivre. <kbd>Esc</kbd> pour annuler.
      </div>
    </template>

    <!-- ============ Picker — ajouter un article à une piste ============ -->
    <template v-else-if="ctx?.type === 'picker'">
      <div class="v-popover__head">
        <span>Ajouter à</span>
        <span class="ctx">{{ pisteLabel(ctx.pisteId) }}</span>
      </div>
      <div class="v-popover__search">
        <input v-model="search" type="text" placeholder="Filtrer parmi vos articles sauvegardés…" />
      </div>
      <div class="v-popover__list">
        <button
          v-for="a in filteredArticles"
          :key="a.id"
          class="v-popover__list-item"
          :disabled="a.pisteIds.includes(ctx.pisteId)"
          :class="{ 'v-popover__list-item--disabled': a.pisteIds.includes(ctx.pisteId) }"
          @click="emit('pick-article', { articleId: a.id, pisteId: ctx.pisteId }); api.close()"
        >
          <span class="v-popover__list-item__title">{{ a.title }}</span>
          <span class="v-popover__list-item__meta">
            <b>{{ a.source }}</b>
            <span>{{ a.publishedAt }}</span>
          </span>
        </button>
      </div>
      <div class="v-popover__foot">
        Choisissez un article. <kbd>Esc</kbd> pour fermer.
      </div>
    </template>
  </div>
</template>
