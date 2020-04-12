<template>
  <div>
    <div id="user" class="nes-select xlrg">
      <select required v-model="username" v-on:change="changed">
        <option v-for="u in users" :key="u.name" :value="u.name">{{ u.name }}</option>
        <option value="add" selected>- add user -</option>
      </select>
    </div>

    <dialog class="nes-dialog is-dark is-rounded" id="user-dialog">
      <form method="dialog">
        <h3 class="title">Add User...</h3>

        <input id="user-input" type="text" class="nes-input" placeholder="your name...">

        <menu class="dialog-menu">
          <button class="nes-btn">Cancel</button>
          <button class="nes-btn is-primary" v-on:click="add">Confirm</button>
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

    <button id="clear-data" style="display: none;" v-on:click="clearData">Clear</button>
  </div>
</template>

<script>
import { EventBus } from '@/util/bus.js'

const MODEL_VER = 2
const STORE = 'nesmaths'
const ADD_USER = 'add'

export default {
  data () {
    return {
      username: '',
      user: {},
      users: [],
      err: ''
    }
  },

  mounted () {
    EventBus.$on('saveUser', (user) => {
      //console.debug('[User] event.saveUser: ' + JSON.stringify(user))
      this.users.find(u => {
        if (u.name === user.name) {
          this.user = u = this.$copy(user)
          return true
        }
      })

      this.save()
    })

    // generate an empty data store
    if (localStorage[STORE] === undefined || localStorage[STORE] === null) {
      localStorage[STORE] = JSON.stringify({
        users: [],
        version: MODEL_VER
      })
    }

    let data = JSON.parse(localStorage[STORE])
    if (data.version === undefined || data.version === null || data.version !== MODEL_VER) {
      // TODO: warn that it's going to reset

      // reset
      let n = { users: [], version: MODEL_VER }

      data = this.$copy(n)
      localStorage[STORE] = JSON.stringify(n)
    }

    this.users = data.users
  },

  methods: {
    error (msg) {
      this.err = msg
      document.getElementById('error-dialog').showModal()
    },

    save () {
      localStorage[STORE] = JSON.stringify({
        users: this.users,
        version: MODEL_VER
      })
    },

    changed (event) {
      let name = event.target.value
      if (name === ADD_USER) {
        this.username = ''
        document.getElementById('user-input').value = ''
        document.getElementById('user-dialog').showModal()

        return
      }

      this.select(name)
    },

    add () {
      let name = document.getElementById('user-input').value
      if (name.length < 1 || name === ADD_USER) {
        this.error('invalid name')
        return
      }

      if (this.users.filter(u => u.name === name).length > 0) {
        this.error('duplicate user')
        return
      }

      this.users.push({ name: name })
      this.save()

      this.select(name)
    },

    select (name) {
      //console.debug('[User] selected user: ' + name)

      this.user = this.users.filter(u => u.name === name)[0]
      this.username = this.user.name

      EventBus.$emit('userSelected', this.user)
    },

    clearData () {
      localStorage.removeItem(STORE)
    }
  }
}

</script>
