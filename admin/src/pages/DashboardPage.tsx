import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react'
import { dashboardApi } from '../api/client'

interface Summary { todayAppointments: number; pendingAppointments: number; totalClients: number; totalRevenue: number }

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [popularServices, setPopularServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c, p] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getAppointmentsChart(7),
          dashboardApi.getPopularServices(),
        ])
        setSummary(s.data)
        setChartData(c.data)
        setPopularServices(p.data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const stats = summary ? [
    { label: 'رزروهای امروز', value: summary.todayAppointments, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'در انتظار تأیید', value: summary.pendingAppointments, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'کل مشتریان', value: summary.totalClients, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'درآمد کل (تومان)', value: Number(summary.totalRevenue || 0).toLocaleString('fa'), icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-50' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="gradient-header rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">داشبورد مدیریت ✿</h1>
        <p className="opacity-80 mt-1">خوش آمدید، پروانه جان</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`bg-white rounded-2xl p-5 shadow-sm card-hover`}>
                <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-4">رزروهای ۷ روز اخیر</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C2185B" radius={4} name="رزرو" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-4">محبوب‌ترین خدمات</h2>
              <div className="space-y-3">
                {popularServices.map((s: any, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-pink-100 rounded-full h-2 w-24 overflow-hidden">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.min(100, (s.count / (popularServices[0]?.count || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-left">{s.count}</span>
                    </div>
                  </div>
                ))}
                {popularServices.length === 0 && <p className="text-gray-400 text-sm text-center">داده‌ای وجود ندارد</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
