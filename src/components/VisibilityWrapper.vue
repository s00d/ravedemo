<template>
  <div ref="wrapperRef" class="visibility-wrapper" :data-section="sectionName">
    <slot v-if="isVisible"></slot>
    <div v-else class="section-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  threshold?: number
  rootMargin?: string
  sectionName: string
}>()

const emit = defineEmits<{
  (e: 'visibilityChange', isVisible: boolean, sectionName: string): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible.value = entry.isIntersecting
      emit('visibilityChange', entry.isIntersecting, props.sectionName)
    })
  }, {
    threshold: props.threshold || 0.1,
    rootMargin: props.rootMargin || '100px'
  })

  if (wrapperRef.value) {
    observer.observe(wrapperRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.visibility-wrapper {
  width: 100%;
  min-height: 100vh;
}

.section-placeholder {
  width: 100%;
  min-height: 100vh;
  background: #000;
}
</style> 