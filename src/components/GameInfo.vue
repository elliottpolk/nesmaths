<template>
  <div class="nes-container flex">
    <div class="wrapper flex flex-end">
      <div class="nes-field flex-start">
        <label for="curr-score">SCORE:</label>
        <div id="curr-score">{{ score }} of {{ asked }}</div>
      </div>

    <div class="space"></div>
      <div class="nes-field">
        <label for="overall-score">OVERALL:</label>
        <div id="overall-score">{{ totalScore }} of {{ totalAsked }}</div>
      </div>

    <div class="space"></div>

      <div id="level" :class="['nes-select', 'mr-1', lvlSelectSize]">
        <select required v-model="level" v-on:change="levelChange">
          <option v-for="level in levels" :key="level.value" :value="level.value">{{ level.name }}</option>
        </select>
      </div>

      <div id="mode" :class="['nes-select', 'mr-1', modeSelectSize]">
        <select required v-model="mode" v-on:change="modeChange">
          <option v-for="mode in modes" :key="mode.value" :value="mode.value">{{ mode.name }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/util/bus.js'

export default {
  props: {
    emitter: String,
    levels: Array,
    modes: Array,
    score: Number,
    asked: Number,
    totalScore: Number,
    totalAsked: Number,
    lvlSelectSize: {
      type: String,
      default: 'lrg'
    },
    modeSelectSize: {
      type: String,
      default: 'lrg'
    }
  },

  data () {
    return {
      level: null,
      mode: null
    }
  },

  mounted () {
    this.level = this.levels[0].value
    this.mode = this.modes[0].value
  },

  methods: {

    levelChange (event) {
      this.level = event.target.value
      EventBus.$emit('levelChanged', { emitter: this.emitter, value: event.target.value })
    },

    modeChange (event) {
      this.mode = event.target.value
      EventBus.$emit('modeChanged', { emitter: this.emitter, value: event.target.value })
    }
  }
}
</script>
