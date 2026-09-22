import { useLocalStorage } from './useLocalStorage.js'

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createTask({ title, description = '', priority = 'medium', status = 'todo' }) {
  if (!title || !String(title).trim()) {
    throw new Error('标题不能为空')
  }
  const now = Date.now()
  return {
    id: createId(),
    title: String(title).trim(),
    description: String(description ?? '').trim(),
    status,
    priority,
    createdAt: now,
    updatedAt: now,
  }
}

export function useTasks() {
  const tasks = useLocalStorage('tasks', [])

  function getTask(id) {
    return tasks.value.find((t) => t.id === id)
  }

  function addTask(input) {
    const task = createTask(input)
    tasks.value.push(task)
    return task
  }

  function updateTask(id, patch) {
    const task = getTask(id)
    if (!task) return null
    if (patch.title !== undefined) {
      if (!String(patch.title).trim()) throw new Error('标题不能为空')
      task.title = String(patch.title).trim()
    }
    if (patch.description !== undefined) task.description = String(patch.description).trim()
    if (patch.priority !== undefined) task.priority = patch.priority
    if (patch.status !== undefined) task.status = patch.status
    task.updatedAt = Date.now()
    return task
  }

  function removeTask(id) {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return false
    tasks.value.splice(idx, 1)
    return true
  }

  function moveTask(id, status) {
    return updateTask(id, { status })
  }

  return { tasks, addTask, getTask, updateTask, removeTask, moveTask }
}
