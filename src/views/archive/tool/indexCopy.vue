<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryKey"
              placeholder="请输入工具关键字"
              class="input-with-select"
              clearable
              @clear="fetchDiyData"
              @keyup.enter.native="fetchDiyData"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchDiyData"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddTool">添加工具</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="flex-right">
        <el-button type="danger" plain @click="handelMultipleDelete">批量删除</el-button>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName" style="margin-top: 15px;" type="card">
      <el-tab-pane label="可DIY制作" name="isDIY">
        <keep-alive>
          <diy-pane ref="diyList" :queryKey="queryKey" @paneEdit="handleEdit(arguments)" />
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane label="不可DIY制作" name="notDIY">
        <keep-alive>
          <tool-pane ref="toolList" :queryKey="queryKey" @paneEdit="handleEdit(arguments)" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="添加工具" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newToolRef" :inline="false" :model="newTool" :rules="newToolRules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="可否DIY" prop="isDIY" required>
              <el-radio-group v-model="newTool.isDIY">
                <el-radio :label="true">可以DIY制作</el-radio>
                <el-radio :label="false">不可以DIY制作</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="isDIYBL">
            <el-form-item label="选择工具" prop="toolInfo">
              <el-select
                v-model="newTool.toolInfo"
                :remote-method="getToolList"
                filterable
                default-first-option
                remote
                value-key="_id"
                placeholder="搜索工具"
              >
                <el-option v-for="item in toolList" :key="item._id" :label="item.name" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="notDIY">
            <el-form-item label="工具名称" prop="name">
              <el-input v-model="newTool.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="notDIY">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newTool.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="notDIY">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newTool.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="notDIY">
            <el-form-item label="来源(多选)" prop="channels">
              <el-select v-model="newTool.channels" multiple collapse-tags placeholder="请选择获取途径">
                <el-option v-for="item in channelList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16" v-show="notDIY">
            <el-form-item label="照片" prop="photoSrc">
              <el-upload
                ref="upload"
                :action="uploadUrl"
                name="photoSrc"
                :multiple="false"
                :with-credentials="true"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="success" v-if="this.newTool.photoSrc">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input v-model.number="newTool.price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="耐久度" prop="durability">
              <el-input v-model.number="newTool.durability" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="途径说明" prop="channelDetail">
              <el-input v-model="newTool.channelDetail" type="textarea" placeholder="请输入具体途径说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postTool">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DiyPane from './components/DiyPane'
import ToolPane from './components/ToolPane'
import { mapState } from 'vuex'
import { searchRecipe } from '@/api/recipe'
import { addDiyTool, getDiyTool, deleteDiyTool } from '@/api/diyTool'
import { addTool, getTool, deleteTool } from '@/api/tool'

export default {
  name: '',
  components: { DiyPane, ToolPane },
  filters: {
    jpnFilter(text) {
      let jpnText = text.length > 5 ? text.substring(0, 5) + '...' : text
      return jpnText
    }
  },
  data() {
    return {
      tabOptions: [
        { label: '可DIY制作', key: 'isDIY' },
        { label: '不可DIY制作', key: 'notDIY' }
      ],
      activeName: 'isDIY',
      listLoading: true,
      queryKey: '',
      dialogAddVisible: false,
      newTool: {
        toolInfo: null,
        price: null,
        durability: null, //耐久度
        isDIY: null, //是否可DIY制作
        channelDetail: '', //获取途径详情
        name: '',
        engName: '',
        jpnName: '',
        channels: [],
        photoSrc: ''
      },
      toolList: [],
      isDIYList: [
        { text: '可以DIY制作', value: true },
        { text: '不可以DIY制作', value: false }
      ],
      channelList: [
        //获取途径
        { text: '商店购买', value: '商店购买' },
        { text: '狸端机兑换', value: '狸端机兑换' },
        { text: '岛民赠送', value: '岛民赠送' },
        { text: 'npc赠送', value: 'npc赠送' }
      ],
      newToolRules: {
        toolInfo: [{ required: true, message: '请选择工具', trigger: 'blur' }]
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
    isDIYBL() {
      let bl = false
      if (this.newTool.isDIY !== null && this.newTool.isDIY === true) bl = true
      return bl
    },
    notDIY() {
      let bl = false
      if (this.newTool.isDIY !== null && this.newTool.isDIY === false) bl = true
      return bl
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
    getToolList(query) {
      searchRecipe(query).then(response => {
        if (!response.data) return
        this.toolList = response.data
      })
    },
    handleRemove(file) {
      this.newTool.photoSrc = ''
    },
    handleSuccess(res) {
      // 图片上传成功后把临时地址保存到表单photoSrc属性中
      let src = res.data.path
      src = src.replace('/public', '')
      this.newTool.photoSrc = src
    },
    openAddTool() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newToolRef'].resetFields()
      })
    },
    dialogAddClose() {
      if (this.newTool.isDIY === false) {
        this.$refs.upload.clearFiles()
      }
      this.$refs['newToolRef'].resetFields()
      delete this.newTool._id
      delete this.newTool.__v
      this.toolList = []
    },
    postTool() {
      this.$refs.newToolRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        if (this.newTool.isDIY) {
          this.newTool.name = this.newTool.toolInfo.name
          addDiyTool(this.newTool).then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.dialogAddVisible = false
            // if (!this.newTool._id) this.queryInfo.page = 1
            this.$refs.diyList.fetchData()
          })
        } else {
          addTool(this.newTool).then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            this.$refs.toolList.fetchData()
          })
        }
      })
    },
    handleEdit(arg) {
      let id = arg[0]
      let type = arg[1]
      if (this.$refs['newToolRef']) {
        this.$refs['newToolRef'].resetFields()
      }
      if (type === 'isDIY') {
        getDiyTool(id).then(res => {
          this.dialogAddVisible = true
          // 回显数据
          this.$nextTick(function () {
            this.newTool = res.data
            this.toolList.push(this.newTool.toolInfo)
          })
        })
      } else {
        getTool(id).then(res => {
          this.dialogAddVisible = true
          // 回显数据
          this.$nextTick(function () {
            this.newTool = res.data
          })
        })
      }
    },
    handelMultipleDelete() {
      if (this.activeName === 'isDIY') {
        this.$refs.diyList.handelMultipleDelete()
      } else {
        this.$refs.toolList.handelMultipleDelete()
      }
    },
    fetchDiyData() {
      if (this.activeName === 'isDIY') {
        this.$refs.diyList.fetchData()
      } else {
        this.$refs.toolList.fetchData()
      }
    }
  }
}
</script>

<style scoped></style>
