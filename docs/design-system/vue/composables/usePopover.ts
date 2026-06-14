/**
 * Le Veilleur — Design System
 * vue/composables/usePopover.ts
 *
 * Popover contextuel — un seul popover ouvert à la fois.
 * Gère :
 *  - ouverture programmatique avec position + contexte
 *  - fermeture par clic extérieur + Esc
 *  - repositionnement automatique si overflow
 *
 * Le contenu (boutons, items) est rendu par le composant
 * consommateur via slot — ce composable ne gère QUE l'état.
 */

import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import type { PopoverContext, PopoverPosition } from "../types";

interface OpenOptions {
  /** Position en pixels (relative au viewport). */
  position: PopoverPosition;
  /** Contexte fonctionnel : sert à savoir ce qu'on affiche. */
  context: PopoverContext;
  /** Décalage par rapport au point cliqué. Default {x:8,y:8}. */
  offset?: { x: number; y: number };
  /** Élément qui contient le popover (pour le calcul d'overflow). */
  bounds?: HTMLElement | null;
}

export function usePopover() {
  const isOpen = ref(false);
  const context = ref<PopoverContext | null>(null);
  const position = ref<PopoverPosition>({ x: 0, y: 0 });
  const elRef = ref<HTMLElement | null>(null);

  // -------------------------------------------------------------
  // Open / close
  // -------------------------------------------------------------
  async function open(options: OpenOptions) {
    context.value = options.context;
    position.value = {
      x: options.position.x + (options.offset?.x ?? 8),
      y: options.position.y + (options.offset?.y ?? 8),
    };
    isOpen.value = true;
    await nextTick();
    adjustForOverflow(options.bounds);
    focusFirstInput();
  }

  function close() {
    isOpen.value = false;
    context.value = null;
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  function adjustForOverflow(bounds?: HTMLElement | null) {
    const el = elRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const containerRect = (bounds ?? document.body).getBoundingClientRect();

    if (rect.right > containerRect.right - 8) {
      position.value.x = Math.max(8, containerRect.right - rect.width - 8);
    }
    if (rect.bottom > containerRect.bottom - 8) {
      position.value.y = Math.max(8, position.value.y - rect.height - 16);
    }
  }

  function focusFirstInput() {
    elRef.value?.querySelector<HTMLInputElement>("input")?.focus();
  }

  // -------------------------------------------------------------
  // Outside click & Esc
  // -------------------------------------------------------------
  function onDocumentClick(e: MouseEvent) {
    if (!isOpen.value) return;
    const el = elRef.value;
    if (el && !el.contains(e.target as Node)) close();
  }
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isOpen.value) close();
  }

  onMounted(() => {
    document.addEventListener("click",   onDocumentClick, true);
    document.addEventListener("keydown", onKeydown);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("click",   onDocumentClick, true);
    document.removeEventListener("keydown", onKeydown);
  });

  return { isOpen, context, position, elRef, open, close };
}

export type PopoverApi = ReturnType<typeof usePopover>;
