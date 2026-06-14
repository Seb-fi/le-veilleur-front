import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { captureTokenFromUrl } from './api/auth'

import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/animations.css'

// PRD #49 §4.4 : capturer le token du lien présigné AVANT le router (la garde lit
// hasToken()). Sur 401 (token révoqué/expiré en cours de session) → écran verrouillé.
captureTokenFromUrl()
window.addEventListener('auth:unauthorized', () => { router.push('/locked') })

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')
