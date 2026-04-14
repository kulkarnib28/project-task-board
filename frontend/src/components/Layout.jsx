import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function Layout({ children }) {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useAppContext()
  return (
    <div className="app-shell">
      <header>
        <div>
          <h1>Project Task Board</h1>
          <p className="subtitle">Task planning, tracking, and collaboration workspace</p>
        </div>
        <div className="row nav-row">
          <button type="button" className="ghost" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <nav>
          <Link className={pathname === '/dashboard' ? 'active' : ''} to="/dashboard">Dashboard</Link>
          <Link className={pathname.startsWith('/projects') ? 'active' : ''} to="/projects">Projects</Link>
          </nav>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  )
}
