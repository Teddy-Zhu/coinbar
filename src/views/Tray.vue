<template>
  <div style="overflow-x: hidden">
    <a-row type="flex" justify="space-around" align="middle" :gutter="16">
      <a-col :span="22" offset="1" class="control">
        <a-button :type="config.enable?'danger':'primary'" @click="updateStatus">
          {{ config.enable ? '禁用' : '启用' }}
        </a-button>
        <a-button type="primary" @click="addExchangeBtn">
          新增交易所
        </a-button>
        <a-button type="primary" @click="removeExchangeBtn">
          移除交易所
        </a-button>
      </a-col>
      <a-col :span="24">    <a-divider /></a-col>
      <a-col :span="2" offset="1">
        <label>名称</label>
      </a-col>
      <a-col :span="7">
        <a-input v-model="newExchange" placeholder="exchange name"/>
      </a-col>
      <a-col :span="2" offset="1">
        <label>type</label>
      </a-col>
      <a-col :span="7">
        <a-select :default-value="0" style="width: 100%" v-model="newType">
          <a-select-option :value="0">
            0(fetchTicker)
          </a-select-option>
          <a-select-option :value="1">
            1(fetchTickers)
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="24">    <a-divider />
      </a-col>
      <a-col :span="24">
        <a-tabs v-model="activeExchange">
          <a-tab-pane :key="name" :tab="name" v-for="(value, name) in config.subscribe">
            <a-row>
              <a-col :span="22" offset="1">
                <a-select :default-value="config.subscribe[name].type" style="width: 100%" @change="updateExchangeStatusSelect">
                  <a-select-option :value="0">
                    0(fetchTicker)
                  </a-select-option>
                  <a-select-option :value="1">
                    1(fetchTickers)
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="22" offset="1">
                <a-select mode="tags"
                          style="width: 100%"
                          :default-value="config.subscribe[name].symbols"
                          placeholder="请输入需要监听的Coin"
                          @change="changeSymbols(name,$event)"
                >
                  <a-select-option value="BTC/USDT">BTC/USDT</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="22" offset="1">
                <a-button :type="config.subscribe[name].enable?'danger':'primary'" @click="updateExchangeStatus">
                  {{ config.subscribe[name].enable ? '禁用' : '启用' }}
                </a-button>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Tray',
  computed: mapState(['config']),
  data () {
    return {
      newExchange: '',
      newType: 0,
      activeExchange: ''
    }
  },
  created () {
    this.activeExchange = Object.keys(this.config.subscribe)[0]
  },
  methods: {
    ...mapActions(['updateSymbols', 'addExchange', 'removeExchange', 'switchStatus', 'switchExchangeStatus', 'updateExchangeType']),
    updateExchangeStatusSelect (val) {
      this.updateExchangeStatus({
        name: this.activeExchange,
        type: val
      })
    },
    updateExchangeStatus () {
      if (!this.activeExchange) {
        return
      }
      this.switchExchangeStatus({
        name: this.activeExchange
      })
    },
    updateStatus () {
      this.switchStatus()
    },
    removeExchangeBtn () {
      if (!this.activeExchange) {
        return
      }
      this.removeExchange({
        name: this.activeExchange
      })
    },
    addExchangeBtn () {
      if (!this.newExchange) {
        this.$message.error('请输入交易所名称')
        return
      }
      if (this.newExchange in this.config.subscribe) {
        this.$message.error('该交易所已经存在')
      }
      this.addExchange({
        name: this.newExchange
      })
    },
    changeSymbols (name, value) {
      this.updateSymbols({
        name,
        symbols: value
      })
    }
  }
}
</script>

<style type="text/css">
.ant-col.control .ant-btn {
  margin-right: 10px;
}
</style>
