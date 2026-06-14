import { ref } from 'vue'

export interface PendingDrop {
  articleId:     string
  articleLabel:  string
  sourcePisteId: string | null
  targetPisteId: string
  targetLabel:   string
}

export function useArticleDnD() {
  const draggingId    = ref<string | null>(null)
  const dropTargetId  = ref<string | null>(null)
  const pendingDrop   = ref<PendingDrop | null>(null)
  const modalVisible  = ref(false)
  const ghostPos      = ref<{ x: number; y: number } | null>(null)
  const ghostLabel    = ref('')

  function startDrag(articleId: string, label: string, x: number, y: number) {
    draggingId.value = articleId
    ghostLabel.value = label
    ghostPos.value   = { x, y }
  }

  function moveGhost(x: number, y: number) {
    ghostPos.value = { x, y }
  }

  function endDrag() {
    draggingId.value   = null
    dropTargetId.value = null
    ghostPos.value     = null
  }

  function setDropTarget(pisteId: string) {
    dropTargetId.value = pisteId
  }

  function clearDropTarget() {
    dropTargetId.value = null
  }

  function openModal(drop: PendingDrop) {
    pendingDrop.value  = drop
    modalVisible.value = true
  }

  function closeModal() {
    modalVisible.value = false
    pendingDrop.value  = null
  }

  return {
    draggingId, dropTargetId, pendingDrop, modalVisible, ghostPos, ghostLabel,
    startDrag, moveGhost, endDrag, setDropTarget, clearDropTarget, openModal, closeModal,
  }
}
