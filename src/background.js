'use strict'

import store from './store'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { menubar } from 'menubar'
// eslint-disable-next-line no-unused-vars
/* global __static */
const ccxt = require('ccxt')

const isDevelopment = process.env.NODE_ENV !== 'production'

let trayMenu
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
])

async function createWindow () {
  // Create the browser window.
  // const win = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //
  //     // Use pluginOptions.nodeIntegration, leave this alone
  //     // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
  //     nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
  //     contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
  //     enableRemoteModule: true
  //   }
  // })
  let url
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    url = process.env.WEBPACK_DEV_SERVER_URL
    // await win.loadURL(url)
    // if (process.env.NODE_ENV !== 'production') win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    url = 'app://./index.html'
    // win.loadURL(url)
  }

  // win.hide()
  // win.setSkipTaskbar(true)
  console.log(`url: ${url},static: ${__static}`)
  trayMenu = menubar({
    icon: `${__static}/bar.png`,
    index: url + '#/tray',
    browserWindow: {
      skipTaskbar: true,
      webPreferences: {

        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true
      }
    },
    showDockIcon: false,
    preloadWindow: true
  })

  trayMenu.on('after-create-window', () => {
    app.dock.hide()
  })
  trayMenu.on('ready', () => {
    // console.log('app is ready');
    // your app code here
    trayMenu.tray.addListener('right-click', () => {
      app.exit()
    })
    if (process.env.NODE_ENV !== 'production') trayMenu.window.webContents.openDevTools()
    updateCoinByExchange()
  })
}

const cacheExchangeTool = {}

function getExchangeInstance (exchange) {
  if (exchange in cacheExchangeTool) {
    return cacheExchangeTool[exchange]
  } else {
    const exchangeInstance = new ccxt[exchange]()
    cacheExchangeTool[exchange] = exchangeInstance
    return exchangeInstance
  }
}

async function updateCoinByExchange () {
  const allConfig = store.state.config
  const refreshInterval = allConfig.refresh
  const enable = allConfig.enable
  if (enable) {
    const config = allConfig.subscribe
    const msgStr = []
    try {
      for (const exchange in config) {
        const exchangeConfig = config[exchange]
        // console.log(`exchange: ${exchange}, config: ${JSON.stringify(exchangeConfig)}`)
        if (!exchangeConfig.enable) {
          continue
        }
        const exchangeObj = getExchangeInstance(exchange)
        const removeSuffix = exchangeConfig.removeSuffix
        if (exchangeConfig.type === 0) {
          for (const i in exchangeConfig.symbols) {
            const symbol = exchangeConfig.symbols[i]
            const ticker = await exchangeObj.fetchTicker(symbol)
            msgStr.push(`${removeSuffix ? symbol.split('/')[0] : symbol} ${ticker.last}`)
          }
        } else {
          const tickers = await exchangeObj.fetchTickers(exchangeConfig.symbols)
          // console.log(typeof tickers)
          for (const tickerName of Object.keys(tickers)) {
            const ticker = tickers[tickerName]
            msgStr.push(`${removeSuffix ? ticker.symbol.split('/')[0] : ticker.symbol} ${ticker.last}`)
          }
        }
      }
    } catch (e) {
      console.log(e)
    }

    trayMenu.tray.setTitle(msgStr.join('·'))
  } else {
    trayMenu.tray.setTitle('plugin disabled')
  }
  setTimeout(updateCoinByExchange, refreshInterval * 1000)
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
