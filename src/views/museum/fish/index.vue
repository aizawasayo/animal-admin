<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入鱼类名称关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddFish">添加鱼类</el-button>
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
      <el-table-column align="center" label="序号" width="50">
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
          {{ scope.row.jpnName }}
        </template>
      </el-table-column>
      <el-table-column label="出现月份" align="center">
        <el-table-column label="北半球" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.activeTime.north[0] === '全年'">全年</span>
            <span v-else>
              {{ scope.row.activeTime.north[0] + '-' + scope.row.activeTime.north[scope.row.activeTime.north.length - 1] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="南半球" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.activeTime.south[0] === '全年'">全年</span>
            <span v-else>
              {{ scope.row.activeTime.south[0] + '-' + scope.row.activeTime.south[scope.row.activeTime.south.length - 1] }}
            </span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="场所" align="center" column-key="locale" :filters="localeList">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.locale" :key="'locale' + index">{{
            index === scope.row.locale.length - 1 ? item : item + '、'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间段" align="center">
        <template slot-scope="scope">
          {{ scope.row.period === '1点-24点' ? '全天' : scope.row.period }}
        </template>
      </el-table-column>
      <el-table-column label="鱼影" align="center" width="50" prop="shadow" sortable="custom" column-key="shadow" :filters="shadowList">
        <template slot-scope="scope">
          {{ scope.row.shadow }}
        </template>
      </el-table-column>
      <el-table-column label="解锁条件" align="center" width="50">
        <template slot-scope="scope">
          {{ scope.row.unlockCondition ? '有' : '无' }}
        </template>
      </el-table-column>
      <el-table-column label="稀有度" align="center" prop="rarity" sortable="custom" column-key="rarity" :filters="rarityList">
        <template slot-scope="scope">
          {{ scope.row.rarity }}
        </template>
      </el-table-column>
      <el-table-column label="简介">
        <template slot-scope="scope">
          {{ scope.row.introduction | introFilter }}
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
    <el-dialog title="添加鱼类" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newFishRef" :inline="false" :model="newFish" :rules="newFishRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newFish.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newFish.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newFish.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input v-model.number="newFish.price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="场所" prop="locale">
              <el-select v-model="newFish.locale" multiple placeholder="请选择出现场所">
                <el-option v-for="item in localeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="鱼影" prop="shadow">
              <el-select v-model="newFish.shadow" placeholder="请选择鱼影大小">
                <el-option v-for="item in shadowList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="出现月份(多选)：" label-width="160px"> </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="北半球" prop="activeTime.north">
              <el-select
                v-model="newFish.activeTime.north"
                multiple
                collapse-tags
                clearable
                placeholder="请选择月份"
                style="width: 100%;"
                @change="
                  val => {
                    selectAll(val, 'north')
                  }
                "
              >
                <el-option v-for="item in monthList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="南半球" prop="activeTime.south">
              <el-select
                v-model="newFish.activeTime.south"
                multiple
                collapse-tags
                clearable
                placeholder="请选择月份"
                style="display: block;"
                @change="
                  val => {
                    selectAll(val, 'south')
                  }
                "
              >
                <el-option v-for="item in monthList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="出现时间段：" prop="period" label-width="160px"> </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="开始时间" prop="periodStart">
              <el-time-select v-model="newFish.periodStart" :picker-options="periodOptions" placeholder="请选择开始时间"> </el-time-select>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="结束时间" prop="periodEnd">
              <el-time-select v-model="newFish.periodEnd" :picker-options="periodOptions" placeholder="请选择结束时间"> </el-time-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="解锁要求" prop="unlockCondition">
              <el-select v-model="newFish.unlockCondition" placeholder="请选择解锁条件">
                <el-option v-for="item in unlockConditionList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="稀有度" prop="rarity">
              <el-select v-model="newFish.rarity" placeholder="请选择稀有程度">
                <el-option v-for="item in rarityList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
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
                <el-button size="small" type="success" v-if="this.newFish.photoSrc">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="简介" prop="introduction">
              <el-input v-model="newFish.introduction" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postFish">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import getOption from '@/utils/get-option'
import Pagination from '@/components/Pagination'
import { getFishes, addFish, getFish, deleteFish } from '@/api/fish'

export default {
  name: 'Fish',
  components: { Pagination },
  filters: {
    introFilter(text) {
      return text.substring(0, 10) + '...'
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      queryInfo: {
        query: '',
        page: 1, // 当前的页数
        pageSize: 8, // 当前每页显示多少条数据
        sortJson: {},
        sort: ''
      },
      total: 0,
      dialogAddVisible: false,
      emptyText: '没有相关数据',
      newFish: {
        name: '',
        price: null,
        engName: '',
        jpnName: '',
        activeTime: { north: [], south: [] },
        locale: [],
        period: '',
        periodStart: '',
        periodEnd: '',
        shadow: '',
        unlockCondition: '',
        rarity: '',
        introduction: '',
        photoSrc: ''
      },
      oldOptions: {
        north: [],
        south: []
      },
      periodOptions: { start: '01:00', step: '1:00', end: '24:00' },
      localeList: [],
      monthList: [
        { text: '全选', value: '全年' },
        { text: '一月', value: '1月' },
        { text: '二月', value: '2月' },
        { text: '三月', value: '3月' },
        { text: '四月', value: '4月' },
        { text: '五月', value: '5月' },
        { text: '六月', value: '6月' },
        { text: '七月', value: '7月' },
        { text: '八月', value: '8月' },
        { text: '九月', value: '9月' },
        { text: '十月', value: '10月' },
        { text: '十一月', value: '11月' },
        { text: '十二月', value: '12月' }
      ],
      shadowList: [],
      unlockConditionList: [],
      rarityList: [],
      newFishRules: {
        name: [
          { required: true, message: '请输入鱼类名称', trigger: 'blur' },
          { min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur' }
        ],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
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
      getFishes(this.queryInfo).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getOptions() {
      getOption('fishLocale', list => {
        this.localeList = list
      })
      getOption('shadow', list => {
        this.shadowList = list
      })
      getOption('rarity', list => {
        this.rarityList = list
      })
      getOption('fishUnlock', list => {
        this.unlockConditionList = list
      })
    },
    handleRemove(file) {
      // 移除上传的图片
      // 找出pics数组中要移除这项的索引
      this.newFish.photoSrc = ''
    },
    handleSuccess(res) {
      // 图片上传成功后把临时地址保存到表单photoSrc属性中
      let src = res.data.path
      src = src.replace('/public', '')
      this.newFish.photoSrc = src
    },
    openAddFish() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newFishRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newFishRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newFish._id
      delete this.newFish.__v
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
    selectAll(val, prop) {
      let allValues = []
      // 保留所有值
      for (let item of this.monthList) {
        allValues.push(item.value)
      }
      // 用来储存上一次的值，可以进行对比
      const oldVal = this.oldOptions[prop].length === 0 ? [] : this.oldOptions[prop][1]
      // 如果有点全选,该赋值数组全部项
      if (val.includes('全年')) this.newFish.activeTime[prop] = allValues
      // 取消全部选中  上次有 当前没有 表示取消全选
      if (oldVal.includes('全年') && !val.includes('全年')) this.newFish.activeTime[prop] = []
      // 点击非全部选中  需要排除全部选中 以及 当前点击的选项
      // 新老数据都有全部选中
      if (oldVal.includes('全年') && val.includes('全年')) {
        const index = val.indexOf('全年')
        val.splice(index, 1) // 排除全选选项
        this.newFish.activeTime[prop] = val
      }
      // 全选未选 但是其他选项全部选上 则全选选上 上次和当前 都没有全选
      if (!oldVal.includes('全年') && !val.includes('全年')) {
        if (val.length === allValues.length - 1) this.newFish.activeTime[prop] = ['全年'].concat(val)
      }
      // 储存当前最后的结果 作为下次的老数据
      this.oldOptions[prop][1] = this.newFish.activeTime[prop]
      // console.log(this.newFish.activeTime.north)
      // console.log(this.newFish.activeTime.south)
    },
    postFish() {
      // 新增岛民
      this.$refs.newFishRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        const startPeriod =
          this.newFish.periodStart.indexOf('0') === 0 ? this.newFish.periodStart.substring(1, 2) : this.newFish.periodStart.substring(0, 2)
        const endPeriod = this.newFish.periodEnd.indexOf('0') === 0 ? this.newFish.periodEnd.substring(1, 2) : this.newFish.periodEnd.substring(0, 2)
        this.newFish.period = startPeriod + '点-' + endPeriod + '点'
        addFish(this.newFish).then(res => {
          this.$message({ message: res.message, type: 'success' })
          if (!this.newFish._id) this.queryInfo.page = 1
          this.$refs.upload.clearFiles()
          this.dialogAddVisible = false
          this.fetchData()
        })
      })
    },
    handleEdit(id) {
      if (this.$refs['newFishRef']) {
        this.$refs['newFishRef'].resetFields()
      }
      // 查询并编辑岛民信息
      getFish(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newFish = res.data
        })
      })
    },
    handleDelete(id) {
      // 删除岛民方法，可批量
      this.$confirm('此操作将永久删除该岛民, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteFish(id).then(res => {
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
