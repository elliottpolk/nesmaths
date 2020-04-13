import Vue from 'vue'
import App from './App.vue'

import '@/assets/css/styles.scss'
import 'nes.css/css/nes.min.css'

Vue.config.productionTip = false

import VueGtag from 'vue-gtag'
Vue.use(VueGtag, {
    config: { id: 'UA-139881970-2' }
})

import { BootstrapVue } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)

import UUID from 'vue-uuid'
Vue.use(UUID)

import copy from '@/util/copy.js'
Vue.use(copy)

import VueCryptoJS from 'vue-cryptojs'
Vue.use(VueCryptoJS)

new Vue({
  render: h => h(App)
}).$mount('#app')
