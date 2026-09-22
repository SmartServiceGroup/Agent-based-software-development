export const TASK_STATUSES = [
  { id: 'todo', label: '待办' },
  { id: 'in-progress', label: '进行中' },
  { id: 'done', label: '完成' },
]

export const PRIORITY_LEVELS = [
  { id: 'high', label: '高', badge: 'bg-red-500' },
  { id: 'medium', label: '中', badge: 'bg-yellow-500' },
  { id: 'low', label: '低', badge: 'bg-green-500' },
]

export const PRIORITY_BY_ID = Object.fromEntries(
  PRIORITY_LEVELS.map((p) => [p.id, p]),
)
