<template>
  <div>
    <div class="nes-container with-title flex">
      <h3 class="title">Settings...</h3>

      <div class="wrapper flex flex-end mt-1">
        <div id="difficulty" class="nes-select med mr-1">
          <select required v-model="difficulty" v-on:change="difficultyChange">
            <option v-for="i in 5" :key="i" :value="i">{{ i }}</option>
          </select>

        </div>

        <div id="mode" class="nes-select lrg mr-1">
          <select required v-model="mode" v-on:change="modeChange">
            <option v-for="mode in modes" :key="mode.value" :value="mode.value">{{ mode.name }}</option>
          </select>
        </div>

        <div id="user" class="nes-select lrg">
          <select required v-model="username" v-on:change="userChange">
            <option v-for="user in users" :key="user.name" :value="user.name">{{ user.name }}</option>
            <option value="add" selected>- add user -</option>
          </select>
        </div>
      </div>
    </div>

    <div class="nes-container">
      <div class="wrapper flex">
          <div class="nes-field">
            <label for="curr-score">SCORE:</label>
            <div id="curr-score">{{ currentScore }} of {{ problems.length }}</div>
          </div>
          <div class="space"></div>

          <div class="nes-field">
            <label for="overall-score">OVERALL:</label>
            <div id="overall-score">{{ totalScore }} of {{ totalProblems }}</div>
          </div>
          <div class="space"></div>

          <button id="check-answers" :class="['nes-btn', { 'is-disabled': checked }]" :disabled="checked" style="margin-right: 1em;" v-on:click="check">Check</button>
          <button id="more" class="nes-btn" v-on:click="more">More</button>
          <button id="cheat" style="display: none;" v-on:click="cheat">Cheat</button>
      </div>
    </div>

    <div class="nes-container with-title">
      <h3 class="title">Maths...</h3>

      <div class="flex flex-wrap">
        <div class="nes-container is-rounded problem" v-for="(problem, index) in problems" :key="index" :data-solution="problem.solution">
          <div class="left-number">{{ problem.top }}</div>
          <div class="operator-sign">{{ problem.op }}</div>
          <div class="right-number">{{ problem.bottom }}</div>
          <div class="equals-sign">=</div>
          <input v-if="problem.checked" type="number" step="0.01" :class="['nes-input', solved(problem.solution, problem.value) ? 'is-success' : 'is-error']" :value="problem.value" disabled>
          <input v-else type="number" step="0.01" class="nes-input" :value="problem.value" v-on:change="updateProblem" :data-index="index" >
        </div>
      </div>
    </div>

    <dialog class="nes-dialog is-dark is-rounded" id="user-dialog">
      <form method="dialog">
        <h3 class="title">Add User...</h3>

        <input id="user-input" type="text" class="nes-input" placeholder="your name...">

        <menu class="dialog-menu">
          <button class="nes-btn">Cancel</button>
          <button class="nes-btn is-primary" v-on:click="userAdd">Confirm</button>
        </menu>
      </form>
    </dialog>

    <dialog class="nes-dialog is-dark is-rounded" id="error-dialog">
      <form method="dialog">
        <h3 class="title">Error...</h3>

        <div class="flex flex-wrap error-body">
          <div class="wrapper">
              {{ err }}
          </div>

          <div class="wrapper">
          <menu class="dialog-menu">
            <button class="nes-btn is-primary">Confirm</button>
          </menu>
          </div>
        </div>
      </form>
    </dialog>
  </div>
</template>

<script>
const store = 'nesmaths'
const ADD_USER = 'add'
const MODE_ADD_SUB = 'as'
const MODE_MUL_DIV = 'md'

