import { useMemo, useState } from 'react'

export function ProjectForm({ initial = { name: '', description: '' }, onSubmit, onCancel, apiErrors = {} }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const normalizedApiErrors = useMemo(() => ({
    name: apiErrors.name || apiErrors.Name || apiErrors['dto.Name'],
    description: apiErrors.description || apiErrors.Description || apiErrors['dto.Description'],
  }), [apiErrors])

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Project name is required.'
    if (form.name.trim().length > 100) nextErrors.name = 'Project name must be 100 characters or less.'
    if ((form.description || '').length > 300) nextErrors.description = 'Description must be 300 characters or less.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, name: form.name.trim() })
  }

  return (
    <form onSubmit={submit} className="card form">
      <input placeholder="Project name" maxLength={100} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      {(errors.name || normalizedApiErrors.name?.[0]) && <p className="error">{errors.name || normalizedApiErrors.name?.[0]}</p>}
      <textarea placeholder="Description" maxLength={300} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      {(errors.description || normalizedApiErrors.description?.[0]) && <p className="error">{errors.description || normalizedApiErrors.description?.[0]}</p>}
      <div className="row">
        <button type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
