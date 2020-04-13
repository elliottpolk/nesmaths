<template>
  <div>
    <div class="wrapper flex flex-end" style="border: 4px solid #20262e;">
      <users></users>
    </div>

    <div class="main">
      <b-tabs>
        <!-- <b-tab title="Workbooks" active> -->
        <b-tab title="Workbooks">
          <workbooks></workbooks>
        </b-tab>

        <!-- <b-tab title="Flash Cards"> -->
        <b-tab title="Flash Cards" active>
          <flash-cards></flash-cards>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>

import Users from '@/components/User.vue'
import Workbooks from '@/components/Workbooks.vue'
import FlashCards from '@/components/FlashCards.vue'

export default {
  name: 'Maths',

  data () {
    return {
    }
  },

  created () {
  },

  methods: {
  },

  components: {
    Users,
    Workbooks,
    FlashCards
  }
}
</script>

<style>
</style>
