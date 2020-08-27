<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddBoard">添加</el-button>
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
      <el-table-column align="center" label="照片" width="60" prop="photoSrc">
        <template slot-scope="scope">
          <img v-if="scope.row.photoSrc.length > 0 && scope.row.photoSrc[0].src" :src="apiUrl + scope.row.photoSrc[0].src" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="话题" align="center" column-key="topic" :filters="topicList">
        <template slot-scope="scope">
          {{ scope.row.topic }}
        </template>
      </el-table-column>
      <el-table-column label="详情" align="center">
        <template slot-scope="scope">
          {{ scope.row.content | textFilter }}
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
    <el-dialog title="发布信息" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newBoardRef" :inline="false" :model="newBoard" :rules="newBoardRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="话题" prop="topic">
              <el-select v-model="newBoard.topic" collapse-tags placeholder="请选择话题">
                <el-option v-for="item in topicList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
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
                :file-list="newBoard.photoSrc"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="success" v-if="newBoard.photoSrc[0]">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="" prop="content">
              <el-input v-model="newBoard.content" type="textarea" placeholder="把你想分享的说出来吧" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postBoard">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getBoardList, addBoard, getBoard, deleteBoard } from '@/api/board'
import getOption from '@/utils/get-option'

export default {
  components: { Pagination },
  filters: {
    textFilter(text) {
      let shortText = text
      if (text && text.length > 30) {
        shortText = text.substring(0, 30) + '...'
      }
      return shortText
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
      topicList: [],
      newBoard: {
        user: '',
        topic: '', // 话题
        content: '', // 详细内容
        photoSrc: []
      },
      newBoardRules: {
        topic: [{ required: true, message: '请选择话题', trigger: 'change' }]
      },
      multipleSelection: []
    }
  },
  computed: {
    ...mapState('app', { uploadUrl: state => state.uploadUrl }),
    ...mapGetters(['userId', 'roles']), //推荐这种
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
      if (this.roles[0] === 'normal') {
        this.queryInfo.user = this.userId
      }
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getBoardList(this.queryInfo).then(response => {
        this.list = response.data.records
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    getOptions() {
      getOption('topic', list => {
        this.topicList = list
        // this.topicList = List.map(item => {
        //   return {
        //     text: item.text,
        //     value: item.value === '不限话题' ? '' : item.value
        //   }
        // })
      })
    },
    handleRemove(file) {
      // 移除上传的图片
      let removePath = file.src
      //removePath = removePath.replace('/public', '')
      // 找出pics数组中要移除这项的索引
      let removeIndex = this.newBoard.photoSrc.findIndex(item => item.src === removePath)
      this.newBoard.photoSrc.splice(removeIndex)
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
    openAddBoard() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newBoardRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newBoardRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newBoard._id
      delete this.newBoard.__v
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
    postBoard() {
      this.$refs.newBoardRef.validate(valid => {
        this.newBoard.photoSrc = this.newBoard.photoSrc.concat(this.uploadList)
        this.uploadList = []
        if (!valid) return this.$message.error('请修改有误的表单项')
        this.newBoard.user = this.$store.getters.userId
        addBoard(this.newBoard).then(res => {
          this.$message({ message: res.message, type: 'success' })
          this.$refs.upload.clearFiles()
          this.dialogAddVisible = false
          // if (!this.newBoard._id) this.queryInfo.page = 1
          this.fetchData()
        })
      })
    },
    handleEdit(id) {
      if (this.$refs['newBoardRef']) {
        this.$refs['newBoardRef'].resetFields()
      }
      getBoard(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newBoard = res.data
        })
      })
    },
    handleDelete(id) {
      // 删除可批量
      this.$confirm('此操作将永久删除该工具, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBoard(id).then(res => {
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

<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
.el-input-number--medium {
  width: 50%;
}
</style>
