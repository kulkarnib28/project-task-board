import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { useApi } from '../hooks/useApi'
import { TaskForm } from '../components/TaskForm'
import { useAppContext } from '../context/AppContext'

const initialTask = { title: '', description: '', priority: 'Medium', status: 'Todo', dueDate: '' }
const priorityLabels = ['Low', 'Medium', 'High', 'Critical']
const statusLabels = ['Todo', 'InProgress', 'Review', 'Done']
const priorityToValue = { Low: 0, Medium: 1, High: 2, Critical: 3 }
const statusToValue = { Todo: 0, InProgress: 1, Review: 2, Done: 3 }

const toLabel = (value, labels) => (typeof value === 'number' ? labels[value] ?? String(value) : value)
const toPayload = (payload) => ({
  ...payload,
  priority: typeof payload.priority === 'number' ? payload.priority : (priorityToValue[payload.priority] ?? payload.priority),
  status: typeof payload.status === 'number' ? payload.status : (statusToValue[payload.status] ?? payload.status),
})
const isOverdue = (task) => {
  if (!task?.dueDate) return false
  const status = toLabel(task.status, statusLabels)
  if (status === 'Done') return false
  const due = new Date(task.dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

export function TaskBoardPage() {
  const { id } = useParams()
  const { triggerRefresh } = useAppContext()
  const { loading, error, callApi } = useApi()
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({ status: '', priority: '', sortBy: 'createdAt', sortDir: 'desc', page: 1, pageSize: 10 })
  const [meta, setMeta] = useState({ totalPages: 1 })
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [taskFormErrors, setTaskFormErrors] = useState({})
  const [dragOverStatus, setDragOverStatus] = useState('')

  const load = () => {
    const params = { ...filters }
    Object.keys(params).forEach((k) => { if (params[k] === '' || params[k] === null) delete params[k] })
    callApi(() => api.get(`/projects/${id}/tasks`, { params })).then((res) => {
      setTasks(res.data.data)
      setMeta({ totalPages: res.data.totalPages })
    })
  }

  useEffect(() => { load() }, [id, filters])

  const createTask = async (payload) => {
    try {
      await callApi(() => api.post(`/projects/${id}/tasks`, toPayload(payload)))
      setTaskFormErrors({})
      setShowForm(false)
      load()
      triggerRefresh()
    } catch (err) {
      setTaskFormErrors(err?.response?.data?.errors || {})
    }
  }

  const updateTaskStatusByDrag = async (task, targetStatus) => {
    const currentStatus = toLabel(task.status, statusLabels)
    if (currentStatus === targetStatus) return

    const previousTasks = tasks
    const optimistic = tasks.map((t) =>
      t.id === task.id ? { ...t, status: targetStatus } : t
    )
    setTasks(optimistic)

    try {
      await callApi(() => api.put(`/tasks/${task.id}`, toPayload({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: targetStatus,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : null,
      })))
      triggerRefresh()
      load()
    } catch {
      setTasks(previousTasks)
    }
  }

  return (
    <section>
      <div className="row wrap filters-row">
        <h2>Task Board</h2>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close' : 'Add Task'}</button>
        <select className="filter-control" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <option value="list">List View</option>
          <option value="kanban">Kanban View</option>
        </select>
        <select className="filter-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Status</option><option>Todo</option><option>InProgress</option><option>Review</option><option>Done</option>
        </select>
        <select className="filter-control" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
          <option value="">All Priority</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select className="filter-control" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
          <option value="createdAt">createdAt</option><option value="dueDate">dueDate</option><option value="priority">priority</option>
        </select>
        <select className="filter-control" value={filters.sortDir} onChange={(e) => setFilters({ ...filters, sortDir: e.target.value })}>
          <option value="desc">desc</option>
          <option value="asc">asc</option>
        </select>
      </div>
      {showForm && (
        <div className="card full form-panel">
          <h3>Add Task</h3>
          <TaskForm apiErrors={taskFormErrors} initial={initialTask} onSubmit={createTask} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {loading && <p>Loading tasks...</p>}
      {error && <p className="error">{error}</p>}
      {viewMode === 'list' ? (
        <div className="grid">
          {!loading && tasks.length === 0 && (
            <article className="card full">
              <h3>No tasks yet</h3>
              <p>Create your first task for this project using the <strong>Add Task</strong> button.</p>
            </article>
          )}
          {tasks.map((t) => (
            <article key={t.id} className={`card ${isOverdue(t) ? 'overdue' : ''}`}>
              <h3><Link to={`/tasks/${t.id}`}>{t.title}</Link></h3>
              <p>{t.description || 'No description'}</p>
              <div className="row">
                <span className={`badge ${String(toLabel(t.priority, priorityLabels)).toLowerCase()}`}>
                  {toLabel(t.priority, priorityLabels)}
                </span>
                <span>{toLabel(t.status, statusLabels)}</span>
              </div>
              <small>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="kanban">
          {statusLabels.map((status) => {
            const columnTasks = tasks.filter((t) => toLabel(t.status, statusLabels) === status)
            return (
              <section
                key={status}
                className={`kanban-column ${dragOverStatus === status ? 'drop-target' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverStatus(status)
                }}
                onDragLeave={() => setDragOverStatus('')}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOverStatus('')
                  const taskId = Number(e.dataTransfer.getData('taskId'))
                  const draggedTask = tasks.find((x) => x.id === taskId)
                  if (draggedTask) updateTaskStatusByDrag(draggedTask, status)
                }}
              >
                <h3>{status}</h3>
                {columnTasks.length === 0 && <p className="muted">No tasks</p>}
                {columnTasks.map((t) => (
                  <article
                    key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', String(t.id))}
                    className={`card ${isOverdue(t) ? 'overdue' : ''}`}
                  >
                    <h4><Link to={`/tasks/${t.id}`}>{t.title}</Link></h4>
                    <div className="row">
                      <span className={`badge ${String(toLabel(t.priority, priorityLabels)).toLowerCase()}`}>
                        {toLabel(t.priority, priorityLabels)}
                      </span>
                    </div>
                    <small>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</small>
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      )}
      <div className="row">
        <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</button>
        <span>Page {filters.page} / {meta.totalPages || 1}</span>
        <button disabled={filters.page >= (meta.totalPages || 1)} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
      </div>
    </section>
  )
}
