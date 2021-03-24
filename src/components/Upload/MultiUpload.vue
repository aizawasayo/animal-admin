<!--批量上传组件-->
<template>
  <div class="upload-container">
    <el-upload
      ref="upload"
      :action="`${apiUrl}/admin/upload`"
      name="photoSrc"
      with-credentials
      :show-file-list="true"
      :file-list="fileList"
      :on-change="fileListChange"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :auto-upload="false"
      :drag="drag"
      multiple
      :class="uploadClass"
    >
      <el-button v-if="!drag" slot="trigger" size="small" type="primary">选取文件</el-button>
      <div v-if="drag">
        <i class="el-icon-upload" />
        <div class="el-upload__text">将图片拖到此处，<br />或<em>点击上传</em></div>
      </div>
      <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="handleUpload">上传到服务器</el-button> -->
      <div slot="tip" class="el-upload__tip">
        <span style="color: #f56c6c;">只能上传jpg/png/gif文件，且不超过2M。</span><br />
        图片列表中已经上传成功的图片(<span style="color: #67c23a;">有绿色✓</span>)，点击图片名称可以预览大图
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible" :append-to-body="true" :modal-append-to-body="false" :width="dialogWidth" class="preview-dialog">
      <img width="100%" :src="previewUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { uploadMult } from '@/api/upload'
export default {
  name: 'MultiUpload',
  props: {
    list: {
      type: Array,
      default: []
    },
    drag: {
      type: Boolean,
      default: false
    },
    dialogWidth: {
      type: String,
      default: '35%'
    }
  },
  data() {
    return {
      value: '',
      fileList: [], // 由于不是简单数据，不能直接用props.list值作为初始值
      dialogVisible: false
    }
  },
  computed: {
    previewUrl() {
      return this.value ? process.env.VUE_APP_BASE_API + this.value : ''
    },
    uploadClass() {
      return this.drag ? 'image-uploader' : ''
    }
  },
  watch: {
    list: {
      handler(newVal) {
        // 深拷贝，项目里推荐lodash
        // this.fileList = _.cloneDeep(this.list)
        this.fileList = this.list.map(obj => ({ ...obj }))
      },
      deep: true
    }
  },
  methods: {
    fileListChange(file, fileList) {
      // 添加文件、上传成功和上传失败时都会被调用
      const typeList = ['image/jpeg', 'image/png', 'image/gif']
      const isTypeValid = typeList.includes(file.raw.type)
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isTypeValid) return this.$message.error('图片格式只能是 JPG/PNG/GIF!')
      if (!isLt2M) return this.$message.error('图片大小不能超过 2MB!')
      this.fileList.push(file) // 能响应式更改数组
      // this.$set(this.fileList, this.fileList.length, file) // 能响应式更改数组
    },
    filterFileList(uploaded) {
      // 传 uploaded 筛选已上传的图片列表，不传筛选未上传的
      return uploaded ? this.fileList.filter(item => !item.hasOwnProperty('raw')) : this.fileList.filter(item => item.hasOwnProperty('raw'))
    },
    async getUploadedList() {
      /* 逻辑梳理：
       1. 点击父组件表单提交按钮触发，这时说明组件已无其他数据操作
       2. 父组件需要的数据是fileList中所有不含raw字段的数据，不含的只有list传过来的新成功上传后经过处理的两种可嫩
       3. 首先判断有没有含有raw的，如果没有，直接return fileList, 因为fileList的值就等于传过来的list
       4. 如果有去批量上传，请求的返回值追加到this.list中，再返给父组件
      */
      const toUploadList = this.filterFileList()
      if (toUploadList.length == 0) return this.fileList
      let formData = new FormData()
      toUploadList.forEach(file => formData.append('photoSrc', file.raw, file.name))
      const { data } = await uploadMult(formData)
      return this.filterFileList(true).concat(this.commonApi.uploadMultiSuccess(data))
    },
    handlePreview(file) {
      if (file.src) {
        this.value = file.src
        this.dialogVisible = true
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList.map(obj => ({ ...obj }))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.upload-container {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  .image-uploader {
    width: 100%;
    display: flex;
    flex-direction: row;
    .el-icon-upload {
      margin: 20px 0 16px;
      font-size: 60px;
    }
    .el-upload__text {
      line-height: 20px;
      font-size: 13px;
    }
    .el-upload__tip {
      width: 300px;
      margin: 0 20px;
      line-height: 20px;
    }
  }
  .image-uploader >>> .el-upload-list__item:first-child {
    margin-top: 0px;
  }
  .image-uploader >>> .el-upload-dragger {
    width: 150px;
    height: 150px;
  }
}
</style>
