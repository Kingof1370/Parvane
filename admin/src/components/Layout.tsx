import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Scissors, Users, Settings,
  LogOut, Menu, UserCheck, Image, Star, MessageCircle,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/appointments', icon: Calendar, label: 'رزروها' },
  { to: '/services', icon: Scissors, label: 'خدمات' },
  { to: '/staff', icon: UserCheck, label: 'متخصصان' },
  { to: '/gallery', icon: Image, label: 'گالری استایل' },
  { to: '/clients', icon: Users, label: 'مشتریان' },
  { to: '/loyalty', icon: Star, label: 'امتیاز وفاداری' },
  { to: '/chat', icon: MessageCircle, label: 'مشاوره آنلاین' },
  { to: '/settings', icon: Settings, label: 'تنظیمات' },
]

export default function Layout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const Sidebar = () => {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    const isStaff = user?.role === 'staff'

    const visibleItems = navItems.filter(({ to }) => {
      if (isStaff) {
        return to === '/gallery' || to === '/chat'
      }
      return true
    })

    return (
      <div className="flex flex-col h-full bg-white shadow-xl">
        <div className="gradient-header p-6">
          <div className="text-white text-center">
            <div className="text-3xl mb-2">✿</div>
            <div className="font-bold text-lg">سالن زیبایی پروانه</div>
            <div className="text-sm opacity-80">{isStaff ? 'پنل متخصص' : 'پنل مدیریت'}</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-pink-50 text-pink-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t space-y-1">
          <div className="text-xs text-gray-400 text-center pb-2">
            توسعه: علی بهمنی | ۰۹۹۱۵۴۲۰۵۵۸
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-pink-700">سالن زیبایی پروانه</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
