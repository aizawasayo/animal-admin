<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryKey"
              placeholder="请输入选项关键字"
              class="input-with-select"
              clearable
              @clear="fetchOptionData"
              @keyup.enter.native="fetchOptionData"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchOptionData"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddOption">添加选项</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="flex-right">
        <el-button type="danger" plain @click="handelMultipleDelete">批量删除</el-button>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName" style="margin-top: 15px;" type="card">
      <el-tab-pane v-for="(item, i) in tabOptions" :key="item.key" :label="item.label" :name="item.key">
        <keep-alive>
          <option-list ref="optionList" :type="item.key" :queryKey="queryKey" @paneEdit="handleEdit(arguments)" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
    <add-option
      ref="addOptionRef"
      :visible.sync="dialogAddVisible"
      :option="newOption"
      :tab-list="tabOptions"
      @freshData="fetchOptionData"
      @closeDialog="hideDialog"
    ></add-option>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import OptionList from '../components/OptionList'
import AddOption from '../components/AddOption'
import { getOption } from '@/api/option'

export default {
  name: 'OptionIndex',
  components: { OptionList, AddOption },
  props: ['tabOptions', 'activeTab'],
  data() {
    return {
      activeName: this.activeTab,
      queryKey: '',
      dialogAddVisible: false,
      newOption: {
        name: '',
        type: '',
        orderNum: null,
        position: '',
        duration: null,
        icon: '',
        color: ''
      },
      multipleSelection: []
    }
  },
  computed: {
    // 获取app模块的uploadUrl的三种方式
    // ...mapState(['app']), //使用是app.uploadUrl
    ...mapState('app', { uploadUrl: state => state.uploadUrl }),
    // ...mapGetters(['uploadUrl']), //推荐这种
    apiUrl() {
      return process.env.VUE_APP_BASE_API
    },
    tabIndex() {
      return this.tabOptions.findIndex(item => item.key === this.activeName)
    }
  },
  watch: {
    activeName(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    }
  },
  created() {
    const tab = this.$route.query.tab
    if (tab) {
      this.activeName = tab
    }
  },
  methods: {
    openAddOption() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      // this.$nextTick(function () {
      let type = this.tabOptions[this.tabIndex].key
      this.newOption = {
        name: '',
        type: type,
        orderNum: null,
        position: '',
        duration: null,
        icon: '',
        color: ''
      }
      //})
    },
    handleEdit(arg) {
      let id = arg[0]
      let type = arg[1]
      getOption(id).then(res => {
        this.dialogAddVisible = true
        this.newOption = res.data
      })
    },
    handelMultipleDelete() {
      this.$refs.optionList[this.tabIndex].handelMultipleDelete()
    },
    fetchOptionData() {
      this.$refs.optionList.forEach(item => item.fetchData())
      // this.$refs.optionList[this.tabIndex].fetchData()
    },
    hideDialog() {
      this.dialogAddVisible = false
    }
  }
}
</script>

<style scoped></style>
