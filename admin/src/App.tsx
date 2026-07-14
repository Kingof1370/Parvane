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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function IndexRedirect() {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  if (user?.role === 'staff') {
    return <Navigate to="/gallery" replace />
  }
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<IndexRedirect />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="loyalty" element={<LoyaltyPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
