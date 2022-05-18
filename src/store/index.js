import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'
import createPromiseAction from './promise-action'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    defaultExchangeConfig: {
      enable: true,
      type: 0,
      removeSuffix: true,
      symbols: []
    },
    config: {
      refresh: 10,
      enable: true,
      subscribe: {
      }
    }
  },
  mutations: {
    updateSymbolsM (state, { name, symbols }) {
      // console.log('updateSymbols', name, symbols)
      state.config.subscribe[name].symbols = symbols
    },
    addExchangeM (state, { name, type }) {
      if (name in state.config.subscribe) {
        return
      }
      console.log('addExchange', name, type)
      const ec = _.cloneDeep(state.defaultExchangeConfig)
      ec.type = type
      state.config.subscribe[name] = ec
    },
    removeExchangeM (state, { name }) {
      console.log('removeExchangeM', name)
      if (!(name in state.config.subscribe)) {
        return
      }
      console.log('removeExchangeM del', name)
      delete state.config.subscribe[name]
      console.log(state.config.subscribe)
    },
    switchStatusM (state) {
      state.config.enable = !state.config.enable
    },
    switchExchangeStatusM (state, { name }) {
      if (!(name in state.config.subscribe)) {
        return
      }
      state.config.subscribe[name].enable = !state.config.subscribe[name].enable
    },
    updateExchangeTypeM (state, { name, type }) {
      if (!(name in state.config.subscribe)) {
        return
      }
      state.config.subscribe[name].type = type
    },
    updateRefreshFrequencyM (state, { time }) {
      state.config.refresh = time
    }
  },
  actions: {
    updateRefreshFrequency ({ commit }, { time }) {
      commit('updateRefreshFrequencyM', { time })
    },
    updateExchangeType ({ commit }, { name, type }) {
      commit('updateExchangeTypeM', { name, type })
    },
    switchExchangeStatus ({ commit }, { name }) {
      commit('switchExchangeStatusM', { name })
    },
    switchStatus ({ commit }) {
      commit('switchStatusM')
    },
    removeExchange ({ commit }, { name }) {
      console.log('removeExchange', name)
      return new Promise((resolve, reject) => {
        commit('removeExchangeM', { name })
        resolve()
      })
    },
    addExchange ({ commit }, { name, type }) {
      return new Promise((resolve, reject) => {
        commit('addExchangeM', { name, type })
        resolve()
      })
    },
    updateSymbols ({ commit }, { name, symbols }) {
      commit('updateSymbolsM', { name, symbols })
    }
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    createPersistedState(),
    createSharedMutations(),
    createPromiseAction()
  ],
  devtools: true
})
