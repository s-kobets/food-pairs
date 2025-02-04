import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Home from './routes/Home'
import Combinations from './routes/Combinations'
import Profile from './routes/Profile'
import Foods from './routes/Foods'
import { useEffect, useState } from 'react'
import { setupDatabase, checkDatabaseHealth } from './lib/setupDatabase'
import IngredientsChecker from './routes/IngredientsChecker'

function App() {
  const {pathname} =  window.location
  const [isDbReady, setIsDbReady] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const isMainPage = pathname === '/'

  useEffect(() => {
    if (isMainPage) return
    const initializeDatabase = async () => {
      try {
        // Check if database is healthy first
        const isHealthy = await checkDatabaseHealth()
        if (!isHealthy) {
          // Only run setup if health check fails
          const success = await setupDatabase()
          if (!success) {
            throw new Error('Failed to initialize database')
          }
        }
        
        setIsDbReady(true)
      } catch (error) {
        setDbError(error instanceof Error ? error.message : 'Database initialization failed')
      }
    }

    initializeDatabase()
  }, [isMainPage])

  if (dbError) {
    return <div className="text-red-500">Error: {dbError}</div>
  }

  if (!isMainPage && !isDbReady) {
    return <div>Setting up database...</div>
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/combinations" element={<Combinations />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checker" element={<IngredientsChecker />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 