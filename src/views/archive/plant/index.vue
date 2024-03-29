<template>
  <div class="app-container">
    <el-row class="search-box" type="flex" justify="space-between">
      <el-col :span="16">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-input
              v-model="queryInfo.query"
              placeholder="请输入植物关键字"
              class="input-with-select"
              clearable
              @clear="fetchData"
              @keyup.enter.native="fetchData('refresh')"
            >
              <el-button slot="append" icon="el-icon-search" @click="fetchData('refresh')"></el-button>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="() => commonApi.openAddForm('plant', this)">添加植物</el-button>
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
      element-loading-text="加载中"
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
      <el-table-column label="价格" align="center" width="100" column-key="price">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="英文名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.engName }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="日文名" align="center">
        <template slot-scope="scope">
          {{ scope.row.jpnName }}
        </template>
      </el-table-column> -->
      <el-table-column label="种类" align="center" column-key="type" :filters="typeList">
        <template slot-scope="scope">
          {{ scope.row.type.join('/') }}
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" column-key="channel" :filters="channelList">
        <template slot-scope="scope">
          {{ scope.row.channel }}
        </template>
      </el-table-column>
      <el-table-column label="成长阶段" align="center">
        <template slot-scope="scope">
          <span v-if="!(scope.row.type.includes('种子') || scope.row.type.includes('树苗'))">
            <span>{{ scope.row.growStage.join('-') }}</span>
          </span>
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
    <el-dialog title="添加植物" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
      <el-form ref="newPlantRef" :inline="false" :model="newPlant" :rules="newPlantRules" label-width="80px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="名称" prop="name">
              <el-input v-model="newPlant.name" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="英文名" prop="engName">
              <el-input v-model="newPlant.engName" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item label="日文名" prop="jpnName">
              <el-input v-model="newPlant.jpnName" />
            </el-form-item>
          </el-col> -->
          <el-col :span="5">
            <el-form-item label="价格" prop="price">
              <el-input v-model.number="newPlant.price" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="种类" prop="type">
              <el-select v-model="newPlant.type" multiple collapse-tags placeholder="请选择种类">
                <el-option v-for="item in typeList" :key="item.value" :label="item.text" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="notSeed">
          <el-col :span="8">
            <el-form-item label="来源" prop="channel">
              <el-radio-group v-model="newPlant.channel">
                <el-radio label="种子">种子</el-radio>
                <el-radio label="花卉杂交">花卉杂交</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="newPlant.channel == '种子'" :span="16">
            <el-form-item label="种子名称" prop="seed">
              <el-select
                v-model="newPlant.seed"
                :remote-method="query => getPlantList(query, 'seed')"
                filterable
                default-first-option
                remote
                value-key="name"
                placeholder="查询种子"
              >
                <el-option v-for="item in seedList" :key="item.name" :label="item.name" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <div v-if="newPlant.channel == '花卉杂交'"> -->
          <el-col v-show="newPlant.channel == '花卉杂交'" v-for="(item, i) in newPlant.mixPlant" :key="'mixPlant' + i" :span="8">
            <el-form-item :label="'花卉' + (i + 1)" prop="" label-width="80px">
              <el-select
                v-model="newPlant.mixPlant[i]"
                :remote-method="query => getPlantList(query, 'mix')"
                filterable
                default-first-option
                remote
                value-key="name"
                placeholder="查询花卉"
              >
                <el-option v-for="item1 in mixList" :key="item1.name" :label="item1.name" :value="item1" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- </div> -->
          <el-col :span="2">
            <el-form-item label="成长阶段" label-width="80px"> </el-form-item>
          </el-col>
          <el-col v-for="(item, i) in newPlant.growStage" :key="'growS' + i" :span="7">
            <el-form-item :label="'阶段' + (i + 1)" prop="" label-width="80px">
              <el-select v-model="newPlant.growStage[i]">
                <el-option v-for="item1 in growList[i]" :key="item1" :label="item1" :value="item1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="照片" prop="photoSrc">
              <upload-single v-model="newPlant.photoSrc" dialog-width="30%" drag />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="postPlant">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPlants, addPlant, getPlant, deletePlant, searchPlant } from '@/api/plant'
