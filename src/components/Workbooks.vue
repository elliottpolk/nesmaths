<template>
  <div>
    <game-info
      :emitter="emitter"
      :levels="levels"
      :modes="modes"
      :score="game.score.correct"
      :asked="game.score.asked"
      :totalScore="game.score.totalCorrect"
      :totalAsked="game.score.totalAsked"
      :modeSelectSize="'xlrg'"></game-info>

    <div class="nes-container with-title">
      <h3 class="title">Actions...</h3>

      <div class="flex flex-wrap">
        <div id="history" class="nes-select lrg">
          <select required v-model="game.sheet.id" v-on:change="selectSheet">
            <option v-for="(s, i) in game.displayable" :key="s.id" :value="s.id">Sheet {{ i + 1 }}</option>
          </select>
        </div>
        <div class="space"></div>

        <button id="check-answers" :class="['nes-btn', { 'is-disabled': game.sheet.checked }]" :disabled="game.sheet.checked" style="margin-right: 1em;" v-on:click="check">Check</button>
        <button id="more" class="nes-btn" v-on:click="more">New</button>
        <button id="cheat" style="display: none;" v-on:click="cheat">Cheat</button>
      </div>
    </div>

    <div class="nes-container with-title">
      <h3 class="title">Worksheet...</h3>

      <div class="flex flex-wrap">
        <div class="nes-container is-rounded problem" v-for="(p, i) in game.sheet.problems" :key="i" :data-solution="p.solution">
          <div class="left-number">{{ p.top }}</div>
          <div class="operator-sign">{{ p.op }}</div>
          <div class="right-number">{{ p.bottom }}</div>
          <div class="equals-sign">=</div>
          <input v-if="p.checked" type="number" step="0.01" :class="['nes-input', solved(p.solution, p.value) ? 'is-success' : 'is-error']" :value="p.value" disabled>
          <input v-else type="number" step="0.01" class="nes-input" :value="p.value" v-on:change="updateProblem" :data-index="i" >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus  } from '@/util/bus.js'
import GameInfo from '@/components/GameInfo'

const MODE_ADD_SUB = 'as'
const MODE_MUL_DIV = 'md'

