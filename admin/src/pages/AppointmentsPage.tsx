import { useEffect, useState } from 'react'
import { appointmentsApi } from '../api/client'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

const statusLabel: Record<string, string> = { pending: 'در انتظار', confirmed: 'تأیید شده', in_progress: 'در حال انجام', completed: 'تکمیل شده', cancelled: 'لغو شده', no_show: 'غیبت' }
const statusClass: Record<string, string> = { pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled', no_show: 'status-cancelled' }

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  const load = async () => {
    setLoading(true)
    try {
      const res = await appointmentsApi.getAll({ date: dateFilter })
      setAppointments(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [dateFilter])

  const updateStatus = async (id: string, status: string) => {
    await appointmentsApi.updateStatus(id, status)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت رزروها</h1>
        <div className="flex gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
          />
          <button onClick={load} className="p-2 border rounded-xl hover:bg-gray-50">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p>رزروی برای این تاریخ وجود ندارد</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['مشتری', 'خدمت', 'متخصص', 'ساعت', 'وضعیت', 'عملیات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-sm font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt: any) => (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{appt.client?.fullName}</td>
                    <td className="px-4 py-3 text-sm">{appt.service?.name}</td>
                    <td className="px-4 py-3 text-sm">{appt.staff?.fullName}</td>
                    <td className="px-4 py-3 text-sm">{appt.startTime} — {appt.endTime}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusClass[appt.status] || ''}`}>
                        {statusLabel[appt.status] || appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(appt.id, 'confirmed')} className="p-1 text-green-500 hover:bg-green-50 rounded-lg" title="تأیید">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => updateStatus(appt.id, 'cancelled')} className="p-1 text-red-500 hover:bg-red-50 rounded-lg" title="لغو">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <button onClick={() => updateStatus(appt.id, 'completed')} className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg" title="تکمیل">
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Calendar({ size, className }: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
