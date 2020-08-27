<template>
  <guide-detail :is-edit="false" />
</template>

<script>
import GuideDetail from './components/GuideDetail'

export default {
  name: 'addGuide',
  components: { GuideDetail }
}
</script>
