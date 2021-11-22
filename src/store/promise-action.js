// support vuex-electron promise return
// from issue https://github.com/vue-electron/vuex-electron/issues/8
import promiseIpc from 'electron-promise-ipc' // yarn add electron-promise-ipc

const DISPATCH = 'promise-action-dispatch'

export default (options = {}) => store => {
  function renderer () {
    store.dispatchPromise = (type, payload) =>
      promiseIpc.send(DISPATCH, {
        type,
        payload
      })
  }

  function main (store) {
    promiseIpc.on(DISPATCH, ({ type, payload }) => {
      return store.dispatch(type, payload)
    })
  }

  return process.type === 'renderer'
    ? renderer()
    : main(store)
}
