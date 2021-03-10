<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input v-model="queryInfo.query" placeholder="请输入标题关键字" class="input-with-select" clearable @clear="fetchData">
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddBanner">添加焦点图</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="flex-right">
        <el-button type="danger" plain @click="handelMultipleDelete">批量删除</el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
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
      <el-table-column align="center" label="图片" width="80">
        <template slot-scope="scope">
          <img v-if="scope.row.avatar" :src="apiUrl + scope.row.avatar" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="链接" align="center" prop="link" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.link }}
        </template>
      </el-table-column>
      <el-table-column label="发布日期" align="center" prop="created_time" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.created_time | parseTime('{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center" prop="state" column-key="state" :filters="stateList" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.state === 0 ? '启用' : '禁用' }}
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
    <el-dialog title="添加焦点图" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newBannerRef" :inline="false" :model="newBanner" :rules="newBannerRules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-if="newBanner._id" v-model="newBanner.title" />
              <el-input v-else v-model="newBanner.title" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="链接" prop="link">
              <el-input v-model="newBanner.link" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="state">
              <el-radio-group v-model="newBanner.state">
                <el-radio :label="0">启用</el-radio>
                <el-radio :label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="图片" prop="avatar">
              <el-upload
                ref="upload"
                :action="uploadUrl"
                name="avatar"
                :multiple="false"
                :with-credentials="true"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="success" v-if="this.newBanner.avatar">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postBanner">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getBanners, addBanner, getBanner, deleteBanner } from '@/api/banner'

export default {
  name: 'Banner',
  components: { Pagination },
  data() {
    const checkPass = (rule, value, callback) => {
      // 至少8个字符，至少1个大写字母，1个小写字母和1个数字,不能包含特殊字符（非数字字母）：
      // ^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$
      const reg = new RegExp(/^[a-zA-Z0-9]{8,16}$/)
      if (!value) {
        callback(new Error('密码不能为空'))
      } else if (!reg.test(value)) {
        callback(new Error('密码不符合规则'))
      } else {
        callback()
      }
    }
    return {
      list: null,
      loading: true,
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
      newBanner: {
        title: '',
        link: '',
        avatar: '',
        state: 0
      },
      stateList: [
        { text: '启用', value: 0 },
        { text: '禁用', value: 1 }
      ],
      newBannerRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
        ]
      },
      multipleSelection: []
    }
  },
  computed: {
    uploadUrl() {
      const url = process.env.VUE_APP_BASE_API + '/admin/user/upload'
      return url
    },
    apiUrl() {
      return process.env.VUE_APP_BASE_API
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData(param) {
      this.loading = true
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getBanners(this.queryInfo).then(res => {
        this.list = res.data.list
        this.total = res.data.total
        this.loading = false
      })
    },
    handleRemove(file) {
      this.newBanner.avatar = ''
    },
    handleSuccess(res) {
      let src = res.data.path
      src = src.replace('/public', '')
      this.newBanner.avatar = src
    },
    openAddBanner() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newBannerRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newBannerRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newBanner._id
      delete this.newBanner.__v
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
    postBanner() {
      // 新增用户
      this.$refs.newBannerRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        addBanner(this.newBanner)
          .then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            this.queryInfo.page = 1
            this.fetchData()
          })
          .catch(err => this.$message({ message: err.message, type: 'error' }))
      })
    },
    handleEdit(id) {
      if (this.$refs['newBannerRef']) {
        this.$refs['newBannerRef'].resetFields()
      }
      // 查询并编辑用户信息
      getBanner(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newBanner = res.data
        })
      })
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteBanner, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteBanner, this.fetchData)
    }
  }
}
</script>
<style scoped></style>
