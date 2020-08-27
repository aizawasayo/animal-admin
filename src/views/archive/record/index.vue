<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入唱片关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddRecord">添加唱片</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="flex-right">
        <!-- <el-select v-model="queryInfo.breed" clearable placeholder="筛选种族" style="margin-right: 10px" @change="fetchData('new')">
          <el-option v-for="item in breedList" :label="item.text" :value="item.value" />
        </el-select> -->
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
      <el-table-column align="center" label="封面" width="60" prop="photoSrc">
        <template slot-scope="scope">
          <img v-if="scope.row.photoSrc.length > 0 && scope.row.photoSrc[0].src" :src="apiUrl + scope.row.photoSrc[0].src" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="英文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.engName }}
        </template>
      </el-table-column>
      <el-table-column label="日文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.jpnName | jpnFilter }}
        </template>
      </el-table-column>
      <el-table-column label="买入价格" align="center" prop="price" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="售出价格" align="center">
        <template slot-scope="scope">
          {{ scope.row.salePrice }}
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.channel" :key="'channel' + index">{{
            index === scope.row.channel.length - 1 ? item : item + '/'
          }}</span>
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
    <el-dialog title="添加唱片" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newRecordRef" :inline="false" :model="newRecord" :rules="newRecordRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newRecord.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newRecord.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newRecord.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="买入价格" prop="price">
              <el-input v-model.number="newRecord.price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="售出价格" prop="salePrice">
              <el-input v-model.number="newRecord.salePrice" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源" prop="channel" required>
              <el-select v-model="newRecord.channel" multiple collapse-tags placeholder="请选择获取方式">
                <el-option v-for="item in channelList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="封面" prop="photoSrc">
              <el-upload
                ref="upload"
                :action="uploadUrl"
                name="photoSrc"
                :multiple="true"
                :with-credentials="true"
                :file-list="newRecord.photoSrc"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="success" v-if="newRecord.photoSrc[0]">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postRecord">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import { getRecords, addRecord, getRecord, deleteRecord } from '@/api/record'
import getOption from '@/utils/get-option'

export default {
  components: { Pagination },
  filters: {
    jpnFilter(text) {
      let jpnText = ''
      text && text.length > 5 ? (jpnText = text.substring(0, 5) + '...') : (jpnText = text)
      return jpnText
    },
    introFilter(text) {
      return text ? text.substring(0, 10) + '...' : '无赝品'
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
      uploadList: [], // 自定义的数组，用于处理fileList，fileList是只读的
      newRecord: {
        name: '',
        engName: '',
        jpnName: '',
        price: 3200,
        salePrice: 800,
        channel: [],
        photoSrc: []
      },
      channelList: [
        { text: 'Nook购物', value: 'Nook购物' },
        { text: 'KK赠送', value: 'KK赠送' },
        { text: '第一次KK演唱会后', value: '第一次KK演唱会后' },
        { text: '生日当天KK赠送', value: '生日当天KK赠送' },
        { text: '隐藏歌曲', value: '隐藏歌曲' }
      ],
      newRecordRules: {
        name: [
          { required: true, message: '请输入唱片名', trigger: 'blur' },
          { min: 1, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur' }
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
    },
    // isNpc() {
    //   let isNpc = this.newRecord.channels.includes('npc赠送')
    //   return isNpc
    // },
    isSale() {
      let isSaleBl = this.newRecord.orderType === '订购'
      return isSaleBl
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
      getRecords(this.queryInfo).then(response => {
        this.list = response.data.records
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    getOptions() {
      getOption('size', list => {
        this.sizeList = list
      })
    },
    handleRemove(file) {
      // 移除上传的图片
      let removePath = file.src
      //removePath = removePath.replace('/public', '')
      // 找出pics数组中要移除这项的索引
      let removeIndex = this.newRecord.photoSrc.findIndex(item => item.src === removePath)
      this.newRecord.photoSrc.splice(removeIndex)
    },
    handleSuccess(res) {
      // 图片上传成功后把临时地址保存到表单photoSrc属性中
      let files = res.data
      let pic = files[0]
      let src = pic.path
      let name = pic.name
      src = src.replace('/public', '')
      let newPic = { name: name, src: src }
      this.uploadList.push(newPic)
    },
    openAddRecord() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newRecordRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newRecordRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newRecord._id
      delete this.newRecord.__v
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
    postRecord() {
      this.$refs.newRecordRef.validate(valid => {
        this.newRecord.photoSrc = this.newRecord.photoSrc.concat(this.uploadList)
        this.uploadList = []
        if (!valid) return this.$message.error('请修改有误的表单项')
        addRecord(this.newRecord).then(res => {
          this.$message({ message: res.message, type: 'success' })
          this.$refs.upload.clearFiles()
          this.dialogAddVisible = false
          // if (!this.newRecord._id) this.queryInfo.page = 1
          this.fetchData()
        })
      })
    },
    handleEdit(id) {
      if (this.$refs['newRecordRef']) {
        this.$refs['newRecordRef'].resetFields()
      }
      getRecord(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newRecord = res.data
        })
      })
    },
    handleDelete(id) {
      // 删除岛民方法，可批量
      this.$confirm('此操作将永久删除该服饰, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteRecord(id).then(res => {
            this.$message({ type: 'success', message: res.message })
            this.fetchData()
          })
        })
        .catch(() => {
          this.$message({ type: 'info', message: '已取消删除' })
        })
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      // 批量删除岛民
      if (this.multipleSelection.length === 0) {
        return this.$message({
          type: 'warning',
          message: '请先选中至少一条数据！'
        })
      }
      let id = ''
      this.multipleSelection.forEach(val => {
        id += val._id + ','
      })
      id = id.substring(0, id.length - 1)
      this.handleDelete(id)
    }
  }
}
</script>

<style scoped></style>
