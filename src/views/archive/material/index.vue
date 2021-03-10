<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入素材名称关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddMaterial">添加素材</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="flex-right">
        <el-button type="danger" plain @click="handelMultipleDelete">批量删除</el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :empty-text="emptyText"
      @selection-change="handleSelectionChange"
      @filter-change="filterChange"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" width="40" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column align="center" label="序号" width="55">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="照片" width="60">
        <template slot-scope="scope">
          <img v-if="scope.row.photoSrc" :src="apiUrl + scope.row.photoSrc" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" width="80" prop="price" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="英文名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.engName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日文名" align="center" column-key="price">
        <template slot-scope="scope">
          {{ scope.row.jpnName }}
        </template>
      </el-table-column>
      <el-table-column label="堆叠数量" width="80" align="center" column-key="maxNum">
        <template slot-scope="scope">
          {{ scope.row.maxNum }}
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" prop="channels" sortable="custom">
        <template slot-scope="scope">
          <span v-if="scope.row.season && scope.row.season.length !== 0">{{ scope.row.season.join('/') }}</span>
          <span v-if="scope.row.activity">{{ scope.row.activity }}期间</span>
          <span>{{ scope.row.channels.join('/') }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="handleEdit(scope.row._id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete(scope.row._id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryInfo.page" :limit.sync="queryInfo.pageSize" @pagination="fetchData" />
    <el-dialog title="添加素材" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newMaterialRef" :inline="false" :model="newMaterial" :rules="newMaterialRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newMaterial.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newMaterial.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newMaterial.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input v-model.number="newMaterial.price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属活动" prop="activity">
              <el-select v-model="newMaterial.activity" placeholder="请选择所属活动">
                <el-option v-for="item in activityList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属季节" prop="season">
              <el-select v-model="newMaterial.season" multiple placeholder="请选择出现季节">
                <el-option v-for="item in seasonList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源(多选)" prop="channels">
              <el-select v-model="newMaterial.channels" multiple collapse-tags placeholder="请选择获取途径">
                <el-option v-for="item in channelList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="堆叠数量" prop="maxNum">
              <el-input v-model.number="newMaterial.maxNum" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
                <el-button size="small" type="success" v-if="this.newMaterial.photoSrc">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postMaterial">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import { getMaterials, addMaterial, getMaterial, deleteMaterial } from '@/api/material'
import getOption from '@/utils/get-option'

export default {
  name: 'Material',
  components: { Pagination },
  filters: {
    introFilter(text) {
      return text.substring(0, 20) + '...'
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      queryInfo: {
        query: '',
        page: 1, // 当前的页数
        pageSize: 10, // 当前每页显示多少条数据
        sortJson: {},
        sort: ''
      },
      total: 0,
      dialogAddVisible: false,
      emptyText: '没有相关数据',
      newMaterial: {
        name: '',
        price: null,
        engName: '',
        jpnName: '',
        activity: '',
        season: [],
        maxNum: null,
        channels: [],
        photoSrc: ''
      },
      activityList: [],
      seasonList: [],
      channelList: [
        { text: '商店购买', value: '商店购买' },
        { text: '狸端机订购', value: '狸端机订购' },
        { text: '岛民赠送', value: '岛民赠送' },
        { text: 'npc赠送', value: 'npc赠送' },
        { text: '素材岛挖掘', value: '素材岛挖掘' },
        { text: '花卉杂交', value: '花卉杂交' },
        { text: '星座当月许愿', value: '星座当月许愿' },
        { text: '对流星许愿次日', value: '对流星许愿次日' },
        { text: '海滩拾取', value: '海滩拾取' },
        { text: '海滩喷水处挖掘', value: '海滩喷水处挖掘' },
        { text: '树边采集', value: '树边采集' },
        { text: '砍树掉落', value: '砍树掉落' },
        { text: '摇晃树干', value: '摇晃树干' },
        { text: '砍竹子', value: '砍竹子' },
        { text: '敲石头', value: '敲石头' },
        { text: '钓鱼', value: '钓鱼' },
        { text: '挖掘地面', value: '挖掘地面' },
        { text: '打落气球', value: '打落气球' },
        { text: '果树掉落', value: '果树掉落' },
        { text: '非果树掉落', value: '非果树掉落' },
        { text: '针叶树掉落', value: '针叶树掉落' },
        { text: '阔叶树掉落', value: '阔叶树掉落' },
        { text: '打落蓝色气球', value: '打落蓝色气球' },
        { text: '捕虫网捕捉', value: '捕虫网捕捉' },
        { text: '潜水打捞', value: '潜水打捞' },
        { text: '与阿獭交换帆立贝随机获得', value: '与阿獭交换帆立贝随机获得' }
      ],
      newMaterialRules: {
        name: [
          { required: true, message: '请输入素材名字', trigger: 'blur' },
          { min: 1, max: 16, message: '长度在 2 到 16 个字符', trigger: 'blur' }
        ]
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
    }
  },
  created() {
    this.fetchData()
    this.getOptions()
  },
  methods: {
    fetchData(param) {
      this.listLoading = true
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getMaterials(this.queryInfo).then(response => {
        this.list = response.data.list
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    getOptions() {
      getOption('activity', list => {
        this.activityList = list
      })
      getOption('season', list => {
        this.seasonList = list
      })
    },
    handleRemove(file) {
      this.newMaterial.photoSrc = ''
    },
    handleSuccess(res) {
      // 图片上传成功后把临时地址保存到表单photoSrc属性中
      let src = res.data.path
      src = src.replace('/public', '')
      this.newMaterial.photoSrc = src
    },
    openAddMaterial() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newMaterialRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newMaterialRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newMaterial._id
      delete this.newMaterial.__v
    },
    filterChange(filter) {
      Object.assign(this.queryInfo, filter)
      this.fetchData('new')
    },
    sortChange(sortInfo) {
      let order = sortInfo.order
      order === 'ascending' ? (order = 1) : (order = -1)
      this.queryInfo.sortJson = {}
      this.queryInfo.sortJson[sortInfo.prop] = order
      this.queryInfo.sort = JSON.stringify(this.queryInfo.sortJson)
      this.fetchData('new')
    },
    postMaterial() {
      this.$refs.newMaterialRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        addMaterial(this.newMaterial)
          .then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            //this.queryInfo.page = 1
            this.fetchData()
          })
          .catch(err => this.$message({ message: err.message, type: 'error' }))
      })
    },
    handleEdit(id) {
      if (this.$refs['newMaterialRef']) {
        this.$refs['newMaterialRef'].resetFields()
      }
      // 查询并编辑岛民信息
      getMaterial(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newMaterial = res.data
        })
      })
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteMaterial, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteMaterial, this.fetchData)
    }
  }
}
</script>

<style scoped></style>
