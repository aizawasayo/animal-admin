<template>
  <el-dialog title="添加选项" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
    <el-form ref="newOptionRef" :inline="false" :model="newOption" :rules="newOptionRules" label-width="80px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="序号" prop="orderNum">
            <el-input v-model.number="newOption.orderNum" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="名称" prop="name">
            <el-input v-model="newOption.name" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="类型" prop="type">
            <el-select v-model="newOption.type" collapse-tags placeholder="请选择选项类型">
              <el-option v-for="(item, i) in tabOptions" :key="item.key + i" :label="item.label" :value="item.key"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('closeDialog')">取 消</el-button>
      <!-- <el-button @click="dialogAddVisible = false">取 消</el-button> -->
      <el-button type="primary" @click="postOption">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { addOption } from '@/api/option'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    option: {
      type: Object,
      default: function () {
        return {
          name: '',
          type: '',
          orderNum: null
        }
      }
    },
    tabList: {
      type: Array
    }
  },
  data() {
    return {
      newOption: {
        name: '',
        type: '',
        orderNum: null
      },
      dialogAddVisible: false,
      tabOptions: this.tabList,
      newOptionRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        orderNum: [{ required: true, message: '请输入序号', trigger: 'blur' }]
      }
    }
  },
  watch: {
    option: {
      //immediate: true,
      handler(val) {
        if (val.name) {
          this.newOption = val
        }
        if (val.type) {
          this.newOption.type = val.type
        }
      }
    },
    visible: {
      handler(val) {
        if (val) {
          this.dialogAddVisible = true
        } else {
          this.dialogAddVisible = false
        }
      }
    }
  },
  created() {
    //console.log('created', this.newOption)
  },
  beforeMount() {
    //console.log('beforeMount', this.newOption)
  },
  mounted() {
    //console.log('mounted', this.newOption)
  },
  beforeUpdate() {
    //console.log('beforeUpdate', this.newOption)
  },
  methods: {
    dialogAddClose() {
      this.$refs['newOptionRef'].resetFields()
      delete this.newOption._id
      delete this.newOption.__v
      this.$emit('closeDialog')
    },
    postOption() {
      this.$refs.newOptionRef.validate(valid => {
        if (!valid) return this.$message.error('请修改有误的表单项')
        addOption(this.newOption).then(res => {
          this.$message({ message: res.message, type: 'success' })
          this.resetForm()
          this.$emit('closeDialog')
          this.$emit('freshData')
        })
      })
    },
    resetForm() {
      this.$nextTick(function () {
        this.$refs.newOptionRef.resetFields()
      })
    }
  }
}
</script>
