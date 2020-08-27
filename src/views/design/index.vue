<template>
  <design-index :tabOptions="tabOptions" :activeTab="activeName"></design-index>
</template>

<script>
import DesignIndex from './components/DesignIndex'

export default {
  name: '',
  components: { DesignIndex },
  data() {
    return {
      tabOptions: [
        { label: '衣服', key: 'clothingDesign', icon: 'theme' },
        { label: '帽子', key: 'hatDesign', icon: 'hat' },
        { label: '图案', key: 'patternDesign', icon: 'pattern' }
      ],
      activeName: 'clothingDesign'
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