export default {
  data () {
    return {
      emitter: 'workbooks',
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
          name: 'add/subtract',
          value: MODE_ADD_SUB
        },
        {
          name: 'multiply/divide',
          value: MODE_MUL_DIV
        }
      ],
      game: {
        level: 1,
        mode: MODE_ADD_SUB,
        score: {
          correct: 0,
          asked: 0,
          totalCorrect: 0,
          totalAsked: 0
        },
        sheet: {
          id: '',
          problems: [],
          checked: false,
          level: 1,
          mode: MODE_ADD_SUB,
        },
        displayable: [],
        sheets: [],
      },
      user: {},
    }
  },

  mounted () {
    EventBus.$on('userSelected', (user) => {
      //console.debug('[Worksheet] handling user selected: ' + user.name)
      this.user = user
      this.changeWorksheets(user.worksheets)
    }).$on('levelChanged', (event) => {
      if (event.emitter === undefined || event.emitter === null || event.emitter !== this.emitter)
        return

      this.levelChange(event.value)
    }).$on('modeChanged', (event) => {
      if (event.emitter === undefined || event.emitter === null || event.emitter !== this.emitter)
        return

      this.modeChange(event.value)
    })
  },

  methods: {

    newGame: () => {
      return {
        score: {
          correct: 0,
          asked: 0,
          totalCorrect: 0,
          totalAsked: 0
        },
        workbook: {
          sheet: {},
          level: 1,
          mode: MODE_ADD_SUB,
          sheets: []
        },
        workbooks: [],
      }
    },

    solved: (a, b) => {
      return Number.parseFloat(a).toFixed(2) === Number.parseFloat(b).toFixed(2)
    },

    getSheet () {
      if (this.game.sheets === undefined || this.game.sheets === null)
        return null

      // reset the displayables
      console.debug('resetting displayables')
      this.game.displayable = this.game.sheets.filter(s => { s.level === this.game.level && s.mode === this.game.mode })

      console.debug('finding displayables')
      return this.game.displayable.find(s => (s.level === this.game.level && s.mode === this.game.mode))
    },

    levelChange (level) {
      this.game.level = this.user.worksheets.level = level
      if (this.sheet !== undefined && this.sheet !== null && this.sheet.level === level && this.sheet.mode == this.game.mode)
        return

      // check to see if we have a worksheet already for the level and select
      let sheet = this.getSheet()
      for (; (sheet === undefined || sheet === null); sheet = this.getSheet())
        this.generateWorksheet(this.game.level, this.game.mode)

      EventBus.$emit('saveUser', this.user)

      console.debug(sheet)

      console.debug('shite')
      this.game.sheet = this.$copy(sheet)
    },

    modeChange (mode) {
      this.mode = this.user.worksheets.mode = mode
      if (this.sheet !== undefined && this.sheet !== null && this.sheet.mode === mode)
        return

      // check to see if we have a worksheet already for the mode and select
      let sheet = this.getSheet()
      for(; sheet === null; sheet = this.getSheet())
        this.generateWorksheet(this.game.level, this.game.mode)

      EventBus.$emit('saveUser', this.user)

      this.game.sheet = this.$copy(sheet)
      this.game.score = this.score()
    },

    reset () {
      this.game = this.newGame()
    },

    changeWorksheets (worksheets) {
      if (worksheets === undefined || worksheets === null)
        this.user.worksheets = worksheets = this.$copy(this.newGame())

      this.reset()
      if (worksheets.sheets === undefined || worksheets.sheets === null || worksheets.sheets.length < 1) {
        //console.debug('[Worksheet] generating worksheet for user')
        this.generateWorksheet(worksheets.level, worksheets.mode)

        // copy over updated worksheets
        worksheets = this.$copy(this.user.worksheets)
        EventBus.$emit('saveUser', this.user)
      }

      this.game = this.$copy(worksheets)
    },

    generateWorksheet (d, m) {
      var tmin = 1
      var tmax = 20

      var lmin = 0
      var lmax = 10

      switch (Number(d)) {
        case 5:
          tmin = lmin = 1000
          tmax = lmax = 9999
          break

        case 4:
          tmin = 1000
          tmax = 9999

          lmin = 100
          lmax = 999
          break

        case 3:
          tmin = 100
          tmax = 999

          lmin = 10
          lmax = 99
          break

        case 2:
          tmin = lmin = 10
          tmax = lmax = 99
          break

        default:
          // do nothing
      }

      let problems = []

      const count = 10

      let i = 0
      for (i = 0; i < count; i++) {
        let top = Math.floor(Math.random() * (tmax - tmin)) + tmin
        let bottom = Math.floor(Math.random() * (lmax - lmin)) + lmin

        let p = {
          top: top,
          bottom: bottom,
          op: (m === 'as') ? '+' : '*',
          solution: (m === 'as') ? (top + bottom) : (top * bottom),
          value: 0,
          checked: false
        }

        problems.push(this.$copy(p))
      }

      for (i = 0; i < count; i++) {
        let top = Math.floor(Math.random() * (tmax - tmin)) + tmin
        let bottom = Math.floor(Math.random() * (lmax - lmin)) + lmin

        let p = {
          top: top,
          bottom: bottom,
          op: (m === 'as') ? '-' : '÷',
          solution: (m === 'as') ? (top - bottom) : (top / bottom),
          value: 0,
          checked: false
        }

        problems.push(this.$copy(p))
      }

      let sheet = {
        id: this.$uuid.v4(),
        problems: this.$copy(problems),
        checked: false,
        level: this.game.level,
        mode: this.game.mode
      }

      // do your null checks
      if (this.game.sheets === undefined || this.game.sheets === null)
        this.game.sheets = []

      // set as selected sheet and add to the list of sheets
      this.game.sheet = this.$copy(sheet)
      this.game.displayable.push(this.$copy(this.game.sheet))
      this.game.sheets.push(this.$copy(this.game.sheet))

      // ensure this gets written back to the user
      this.user.worksheets.sheet = this.$copy(this.game.sheet)
      this.user.worksheets.sheets = this.$copy(this.game.sheets)
    },

    updateProblem (event) {
      let index = event.target.dataset.index
      let value = event.target.value

      this.game.sheet.problems[index].value = value
      this.game.sheets.find(s => {
        if (s.id === this.game.sheet.id) {
          s.problems[index].value = value
          return
        }
      })

      // ensure the user gets the sheet updates
      this.user.worksheets.sheet = this.$copy(this.game.sheet)
      this.user.worksheets.sheets = this.$copy(this.game.sheets)

      EventBus.$emit('saveUser', this.user)
    },

    score () {
      let _score = {
        correct: 0,
        asked: this.game.sheet.problems.length,
        totalCorrect: 0,
        totalAsked: 0,
      }

      this.game.sheet.problems.forEach(p => {
        if (p.checked && this.solved(p.solution, p.value) )
          _score.correct++
      })

      //let id = this.game.sheet.id
      let level = this.game.level
      let mode = this.game.mode

      this.game.sheets.forEach(s => {
        if (s.level === level && s.mode === mode) {
          _score.totalAsked += s.problems.length

          s.problems.forEach(p => {
            if (p.checked && this.solved(p.solution, p.value))
              _score.totalCorrect++
          })
        }
      })

      return _score
    },

    check () {
      this.game.sheet.checked = true
      this.game.sheet.problems.forEach(p => p.checked = true)
      this.game.sheets.find((s, i) => {
        if (s.id === this.game.sheet.id)
          this.game.sheets[i] = this.$copy(this.game.sheet)
      })

      let score = this.score()
      this.game.score = this.$copy(score)

      this.game.sheets.find((s, i) => {
        if (s.id === this.game.sheet.id)
          this.game.sheets[i] = this.$copy(this.game.sheet)
      })

      this.user.worksheets = this.$copy(this.game)
      EventBus.$emit('saveUser', this.user)
    },

    selectSheet (event) {
      this.game.sheet = this.$copy(this.game.sheets.find(s => s.id === event.target.value))
      this.game.score = this.score()

      this.user.worksheets = this.$copy(this.game)
      EventBus.$emit('saveUser', this.user)
    },

    more () {
      this.generateWorksheet(this.game.level, this.game.mode)
      EventBus.$emit('saveUser', this.user)
    },

    cheat() {
      this.game.sheet.problems.forEach(p => p.value = p.solution)
    }
  },

  components: {
    'game-info': GameInfo
  }
}
</script>

<style>

</style>
