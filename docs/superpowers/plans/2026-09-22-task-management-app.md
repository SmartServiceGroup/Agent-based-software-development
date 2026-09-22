# 任务管理应用 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个纯前端「任务管理应用」，支持任务增删改查、三态三列看板拖拽、优先级颜色标识、一键深色模式（记忆偏好），数据用 localStorage 持久化，作为 Agentic 开发的课堂实践。

**Architecture:** Vue 3（Composition API + `<script setup>`）单页应用；状态与持久化通过组合式函数（`useLocalStorage` / `useTasks` / `useDarkMode`）封装；UI 拆分为 TaskForm / TaskCard / TaskColumn / KanbanBoard / DarkModeToggle 五个组件，看板拖拽用原生 HTML5 Drag and Drop。

**Tech Stack:** Vue 3、Vite、Tailwind CSS（darkMode: class）、Vitest + @vue/test-utils + jsdom、原生 localStorage。

## Global Constraints

- 前端框架：Vue 3；构建工具：Vite；样式方案：Tailwind CSS；数据存储：localStorage（刷新不丢失）。
- 任务三种状态（固定 id/label）：`todo/待办`、`in-progress/进行中`、`done/完成`。
- 优先级三档（固定 id/label/颜色）：`high/高/红`、`medium/中/黄`、`low/低/绿`。
- 新增/编辑任务：`title` 必填（空白即拒绝），`description` 选填（默认为空串）。
- 深色模式：一键切换，并写入 localStorage 记住选择，下次进入保持。
- 提交验收：可运行应用 + 每次功能截图 + 提示词设计；限时 20–25 分钟演示（此条不影响代码，仅验收口径）。
- 参考资源：https://www.runoob.com/vibe-coding/vibe-coding-practice.html

---

## 文件结构总览

| 文件 | 职责 |
| --- | --- |
| `package.json` | 依赖与脚本（dev/build/test） |
| `vite.config.js` | Vite + Vue 插件 + Vitest(jsdom) 配置 |
| `tailwind.config.js` | Tailwind 内容扫描、`darkMode: 'class'` |
| `postcss.config.js` | Tailwind + autoprefixer 后处理 |
| `index.html` | 入口 HTML（zh-CN，挂载 `#app`） |
| `src/main.js` | 创建并挂载 Vue 应用 |
| `src/style.css` | Tailwind 三条指令 |
| `src/constants.js` | 状态、优先级常量与映射 |
| `src/composables/useLocalStorage.js` | 响应式本地存储 |
| `src/composables/useTasks.js` | 任务 CRUD + 状态流转 + 校验 |
| `src/composables/useDarkMode.js` | 深色模式状态 + 持久化 |
| `src/components/TaskForm.vue` | 新增任务表单 |
| `src/components/TaskCard.vue` | 单任务卡片（展示/行内编辑/删除/拖拽源） |
| `src/components/TaskColumn.vue` | 单状态列（置放目标） |
| `src/components/KanbanBoard.vue` | 三列看板 + 拖拽编排 |
| `src/components/DarkModeToggle.vue` | 深色模式切换按钮 |
| `src/App.vue` | 组装全局布局与状态接线 |

---

### Task 1: 工程脚手架与常量配置

**Files:**
- Create: `package.json`、`vite.config.js`、`tailwind.config.js`、`postcss.config.js`、`index.html`、`src/main.js`、`src/style.css`、`src/constants.js`、`src/App.vue`
- Test: 无独立测试，以构建通过为验收。

**Interfaces:**
- Consumes: 无（首个任务）。
- Produces: `constants.js` 导出 `TASK_STATUSES`、`PRIORITY_LEVELS`、`PRIORITY_BY_ID`；App 骨架可被后续任务直接扩展。

- [ ] **Step 1: 写入 package.json**

