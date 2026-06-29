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
