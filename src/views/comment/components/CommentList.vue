<template>
  <div class="tabPane-container">
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
      <el-table-column label="评论用户" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.uid.username }}
        </template>
      </el-table-column>
      <el-table-column label="评论内容" align="center" prop="content">
        <template slot-scope="scope">
          {{ scope.row.content }}
        </template>
      </el-table-column>
      <el-table-column label="评论时间" width="200" align="center" prop="created_time">
        <template slot-scope="scope">
          {{ scope.row.created_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
        </template>
      </el-table-column>
      <el-table-column label="点赞数" width="100" align="center" prop="like">
        <template slot-scope="scope">
          {{ scope.row.like }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete(scope.row._id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryInfo.page"
      :limit.sync="queryInfo.pageSize"
      :page-sizes="pageSize"
      @pagination="fetchData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getComments, deleteComment } from '@/api/comment'

export default {
  name: 'CommentList',
  components: { Pagination },
  props: {
    type: {
      type: String
    },
    queryKey: {
      type: String
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      queryInfo: {
        query: this.queryKey,
        page: 1, // 当前的页数
        pageSize: 10, // 当前每页显示多少条数据
        sortJson: { created_time: 1 },
        sort: ''
      },
      pageSize: [8, 10, 15],
      total: 0,
      emptyText: '没有相关数据',
      multipleSelection: []
    }
  },
  computed: {
    ...mapGetters(['userId']), // 推荐这种
    apiUrl() {
      return process.env.VUE_APP_BASE_API
    }
  },
  watch: {
    queryKey(newVal) {
      this.queryInfo.query = newVal
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData(param) {
      this.listLoading = true
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getComments(this.type, this.queryInfo).then(response => {
        this.list = response.data.list
        this.total = response.data.total || 0
        this.listLoading = false
      })
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
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteComment, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteComment, this.fetchData)
    }
  }
}
</script>
