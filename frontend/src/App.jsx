import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profiles from './pages/Profiles'
import ProfileDetail from './pages/ProfileDetail'
import CreateProfile from './pages/CreateProfile'
import AddPreference from './pages/AddPreference'
import EditPreference from './pages/EditPreference'
import Stats from './pages/Stats'
import SearchProfiles from './pages/SearchProfiles'
import EditProfile from './pages/EditProfile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/profiles" element={<PrivateRoute><Layout><Profiles /></Layout></PrivateRoute>} />
          <Route path="/profiles/create" element={<PrivateRoute><Layout><CreateProfile /></Layout></PrivateRoute>} />
          <Route path="/profiles/search" element={<PrivateRoute><Layout><SearchProfiles /></Layout></PrivateRoute>} />
          <Route path="/profiles/:id" element={<PrivateRoute><Layout><ProfileDetail /></Layout></PrivateRoute>} />
          <Route path="/profiles/:id/edit" element={<PrivateRoute><Layout><EditProfile /></Layout></PrivateRoute>} />
          <Route path="/preferences/create" element={<PrivateRoute><Layout><AddPreference /></Layout></PrivateRoute>} />
          <Route path="/preferences/:id/edit" element={<PrivateRoute><Layout><EditPreference /></Layout></PrivateRoute>} />
          <Route path="/stats" element={<PrivateRoute><Layout><Stats /></Layout></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
