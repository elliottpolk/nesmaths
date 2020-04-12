<template>
  <div>
    <game-info
      :emitter="emitter"
      :levels="levels"
      :modes="modes"
      :score="game.score.correct"
      :asked="game.score.asked"
      :totalScore="game.score.totalCorrect"
      :totalAsked="game.score.totalAsked"></game-info>
  </div>
</template>

<script>
import { EventBus } from '@/bus.js'
import GameInfo from '@/components/GameInfo'

const MODE_ADD = 'add'
const MODE_SUB = 'sub'
const MODE_MUL = 'mul'
const MODE_DIV = 'div'

export default {
  data () {
    return {
      emitter: 'flashcards',
      game: {
        level: 1,
        mode: MODE_ADD,
        score: {
          correct: 0,
          asked: 0,
          totalCorrect: 0,
          totalAsked: 0,
        },
        cards: []
      },
      levels: [
        {
          name: 'Level 1',
          value: 1,
        },
        {
          name: 'Level 2',
          value: 2,
        },
        {
          name: 'Level 3',
          value: 3,
        },
        {
          name: 'Level 4',
          value: 4,
        },
        {
          name: 'Level 5',
          value: 5,
        }
      ],
      modes: [
        {
          name: 'add',
          value: MODE_ADD
        },
        {
          name: 'subtract',
          value: MODE_SUB
        },
        {
          name: 'multiply',
          value: MODE_MUL
        },
        {
          name: 'divide',
          value: MODE_DIV
        }
      ],
      user: {},
    }
  },

  mounted () {
    EventBus.$on('userSelected', (user) => {
      console.debug('[FlashCards] handling user selected: ' + user.name)
      this.user = user
      this.changeFlashcards(user.flashcards)
    }).$on('levelChanged', (event) => {
      if (event.emitter === undefined || event.emitter === null || event.emitter !== this.emitter)
        return

      console.debug(event)
    }).$on('modeChanged', (event) => {
      if (event.emitter === undefined || event.emitter === null || event.emitter !== this.emitter)
        return

      console.debug(event)
    })
  },

  methods: {

    newFlashcards: () => {
      return {
        level: 1,
        mode: MODE_ADD,
        score: {
          correct: 0,
          total: 0
        },
        history: {}
      }
    },

    solved: (a, b) => {
      return Number.parseFloat(a).toFixed(2) === Number.parseFloat(b).toFixed(2)
    },

    levelChange (event) {
      this.level = this.user.flashcards.level = event.target.value
    },

    modeChange (event) {
      this.mode = this.user.flashcards.mode = event.target.value
    },

    reset () {
      this.level = 1
      this.mode = MODE_ADD
      this.totalScore = 0
      this.totalProblem = 0
    },

    changeFlashcards (cards) {
      console.debug('TODO: ' + JSON.stringify(cards))
    }
  },

  components: {
    'game-info': GameInfo
  }

}
</script>

<style>
</style>