export default {
  data () {
    return {
      difficulty: 1,
      user: {},
      username: '',
      users: [],
      mode: 'as',
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
      currentScore: 0,
      totalScore: 0,
      totalProblems: 0,
      problems: [],
      checked: false,
      err: ''
    }
  },

  created () {
    if (localStorage[store] === undefined || localStorage[store] === null) {
      localStorage[store] = JSON.stringify({
        users: [],
      })
    }
    this.users = JSON.parse(localStorage[store]).users
    if (this.users.length > 0) {
      this.selectUser(this.users[0].name)
    }
  },

  methods: {
    solved: (a, b) => {
      return Number.parseFloat(a).toFixed(2) === Number.parseFloat(b).toFixed(2)
    },

    save () {
      localStorage[store] = JSON.stringify({ users: this.users })
    },

    error (msg) {
      this.err = msg
      document.getElementById('error-dialog').showModal()
    },

    difficultyChange (event) {
      this.difficulty = this.user.level = event.target.value
      this.users.find(u => {
        if (u.name === this.user.name) {
          u.level = this.user.level
          return true
        }
      })
      this.generateProblems(this.difficulty, this.mode)
      this.save()

      this.currentScore = this.score()
      this.checked = this.problems[0].checked
    },

    modeChange (event) {
      this.mode = this.user.mode = event.target.value
      this.users.find(u => {
        if (u.name === this.user.name) {
          u.mode= this.user.mode
          return true
        }
      })
      this.generateProblems(this.difficulty, this.mode)
      this.save()

      this.currentScore = this.score()
      this.checked = this.problems[0].checked
    },

    userChange (event) {
      let name = event.target.value
      if (name === ADD_USER) {
        this.username = ''
        document.getElementById('user-input').value = ''
        document.getElementById('user-dialog').showModal()

        return
      }

      this.selectUser(name)
    },

    userAdd () {
      let name = document.getElementById('user-input').value
      if (name.length < 1 || name === ADD_USER) {
        this.error('invalid name')
        return
      }

      if (this.users.filter(u => u.name === name).length > 0) {
        this.error('duplicate user')
        return
      }

      this.users.push({
        name: name,
          level: 1,
          mode: MODE_ADD_SUB,
          score: {
            correct: 0,
            total: 0,
          },
          recents: []
      })

      this.save()
      this.selectUser(name)
    },

    selectUser (name) {
      console.debug('selected user: ' + name)

      this.user = this.users.filter(u => u.name === name)[0]
      this.username = this.user.name

      this.difficulty = this.user.level
      this.mode = this.user.mode
      this.totalScore = this.user.score.correct
      this.totalProblems = this.user.score.total

      if (!this.user.recents || this.user.recents.length < 1) {
        this.generateProblems(this.user.level, this.user.mode)
        this.save()
      }
      this.problems = this.user.recents
      this.currentScore = this.score()
      this.checked = this.problems[0].checked
    },

    generateProblems (d, m) {

      console.debug('difficulty: ' + d)
      console.debug('mode: ' + m)

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

      console.debug('tmin: ' + tmin)
      console.debug('tmax: ' + tmax)
      console.debug('lmin: ' + lmin)
      console.debug('lmax: ' + lmax)

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

        console.debug('adding problem: ' + JSON.stringify(p))
        problems.push(p)
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

        console.debug('adding problem: ' + JSON.stringify(p))
        problems.push(p)
      }

      this.user.recents = JSON.parse(JSON.stringify(problems))
      this.users.find(u => {
        if (u.name === this.user.name) {
          u.recents = JSON.parse(JSON.stringify(this.user.recents))
        }
      })
      this.problems = this.user.recents
    },

    updateProblem (event) {
      let target = event.target
      this.problems[target.dataset.index].value = target.value
    },

    score () {
      let _score = 0
      this.problems.forEach(p => {
        if (p.checked && this.solved(p.solution, p.value) )
          _score++
      })

      return _score
    },

    check () {
      this.checked = true
      this.problems.forEach(p => p.checked = true)

      this.totalProblems = this.user.score.total += this.problems.length
      this.totalScore = this.user.score.correct += (this.currentScore = this.score())

      this.user.recents = JSON.parse(JSON.stringify(this.problems))
      this.users.find(u => {
        if (u.name === this.user.name)
          u.recents = JSON.parse(JSON.stringify(this.user.recents))
      })
      this.save()
    },

    more () {
      this.checked = false

      this.currentScore = 0
      this.generateProblems(this.difficulty, this.mode)
      this.save()
    },

    cheat() {
      this.problems.forEach(problem => problem.value = problem.solution)
    }
  }
}
</script>

<style>

</style>