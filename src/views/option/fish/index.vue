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
        { label: '鱼出现场所', key: 'fishLocale' },
        { label: '鱼影大小', key: 'shadow' },
        { label: '解锁数量要求', key: 'fishUnlock' }
      ],
      //tabIndex:0,
      activeName: 'fishLocale'
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
