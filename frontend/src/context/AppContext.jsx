import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [theme, setTheme] = useState(() => localStorage.getItem('taskboard-theme') || 'light')
  const triggerRefresh = () => setRefreshKey((v) => v + 1)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('taskboard-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <AppContext.Provider value={{ refreshKey, triggerRefresh, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used in AppProvider')
  return context
}
