import { test, expect } from '@playwright/test'

// « Mon flux audio » (PRD « Flux podcast audio per-user »). Mode mock : le store
// expose une feed_url déterministe ; on stubbe l'API pour les appels réseau réels
// (en mode mock le store court-circuite le réseau, mais on intercepte par sécurité).

test.beforeEach(async ({ page }) => {
  await page.route('**/api/feed/me', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ feed_url: 'https://veille.example.eu/feed/mock-token-abc123.xml' }),
    }),
  )
  await page.route('**/api/feed/regenerate', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ feed_url: 'https://veille.example.eu/feed/rotated.xml' }),
    }),
  )
  // Permission presse-papier pour le test « Copier ».
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
})

test('la rubrique Mon flux audio s’affiche dans le profil', async ({ page }) => {
  await page.goto('/#/profil')
  await expect(page.getByText('Mon flux audio')).toBeVisible()
  await expect(page.getByRole('tab', { name: /Apple Podcasts/ })).toBeVisible()
})

test('flux actif (me renvoie une URL) → abonnement direct, « Régénérer » secondaire', async ({ page }) => {
  await page.goto('/#/profil')
  // L'URL réelle est affichée dans le champ copier-coller (rubrique d'abonnement visible).
  await expect(page.getByRole('textbox', { name: /URL de votre flux/ })).toHaveValue(/\/feed\//)
  await expect(page.getByRole('button', { name: 'Copier' })).toBeVisible()
  // « Régénérer » est une action SECONDAIRE explicite — JAMAIS le geste par défaut.
  await expect(page.getByRole('button', { name: 'Régénérer mon flux' })).toBeVisible()
  // Pas de gros bouton « Générer » trompeur quand un flux est déjà actif.
  await expect(page.getByRole('button', { name: /Générer mon flux/ })).toHaveCount(0)
  // Le bouton « Régénérer » ne déclenche RIEN sans confirmation explicite (pas de casse).
  await page.getByRole('button', { name: 'Régénérer mon flux' }).click()
  await expect(page.getByText(/ancien lien cessera de fonctionner/)).toBeVisible()
})

test('aucun flux (me renvoie null) → « Générer mon flux », pas de rubrique d’abonnement', async ({ page }) => {
  // ?feed=empty force le mock fetchMyFeed à renvoyer { feed_url: null }.
  await page.goto('/#/profil?feed=empty')
  await expect(page.getByRole('button', { name: /Générer mon flux audio/ })).toBeVisible()
  // Tant qu'aucun flux n'existe : pas d'onglets ni de champ URL.
  await expect(page.getByRole('tab', { name: /Apple Podcasts/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Régénérer mon flux' })).toHaveCount(0)
})

test('les onglets par app sont cliquables et changent le panneau', async ({ page }) => {
  await page.goto('/#/profil')
  const overcast = page.getByRole('tab', { name: /Overcast/ })
  await overcast.click()
  await expect(overcast).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('button', { name: /Ouvrir dans Overcast/ })).toBeVisible()
})

test('le bouton Copier copie l’URL du flux', async ({ page }) => {
  await page.goto('/#/profil')
  await page.getByRole('button', { name: 'Copier' }).click()
  await expect(page.getByRole('status')).toContainText('copiée')
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip).toContain('/feed/')
})

test('le bandeau Spotify / Deezer est honnête et pointe un repli', async ({ page }) => {
  await page.goto('/#/profil')
  const banner = page.getByRole('note')
  await expect(banner).toContainText('Spotify et Deezer')
  await expect(banner.getByRole('link', { name: /portail/ })).toBeVisible()
})

test('Régénérer avertit puis appelle l’API', async ({ page }) => {
  await page.goto('/#/profil')
  await page.getByRole('button', { name: 'Régénérer mon flux' }).click()
  await expect(page.getByText(/ancien lien cessera de fonctionner/)).toBeVisible()
  await page.getByRole('button', { name: /Confirmer la régénération/ }).click()
  await expect(page.getByRole('status')).toContainText('Nouveau flux')
})

test('AntennaPod et Autre lecteur sont en copier-coller uniquement', async ({ page }) => {
  await page.goto('/#/profil')
  await page.getByRole('tab', { name: /AntennaPod/ }).click()
  // Pas de bouton « Ouvrir dans … » (deep-link null) — uniquement le repli copier-coller.
  await expect(page.getByRole('button', { name: /^Ouvrir dans/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Copier' })).toBeVisible()
})
