<template>
  <option-index :tabOptions="tabOptions" :activeTab="activeName"></option-index>
</template>

<script>
import OptionIndex from '../components/OptionIndex'

export default {
  name: '',
  components: { OptionIndex },
  data() {
    return {
      tabOptions: [
        { label: 'DIY类型', key: 'diyType' },
        { label: 'DIY来源', key: 'diyChannels' },
        { label: '解锁数量要求', key: 'diyUnlock' }
      ],
      //tabIndex:0,
      activeName: 'diyType'
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
<template>
  <option-index :tabOptions="tabOptions" :activeTab="activeName"></option-index>
</template>

<script>
import OptionIndex from '../components/OptionIndex'

export default {
  name: '',
  components: { OptionIndex },
  data() {
    return {
      tabOptions: [
        { label: '昆虫出现场所', key: 'insectLocale' },
        { label: '解锁数量要求', key: 'insectUnlock' }
      ],
      //tabIndex:0,
      activeName: 'insectLocale'
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
