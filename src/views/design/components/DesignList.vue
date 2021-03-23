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
      @selection-change="selection => commonApi.handleSelectionChange(selection, this)"
      @filter-change="filters => commonApi.filterChange(filters, this)"
      @sort-change="sortInfo => commonApi.sortChange(sortInfo, this)"
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
      <el-table-column label="介绍" align="center" prop="content">
        <template slot-scope="scope">
          {{ scope.row.content }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="$emit('paneEdit', scope.row._id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete(scope.row._id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryInfo.page" :limit.sync="queryInfo.pageSize" @pagination="fetchData" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getDesignList, deleteDesign } from '@/api/design'

export default {
  name: 'DesignList',
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
        type: this.type,
        sortJson: {},
        sort: ''
      },
      total: 0,
      emptyText: '没有相关数据',
      multipleSelection: []
    }
  },
  watch: {
    queryKey(newVal) {
      this.queryInfo.query = newVal
    }
  },
  computed: {
    ...mapGetters(['userId', 'roles']) //推荐这种
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData(param) {
      this.listLoading = true
      if (this.roles.length === 1 && this.roles.includes('normal')) {
        this.queryInfo.user = this.userId
      }
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getDesignList(this.queryInfo)
        .then(response => {
          this.list = response.data.list
          this.total = response.data.total || 0
          this.listLoading = false
        })
        .catch(err => this.$message.error(err.message))
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteDesign, this.fetchData)
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteDesign, this.fetchData)
    }
  }
}
</script>
