<script setup>
import { ref } from 'vue'
import { TASK_STATUSES } from '../constants.js'
import TaskColumn from './TaskColumn.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
})
const emit = defineEmits(['update', 'remove', 'move'])

const draggingId = ref(null)

function onDragStart(task, event) {
  draggingId.value = task.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', task.id)
}

function onDrop(status) {
  if (draggingId.value) {
    emit('move', { id: draggingId.value, status })
  }
  draggingId.value = null
}

function tasksByStatus(status) {
  return props.tasks.filter((t) => t.status === status)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <TaskColumn
      v-for="status in TASK_STATUSES"
      :key="status.id"
      :status="status"
      :tasks="tasksByStatus(status.id)"
      @dragstart="onDragStart"
      @drop="onDrop(status.id)"
      @update="emit('update', $event)"
      @remove="emit('remove', $event)"
    />
  </div>
</template>
