<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入艺术品关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddArtwork">添加艺术品</el-button>
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
      <el-table-column align="center" label="照片" width="60" prop="photoSrc">
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
      <el-table-column label="价格" align="center" prop="price" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="英文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.engName }}
        </template>
      </el-table-column>
      <el-table-column label="日文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.jpnName | textFilter(5) }}
        </template>
      </el-table-column>
      <el-table-column label="真名" align="center">
        <template slot-scope="scope">
          {{ scope.row.realName }}
        </template>
      </el-table-column>
      <el-table-column label="售出价格" align="center">
        <template slot-scope="scope"> {{ scope.row.salePrice }}（赝品为0） </template>
      </el-table-column>
      <el-table-column label="占地面积" align="center">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="赝品特征" align="center">
        <template slot-scope="scope">
          {{ scope.row.fakeCharacter | introFilter }}
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
    <el-dialog title="添加艺术品" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newArtworkRef" :inline="false" :model="newArtwork" :rules="newArtworkRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newArtwork.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newArtwork.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newArtwork.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="真名" prop="realName">
              <el-input v-model="newArtwork.realName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input v-model.number="newArtwork.price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="售出价格" prop="salePrice">
              <el-input v-model.number="newArtwork.salePrice" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="占地面积" prop="size" required>
              <el-select v-model="newArtwork.size" collapse-tags placeholder="请选择尺寸">
                <el-option v-for="item in sizeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
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
                :file-list="newArtwork.photoSrc"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="success" v-if="newArtwork.photoSrc[0]">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="赝品特征" prop="fakeCharacter">
              <el-input v-model="newArtwork.fakeCharacter" type="textarea" placeholder="请输入赝品特征" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="相关信息" prop="introduction">
              <el-input v-model="newArtwork.introduction" type="textarea" placeholder="请输入详细信息与描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postArtwork">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import { getArtworkList, addArtwork, getArtwork, deleteArtwork } from '@/api/artwork'
import getOption from '@/utils/get-option'

export default {
  name: 'Artwork',
  components: { Pagination },
  filters: {
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
      newArtwork: {
        name: '',
        engName: '',
        jpnName: '',
        realName: '',
        price: 4980,
        salePrice: 1245,
        size: '',
        hasFake: null,
        fakeCharacter: '',
        introduction: '',
        photoSrc: []
      },
      sizeList: [],
      newArtworkRules: {
        name: [
          { required: true, message: '请输入服饰名', trigger: 'blur' },
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
    isSale() {
      let isSaleBl = this.newArtwork.orderType === '订购'
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
      getArtworkList(this.queryInfo).then(response => {
        this.list = response.data.list
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
      // 找出pics数组中要移除这项的索引
      let removeIndex = this.newArtwork.photoSrc.findIndex(item => item.src === removePath)
      this.newArtwork.photoSrc.splice(removeIndex)
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
    openAddArtwork() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newArtworkRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newArtworkRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newArtwork._id
      delete this.newArtwork.__v
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
    postArtwork() {
      this.$refs.newArtworkRef.validate(valid => {
        this.newArtwork.photoSrc = this.newArtwork.photoSrc.concat(this.uploadList)
        this.uploadList = []
        this.newArtwork.fakeCharacter ? (this.newArtwork.hasFake = true) : (this.newArtwork.hasFake = false)
        if (!valid) return this.$message.error('请修改有误的表单项')
        addArtwork(this.newArtwork)
          .then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            // if (!this.newArtwork._id) this.queryInfo.page = 1
            this.fetchData()
          })
          .catch(err => this.$message({ message: err.message, type: 'error' }))
      })
    },
    handleEdit(id) {
      if (this.$refs['newArtworkRef']) {
        this.$refs['newArtworkRef'].resetFields()
      }
      getArtwork(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newArtwork = res.data
        })
      })
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteArtwork, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteArtwork, this.fetchData)
    }
  }
}
</script>

<style scoped></style>
