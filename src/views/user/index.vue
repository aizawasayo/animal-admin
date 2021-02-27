<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input v-model="queryInfo.query" placeholder="请输入用户名关键字" class="input-with-select" clearable @clear="fetchData">
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddUser">添加用户</el-button>
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
      :data="userList"
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
      <el-table-column align="center" label="头像" width="80">
        <template slot-scope="scope">
          <img v-if="scope.row.avatar" :src="apiUrl + scope.row.avatar" width="25" height="25" />
          <span v-else>未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="名字" align="center" prop="username" sortable="custom" width="100">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" prop="email" sortable="custom" width="200">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center" width="90">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="登岛日期" align="center" width="110" sortable="custom" prop="startDate">
        <template slot-scope="scope">
          {{ scope.row.startDate | parseTime('{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="动森ID" align="center" prop="gameId" width="180">
        <template slot-scope="scope">
          {{ scope.row.gameId }}
        </template>
      </el-table-column>
      <el-table-column label="岛屿名称" align="center" prop="islandName">
        <template slot-scope="scope">
          {{ scope.row.islandName }}
        </template>
      </el-table-column>
      <el-table-column label="岛屿位置" width="100" align="center" column-key="position" :filters="positionList">
        <template slot-scope="scope">
          <span>{{ scope.row.position === 'North' ? '北半球' : '南半球' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="90" align="center" column-key="roles" :filters="roleList">
        <template slot-scope="scope">
          {{ scope.row.roles[0] === 'admin' ? '管理员' : '普通用户' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center" prop="state" column-key="state" :filters="stateList" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.state === 0 ? '启用' : '禁用' }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="个性签名" align="center">
        <template slot-scope="scope">
          {{ scope.row.signature }}
        </template>
      </el-table-column> -->
      <el-table-column class-name="status-col" label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="handleEdit(scope.row._id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="handleDelete(scope.row._id, scope.row.role)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryInfo.page" :limit.sync="queryInfo.pageSize" @pagination="fetchData" />
    <el-dialog title="添加用户" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newUserRef" :inline="false" :model="newUser" :rules="newUserRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名字" prop="username">
              <el-input v-if="newUser._id" v-model="newUser.username" disabled="" />
              <el-input v-else v-model="newUser.username" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="newUser.nickname" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="游戏ID" prop="gameId">
              <el-input v-model="newUser.gameId" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="岛屿名称" prop="islandName">
              <el-input v-model="newUser.islandName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="岛屿位置" prop="position">
              <el-radio-group v-model="newUser.position">
                <el-radio label="North">北半球</el-radio>
                <el-radio label="South">南半球</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="登岛日期" prop="startDate">
              <el-date-picker v-model="newUser.islandDate" type="date" placeholder="选择日期" style="width: 100%;"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="角色" prop="roles">
              <el-radio-group v-model="newUser.roles[0]">
                <el-radio label="admin">管理员</el-radio>
                <el-radio label="normal">普通用户</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="state">
              <el-radio-group v-model="newUser.state">
                <el-radio :label="0">启用</el-radio>
                <el-radio :label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item v-if="this.newUser._id" label="密码" prop="psw">
              <el-input v-model="newUser.password" type="password" show-password disabled />
            </el-form-item>
            <el-form-item v-else label="密码" prop="password">
              <el-input v-model="newUser.password" type="password" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="头像" prop="avatar">
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
                <el-button size="small" type="success" v-if="this.newUser.avatar">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getUsers, addUser, getUser, editUser, deleteUser } from '@/api/user'
import { timestamp, standardTime } from '@/utils'

export default {
  name: 'User',
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
      userList: null,
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
      newUser: {
        _id: '',
        username: '',
        nickname: '',
        gameId: '',
        islandName: '',
        position: '',
        islandDate: null,
        startDate: '',
        password: '',
        avatar: '',
        roles: [],
        state: 0,
        signature: ''
      },
      stateList: [
        { text: '启用', value: 0 },
        { text: '禁用', value: 1 }
      ],
      positionList: [
        { text: '北半球', value: 'North' },
        { text: '南半球', value: 'South' }
      ],
      roleList: [
        { text: '管理员', value: 'admin' },
        { text: '普通用户', value: 'normal' }
      ],
      newUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12 个字符', trigger: 'blur' }
        ],
        gameId: [{ required: true, message: '请输入游戏ID', trigger: 'blur' }],
        password: [{ validator: checkPass, trigger: 'blur' }],
        roles: [{ required: true, message: '请选择用户角色', trigger: 'change' }]
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
      this.listLoading = true
      if (param === 'new') {
        this.queryInfo.page = 1
      }
      getUsers(this.queryInfo).then(res => {
        this.userList = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    handleRemove(file) {
      // 移除上传的图片
      // 找出pics数组中要移除这项的索引
      this.newUser.avatar = ''
    },
    handleSuccess(res) {
      let src = res.data.path
      src = src.replace('/public', '')
      this.newUser.avatar = src
    },
    openAddUser() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newUserRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newUserRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newUser._id
      delete this.newUser.__v
      delete this.newUser.psw
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
    postUser() {
      // 新增用户
      this.$refs.newUserRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        this.newUser.startDate = timestamp(this.newUser.islandDate)
        if (this.newUser._id) {
          editUser(this.newUser._id, this.newUser).then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            this.queryInfo.page = 1
            this.fetchData()
          })
        } else {
          addUser(this.newUser).then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            this.queryInfo.page = 1
            this.fetchData()
          })
        }
      })
    },
    handleEdit(id) {
      if (this.$refs['newUserRef']) {
        this.$refs['newUserRef'].resetFields()
      }
      // 查询并编辑用户信息
      getUser(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newUser = res.data
          if (this.newUser.startDate) {
            this.newUser.islandDate = standardTime(this.newUser.startDate)
          }
        })
      })
    },
    handleDelete(id, role) {
      if (role.indexOf('admin') > -1) return this.$message('不能删除管理员！')
      // 删除用户方法，可批量
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteUser(id).then(res => {
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
      let role = ''
      this.multipleSelection.forEach(val => {
        id += val._id + ','
        role += val.role + ','
      })
      id = id.substring(0, id.length - 1)
      this.handleDelete(id, role)
    }
  }
}
</script>
<style scoped></style>
