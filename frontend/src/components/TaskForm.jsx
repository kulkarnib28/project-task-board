import { useMemo, useState } from 'react'

const priorities = ['Low', 'Medium', 'High', 'Critical']
const statuses = ['Todo', 'InProgress', 'Review', 'Done']

export function TaskForm({ initial, onSubmit, onCancel, apiErrors = {} }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const normalizedApiErrors = useMemo(() => ({
    title: apiErrors.title || apiErrors.Title || apiErrors['dto.Title'],
    description: apiErrors.description || apiErrors.Description || apiErrors['dto.Description'],
    dueDate: apiErrors.dueDate || apiErrors.DueDate || apiErrors['dto.DueDate'],
    priority: apiErrors.priority || apiErrors.Priority || apiErrors['dto.Priority'],
    status: apiErrors.status || apiErrors.Status || apiErrors['dto.Status'],
  }), [apiErrors])

  const validate = () => {
    const nextErrors = {}
    if (!form.title?.trim()) nextErrors.title = 'Task title is required.'
    if ((form.title || '').trim().length > 150) nextErrors.title = 'Task title must be 150 characters or less.'
    if ((form.description || '').length > 1000) nextErrors.description = 'Description must be 1000 characters or less.'
    if (form.dueDate && new Date(form.dueDate) < new Date(new Date().toDateString())) {
      nextErrors.dueDate = 'Due date must be today or in the future.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, title: form.title.trim() })
  }

  return (
    <form onSubmit={submit} className="card form">
      <input required maxLength={150} placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      {(errors.title || normalizedApiErrors.title?.[0]) && <p className="error">{errors.title || normalizedApiErrors.title?.[0]}</p>}
      <textarea maxLength={1000} placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      {(errors.description || normalizedApiErrors.description?.[0]) && <p className="error">{errors.description || normalizedApiErrors.description?.[0]}</p>}
      <div className="row">
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {priorities.map((x) => <option key={x}>{x}</option>)}
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {statuses.map((x) => <option key={x}>{x}</option>)}
        </select>
        <input type="date" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value || null })} />
      </div>
      {(errors.priority || normalizedApiErrors.priority?.[0]) && <p className="error">{errors.priority || normalizedApiErrors.priority?.[0]}</p>}
      {(errors.status || normalizedApiErrors.status?.[0]) && <p className="error">{errors.status || normalizedApiErrors.status?.[0]}</p>}
      {(errors.dueDate || normalizedApiErrors.dueDate?.[0]) && <p className="error">{errors.dueDate || normalizedApiErrors.dueDate?.[0]}</p>}
      <div className="row">
        <button type="submit">Save Task</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
