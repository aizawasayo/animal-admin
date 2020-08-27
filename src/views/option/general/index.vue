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
        { label: '岛民性格', key: 'character' },
        { label: '动物种族', key: 'breed' },
        { label: '稀有程度', key: 'rarity' },
        { label: '动森活动', key: 'activity' },
        { label: '季节', key: 'season' },
        { label: '话题', key: 'topic' }
      ],
      //tabIndex:0,
      activeName: 'character'
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
