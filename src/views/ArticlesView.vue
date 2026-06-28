<script setup lang="ts">
import { onMounted } from 'vue'
import { useExplorerStore } from '../stores/useExplorerStore'
import FilterBar from '../components/explorer/FilterBar.vue'
import ArticleCard from '../components/explorer/ArticleCard.vue'

const store = useExplorerStore()
onMounted(() => store.loadArticles())
</script>

<template>
  <div class="articles-page">
    <FilterBar
      :axis-options="store.AXIS_OPTIONS"
      :sort-options="store.SORT_OPTIONS"
      :axis-filter="store.axisFilter"
      :sort-order="store.sortOrder"
      :search-query="store.searchQuery"
      @update:axis-filter="store.axisFilter = $event"
      @update:sort-order="store.sortOrder = $event"
      @update:search-query="store.searchQuery = $event"
    />

    <div v-if="store.articlesLoading" class="loading">
      <span>Chargement…</span>
    </div>

    <div v-else class="articles-content">
      <div class="article-list">
        <ArticleCard
          v-for="article in store.filteredArticles"
          :key="article.id"
          :article="article"
        />
        <div v-if="!store.filteredArticles.length" class="empty">
          Aucun article ne correspond à cette recherche.
        </div>
      </div>

      <div v-if="store.hasMore && store.filteredArticles.length" class="load-more">
        <button
          type="button"
          class="load-more-btn"
          :disabled="store.loadingMore"
          @click="store.loadMoreArticles()"
        >
          {{ store.loadingMore ? 'Chargement…' : 'Charger plus d’articles' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.articles-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-family: var(--font-mono);
  font-size: var(--type-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-4);
}

.articles-content {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px 80px;
  width: 100%;
}

.article-list {
  display: flex;
  flex-direction: column;
}

.empty {
  padding: 60px 0;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-ink-4);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 28px 0 8px;
}

.load-more-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-2);
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.load-more-btn:hover {
  background: var(--color-bg-2);
  color: var(--color-ink);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