import { searchMaterial } from '@/api/material'
export default {
  name: 'Plant',
  data() {
    return {
      list: null,
      listLoading: true,
      queryInfo: {
        query: '',
        page: 1,
        pageSize: 10,
        sortJson: {},
        sort: ''
      },
      total: 0,
      dialogAddVisible: false,
      emptyText: '没有相关数据',
      newPlant: {
        name: '',
        engName: '',
        jpnName: '',
        price: null,
        type: [],
        channel: '',
        seed: null,
        mixPlant: [
          {
            name: '',
            _id: '',
            photoSrc: ''
          },
          {
            name: '',
            _id: '',
            photoSrc: ''
          }
        ],
        growStage: ['', '', '', '', ''],
        photoSrc: ''
      },
      seedList: [],
      mixList: [],
      growList: [
        ['', '幼苗', '种子', '球根', '杂交', '花苗', '树苗', '竹笋苗'],
        ['', 'S', '花芽', '幼苗'],
        ['', 'M', '花茎', '小树'],
        ['', 'L', '花蕾', '树'],
        ['', '树', '花株', '竹子']
      ],
      typeList: [
        { text: '种子', value: '种子' },
        { text: '水果', value: '水果' },
        { text: '树苗', value: '树苗' },
        { text: '树', value: '树' },
        { text: '花', value: '花' },
        { text: '蘑菇', value: '蘑菇' },
        { text: '灌木', value: '灌木' },
        { text: '其他', value: '其他' }
      ],
      channelList: [
        { text: '种子', value: '种子' },
        { text: '花卉杂交', value: '花卉杂交' }
      ],
      newPlantRules: {
        name: [
          { required: true, message: '请输入植物名字', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      multipleSelection: []
    }
  },
  computed: {
    notSeed() {
      const isSeed = this.newPlant.type.includes('种子') || this.newPlant.type.includes('树苗')
      return !isSeed
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData(param) {
      this.commonApi.getList(param, getPlants, this)
    },
    getPlantList(query, type) {
      if (!query.trim()) return
      if (type === 'mix') {
        searchMaterial(query)
          .then(response => {
            if (response.data.length === 0) return
            const listname = type + 'List'
            this[listname] = response.data.map(v => {
              return { name: v.name, _id: v._id, photoSrc: v.photoSrc }
            })
          })
          .catch(err => this.$message.error(err.message))
      } else {
        searchPlant(query)
          .then(response => {
            if (response.data.length === 0) return
            const listname = type + 'List'
            this[listname] = response.data.map(v => {
              return { name: v.name, _id: v._id, photoSrc: v.photoSrc }
            })
          })
          .catch(err => this.$message.error(err.message))
      }
    },
    dialogAddClose() {
      this.$refs.newPlantRef.resetFields()
      delete this.newPlant._id
      delete this.newPlant.__v
      this.seedList = []
      this.mixList = []
      this.growStage = ['', '', '', '', '']
    },
    postPlant() {
      this.newPlant.growStage = this.newPlant.growStage.filter(m => m.name !== '')
      this.commonApi.postForm('plant', addPlant, this)
    },
    handleEdit(id) {
      if (this.$refs['newPlantRef']) {
        this.$refs['newPlantRef'].resetFields()
      }
      getPlant(id)
        .then(res => {
          this.dialogAddVisible = true
          this.$nextTick(function () {
            this.newPlant = res.data
            if (this.newPlant.channel === '种子') {
              this.seedList[0] = this.newPlant.seed
            } else if (this.newPlant.channel === '花卉杂交') {
              this.mixList = this.newPlant.mixPlant
            }
          })
        })
        .catch(err => this.$message.error(err.message))
    },
    handleDelete(id) {
      this.commonApi.deleteById(id, deletePlant, this.fetchData)
    },
    handelMultipleDelete() {
      this.commonApi.multipleDelete(this.multipleSelection, deletePlant, this.fetchData)
    }
  }
}
</script>

<style scoped></style>
