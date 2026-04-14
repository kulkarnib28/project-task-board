import { useEffect, useState } from 'react'
import api from '../services/api'
import { useApi } from '../hooks/useApi'
import { useAppContext } from '../context/AppContext'

export function DashboardPage() {
  const [data, setData] = useState(null)
  const { loading, error, callApi } = useApi()
  const { refreshKey } = useAppContext()

  useEffect(() => {
    callApi(() => api.get('/dashboard')).then((res) => setData(res.data))
  }, [refreshKey])

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p className="error">{error}</p>
  if (!data) return null

  const statusEntries = Object.entries(data.tasksByStatus || {})

  return (
    <section className="grid">
      <div className="card"><h3>Total Projects</h3><p>{data.totalProjects}</p></div>
      <div className="card"><h3>Total Tasks</h3><p>{data.totalTasks}</p></div>
      <div className="card danger"><h3>Overdue Tasks</h3><p>{data.overdueTasks}</p></div>
      <div className="card"><h3>Due in 7 Days</h3><p>{data.tasksDueNext7Days}</p></div>
      <div className="card full">
        <h3>Tasks by Status</h3>
        <div className="status-grid">
          {statusEntries.length === 0 && <p>No task status data available.</p>}
          {statusEntries.map(([status, count]) => (
            <div className="status-item" key={status}>
              <span>{status}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
