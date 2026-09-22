import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanBoard from './KanbanBoard.vue'

function makeTask(id, status) {
  return { id, title: 't' + id, description: '', status, priority: 'medium' }
}

describe('KanbanBoard', () => {
  it('renders one column per status', () => {
    const wrapper = mount(KanbanBoard, { props: { tasks: [makeTask('1', 'todo')] } })
    expect(wrapper.findAll('section')).toHaveLength(3)
  })

  it('groups tasks under the matching column', () => {
    const wrapper = mount(KanbanBoard, {
      props: { tasks: [makeTask('1', 'todo'), makeTask('2', 'done')] },
    })
    expect(wrapper.text()).toContain('待办')
    expect(wrapper.text()).toContain('完成')
    expect(wrapper.findAll('[data-test="task-card"]')).toHaveLength(2)
  })
})
