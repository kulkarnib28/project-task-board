import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useApi } from '../hooks/useApi'
import { TaskForm } from '../components/TaskForm'
import { useAppContext } from '../context/AppContext'

const priorityToValue = { Low: 0, Medium: 1, High: 2, Critical: 3 }
const statusToValue = { Todo: 0, InProgress: 1, Review: 2, Done: 3 }

const toPayload = (payload) => ({
  ...payload,
  priority: typeof payload.priority === 'number' ? payload.priority : (priorityToValue[payload.priority] ?? payload.priority),
  status: typeof payload.status === 'number' ? payload.status : (statusToValue[payload.status] ?? payload.status),
})

export function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { triggerRefresh } = useAppContext()
  const { loading, error, callApi } = useApi()
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState({ author: '', body: '' })
  const [successMessage, setSuccessMessage] = useState('')
  const [taskFormErrors, setTaskFormErrors] = useState({})

  const showSuccess = (message) => {
    setSuccessMessage(message)
    window.setTimeout(() => setSuccessMessage(''), 2200)
  }

  const load = async () => {
    const taskRes = await callApi(() => api.get(`/tasks/${id}`))
    setTask(taskRes.data)
    const commentRes = await callApi(() => api.get(`/tasks/${id}/comments`))
    setComments(commentRes.data)
  }
  useEffect(() => { load() }, [id])

  const saveTask = async (payload) => {
    try {
      await callApi(() => api.put(`/tasks/${id}`, toPayload(payload)))
      setTaskFormErrors({})
      triggerRefresh()
      load()
      showSuccess('Task saved successfully.')
    } catch (err) {
      setTaskFormErrors(err?.response?.data?.errors || {})
    }
  }

  const removeTask = async () => {
    if (!window.confirm('Delete this task?')) return
    await callApi(() => api.delete(`/tasks/${id}`))
    triggerRefresh()
    showSuccess('Task deleted successfully.')
    navigate(-1)
  }

  const addComment = async (e) => {
    e.preventDefault()
    await callApi(() => api.post(`/tasks/${id}/comments`, comment))
    setComment({ author: '', body: '' })
    load()
    showSuccess('Comment added successfully.')
  }

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete comment?')) return
    await callApi(() => api.delete(`/comments/${commentId}`))
    load()
    showSuccess('Comment deleted successfully.')
  }

  if (loading && !task) return <p>Loading task...</p>
  if (error && !task) return <p className="error">{error}</p>
  if (!task) return null

  return (
    <section>
      <div className="row">
        <h2>Task Detail</h2>
        <button type="button" className="ghost" onClick={() => navigate(-1)}>Back to Task Board</button>
        <button onClick={removeTask}>Delete Task</button>
      </div>
      {successMessage && <p className="success">{successMessage}</p>}
      <TaskForm apiErrors={taskFormErrors} initial={{ ...task, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' }} onSubmit={saveTask} />
      <div className="card">
        <h3>Comments</h3>
        <form onSubmit={addComment} className="form">
          <input required maxLength={50} placeholder="Author" value={comment.author} onChange={(e) => setComment({ ...comment, author: e.target.value })} />
          <textarea required maxLength={500} placeholder="Comment" value={comment.body} onChange={(e) => setComment({ ...comment, body: e.target.value })} />
          <button type="submit">Add Comment</button>
        </form>
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <p><strong>{c.author}</strong> - {new Date(c.createdAt).toLocaleString()}</p>
            <p>{c.body}</p>
            <button onClick={() => deleteComment(c.id)}>Delete</button>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  )
}
