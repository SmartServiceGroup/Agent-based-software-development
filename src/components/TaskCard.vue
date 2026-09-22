<script setup>
import { ref } from 'vue'
import { PRIORITY_LEVELS, PRIORITY_BY_ID } from '../constants.js'

const props = defineProps({
  task: { type: Object, required: true },
})
const emit = defineEmits(['edit', 'remove', 'dragstart'])

const editing = ref(false)
const title = ref('')
const description = ref('')
const priority = ref('medium')

function startEdit() {
  title.value = props.task.title
  description.value = props.task.description
  priority.value = props.task.priority
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function saveEdit() {
  const t = title.value.trim()
  if (!t) return
  emit('edit', { id: props.task.id, title: t, description: description.value.trim(), priority: priority.value })
  editing.value = false
}
</script>

<template>
  <div
    data-test="task-card"
    draggable="true"
    class="cursor-grab rounded border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    @dragstart="emit('dragstart', props.task, $event)"
  >
    <template v-if="!editing">
      <div class="mb-1 flex items-start justify-between gap-2">
        <span class="font-medium">{{ props.task.title }}</span>
        <span class="inline-block h-3 w-3 shrink-0 rounded-full" :class="PRIORITY_BY_ID[props.task.priority]?.badge"></span>
      </div>
      <p v-if="props.task.description" class="text-sm text-gray-500 dark:text-gray-400">
        {{ props.task.description }}
      </p>
      <div class="mt-2 flex gap-2">
        <button class="text-xs text-blue-600 hover:underline" @click="startEdit">编辑</button>
        <button class="text-xs text-red-600 hover:underline" @click="emit('remove', props.task.id)">删除</button>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col gap-2">
        <input v-model="title" class="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700" />
        <input v-model="description" class="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700" />
        <select v-model="priority" class="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700">
          <option v-for="p in PRIORITY_LEVELS" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
        <div class="flex gap-2">
          <button class="text-xs text-green-600 hover:underline" @click="saveEdit">保存</button>
          <button class="text-xs text-gray-500 hover:underline" @click="cancelEdit">取消</button>
        </div>
      </div>
    </template>
  </div>
</template>
