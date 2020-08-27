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
        { label: '家具类型', key: 'furnitureType' },
        { label: '家具来源', key: 'furnitureChannels' },
        { label: '家具系列', key: 'series' },
        { label: '家具尺寸', key: 'size' }
      ],
      //tabIndex:0,
      activeName: 'furnitureType'
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
