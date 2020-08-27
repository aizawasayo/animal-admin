<template>
  <div class="app-container">
    <el-form ref="newIslander" :model="newIslander" label-width="120px" :inline="true">
      <el-form-item label="名字">
        <el-input v-model="newIslander.name" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="newIslander.sex">
          <el-radio label="1">♂</el-radio>
          <el-radio label="0">♀</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日">
        <el-col :span="10">
          <el-input v-model="newIslander.month" placeholder="请输入月份" style="width: 100%;" />
        </el-col>
        <el-col :span="2" class="line">月</el-col>
        <el-col :span="10">
          <el-input v-model="newIslander.date" placeholder="输入日期" style="width: 100%;" />
        </el-col>
        <el-col :span="2" class="line">日</el-col>
      </el-form-item>
      <el-form-item label="英文名">
        <el-input v-model="newIslander.engName" />
      </el-form-item>
      <el-form-item label="日文名">
        <el-input v-model="newIslander.jpnName" />
      </el-form-item>
      <el-form-item label="性格">
        <el-input v-model="newIslander.character" />
      </el-form-item>
      <el-form-item label="口头禅">
        <el-input v-model="newIslander.petPhrase" />
      </el-form-item>
      <el-form-item label="座右铭">
        <el-input v-model="newIslander.motto" />
      </el-form-item>
      <el-form-item label="目标">
        <el-input v-model="newIslander.ideal" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newIslander: {
        name: '',
        sex: 0,
        month: '',
        date: '',
        birth: '',
        engName: '',
        jpnName: '',
        character: '',
        petPhrase: '',
        motto: '',
        ideal: ''
      }
    }
  },
  methods: {
    onSubmit() {
      this.$message('submit!')
    },
    onCancel() {
      this.$message({ message: 'cancel!', type: 'warning' })
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>
