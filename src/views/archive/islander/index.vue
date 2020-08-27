<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入岛民名字关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')" />
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddIslander">添加岛民</el-button>
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
      <el-table-column type="selection" width="40" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="序号" width="55">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="照片">
        <template slot-scope="scope">
          <img v-if="scope.row.photoSrc" :src="apiUrl + scope.row.photoSrc" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="名字" align="center" prop="name" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" width="70" column-key="sex" :filters="sexList">
        <template slot-scope="scope">
          {{ scope.row.sex === 0 ? '♀' : '♂' }}
        </template>
      </el-table-column>
      <el-table-column label="生日" align="center" width="90" prop="birth" column-key="monthStr" :filters="monthList">
        <template slot-scope="scope">
          {{ scope.row.birth }}
        </template>
      </el-table-column>
      <el-table-column label="种族" align="center" prop="breed" column-key="breed" :filters="breedList">
        <template slot-scope="scope">
          {{ scope.row.breed }}
        </template>
      </el-table-column>
      <el-table-column label="英文名" width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.engName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日文名" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.jpnName }}
        </template>
      </el-table-column>
      <!-- <el-table-column width="100px" label="受欢迎级别">
        <template slot-scope="scope">
          <svg-icon v-for="n in +scope.row.importance" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column> -->
      <el-table-column label="性格" width="100" align="center" prop="character" column-key="character" :filters="characterList" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.character }}
        </template>
      </el-table-column>
      <el-table-column label="口头禅" align="center">
        <template slot-scope="scope">
          {{ scope.row.petPhrase }}
        </template>
      </el-table-column>
      <el-table-column label="座右铭" width="200">
        <template slot-scope="scope">
          {{ scope.row.motto }}
        </template>
      </el-table-column>
      <el-table-column label="目标" align="center">
        <template slot-scope="scope">
          {{ scope.row.ideal }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="handleEdit(scope.row._id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete(scope.row._id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <el-pagination
      :current-page="queryInfo.page"
      :page-sizes="[5, 8, 10]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    </el-pagination> -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryInfo.page" :limit.sync="queryInfo.pageSize" @pagination="fetchData" />
    <el-dialog title="添加岛民" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newIslanderRef" :inline="false" :model="newIslander" :rules="newIslanderRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名字" prop="name">
              <el-input v-model="newIslander.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="newIslander.sex">
                <el-radio v-for="item in sexList" :label="item.value">{{ item.text }}</el-radio>
                <!-- <el-radio :label="0">♀</el-radio> -->
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="生日" required>
              <el-col :span="10">
                <el-form-item prop="month">
                  <el-input v-model.number="newIslander.month" placeholder="请输入月份" style="width: 100;" @input="changeVal($event)" />
                </el-form-item>
              </el-col>
              <el-col :span="2" class="birth-text">月</el-col>
              <el-col :span="10">
                <el-form-item prop="date">
                  <el-input v-model.number="newIslander.date" placeholder="输入日期" style="width: 100;" @input="changeVal($event)" />
                </el-form-item>
              </el-col>
              <el-col :span="2" class="birth-text">日</el-col>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="种族" prop="breed">
              <el-select v-model="newIslander.breed" placeholder="请选择种族">
                <el-option v-for="item in breedList" :label="item.text" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newIslander.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newIslander.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性格" prop="character">
              <el-select v-model="newIslander.character" placeholder="请选择性格">
                <el-option v-for="item in characterList" :label="item.text" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="口头禅" prop="petPhrase">
              <el-input v-model="newIslander.petPhrase" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="座右铭" prop="motto">
              <el-input v-model="newIslander.motto" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目标" prop="ideal">
              <el-input v-model="newIslander.ideal" />
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
                <el-button size="small" type="success" v-if="this.newIslander.photoSrc">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postIslander">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getIslanders, addIslander, getIslander, deleteIslander } from '@/api/islander'

export default {
  components: { Pagination },
  data() {
    const checkMonth = (rule, value, callback) => {
      if (!value) {
        callback(new Error('月份不能为空'))
      } else if (!Number.isInteger(value)) {
        callback(new Error('请输入数字'))
      } else if (value < 1 || value > 12) {
        callback(new Error('请输入合理的月份'))
      } else {
        callback()
      }
    }
    const checkDate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('月份不能为空'))
      } else if (!Number.isInteger(value)) {
        callback(new Error('请输入数字'))
      } else if (value < 1 || value > 31) {
        callback(new Error('请输入合理的月份'))
      } else {
        callback()
      }
    }
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
      newIslander: {
        name: '',
        sex: null,
        breed: '', // 种族
        month: null,
        date: null,
        birth: '',
        monthStr: '',
        engName: '',
        jpnName: '',
        character: '',
        petPhrase: '',
        motto: '',
        ideal: '',
        photoSrc: ''
      },
      sexList: [
        { text: '♀', value: 0 },
        { text: '♂', value: 1 }
      ],
      monthList: [
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
      characterList: [
        { text: '元气', value: '元气' },
        { text: '成熟', value: '成熟' },
        { text: '大姐姐', value: '大姐姐' },
        { text: '自恋', value: '自恋' },
        { text: '运动', value: '运动' },
        { text: '悠闲', value: '悠闲' },
        { text: '暴躁', value: '暴躁' },
        { text: '普通', value: '普通' }
      ],
      breedList: [
        { text: '🐸青蛙', value: '🐸青蛙' },
        { text: '🐿️松鼠', value: '🐿️松鼠' },
        { text: '🐹仓鼠', value: '🐹仓鼠' },
        { text: '🐭老鼠', value: '🐭老鼠' },
        { text: '🐰兔子', value: '🐰兔子' },
        { text: '🐙章鱼', value: '🐙章鱼' },
        { text: '🐷猪', value: '🐷猪' },
        { text: '🐒猴子', value: '🐒猴子' },
        { text: '🦍猩猩', value: '🦍猩猩' },
        { text: '🐨考拉', value: '🐨考拉' },
        { text: '🐻熊', value: '🐻熊' },
        { text: '🐼熊猫', value: '🐼熊猫' },
        { text: '🦁️狮子', value: '🦁️狮子' },
        { text: '🐯老虎', value: '🐯老虎' },
        { text: '🐺狼', value: '🐺狼' },
        { text: '🐱猫', value: '🐱猫' },
        { text: '🐶狗', value: '🐶狗' },
        { text: '🐊鳄鱼', value: '🐊鳄鱼' },
        { text: '🦆鸭子', value: '🦆鸭子' },
        { text: '🐔鸡', value: '🐔鸡' },
        { text: '🐦鸟', value: '🐦鸟' },
        { text: '🦅老鹰', value: '🦅老鹰' },
        { text: '鸵鸟', value: '鸵鸟' },
        { text: '🐧企鹅', value: '🐧企鹅' },
        { text: '🦛河马', value: '🦛河马' },
        { text: '🦏犀牛', value: '🦏犀牛' },
        { text: '🐘象', value: '🐘象' },
        { text: '🦘袋鼠', value: '🦘袋鼠' },
        { text: '食蚁兽', value: '食蚁兽' },
        { text: '🦌鹿', value: '🦌鹿' },
        { text: '🐎马', value: '🐎马' },
        { text: '🐂牛', value: '🐂牛' },
        { text: '🐄奶牛', value: '🐄奶牛' },
        { text: '🐑绵羊', value: '🐑绵羊' },
        { text: '🐐山羊', value: '🐐山羊' }
      ],
      newIslanderRules: {
        name: [
          { required: true, message: '请输入岛民名字', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        sex: [{ required: true, message: '请选择岛民性别', trigger: 'change' }],
        month: [{ validator: checkMonth, trigger: 'blur' }],
        date: [{ validator: checkDate, trigger: 'blur' }],
        breed: [{ required: true, message: '请选择岛民种族', trigger: 'change' }]
      },
      multipleSelection: []
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    ...mapGetters(['uploadUrl']),
    // uploadUrl() {
    //   const url = process.env.VUE_APP_BASE_API + "/admin/upload
    //   return ur
    // },
    apiUrl() {
      return process.env.VUE_APP_BASE_API
    }
  },
  methods: {
    fetchData(param) {
      this.listLoading = true
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getIslanders(this.queryInfo).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    changeVal(e) {
      //强制刷新数据
      this.$forceUpdate()
    },
    // handleSizeChange(newSize) {
    //   // 监听每页条数的改变
    //   this.queryInfo.pageSize = newSize
    //   this.fetchData()
    // },
    // handleCurrentChange(newPage) {
    //   // 监听页码值改变
    //   this.queryInfo.page = newPage
    //   this.fetchData()
    // },
    handleRemove(file) {
      // 移除上传的图片
      // const removePath = file.response.data.path
      // 找出pics数组中要移除这项的索引
      this.newIslander.photoSrc = ''
    },
    handleSuccess(res) {
      // 图片上传成功后把临时地址保存到表单photoSrc属性中
      let src = res.data.path
      src = src.replace('/public', '')
      this.newIslander.photoSrc = src
    },
    openAddIslander() {
      // 打开新增岛民弹窗并重置表单
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newIslanderRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newIslanderRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newIslander._id
      delete this.newIslander.__v
      // for (let key of Object.keys(this.newIslander)) {
      //   if (key === 'sex') {
      //     this.newIslander[key] = null
      //   } else {
      //     this.newIslander[key] = ""
      //   }
      // }
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
    postIslander() {
      // 新增岛民
      this.$refs.newIslanderRef.validate(valid => {
        this.newIslander.birth = this.newIslander.month + '月' + this.newIslander.date + '日'
        this.newIslander.monthStr = this.newIslander.month + '月'
        if (!valid) return this.$message.error('请修改有误的表单项')
        addIslander(this.newIslander).then(res => {
          this.$message({ message: res.message, type: 'success' })
          this.$refs.upload.clearFiles()
          this.dialogAddVisible = false
          this.queryInfo.page = 1
          this.fetchData()
        })
      })
    },
    handleEdit(id) {
      if (this.$refs['newIslanderRef']) {
        this.$refs['newIslanderRef'].resetFields()
      }
      // 查询并编辑岛民信息
      getIslander(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newIslander = res.data
          const birth = res.data.birth
          this.newIslander.month = parseInt(birth.split('月')[0])
          let date = birth.split('月')[1]
          date = parseInt(date.substring(0, date.length - 1))
          this.newIslander.date = date
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
          deleteIslander(id).then(res => {
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
.birth-text {
  text-align: center;
}
</style>
