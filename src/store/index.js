import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    config: {
      enable: true,
      subscribe: {
        binance: {
          type: 0,
          removeSuffix: true,
          symbols: []
        },
        mexc: {
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
      state.config.subscribe[name] = {
        type: 0,
        removeSuffix: true,
        symbols: []
      }
    },
    removeExchangeM (state, { name }) {
      if (!(name in state.config.subscribe)) {
        return
      }
      delete state.config.subscribe[name]
    }
  },
  actions: {
    removeExchange ({ commit }, name) {
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
