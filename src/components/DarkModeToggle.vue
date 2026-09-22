<script setup>
defineProps({
  isDark: { type: Boolean, default: false },
})
defineEmits(['toggle'])
</script>

<template>
  <button
    class="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600"
    @click="$emit('toggle')"
  >
    {{ isDark ? '浅色模式' : '深色模式' }}
  </button>
</template>
