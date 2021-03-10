<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入DIY配方关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('new')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('new')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="openAddRecipe">添加DIY配方</el-button>
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
      <el-table-column align="center" label="照片" width="60" prop="photoSrc" sortable="custom">
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
      <el-table-column label="英文名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.engName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.jpnName | textFilter(5) }}
        </template>
      </el-table-column>
      <el-table-column label="种类" align="center" column-key="type" :filters="typeList">
        <template slot-scope="scope">
          {{ scope.row.type.join('/') }}
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" column-key="channels" :filters="channelList">
        <template slot-scope="scope">
          <span v-if="scope.row.season">{{ scope.row.season }}</span>
          <span v-if="scope.row.activity">{{ scope.row.activity }}期间</span>
          <span v-if="scope.row.character">({{ scope.row.character }}性格)</span>
          <span v-for="(item, index) in scope.row.channels" :key="'channels' + index">
            <span v-if="item === '岛民' || item === 'NPC'">
              {{ index === scope.row.channels.length - 1 ? item + '赠送' : item + '赠送 /' }}
            </span>
            <span v-else>
              {{ index === scope.row.channels.length - 1 ? item : item + ' /' }}
            </span>
          </span>
          <span v-if="scope.row.npc">({{ scope.row.npc }})</span>
        </template>
      </el-table-column>
      <el-table-column label="占地面积" align="center" prop="size" sortable="custom" column-key="size" :filters="sizeList">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="合成材料" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.materials" :key="'materials' + index">{{
            index === scope.row.materials.length - 1 ? item.name + '*' + item.num : item.name + '*' + item.num + '+'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="解锁条件" width="50" align="center">
        <template slot-scope="scope">
          {{ scope.row.unlockCondition ? '有' : '无' }}
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
    <el-dialog title="添加DIY配方" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newRecipeRef" :inline="false" :model="newRecipe" :rules="newRecipeRules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newRecipe.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newRecipe.engName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newRecipe.jpnName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="种类" prop="type">
              <el-select v-model="newRecipe.type" multiple collapse-tags placeholder="请选择种类" clearable>
                <el-option v-for="item in typeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源(多选)" prop="channels">
              <el-select v-model="newRecipe.channels" multiple collapse-tags placeholder="请选择获取途径">
                <el-option v-for="item in channelList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="isNpc">
            <el-form-item label="NPC" prop="npc">
              <el-select v-model="newRecipe.npc" placeholder="请选择来源npc">
                <el-option v-for="item in npcList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="isIslander">
            <el-form-item label="岛民性格" prop="character">
              <el-select v-model="newRecipe.character" placeholder="请选择来源岛民性格">
                <el-option v-for="item in characterList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="季节限定" prop="season">
              <el-select v-model="newRecipe.season" placeholder="请选择出现季节">
                <el-option v-for="item in seasonList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属活动" prop="activity">
              <el-select v-model="newRecipe.activity" placeholder="请选择所属活动">
                <el-option v-for="item in activityList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="占地面积" prop="size">
              <el-select v-model="newRecipe.size" placeholder="请选择占地面积">
                <el-option v-for="item in sizeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="解锁要求" prop="unlockCondition">
              <el-select v-model="newRecipe.unlockCondition" placeholder="请选择解锁条件">
                <el-option v-for="item in unlockConditionList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
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
                <el-button size="small" type="success" v-if="this.newRecipe.photoSrc">已上传，可点击修改</el-button>
                <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">
            <el-form-item label="合成配方" prop="materials" label-width="80px"> </el-form-item>
          </el-col>
          <el-col :span="10" v-for="(item, i) in newRecipe.materials" :key="'materials' + i">
            <el-form-item :label="'材料' + (i + 1)" prop="" label-width="80px">
              <el-col :span="12">
                <el-select
                  v-model="newRecipe.materials[i]"
                  :remote-method="getMaterialList"
                  filterable
                  default-first-option
                  remote
                  value-key="name"
                  placeholder="查询材料"
                >
                  <el-option v-for="item1 in materialList" :key="item1.name" :label="item1.name" :value="item1" />
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-input-number v-model="item.num" size="medium" style="width: 90%; margin-left: 10px;"></el-input-number>
              </el-col>
            </el-form-item>
          </el-col>
          <el-col :span="4" class="addMaterialsBtn">
            <el-button size="mini" round style="margin-top: 0.3rem; margin-left: 0.5rem;" @click="addMaterials"
              ><i class="el-icon-plus el-icon--left"></i>增加材料</el-button
            >
          </el-col>
          <el-col :span="24">
            <el-form-item label="途径说明" prop="channelDetail">
              <el-input v-model="newRecipe.channelDetail" type="textarea" placeholder="请输入具体途径说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postRecipe">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import { getRecipes, addRecipe, getRecipe, deleteRecipe, searchRecipe } from '@/api/recipe'
import { searchMaterial } from '@/api/material'
import { searchFurniture } from '@/api/furniture'
import { searchClothing } from '@/api/clothing'
//import { searchTool } from '@/api/tool'
import getOption from '@/utils/get-option'

