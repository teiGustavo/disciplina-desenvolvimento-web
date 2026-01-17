import { createApp } from 'vue'

import App from './presentation/App.vue'
import bootstrap from './config/bootstrap'

const app = createApp(App)

bootstrap(app);

app.mount('#app')
