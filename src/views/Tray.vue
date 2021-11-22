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
      <a-col :span="24">    <a-divider>Global Setting</a-divider> </a-col>
      <a-col :span="22" offset="1">
        <a-form :label-col="{ span: 5 }">
          <a-form-item label="refresh frequency">
            <a-input-number v-model="refresh" :min="1" @change="updateRefreshFrequencyBtn" />
          </a-form-item>
        </a-form>
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
      refresh: 10,
      newExchange: '',
      newType: 0,
      activeExchange: ''
    }
  },
  created () {
    this.activeExchange = Object.keys(this.config.subscribe)[0]
    this.refresh = this.config.refresh
  },
  methods: {
    ...mapActions(['updateSymbols',
      'updateRefreshFrequency',
      'addExchange', 'removeExchange',
      'switchStatus', 'switchExchangeStatus', 'updateExchangeType']),
    updateRefreshFrequencyBtn (value) {
      this.updateRefreshFrequency({ time: value })
    },
    updateExchangeStatusSelect (val) {
      this.updateExchangeType({
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
      console.log(this.activeExchange)
      if (!this.activeExchange) {
        return
      }
      this.$store.dispatchPromise('removeExchange', {
        name: this.activeExchange
      }).then(() => {
        this.$nextTick(() => {
          if (Object.keys(this.config.subscribe).length > 0) {
            this.activeExchange = Object.keys(this.config.subscribe)[0]
          }
        })
      })
    },
    async addExchangeBtn () {
      if (!this.newExchange) {
        this.$message.error('请输入交易所名称')
        return
      }
      if (this.newExchange in this.config.subscribe) {
        this.$message.error('该交易所已经存在')
      }
      this.$store.dispatchPromise('addExchange', {
        name: this.newExchange,
        type: this.newType
      }).then(() => {
        this.$nextTick(() => {
          this.activeExchange = this.newExchange
        })
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
.control {
  margin-top: 10px;
}
.ant-col.control .ant-btn {
  margin-right: 10px;
}
</style>
