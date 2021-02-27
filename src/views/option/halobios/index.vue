<template>
  <option-index :tabOptions="tabOptions" :activeTab="activeName"></option-index>
</template>

<script>
import OptionIndex from '../components/OptionIndex'

export default {
  name: 'HalobiosSetting',
  components: { OptionIndex },
  data() {
    return {
      tabOptions: [
        { label: '海洋生物出现场所', key: 'halobiosLocale' },
        { label: '海洋生物鱼影大小', key: 'halobiosShadow' },
        { label: '解锁数量要求', key: 'halobiosUnlock' }
      ],
      //tabIndex:0,
      activeName: 'halobiosLocale'
    }
  },
  created() {
    const tab = this.$route.query.tab
    if (tab) {
      this.activeName = tab
    }
  },
  methods: {}
}
</script>

<style scoped></style>
