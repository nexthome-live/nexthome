import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Home } from './screens/Home'
import { PostVacancy } from './screens/Post'
import { ViewVacancies } from './screens/View'
import { API_BASE_URL } from './api/config'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('home')
  const [vacancyCount, setVacancyCount] = useState(0)

  // Lightly fetch count for the home stats — fail silently.
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE_URL}/api/vacancies`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setVacancyCount(data.length)
      })
      .catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, [])

  const goHome = () => setActiveView('home')

  return (
    <div className="app-shell">
      <Header
        onHome={goHome}
        canGoHome={activeView !== 'home'}
      />
      <main className="app-main">
        {activeView === 'home' && (
          <Home
            onSelect={setActiveView}
            totalVacancies={vacancyCount}
          />
        )}
        {activeView === 'post' && (
          <PostVacancy onBack={goHome} onHome={goHome} />
        )}
        {activeView === 'view' && (
          <ViewVacancies onBack={goHome} onHome={goHome} />
        )}
      </main>
      <footer className="app-footer">
        <span>© {new Date().getFullYear()} nextHome</span>
        <span className="app-footer__dot" aria-hidden="true">·</span>
        <span>Find rentals. Feel at home.</span>
      </footer>
    </div>
  )
}

export default App
