<template>
  <div class="footer">
    <div class="nes-container">
      <div class="wrapper flex">
        CSS: <a href="https://nostalgic-css.github.io/NES.css/" target="_blank">NES.css</a>
        <div class="space"></div>

        <a href="https://twitter.com/elliottpolk" target="_blank"><i class="nes-icon twitter"></i></a>
        <a href="https://github.com/elliottpolk" target="_blank"><i class="nes-icon github"></i></a>
        <a href="https://elliottpolk.dev" target="_blank">© 2020 elliottpolk.dev</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FooterView'
}
</script>

<style lang="scss" scoped>

.wrapper {
  max-height: 4em !important;
  line-height: 4em;
}
</style>
