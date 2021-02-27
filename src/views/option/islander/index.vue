<template>
  <option-index :tabOptions="tabOptions" :activeTab="activeName"></option-index>
</template>

<script>
import OptionIndex from '../components/OptionIndex'

export default {
  name: 'IslanderSetting',
  components: { OptionIndex },
  data() {
    return {
      tabOptions: [
        { label: '动物种族', key: 'breed' },
        { label: '岛民性格', key: 'character' },
        // { label: '性格亚型', key: 'subtype' },
        { label: '岛民音高', key: 'voice' },
        { label: '岛民爱好', key: 'hobby' }
      ],
      //tabIndex:0,
      activeName: 'breed'
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
