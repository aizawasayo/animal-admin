<template>
  <el-dialog title="添加设计" :visible.sync="dialogAddVisible" width="60%" :close-on-click-modal="false" @close="dialogAddClose">
    <el-form ref="newDesignRef" :inline="false" :model="newDesign" :rules="newDesignRules" label-width="80px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="名称" prop="name">
            <el-input v-model="newDesign.name" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="类型" prop="type">
            <el-select v-model="newDesign.type" collapse-tags placeholder="请选择设计类型">
              <el-option v-for="(item, i) in tabOptions" :key="item.key + i" :label="item.label" :value="item.key"> </el-option>
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
              :file-list="newDesign.photoSrc"
              :show-file-list="true"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="success" v-if="newDesign.photoSrc[0]">已上传，可点击修改</el-button>
              <el-button size="small" type="primary" v-else><i class="el-icon-upload el-icon--left"></i>点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="" prop="content">
            <el-input v-model="newDesign.content" type="textarea" placeholder="灵感来源，设计思路等等，畅所欲言" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('closeDialog')">取 消</el-button>
      <!-- <el-button @click="dialogAddVisible = false">取 消</el-button> -->
      <el-button type="primary" @click="postDesign">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { addDesign } from '@/api/design'

export default {
  name: 'DesignAdd',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    design: {
      type: Object,
      default: function () {
        return {
          name: '',
          type: '',
          photoSrc: [],
          content: ''
        }
      }
    },
    tabList: {
      type: Array
    }
  },
  data() {
    return {
      newDesign: {
        name: '',
        type: '',
        photoSrc: [],
        content: ''
      },
      uploadList: [],
      dialogAddVisible: false,
      tabOptions: this.tabList,
      newDesignRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapState('app', { uploadUrl: state => state.uploadUrl }),
    ...mapGetters(['userId']) //推荐这种
  },
  watch: {
    design: {
      //immediate: true,
      handler(val) {
        if (val.name) {
          this.newDesign = val
        }
        if (val.type) {
          this.newDesign.type = val.type
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
  methods: {
    dialogAddClose() {
      this.$refs['newDesignRef'].resetFields()
      delete this.newDesign._id
      delete this.newDesign.__v
      this.$emit('closeDialog')
    },
    handleRemove(file) {
      let removePath = file.src
      let removeIndex = this.newDesign.photoSrc.findIndex(item => item.src === removePath)
      this.newDesign.photoSrc.splice(removeIndex)
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
    postDesign() {
      this.$refs.newDesignRef.validate(valid => {
        this.newDesign.photoSrc = this.newDesign.photoSrc.concat(this.uploadList)
        this.uploadList = []
        if (!valid) return this.$message.error('请修改有误的表单项')
        if (this.newDesign.photoSrc.length === 0) return this.$message.error('请上传图片！')
        this.newDesign.user = this.userId
        addDesign(this.newDesign)
          .then(res => {
            this.$message({ message: res.message, type: 'success' })
            this.resetForm()
            this.$emit('closeDialog')
            this.$emit('freshData')
          })
          .catch(err => this.$message({ message: err.message, type: 'error' }))
      })
    },
    resetForm() {
      this.$nextTick(function () {
        this.$refs.newDesignRef.resetFields()
      })
    }
  }
}
</script>
