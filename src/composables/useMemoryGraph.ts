import { ref } from 'vue'

export function useMemoryGraph() {
  const expandedIds = ref<Set<string>>(new Set())
  const focusedId   = ref<string | null>(null)
  const readoutShow = ref(false)

  function toggleCluster(id: string) {
    const willExpand = !expandedIds.value.has(id)
    if (willExpand) {
      expandedIds.value = new Set([...expandedIds.value, id])
      focusedId.value   = id
      readoutShow.value = true
    } else {
      expandedIds.value = new Set([...expandedIds.value].filter(x => x !== id))
      if (focusedId.value === id) {
        readoutShow.value = false
        focusedId.value   = null
      }
    }
  }

  function collapseAll() {
    expandedIds.value = new Set()
    focusedId.value   = null
    readoutShow.value = false
  }

  function peekReadout(id: string) {
    if (!expandedIds.value.has(id) && !readoutShow.value) {
      focusedId.value   = id
      readoutShow.value = true
    }
  }

  function unpeekReadout(id: string) {
    if (!expandedIds.value.has(id) && focusedId.value === id) {
      const anyExpanded = expandedIds.value.size > 0
      if (!anyExpanded) {
        readoutShow.value = false
        focusedId.value   = null
      }
    }
  }

  function isExpanded(id: string) {
    return expandedIds.value.has(id)
  }

  return {
    expandedIds, focusedId, readoutShow,
    toggleCluster, collapseAll, peekReadout, unpeekReadout, isExpanded,
  }
}
