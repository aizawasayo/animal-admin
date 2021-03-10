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
          {{ scope.row.orderNum ? scope.row.orderNum : scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column v-if="isActivity" label="所属半球" align="center" prop="position" sortable="custom">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.position" :key="'activityPosition' + index">{{
            index === scope.row.position.length - 1 ? item : item + '/'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="isActivity" label="所在时期" align="center" prop="duration" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.duration }}
        </template>
      </el-table-column>
      <el-table-column v-if="isTopic" label="图标" align="center" prop="icon">
        <template slot-scope="scope">
          {{ scope.row.icon }}
        </template>
      </el-table-column>
      <el-table-column v-if="isTopic" label="颜色" align="center" prop="color">
        <template slot-scope="scope">
          {{ scope.row.color }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="$emit('paneEdit', scope.row._id, 'notDIY')"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete(scope.row._id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryInfo.page" :limit.sync="queryInfo.pageSize" @pagination="fetchData" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getOptions, deleteOption } from '@/api/option'

export default {
  name: 'OptionList',
  components: { Pagination },
  props: {
    type: {
      type: String
      //default: 'isDIY'
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
    apiUrl() {
      return process.env.VUE_APP_BASE_API
    },
    isActivity() {
      return this.type === 'activity'
    },
    isTopic() {
      return this.type === 'topic'
    }
  },
  created() {
    this.fetchData()
  },
  // beforeMount(e) { //
  //   console.log('beforeMount' + this.diyType)
  // },
  methods: {
    fetchData(param) {
      this.listLoading = true
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getOptions(this.queryInfo).then(response => {
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
      this.commonApi.deleteById(id, deleteOption, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteOption, this.fetchData)
    }
  }
}
</script>
