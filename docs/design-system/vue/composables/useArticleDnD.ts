/**
 * Le Veilleur — Design System
 * vue/composables/useArticleDnD.ts
 *
 * Drag & drop d'un nœud article vers une piste différente.
 * Au drop, lève un évènement qui doit déclencher l'ouverture
 * de la modal "Déplacer / Lier".
 *
 * Le composable est volontairement bas-niveau : il gère
 * uniquement les pointer events et la détection de drop target.
 * La résolution (move vs link) est faite par le consommateur.
 */

import { ref, onMounted, onBeforeUnmount } from "vue";
import type { ArticleId, PisteId, PendingDrop } from "../types";

interface DragState {
  articleId: ArticleId;
  sourcePisteId: PisteId | null;
  startX: number;
  startY: number;
  /** A bougé > seuil et est donc considéré comme drag (pas click). */
  moved: boolean;
  /** Cible courante sous le curseur. */
  dropTarget: { pisteId: PisteId; allowed: boolean } | null;
  /** Données d'affichage pour le ghost. */
  ghost: { label: string };
}

interface UseArticleDnDInput {
  /** Distance avant de considérer "drag" et pas "click". */
  threshold?: number;
  /**
   * Renvoie l'élément piste sous une position écran et indique
   * si le drop y est autorisé. Implémenté par l'app (connaît la
   * géométrie SVG + le modèle).
   */
  resolveTargetAt: (screen: { x: number; y: number }) => {
    pisteId: PisteId;
    allowed: boolean;
  } | null;
  /** Appelé quand un drop valide se produit. */
  onDrop: (decision: PendingDrop) => void;
}

export function useArticleDnD(input: UseArticleDnDInput) {
  const threshold = input.threshold ?? 6;
  const state = ref<DragState | null>(null);
  const ghostEl = ref<HTMLElement | null>(null);

  // -------------------------------------------------------------
  // Public — appeler depuis @pointerdown sur le nœud article
  // -------------------------------------------------------------
  function beginDrag(
    e: PointerEvent,
    payload: {
      articleId: ArticleId;
      sourcePisteId: PisteId | null;
      label: string;
    },
  ) {
    if (e.button !== 0 && e.button !== undefined) return;
    state.value = {
      articleId: payload.articleId,
      sourcePisteId: payload.sourcePisteId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      dropTarget: null,
      ghost: { label: payload.label },
    };
  }

  // -------------------------------------------------------------
  // Global pointer handlers
  // -------------------------------------------------------------
  function onMove(e: PointerEvent) {
    const s = state.value;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.moved && Math.hypot(dx, dy) > threshold) {
      s.moved = true;
      // ghost vient d'apparaître — laissé à l'UI de l'animer
    }
    if (s.moved) {
      positionGhost(e.clientX, e.clientY);
      s.dropTarget = input.resolveTargetAt({ x: e.clientX, y: e.clientY });
    }
  }

  function onUp() {
    const s = state.value;
    state.value = null;
    if (!s) return;
    if (s.moved && s.dropTarget && s.dropTarget.allowed) {
      input.onDrop({
        articleId: s.articleId,
        sourcePisteId: s.sourcePisteId,
        targetPisteId: s.dropTarget.pisteId,
      });
    }
  }

  // -------------------------------------------------------------
  // Ghost positioning — délégué à l'UI mais helper exposé
  // -------------------------------------------------------------
  function positionGhost(clientX: number, clientY: number) {
    const el = ghostEl.value;
    if (!el) return;
    const parent = el.offsetParent as HTMLElement | null;
    const rect = parent?.getBoundingClientRect();
    el.style.left = `${clientX - (rect?.left ?? 0) + 14}px`;
    el.style.top  = `${clientY - (rect?.top  ?? 0) + 14}px`;
  }

  onMounted(() => {
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup",   onUp);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup",   onUp);
  });

  return {
    /** État réactif courant du drag (null si rien en cours). */
    state,
    /** Bind ref sur l'élément ghost dans le template. */
    ghostEl,
    /** Lance un drag depuis le @pointerdown du composant article. */
    beginDrag,
  };
}

export type ArticleDnDApi = ReturnType<typeof useArticleDnD>;