export default {
  name: 'Recipe',
  components: { Pagination },
  filters: {},
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
      newRecipe: {
        name: '',
        engName: '',
        jpnName: '',
        type: '',
        activity: '',
        npc: '',
        season: '',
        character: '',
        materials: [
          { photoSrc: '', num: 1, name: '' },
          { photoSrc: '', num: 1, name: '' },
          { photoSrc: '', num: 1, name: '' }
        ],
        size: '',
        channels: [],
        channelDetail: '',
        unlockCondition: null,
        photoSrc: ''
      },
      materialList: [],
      sizeList: [],
      typeList: [],
      activityList: [],
      seasonList: [],
      characterList: [],
      npcList: [
        { text: '狸克', value: '狸克' },
        { text: '西施惠', value: '西施惠' },
        { text: '傅珂', value: '傅珂' },
        { text: '傅达', value: '傅达' },
        { text: '雪人', value: '雪人' },
        { text: '巴猎', value: '巴猎' },
        { text: '蹦蹦', value: '蹦蹦' },
        { text: '健兆', value: '健兆' },
        { text: '阿獭', value: '阿獭' }
      ],
      channelList: [
        //获取途径
      ],
      unlockConditionList: [
        { text: '无', value: '' },
        { text: '总DIY数量满50次', value: '50' },
        { text: '总DIY数量满100次', value: '100' },
        { text: '总DIY数量满200次', value: '200' }
      ],
      newRecipeRules: {
        name: [
          { required: true, message: '请输入配方名', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
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
    isNpc() {
      let isNpc = this.newRecipe.channels.includes('NPC')
      return isNpc
    },
    isIslander() {
      let isIslander = this.newRecipe.channels.includes('岛民')
      return isIslander
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
      getRecipes(this.queryInfo).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getOptions() {
      getOption('diyType', list => {
        this.typeList = list
      })
      getOption('diyChannels', list => {
        this.channelList = list
      })
      getOption('size', list => {
        this.sizeList = list
      })
      getOption('diyUnlock', list => {
        //this.sizeList = list
      })
      getOption('season', list => {
        this.seasonList = list
      })
      getOption('character', list => {
        this.characterList = list
      })
      getOption('activity', list => {
        this.activityList = list
      })
    },
    getMaterialList(query) {
      searchMaterial(query).then(response => {
        if (!response.data) return
        this.materialList = response.data.map(v => {
          return { name: v.name, _id: v._id, photoSrc: v.photoSrc, num: 1 }
        })
        if (this.materialList.length === 0) {
          searchFurniture(query).then(res => {
            if (!res.data) return
            this.materialList = res.data.map(w => {
              return { name: w.name, _id: w._id, photoSrc: w.photoSrc, num: 1 }
            })
            if (this.materialList.length === 0) {
              searchClothing(query).then(res => {
                if (!res.data) return
                this.materialList = res.data.map(w => {
                  return { name: w.name, _id: w._id, photoSrc: w.photoSrc, num: 1 }
                })
                if (this.materialList.length === 0) {
                  searchRecipe(query).then(res => {
                    if (!res.data) return
                    this.materialList = res.data.map(w => {
                      return { name: w.name, _id: w._id, photoSrc: w.photoSrc, num: 1 }
                    })
                  })
                }
              })
            }
          })
        }
      })
    },
    addMaterials() {
      this.newRecipe.materials.push({ photoSrc: '', num: 1, name: '' })
    },

    handleRemove(file) {
      this.newRecipe.photoSrc = ''
    },
    handleSuccess(res) {
      // 图片上传成功后把临时地址保存到表单photoSrc属性中
      let src = res.data.path
      src = src.replace('/public', '')
      this.newRecipe.photoSrc = src
    },
    openAddRecipe() {
      this.dialogAddVisible = true
      // 用 this.nextTick 或者用个定时器来确保 dom 渲染并更新
      this.$nextTick(function () {
        // 打开新增弹窗前先重置表单 避免表单出现上一次新增的校验数据
        this.$refs['newRecipeRef'].resetFields()
      })
    },
    dialogAddClose() {
      this.$refs.newRecipeRef.resetFields()
      this.$refs.upload.clearFiles()
      delete this.newRecipe._id
      delete this.newRecipe.__v
      this.materialList = []
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
    postRecipe() {
      this.newRecipe.materials = this.newRecipe.materials.filter(m => m.name !== '')
      this.$refs.newRecipeRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        addRecipe(this.newRecipe)
          .then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.$refs.upload.clearFiles()
            this.dialogAddVisible = false
            // if (!this.newRecipe._id) this.queryInfo.page = 1
            this.fetchData()
          })
          .catch(err => this.$message({ message: err.message, type: 'error' }))
      })
    },
    handleEdit(id) {
      if (this.$refs['newRecipeRef']) {
        this.$refs['newRecipeRef'].resetFields()
      }
      getRecipe(id).then(res => {
        this.dialogAddVisible = true
        // 回显数据
        this.$nextTick(function () {
          this.newRecipe = res.data
          this.materialList = this.newRecipe.materials
        })
      })
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deleteRecipe, this.fetchData)
    },
    handleSelectionChange(val) {
      // 监听多选并给多选数组赋值
      this.multipleSelection = val
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deleteRecipe, this.fetchData)
    }
  }
}
</script>

<style scoped></style>
