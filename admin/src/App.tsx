import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
import ServicesPage from './pages/ServicesPage'
import StaffPage from './pages/StaffPage'
import ClientsPage from './pages/ClientsPage'
import SettingsPage from './pages/SettingsPage'
import GalleryPage from './pages/GalleryPage'
import LoyaltyPage from './pages/LoyaltyPage'
import ChatPage from './pages/ChatPage'
import Layout from './components/Layout'

import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />

  if (adminOnly) {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    if (user?.role === 'staff') {
      return <Navigate to="/gallery" replace />
    }
  }

  return <>{children}</>
}

export default function App() {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isStaff = user?.role === 'staff'

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to={isStaff ? "/gallery" : "/dashboard"} replace />} />
        <Route path="dashboard" element={<PrivateRoute adminOnly><DashboardPage /></PrivateRoute>} />
        <Route path="appointments" element={<PrivateRoute adminOnly><AppointmentsPage /></PrivateRoute>} />
        <Route path="services" element={<PrivateRoute adminOnly><ServicesPage /></PrivateRoute>} />
        <Route path="staff" element={<PrivateRoute adminOnly><StaffPage /></PrivateRoute>} />
        <Route path="clients" element={<PrivateRoute adminOnly><ClientsPage /></PrivateRoute>} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="loyalty" element={<PrivateRoute adminOnly><LoyaltyPage /></PrivateRoute>} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<PrivateRoute adminOnly><SettingsPage /></PrivateRoute>} />
      </Route>
    </Routes>
  )
}
