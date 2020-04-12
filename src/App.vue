<template>
  <div id="app">
    <maths-view/>
    <footer-view/>
  </div>
</template>

<script>
import MathsView from '@/views/Maths.vue'
import FooterView from '@/views/Footer.vue'

export default {
  components: {
    MathsView,
    FooterView
  }
}
</script>

<style lang="scss">
</style>
