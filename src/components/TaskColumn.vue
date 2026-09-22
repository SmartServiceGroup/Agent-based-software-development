<script setup>
import TaskCard from './TaskCard.vue'

defineProps({
  status: { type: Object, required: true },
  tasks: { type: Array, default: () => [] },
})
const emit = defineEmits(['drop', 'dragstart', 'update', 'remove'])

function onDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}
</script>

<template>
  <section
    class="flex min-h-[16rem] flex-col rounded-lg bg-gray-100 p-3 dark:bg-gray-800/60"
    @dragover="onDragOver"
    @drop="emit('drop')"
  >
    <header class="mb-2 flex items-center justify-between">
      <h2 class="font-semibold">{{ status.label }}</h2>
      <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {{ tasks.length }}
      </span>
    </header>
    <div class="flex flex-col gap-2">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @dragstart="(t, e) => emit('dragstart', t, e)"
        @update="emit('update', $event)"
        @remove="emit('remove', $event)"
      />
      <p v-if="tasks.length === 0" class="py-6 text-center text-sm text-gray-400">暂无任务</p>
    </div>
  </section>
</template>
