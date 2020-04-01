import Vue from 'vue'
import App from './App.vue'
import router from './router'

import '@/assets/css/styles.scss'
import 'nes.css/css/nes.min.css'

import VueGtag from 'vue-gtag'

Vue.config.productionTip = false

Vue.use(VueGtag, {
    config: { id: 'UA-139881970-2' }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
