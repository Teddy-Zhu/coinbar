import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'
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
      enable: true,
      subscribe: {
        binance: {
          enable: true,
          type: 0,
          removeSuffix: true,
          symbols: []
        },
        mexc: {
          enable: true,
          type: 0,
          removeSuffix: true,
          symbols: ['BTC/USDT', 'ICP/USDT', 'BIT/USDT', 'SWASH/USDT', 'MX/USDT']
        }
      }
    }
  },
  mutations: {
    updateSymbolsM (state, { name, symbols }) {
      // console.log('updateSymbols', name, symbols)
      state.config.subscribe[name].symbols = symbols
    },
    addExchangeM (state, { name }) {
      if (name in state.config.subscribe) {
        return
      }
      state.config.subscribe[name] = _.cloneDeep(state.defaultExchangeConfig)
    },
    removeExchangeM (state, { name }) {
      if (!(name in state.config.subscribe)) {
        return
      }
      delete state.config.subscribe[name]
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
    }
  },
  actions: {
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
      commit('removeExchangeM', name)
    },
    addExchange ({ commit }, { name }) {
      commit('updateSymbolsM', { name })
    },
    updateSymbols ({ commit }, { name, symbols }) {
      commit('updateSymbolsM', { name, symbols })
    }
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    createPersistedState(),
    createSharedMutations()
  ],
  devtools: true
})
