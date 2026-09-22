<script setup>
import { useTasks } from './composables/useTasks.js'
import { useDarkMode } from './composables/useDarkMode.js'
import TaskForm from './components/TaskForm.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import DarkModeToggle from './components/DarkModeToggle.vue'

const { tasks, addTask, updateTask, removeTask, moveTask } = useTasks()
const { isDark, toggle } = useDarkMode()

function handleAdd(input) {
  addTask(input)
}
function handleUpdate(patch) {
  updateTask(patch.id, patch)
}
function handleRemove(id) {
  removeTask(id)
}
function handleMove({ id, status }) {
  moveTask(id, status)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <header class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
      <h1 class="text-2xl font-bold">任务管理应用</h1>
      <DarkModeToggle :is-dark="isDark" @toggle="toggle" />
    </header>
    <main class="mx-auto max-w-6xl px-6 py-6">
      <TaskForm @add="handleAdd" />
      <KanbanBoard
        :tasks="tasks"
        @update="handleUpdate"
        @remove="handleRemove"
        @move="handleMove"
      />
    </main>
  </div>
</template>
