import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useApi } from '../hooks/useApi'
import { ProjectForm } from '../components/ProjectForm'
import { useAppContext } from '../context/AppContext'

const statusOrder = ['Todo', 'InProgress', 'Review', 'Done']

export function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [createFormErrors, setCreateFormErrors] = useState({})
  const [editFormErrors, setEditFormErrors] = useState({})
  const { loading, error, callApi } = useApi()
  const { triggerRefresh } = useAppContext()

  const load = () => callApi(() => api.get('/projects')).then((res) => setProjects(res.data))
  useEffect(() => { load() }, [])

  const createProject = async (payload) => {
    try {
      await callApi(() => api.post('/projects', payload))
      setCreateFormErrors({})
      setShowForm(false)
      load()
      triggerRefresh()
    } catch (err) {
      setCreateFormErrors(err?.response?.data?.errors || {})
    }
  }

  const updateProject = async (payload) => {
    try {
      await callApi(() => api.put(`/projects/${editingProject.id}`, payload))
      setEditFormErrors({})
      setEditingProject(null)
      load()
      triggerRefresh()
    } catch (err) {
      setEditFormErrors(err?.response?.data?.errors || {})
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project and all related tasks/comments?')) return
    await callApi(() => api.delete(`/projects/${id}`))
    load()
    triggerRefresh()
  }

  return (
    <section className="page-section">
      <div className="row">
        <h2>Projects</h2>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close' : 'Add Project'}</button>
      </div>
      {showForm && (
        <div className="card full form-panel">
          <h3>Add Project</h3>
          <ProjectForm apiErrors={createFormErrors} onSubmit={createProject} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {loading && <p>Loading projects...</p>}
      {error && <p className="error">{error}</p>}
      <div className="grid projects-grid">
        {projects.map((p) => (
          <article key={p.id} className="card project-card">
            <h3>{p.name}</h3>
            <p>{p.description || 'No description'}</p>
            <p><strong>Total tasks:</strong> {p.taskCount ?? 0}</p>
            <div className="status-grid">
              {statusOrder.map((status) => (
                <div className="status-item" key={status}>
                  <span>{status}</span>
                  <strong>{p.taskStatusSummary?.[status] ?? 0}</strong>
                </div>
              ))}
            </div>
            <div className="row wrap project-card-actions">
              <Link className="primary-link-btn" to={`/projects/${p.id}`}>Open Task Board</Link>
              <button type="button" className="ghost" onClick={() => setEditingProject(p)}>Edit</button>
              <button type="button" className="danger-btn" onClick={() => deleteProject(p.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      {editingProject && (
        <div className="card full form-panel">
          <h3>Edit Project</h3>
          <ProjectForm apiErrors={editFormErrors} initial={editingProject} onSubmit={updateProject} onCancel={() => setEditingProject(null)} />
        </div>
      )}
    </section>
  )
}