```json
{
  "name": "task-management-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.6.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^24.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 2: 写入 vite.config.js**

```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: 写入 tailwind.config.js 与 postcss.config.js**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
}
```

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: 写入入口文件 index.html / src/main.js / src/style.css**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>任务管理应用</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

```css
/* src/style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: 写入 src/constants.js**

```js
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
```

- [ ] **Step 6: 写入 App.vue 骨架**

```vue
<script setup></script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <header class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
      <h1 class="text-2xl font-bold">任务管理应用</h1>
    </header>
    <main class="mx-auto max-w-6xl px-6 py-6"></main>
  </div>
</template>
```

- [ ] **Step 7: 安装依赖并验证构建**

Run: `npm install`
Expected: 安装成功，无 peer 冲突（若网络失败用普通环境恢复后重试一次）。

Run: `npm run build`
Expected: `vite build` 成功，产物生成于 `dist/`。

- [ ] **Step 8: Commit**

```bash
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/main.js src/style.css src/constants.js src/App.vue
git commit -m "chore: scaffold Vue3 + Vite + Tailwind app"
```

---

### Task 2: useLocalStorage 组合式函数（TDD）

**Files:**
- Create: `src/composables/useLocalStorage.js`
- Test: `src/composables/useLocalStorage.spec.js`

**Interfaces:**
- Consumes: 无。
- Produces: `useLocalStorage(key, defaultValue)` → 返回一个 Vue `ref`，初始值来自 `defaultValue` 或已存储的 JSON；对其赋值（含深改）会自动写回 localStorage。

- [ ] **Step 1: Write the failing test**

```js
// src/composables/useLocalStorage.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useLocalStorage } from './useLocalStorage.js'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns default value when key is missing', () => {
    const v = useLocalStorage('k', [])
    expect(v.value).toEqual([])
  })

  it('loads existing value from storage', () => {
    localStorage.setItem('k', JSON.stringify([1, 2, 3]))
    const v = useLocalStorage('k', [])
    expect(v.value).toEqual([1, 2, 3])
  })

  it('persists changes back to storage', async () => {
    const v = useLocalStorage('k', [])
    v.value = [42]
    await nextTick()
    expect(JSON.parse(localStorage.getItem('k'))).toEqual([42])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/composables/useLocalStorage.spec.js`
Expected: FAIL（`Cannot find module './useLocalStorage.js'`）。

- [ ] **Step 3: Write minimal implementation**

```js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  let initial = defaultValue
  const stored = localStorage.getItem(key)
  if (stored !== null) {
    try {
      initial = JSON.parse(stored)
    } catch {
      initial = defaultValue
    }
  }
  const value = ref(initial)
  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })
  return value
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/composables/useLocalStorage.spec.js`
Expected: PASS（3 passed）。

- [ ] **Step 5: Commit**

```bash
git add src/composables/useLocalStorage.js src/composables/useLocalStorage.spec.js
git commit -m "feat: add useLocalStorage composable"
```

---

### Task 3: useTasks 组合式函数 —— CRUD 与校验（TDD）

**Files:**
- Create: `src/composables/useTasks.js`
- Test: `src/composables/useTasks.spec.js`
- Consume（已存在）: `src/composables/useLocalStorage.js`、`src/constants.js`

**Interfaces:**
- Consumes: `useLocalStorage(key, default)`（Task 2）。
- Produces: `createId()`；`createTask({title, description?, priority?, status?})`；`useTasks()` 返回 `{ tasks, addTask, getTask, updateTask, removeTask, moveTask }`。任务对象形状：`{ id, title, description, status, priority, createdAt, updatedAt }`。`addTask`/`updateTask` 对空标题抛 `Error('标题不能为空')`。

- [ ] **Step 1: Write the failing test**

```js
// src/composables/useTasks.spec.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/composables/useTasks.spec.js`
Expected: FAIL（`Cannot find module './useTasks.js'`）。

- [ ] **Step 3: Write minimal implementation**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/composables/useTasks.spec.js`
Expected: PASS（5 passed）。

- [ ] **Step 5: Commit**

```bash
git add src/composables/useTasks.js src/composables/useTasks.spec.js
git commit -m "feat: add useTasks CRUD composable"
```

---

### Task 4: useDarkMode 组合式函数（TDD）

**Files:**
- Create: `src/composables/useDarkMode.js`
- Test: `src/composables/useDarkMode.spec.js`

**Interfaces:**
- Consumes: 无。
- Produces: `useDarkMode()` 返回 `{ isDark, toggle }`；初始化时从 localStorage `dark-mode` 读取，`toggle()` 反转并持久化，同时切换 `document.documentElement` 的 `dark` class。

- [ ] **Step 1: Write the failing test**

```js
// src/composables/useDarkMode.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { useDarkMode } from './useDarkMode.js'

describe('useDarkMode', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to light mode', () => {
    const { isDark } = useDarkMode()
    expect(isDark.value).toBe(false)
  })

  it('reads persisted dark mode', () => {
    localStorage.setItem('dark-mode', 'true')
    const { isDark } = useDarkMode()
    expect(isDark.value).toBe(true)
  })

  it('toggle flips and persists selection', () => {
    const { isDark, toggle } = useDarkMode()
    toggle()
    expect(isDark.value).toBe(true)
    expect(localStorage.getItem('dark-mode')).toBe('true')
    toggle()
    expect(isDark.value).toBe(false)
    expect(localStorage.getItem('dark-mode')).toBe('false')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/composables/useDarkMode.spec.js`
Expected: FAIL（`Cannot find module './useDarkMode.js'`）。

- [ ] **Step 3: Write minimal implementation**

```js
import { ref, watchEffect } from 'vue'

export function useDarkMode() {
  const isDark = ref(localStorage.getItem('dark-mode') === 'true')

  watchEffect(() => {
    const cls = 'dark'
    const has = document.documentElement.classList.contains(cls)
    if (isDark.value && !has) document.documentElement.classList.add(cls)
    if (!isDark.value && has) document.documentElement.classList.remove(cls)
    localStorage.setItem('dark-mode', String(isDark.value))
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/composables/useDarkMode.spec.js`
Expected: PASS（3 passed）。

- [ ] **Step 5: Commit**

```bash
git add src/composables/useDarkMode.js src/composables/useDarkMode.spec.js
git commit -m "feat: add useDarkMode composable"
```

---

### Task 5: 看板与卡片 UI（新建表单 + 卡片 + 列 + 看板拖拽）

**Files:**
- Create: `src/components/TaskForm.vue`、`src/components/TaskCard.vue`、`src/components/TaskColumn.vue`、`src/components/KanbanBoard.vue`
- Modify: `src/App.vue`（接入表单与看板）
- Test: `src/components/KanbanBoard.spec.js`
- Consume（已存在）: `src/constants.js`、`src/composables/useTasks.js`

**Interfaces:**
- Consumes: `TASK_STATUSES`、`PRIORITY_LEVELS`、`PRIORITY_BY_ID`（constants）；`useTasks()` 的 `tasks`/`addTask`/`updateTask`/`removeTask`/`moveTask`。
- Produces:
  - `TaskForm`：`emit('add', { title, description, priority })`。
  - `TaskCard`：props `{ task }`；`emit('edit', { id, title, description, priority })`、`emit('remove', id)`、`emit('dragstart', task, event)`。
  - `TaskColumn`：props `{ status, tasks }`；透传 `dragstart/update/remove`，`emit('drop')`。
  - `KanbanBoard`：props `{ tasks }`；`emit('update', patch)`、`emit('remove', id)`、`emit('move', { id, status })`。

- [ ] **Step 1: Write the failing test（看板分组渲染）**

```js
// src/components/KanbanBoard.spec.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/KanbanBoard.spec.js`
Expected: FAIL（`Cannot find module './KanbanBoard.vue'`）。

- [ ] **Step 3: 写入 TaskForm.vue**

```vue
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
```

- [ ] **Step 4: 写入 TaskCard.vue**

```vue
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
```

- [ ] **Step 5: 写入 TaskColumn.vue**

```vue
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
```

- [ ] **Step 6: 写入 KanbanBoard.vue**

```vue
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
```

- [ ] **Step 7: 改写 App.vue 接入表单与看板**

```vue
<script setup>
import { useTasks } from './composables/useTasks.js'
import TaskForm from './components/TaskForm.vue'
import KanbanBoard from './components/KanbanBoard.vue'

const { tasks, addTask, updateTask, removeTask, moveTask } = useTasks()

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
    <header class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
      <h1 class="text-2xl font-bold">任务管理应用</h1>
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
```

`KanbanBoard.vue` 中的 `tasksByStatus` 必须引用 `props.tasks`（配合 `const props = defineProps(...)`），请以 Step 6 最终版为准。

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/components/KanbanBoard.spec.js`
Expected: PASS（2 passed）。

Run: `npm run build`
Expected: 构建成功（UI 组件编译通过）。

- [ ] **Step 9: Commit**

```bash
git add src/components/TaskForm.vue src/components/TaskCard.vue src/components/TaskColumn.vue src/components/KanbanBoard.vue src/components/KanbanBoard.spec.js src/App.vue
git commit -m "feat: add kanban board with drag-and-drop"
```

---

### Task 6: 深色模式切换接入

**Files:**
- Create: `src/components/DarkModeToggle.vue`
- Modify: `src/App.vue`（接入 `useDarkMode`）
- Consume（已存在）: `src/composables/useDarkMode.js`

**Interfaces:**
- Consumes: `useDarkMode()` 的 `{ isDark, toggle }`。
- Produces: `DarkModeToggle`：props `{ isDark }`，`emit('toggle')`。

- [ ] **Step 1: 写入 DarkModeToggle.vue**

```vue
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
```

- [ ] **Step 2: 改写 App.vue 接入深色模式**

```vue
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
```

- [ ] **Step 3: 验证构建**

Run: `npm run build`
Expected: 构建成功；`dist` 中存在 `index.html` 与产物资源。

- [ ] **Step 4: Commit**

```bash
git add src/components/DarkModeToggle.vue src/App.vue
git commit -m "feat: add dark mode toggle"
```

---

### Task 7: 集成验证与收尾

**Files:**
- 无新增；仅运行全量测试与构建。

- [ ] **Step 1: 全量测试**

Run: `npm test`
Expected: 全部用例 PASS（useLocalStorage 3 + useTasks 5 + useDarkMode 3 + KanbanBoard 2 = 13 passed）。

- [ ] **Step 2: 全量构建**

Run: `npm run build`
Expected: 构建成功，无报错。

- [ ] **Step 3: 本地预览冒烟**

Run: `npm run dev -- --host 127.0.0.1`
Expected: 服务启动并监听端口；浏览器打开后可：新增任务（空标题被拦截）、卡片显示优先级颜色、拖拽卡片跨列改状态、切换深色模式、刷新后数据与主题均保持。

- [ ] **Step 4: Commit（如步骤产生未提交变更）**

```bash
git add -A
git commit -m "chore: final integration verification"
```

---

## Self-Review

**1. Spec 覆盖：**
- 任务 CRUD → Task 3（核心逻辑）+ Task 5（TaskForm/TaskCard 编辑删除）。
- 三状态 + 三优先级 + 颜色 → Task 1（constants）+ Task 5（卡片颜色徽标）。
- 看板三列拖拽改状态 → Task 5（KanbanBoard/TaskColumn/HTML5 DnD）。
- 深色模式 + 记忆 → Task 4（composable）+ Task 6（toggle 接入）。
- localStorage 持久化 → Task 2（useLocalStorage）+ Task 3（useTasks 接入）。
- 技术栈 Vue3/Vite/Tailwind → Task 1。
- 无覆盖缺口。

**2. 占位符扫描：** 计划中无 "TBD/TODO/实现细节待定" 等占位；步骤全部给出真实代码与期望结果。

**3. 类型/命名一致性：** 任务形状字段（id/title/description/status/priority/createdAt/updatedAt）在 `useTasks.js` 定义，在测试与各组件 props/emit 中同名一致；状态 id（todo/in-progress/done）与优先级 id（high/medium/low）在 `constants.js` 与 `useTasks` 默认值中一致；`move` 事件负载 `{ id, status }` 在 KanbanBoard emit 与 App 的 `handleMove` 解构一致。

**已知注意点（执行者须知）：**
- 各组件在 `<script setup>` 中统一使用 `const props = defineProps({...})`，确保 `props.xxx` 在 `<template>` 与 setup 函数中均可直接引用。
- 拖拽在 jsdom 中不便于端到端断言原生 `dataTransfer`；故自动化覆盖到「列分组渲染」，拖拽行为以构建 + 手动冒烟兜底（Task 7 Step 3）。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-22-task-management-app.md`。执行时按 Task 1 → 7 顺序，推荐使用 superpowers:subagent-driven-development（每任务一个子代理 + 阶段复审），或使用 superpowers:executing-plans 在当前会话内批量执行 + 检查点复审。