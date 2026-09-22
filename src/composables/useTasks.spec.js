import { describe, it, expect, beforeEach } from 'vitest'
import { useTasks } from './useTasks.js'

describe('useTasks', () => {
  beforeEach(() => localStorage.clear())

  it('adds a task with defaults', () => {
    const { tasks, addTask } = useTasks()
    const t = addTask({ title: '写需求' })
    expect(t.id).toBeTruthy()
    expect(t.title).toBe('写需求')
    expect(t.description).toBe('')
    expect(t.status).toBe('todo')
    expect(t.priority).toBe('medium')
    expect(t.createdAt).toBeTypeOf('number')
    expect(tasks.value).toHaveLength(1)
  })

  it('rejects blank title', () => {
    const { addTask } = useTasks()
    expect(() => addTask({ title: '   ' })).toThrow('标题不能为空')
  })

  it('updates a task', () => {
    const { addTask, updateTask, tasks } = useTasks()
    const t = addTask({ title: 'a' })
    updateTask(t.id, { title: 'b', priority: 'high' })
    expect(tasks.value[0].title).toBe('b')
    expect(tasks.value[0].priority).toBe('high')
  })

  it('removes a task', () => {
    const { addTask, removeTask, tasks } = useTasks()
    const t = addTask({ title: 'a' })
    expect(removeTask(t.id)).toBe(true)
    expect(tasks.value).toHaveLength(0)
  })

  it('moves a task between statuses', () => {
    const { addTask, moveTask, tasks } = useTasks()
    const t = addTask({ title: 'a' })
    moveTask(t.id, 'done')
    expect(tasks.value[0].status).toBe('done')
  })
})
