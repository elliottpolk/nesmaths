<template>
  <div>
    <div class="nes-container flex">
      <div class="wrapper flex flex-end">
        <div class="nes-field flex-start">
          <label for="curr-score">SCORE:</label>
          <div id="curr-score">{{ user.deck.score.correct }} of {{ user.deck.score.asked }}</div>
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

      <div v-if="user.deck.card != null" class="flex flex-wrap">
        <div class="space"></div>
        <button id="resetDeck" class="nes-btn mr-1" v-on:click="resetDeck">Reset Deck</button>
        <button id="prevCard" :class="['nes-btn', 'mr-1', { 'is-disabled': (user.deck.card.index == 0)}]" v-on:click="prevCard" :disabled="user.deck.card.index == 0">Prev Card</button>
        <button id="nextCard" class="nes-btn mr-1" v-on:click="nextCard">Next Card</button>
        <button id="cheat" class="nes-btn" :style="{display: cheatable}" v-on:click="cheat">Cheat</button>
      </div>
    </div>

    <div class="nes-container with-title">
      <h3 v-if="user.deck.card" class="title">Card {{ user.deck.card.index + 1 }}</h3>
      <h3 v-else class="title">Card... </h3>

      <div v-if="user.deck.card != null" class="flex">
        <div class="space"></div>
        <div class="nes-container is-rounded problem" :data-solution="user.deck.card.solution">
          <div class="left-number">{{ user.deck.card.top }}</div>
          <div class="operator-sign">{{ user.deck.card.op }}</div>
          <div class="right-number">{{ user.deck.card.bottom }}</div>
          <div class="equals-sign">=</div>
          <input v-if="user.deck.card.checked" type="number" :class="['nes-input', solved(user.deck.card.solution, user.deck.card.value) ? 'is-success' : 'is-error']" :value="user.deck.card.value" disabled>
          <input id="card-value" v-else type="number" step="0.01" class="nes-input" :value="user.deck.card.value" v-on:change="check">
        </div>
        <div class="space"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/util/bus.js'

const MODE_ADD = 'add'
const MODE_SUB = 'sub'
const MODE_MUL = 'mul'
const MODE_DIV = 'div'

const DEFAULT_LEVEL = 1
const DEFAULT_MODE = MODE_ADD
const DEFAULT_OP = '+'

export default {
  data () {
    return {
      emitter: 'flashcards',
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
      user: {
        deck: {
          level: DEFAULT_LEVEL,
          mode: DEFAULT_MODE,
          score: {
            correct: 0,
            asked: 0
          },
          card: null,
          cards: []
        },
        decks: {}
      },
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

    dId (l, m) {
      return this.$CryptoJS.MD5('' + l + m).toString()
    },

    newDeck (l, m) {
      let d = {
        level: l,
        mode: m,
        score: {
          correct: 0,
          asked: 1
        },
        card: {},
        cards: []
      }

      d.card = this.newCard(d.level, d.mode)
      d.card.index = 0
      d.cards.push(this.$copy(d.card))

      return d
    },

    newCard (l, m) {
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

      let p = {
        top: Math.floor(Math.random() * (tmax - tmin)) + tmin,
        bottom: Math.floor(Math.random() * (lmax - lmin)) + lmin,
        op: DEFAULT_OP,
        solution: 0,
        value: 0,
        checked: false
      }

      switch (m) {
        case MODE_DIV:
          p.op = '÷'

          // disallow divide by zero
          while (p.bottom === 0)
            p.bottom = Math.floor(Math.random() * (lmax - lmin)) + lmin

          p.solution = Number.parseFloat(p.top / p.bottom).toFixed(2)
          break

        case MODE_MUL:
          p.op = '*'
          p.solution = Number.parseFloat(p.top * p.bottom).toFixed(2)
          break

        case MODE_SUB:
          p.op = '-'
          p.solution = Number.parseFloat(p.top - p.bottom).toFixed(2)
          break

        default:
          p.op = '+'
          p.solution = Number.parseFloat(p.top + p.bottom).toFixed(2)
      }

      return p
    },

    selectDeck (l, m) {
      let decks = this.user.decks

      let id = this.dId(l, m)
      let d = decks[id]
      if (d === undefined || d === null) {
        d = this.newDeck(l, m)
        decks[id] = this.$copy(d)
      }

      this.user.decks = this.$copy(decks)
      this.user.deck = this.$copy(d)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    levelChanged (event) {
      this.selectDeck(Number(event.target.value), this.user.deck.mode)
    },

    modeChanged (event) {
      this.selectDeck(this.user.deck.level, event.target.value)
    },

    resetDeck () {
      let d = this.user.deck

      d.card.checked = false
      d.card.value = 0
      d.cards.forEach(c => {
        c.checked = false
        c.value = 0
        d.cards[c.index] = this.$copy(c)
      })

      d.score.correct = 0

      this.user.deck = this.$copy(d)
      this.user.decks[this.dId(d.level, d.mode)] = this.$copy(d)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    prevCard () {
      let d = this.user.deck

      // shouldn't be possible but check anyhow
      if (d.card.index === 0)
        return

      d.card = this.$copy(d.cards[d.card.index-1])

      this.user.deck = this.$copy(d)
      this.user.decks[this.dId(d.level, d.mode)] = this.$copy(d)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    nextCard () {
      let d = this.user.deck

      if (d.card.index < (d.cards.length - 1))
        d.card = this.$copy(d.cards[d.card.index+1])
      else {
        var c
        do {
          c = this.newCard(d.level, d.mode)
        } while (d.cards.find(_c => this.$CryptoJS.MD5(_c.top+_c.op+_c.bottom).toString() === this.$CryptoJS.MD5(c.top+c.op+c.bottom).toString()))

        c.index = d.cards.length

        d.cards.push(this.$copy(c))
        d.card = this.$copy(c)

        // update scoring
        d.score.asked++
      }

      this.user.deck = this.$copy(d)
      this.user.decks[this.dId(d.level, d.mode)] = this.$copy(d)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    selectUser (usr) {
      if (usr.deck === undefined || usr.deck === null) {
        // this may be an all new user, so ensure the decks have a default deck
        if (usr.decks === undefined || usr.decks === null || Object.keys(usr.decks).length < 1) {
          // declare the associate array and populate the first sheet
          usr.decks = {}

          let d = this.newDeck(DEFAULT_LEVEL, DEFAULT_MODE)
          usr.decks[this.dId(d.level, d.mode)] = this.$copy(d)
        }

        // grab the deck with the default value
        usr.deck = usr.decks[this.dId(DEFAULT_LEVEL, DEFAULT_MODE)]
        EventBus.$emit('saveUser', usr)
      }

      this.user = usr
      this.level = this.user.deck.level
      this.mode = this.user.deck.mode
    },

    check (event) {
      let d = this.user.deck
      let c = d.card
      
      c.value = Number(event.target.value)
      c.checked = true
      d.cards[c.index] = this.$copy(c)

      d.score.correct += (this.solved(c.solution, c.value)) ? 1 : 0

      this.user.deck = this.$copy(d)
      this.user.decks[this.dId(d.level, d.mode)] = this.$copy(d)
      EventBus.$emit('saveUser', this.user)

      this.$nextTick(() => {
        // sometimes we don't re-render properly, so this should help it along
        this.$forceUpdate()
      })
    },

    cheat () {
      // this.user.deck.card.value = this.user.deck.card.solution
      let el = document.getElementById('card-value')
      el.value = this.user.deck.card.solution
      el.dispatchEvent(new Event('change'))
    }
  },

}
</script>

<style type="scss" scoped>
.space { flex-grow: 5; }
</style>
