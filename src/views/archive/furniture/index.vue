<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入家具关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddFurniture">添加家具</el-button>
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
      <el-table-column align="center" label="照片" width="60" prop="photoSrc" sortable="custom">
        <template slot-scope="scope">
          <img v-if="scope.row.photoSrc.length > 0 && scope.row.photoSrc[0].src" :src="apiUrl + scope.row.photoSrc[0].src" width="25" height="25" />
          <img v-else-if="scope.row.photoSrc.length > 0 && scope.row.photoSrc[0]" :src="apiUrl + scope.row.photoSrc" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" prop="price" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="英文名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.engName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.jpnName | textFilter(5) }}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" column-key="type" :filters="typeList">
        <template slot-scope="scope">
          {{ scope.row.type.join('/') }}
        </template>
      </el-table-column>
      <el-table-column label="获取途径" align="center" column-key="channels" :filters="channelList">
        <template slot-scope="scope">
          <span v-if="scope.row.activity">{{ scope.row.activity }}/</span>
          <span> {{ scope.row.channels.join('/') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="系列" align="center" prop="series" column-key="series" :filters="seriesList">
        <template slot-scope="scope">
          {{ scope.row.series }}
        </template>
      </el-table-column>
      <el-table-column label="占地面积" align="center" prop="size" sortable="custom" column-key="size" :filters="sizeList">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="改造类型" align="center" prop="remould" column-key="remould" :filters="remouldList">
        <template slot-scope="scope">
          {{ scope.row.remould }}
        </template>
      </el-table-column>
      <el-table-column label="订购类型" align="center" prop="orderType" sortable="custom" column-key="orderType" :filters="orderTypeList">
        <template slot-scope="scope">
          {{ scope.row.orderType }}
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
    <el-dialog title="添加家具" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newFurnitureRef" :inline="false" :model="newFurniture" :rules="newFurnitureRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newFurniture.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName" required>
              <el-input v-model="newFurniture.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newFurniture.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类型" prop="type" required>
              <el-select v-model="newFurniture.type" multiple collapse-tags placeholder="请选择种类">
                <el-option v-for="item in typeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格" prop="price" required>
              <el-input v-model.number="newFurniture.price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="尺寸" prop="size" required>
              <el-select v-model="newFurniture.size" placeholder="请选择占地面积">
                <el-option v-for="item in sizeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="改造类型" prop="remould">
              <el-select v-model="newFurniture.remould" placeholder="请选择改造类型">
                <el-option v-for="item in remouldList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订购类型" prop="orderType">
              <el-select v-model="newFurniture.orderType" placeholder="请选择订购类型">
                <el-option v-for="item in orderTypeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源(多选)" prop="channels">
              <el-select v-model="newFurniture.channels" multiple collapse-tags placeholder="请选择获取途径">
                <el-option v-for="item in channelList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属系列" prop="series">
              <el-select v-model="newFurniture.series" placeholder="请选择所属系列">
                <el-option v-for="item in seriesList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属活动" prop="activity">
              <el-select v-model="newFurniture.activity" placeholder="请选择所属活动">
                <el-option v-for="item in activityList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="照片" prop="photoSrc">
              <el-upload
                ref="upload"
                :action="uploadUrl"
                name="photoSrc"
                :multiple="true"
                :with-credentials="true"
                :file-list="newFurniture.photoSrc"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="success" v-if="this.newFurniture.photoSrc[0]">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="途径说明" prop="channelDetail">
              <el-input v-model="newFurniture.channelDetail" type="textarea" placeholder="请输入具体途径说明" />
            </el-form-item>
          </el-col>
          <el-col :span="24"> </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postFurniture">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import { getFurnitureList, addFurniture, getFurniture, deleteFurniture, searchFurniture } from '@/api/furniture'
import getOption from '@/utils/get-option'

export default {
  name: 'Furniture',
  components: { Pagination },
  filters: {},
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
      uploadList: [], // 自定义的数组，用于处理fileList，fileList是只读的
      newFurniture: {
        name: '',
        engName: '',
        jpnName: '',
        price: null,
        type: ['家具'],
        remould: '多颜色', // 能否改造
        orderType: '订购', //订购类型
        character: '',
        series: '', //所属系列
        size: '1.0×1.0', //占地面积
        activity: '',
        channels: ['Nook商店'], //获取途径
        channelDetail: '', //获取途径详情
        photoSrc: []
      },
      typeList: [],
      sizeList: [],
      remouldList: [
        { text: '可改造', value: '可改造' },
        { text: '不可改造', value: '不可改造' },
        { text: '多颜色', value: '多颜色' }
      ],
      orderTypeList: [
        { text: '订购', value: '订购' },
        { text: '不可订购', value: '不可订购' },
        { text: '里数兑换', value: '里数兑换' },
        { text: '非卖品', value: '非卖品' }
      ],
      seriesList: [],
      activityList: [],
      npcList: [
        { text: '狸克', value: '狸克' },
        { text: '西施惠', value: '西施惠' },
        { text: '傅珂', value: '傅珂' },
        { text: '傅达', value: '傅达' },
        { text: '雪人', value: '雪人' },
        { text: '巴猎', value: '巴猎' },
        { text: '蹦蹦', value: '蹦蹦' },
        { text: '健兆', value: '健兆' },
        { text: '阿獭', value: '阿獭' }
      ],
      channelList: [
        //获取途径
      ],
      newFurnitureRules: {
        name: [
          { required: true, message: '请输入家具名', trigger: 'blur' },
          { min: 1, max: 24, message: '长度在 1 到 24 个字符', trigger: 'blur' }
        ]
      },
      multipleSelection: []
    }
  },
  computed: {
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
      getFurnitureList(this.queryInfo).then(response => {
        this.list = response.data.list
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    getOptions() {
      getOption('furnitureChannels', list => {
        this.channelList = list
      })
      getOption('furnitureType', list => {
        this.typeList = list
      })
      getOption('series', list => {
        this.seriesList = list
      })
      getOption('size', list => {
        this.sizeList = list
      })
      getOption('activity', list => {
        this.activityList = list
      })
    },
    handleRemove(file) {
      let removePath = file.src
      let removeIndex = this.newFurniture.photoSrc.findIndex(item => item.src === removePath)
      this.newFurniture.photoSrc.splice(removeIndex, 1)
    },
    handleSuccess(res) {
      let files = res.data
      let pic = files[0]
      let src = pic.path
      let name = pic.name
      src = src.replace('/public', '')
      let newPic = { name: name, src: src }
      this.uploadList.push(newPic)
    },
    openAddFurniture() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newFurnitureRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newFurnitureRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newFurniture._id
      delete this.newFurniture.__v
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
    postFurniture() {
      this.$refs.newFurnitureRef.validate(valid => {
        this.newFurniture.photoSrc = this.newFurniture.photoSrc.concat(this.uploadList)
        this.uploadList = []
        if (!valid) return this.$message.error('请修改有误的表单项')
        addFurniture(this.newFurniture)
          .then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            // if (!this.newFurniture._id) this.queryInfo.page = 1
            this.fetchData()
          })
          .catch(err => this.$message({ message: err.message, type: 'error' }))
      })
    },
    handleEdit(id) {
      if (this.$refs['newFurnitureRef']) {
        this.$refs['newFurnitureRef'].resetFields()
      }
      getFurniture(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newFurniture = res.data
        })
      })
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteFurniture, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteFurniture, this.fetchData)
    }
  }
}
</script>

<style scoped></style>
