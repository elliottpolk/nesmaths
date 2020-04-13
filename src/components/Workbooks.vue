<template>
  <div>
    <div class="nes-container flex">
      <div class="wrapper flex flex-end">
        <div class="nes-field flex-start">
          <label for="curr-score">SCORE:</label>
          <div id="curr-score">{{ user.workbook.score.correct }} of {{ user.workbook.score.asked }}</div>
        </div>

        <div class="space"></div>
        <div class="nes-field">
          <label for="overall-score">OVERALL:</label>
          <div id="overall-score">{{ user.workbook.score.totalCorrect }} of {{ user.workbook.score.totalAsked }}</div>
        </div>

        <div class="space"></div>

        <div id="level" class="nes-select mr-1 lrg">
          <select required v-model="level" v-on:change="levelChanged">
            <option v-for="level in levels" :key="level.value" :value="level.value">{{ level.name }}</option>
          </select>
        </div>

        <div id="mode" class="nes-select mr-1 xlrg">
          <select required v-model="mode" v-on:change="modeChanged">
            <option v-for="mode in modes" :key="mode.value" :value="mode.value">{{ mode.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="nes-container with-title">
      <h3 class="title">Actions...</h3>

      <div class="flex flex-wrap">
        <div id="history" class="nes-select lrg">
          <select required v-model="user.workbook.sheet.id" v-on:change="selectSheet">
            <option v-for="(s, i) in user.workbook.sheets" :key="s.id" :value="s.id">Sheet {{ i + 1 }}</option>
          </select>
        </div>
        <div class="space"></div>

        <button id="addSheet" class="nes-btn" style="margin-right: 1em;" v-on:click="addSheet">Add Sheet</button>
        <button id="check-answers" :class="['nes-btn', { 'is-disabled': user.workbook.sheet.checked }]" :disabled="user.workbook.sheet.checked" v-on:click="check">Check</button>
        <button id="cheat" class="nes-btn" :style="{display: cheatable}" v-on:click="cheat">Cheat</button>
      </div>
    </div>

    <div class="nes-container with-title">
      <h3 class="title">Worksheet...</h3>

      <div class="flex flex-wrap">
        <div class="nes-container is-rounded problem" v-for="(p, i) in user.workbook.sheet.problems" :key="i" :data-solution="p.solution">
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

const MODE_ADD_SUB = 'as'
const MODE_MUL_DIV = 'md'

const DEFAULT_LEVEL = 1
const DEFAULT_MODE = MODE_ADD_SUB

export default {
  data () {
    return {
      emitter: 'workbooks',
      cheatable: 'none',
      level: DEFAULT_LEVEL,
      mode: DEFAULT_MODE,
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
      user: {
        workbook: {
          level: DEFAULT_LEVEL,
          mode: DEFAULT_MODE,
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
          },
          sheets: []
        },
        workbooks: {}
      }
    }
  },

  mounted () {
    EventBus.$on('userSelected', (user) => {
      this.selectUser(user)
    })
  },

  methods: {

    solved: (a, b) => {
      return Number.parseFloat(a).toFixed(2) === Number.parseFloat(b).toFixed(2)
    },

    wbId (l, m) {
      return this.$CryptoJS.MD5('' + l + m).toString()
    },

    newWorkbook (l, m) {
      let wb = {
        level: l,
        mode: m,
        score: {
          correct: 0,
          asked: 0,
          totalCorrect: 0,
          totalAsked: 0
        },
        sheet: {},
        sheets: [],
      }

      wb.sheet = this.newSheet(wb.level, wb.mode)
      wb.sheets.push(this.$copy(wb.sheet))
      
      wb.score.totalAsked = wb.score.asked = wb.sheet.problems.length

      return wb
    },

    newSheet (l, m) {
      var tmin = 1
      var tmax = 20

      var lmin = 0
      var lmax = 10

      switch (Number(l)) {
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
      let count = 10

      let i = 0
      for (i = 0; i < count; i++) {
        let top = Math.floor(Math.random() * (tmax - tmin)) + tmin
        let bottom = Math.floor(Math.random() * (lmax - lmin)) + lmin

        let p = {
          top: top,
          bottom: bottom,
          op: (m === MODE_ADD_SUB) ? '+' : '*',
          solution: Number.parseFloat((m === MODE_ADD_SUB) ? (top + bottom) : (top * bottom)).toFixed(2),
          value: 0,
          checked: false
        }

        problems.push(this.$copy(p))
      }

      for (i = 0; i < count; i++) {
        let top = Math.floor(Math.random() * (tmax - tmin)) + tmin

        // disallow divide by zero
        var bottom = 0
        do {
          bottom = Math.floor(Math.random() * (lmax - lmin)) + lmin
        } while (bottom === 0 && m === MODE_MUL_DIV)

        let p = {
          top: top,
          bottom: bottom,
          op: (m === MODE_ADD_SUB) ? '-' : '÷',
          solution: Number.parseFloat((m === MODE_ADD_SUB) ? (top - bottom) : (top / bottom)).toFixed(2),
          value: 0,
          checked: false
        }

        problems.push(this.$copy(p))
      }

      return {
        id: this.$uuid.v4(),
        problems: this.$copy(problems),
        checked: false,
      }
    },

    addSheet () {
      let wb = this.user.workbook

      // generate new sheet
      let s = this.newSheet(wb.level, wb.mode)
      wb.sheet = this.$copy(s)
      wb.sheets.push(this.$copy(s))

      // update scoring
      wb.score.correct = 0
      wb.score.asked = s.problems.length
      wb.score.totalAsked += s.problems.length

      this.user.workbook = this.$copy(wb)
      this.user.workbooks[this.wbId(wb.level, wb.mode)] = this.$copy(wb)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    selectSheet (event) {
      let wb = this.user.workbook
      wb.sheet = this.$copy(wb.sheets.find(s => s.id === event.target.value))

      this.user.workbook = this.$copy(wb)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    selectUser (usr) {
      if (usr.workbook === undefined || usr.workbook === null) {
        // this may be an all new user, so ensure the workbooks have a default workbook
        if (usr.workbooks === undefined || usr.workbooks === null || Object.keys(usr.workbooks).length < 1) {
          // declare the associate array and populate the first sheet
          usr.workbooks = {}

          let wb = this.newWorkbook(DEFAULT_LEVEL, DEFAULT_MODE)
          usr.workbooks[this.wbId(wb.level, wb.mode)] = this.$copy(wb)
        }

        // grab the workbook with the default value
        usr.workbook = usr.workbooks[this.wbId(DEFAULT_LEVEL, DEFAULT_MODE)]
        EventBus.$emit('saveUser', usr)
      }

      this.user = usr
      this.level = this.user.workbook.level
      this.mode = this.user.workbook.mode
    },

    selectWorkbook (l, m) {
      let wbs = this.user.workbooks

      let id = this.wbId(l, m)
      let wb = wbs[id]
      if (wb === undefined || wb === null) {
        wb = this.newWorkbook(l, m)
        wbs[id] = this.$copy(wb)
      }

      this.user.workbooks = this.$copy(wbs)
      this.user.workbook = this.$copy(wb)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    levelChanged (event) {
      this.selectWorkbook(Number(event.target.value), this.user.workbook.mode)
    },

    modeChanged (event) {
      this.selectWorkbook(this.user.workbook.level, event.target.value)
    },

    updateProblem (event) {
      let index = event.target.dataset.index
      let value = event.target.value

      let wb = this.user.workbook

      wb.sheet.problems[index].value = value
      wb.sheets.find(s => {
        if (s.id === wb.sheet.id) {
          s.problems[index].value = value
          return
        }
      })

      this.user.workbook = this.$copy(wb)
      EventBus.$emit('saveUser', this.user)
    },

    score (sheet) {
      let score = {
        correct: 0,
        asked: sheet.problems.length,
      }

      sheet.problems.forEach(p => {
        if (this.solved(p.solution, p.value))
          score.correct++
      })

      return score
    },

    check () {
      let wb = this.user.workbook
      let sheet = wb.sheet
      let score = this.score(sheet)

      wb.score.totalCorrect += wb.score.correct = score.correct

      // ensure sheet and problems are flagged as checked
      sheet.checked = true
      sheet.problems.forEach(p => p.checked = true)

      // update sheet in list of sheets
      wb.sheets.find((s, i) => {
        if (s.id === sheet.id)
          wb.sheets[i] = this.$copy(sheet)
      })

      this.user.workbooks[this.wbId(wb.level, wb.mode)] = this.$copy(wb)
      this.user.workbook = this.$copy(wb)
      EventBus.$emit('saveUser', this.user)
    },

    cheat () {
      this.user.workbook.sheet.problems.forEach(p => p.value = p.solution)
    }
  }
}
</script>

<style>

</style>
