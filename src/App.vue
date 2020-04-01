<template>
  <div id="app">
    <maths-generator></maths-generator>
    <footer-view></footer-view>
  </div>
</template>

<script>
import MathsGenerator from '@/components/Maths.vue'
import FooterView from '@/views/Footer.vue'

export default {
  components: {
    MathsGenerator,
    FooterView
  }
}
</script>

<style lang="scss">
</style>
