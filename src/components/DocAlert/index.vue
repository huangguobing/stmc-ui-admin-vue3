<template>
  <div v-if="false"></div>
</template>
<script setup lang="tsx">
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'DocAlert' })

defineProps({
  title: propTypes.string,
  url: propTypes.string
})
</script>
