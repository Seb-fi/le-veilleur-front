<script setup lang="ts">
import BrandMark from './BrandMark.vue'
import NavItem from './NavItem.vue'
import AccountMenu from './AccountMenu.vue'
</script>

<template>
  <aside class="sidebar">
    <BrandMark />

    <nav class="sidebar__nav">
      <div class="nav-group">
        <NavItem to="/briefing" :dot="true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="12" r="3.5"/>
              <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4"/>
            </svg>
          </template>
          Briefing
        </NavItem>

        <div class="nav-label">Explorer</div>

        <NavItem to="/explorer/articles" :sub="true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M5 4h11l3 3v13H5z"/>
              <path d="M16 4v3h3M8 11h8M8 14h8M8 17h5"/>
            </svg>
          </template>
          Articles
        </NavItem>

        <NavItem to="/explorer/sujets" :sub="true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="6" cy="7" r="1.2"/><circle cx="12" cy="5" r="1.2"/>
              <circle cx="18" cy="10" r="1.2"/><circle cx="9" cy="14" r="1.2"/>
              <circle cx="15" cy="18" r="1.2"/>
              <path d="M6 7l6-2 6 5-3 4-6 4-3-7" stroke-dasharray="1 2"/>
            </svg>
          </template>
          Sujets
        </NavItem>

        <NavItem to="/explorer/carto" :sub="true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="12" r="2.5"/>
              <circle cx="5" cy="6" r="1.5"/><circle cx="19" cy="6" r="1.5"/>
              <circle cx="5" cy="18" r="1.5"/><circle cx="19" cy="18" r="1.5"/>
              <path d="M12 12L5 6M12 12l7-6M12 12l-7 6M12 12l7 6"/>
            </svg>
          </template>
          Cartographie
        </NavItem>
      </div>

      <NavItem to="/memoire" class="nav-memoire">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="2.5"/>
            <circle cx="12" cy="12" r="6.5" opacity=".55"/>
            <circle cx="12" cy="12" r="10.5" opacity=".28"/>
          </svg>
        </template>
        Mémoire
      </NavItem>

      <NavItem to="/profil">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="8.5" r="3.5"/>
            <path d="M5 20c1-4 4.5-5.5 7-5.5S18 16 19 20"/>
          </svg>
        </template>
        Profil
      </NavItem>
    </nav>

    <AccountMenu
      name="Camille Vasseur"
      email="camille@vasseur.co"
      initials="CV"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 248px;
  flex: none;
  background: var(--color-bg);
  border-right: var(--border-rule);
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 20px;
  z-index: 5;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-label {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  padding: 18px 10px 8px;
  font-weight: var(--weight-medium);
}

.nav-memoire {
  margin-top: 6px;
}
</style>
