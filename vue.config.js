module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'coinbar',
        appId: 'com.v2dawn.coinbar',
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 130,
              y: 150,
              type: 'file'
            }
          ]
        },
        mac: {
          extendInfo: {
            LSUIElement: true
          },
          icon: 'src/assets/coinlogo.png'
        }
      },
      nodeIntegration: true
    }
  }
}
