<script setup>
import { ref } from 'vue'
import { PRIORITY_LEVELS } from '../constants.js'

const emit = defineEmits(['add'])

const title = ref('')
const description = ref('')
const priority = ref('medium')
const error = ref('')

function submit() {
  const t = title.value.trim()
  if (!t) {
    error.value = '标题不能为空'
    return
  }
  error.value = ''
  emit('add', { title: t, description: description.value.trim(), priority: priority.value })
  title.value = ''
  description.value = ''
  priority.value = 'medium'
}
</script>

<template>
  <form
    class="mb-6 flex flex-col gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center dark:border-gray-700"
    @submit.prevent="submit"
  >
    <input
      v-model="title"
      class="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
      placeholder="任务标题（必填）"
    />
    <input
      v-model="description"
      class="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
      placeholder="描述（选填）"
    />
    <select
      v-model="priority"
      class="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
    >
      <option v-for="p in PRIORITY_LEVELS" :key="p.id" :value="p.id">{{ p.label }}</option>
    </select>
    <button
      type="submit"
      class="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
    >
      添加任务
    </button>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </form>
</template>
