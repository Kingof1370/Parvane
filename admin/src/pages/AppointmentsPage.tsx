import { useEffect, useState } from 'react'
import { appointmentsApi, servicesApi, staffApi, clientsApi } from '../api/client'
import { CheckCircle, XCircle, Clock, RefreshCw, Plus, X, Calendar as CalendarIcon } from 'lucide-react'

const statusLabel: Record<string, string> = { pending: 'در انتظار', confirmed: 'تأیید شده', in_progress: 'در حال انجام', completed: 'تکمیل شده', cancelled: 'لغو شده', no_show: 'غیبت' }
const statusClass: Record<string, string> = { pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled', no_show: 'status-cancelled' }

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  // Booking Modal State
  const [showBookModal, setShowBookModal] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [bookingForm, setBookingForm] = useState({
    clientId: '',
    serviceId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    notes: ''
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await appointmentsApi.getAll({ date: dateFilter })
      setAppointments(res.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [dateFilter])

  const openBookModal = async () => {
    setShowBookModal(true)
    try {
      const [sRes, stRes, cRes] = await Promise.all([
        servicesApi.getAll(),
        staffApi.getAll(),
        clientsApi.getAll()
      ])
      setServices(sRes.data)
      setStaffList(stRes.data)
      setClients(cRes.data)
    } catch (err) {
      console.error('Error loading data for booking', err)
    }
  }

  const loadSlots = async () => {
    const { staffId, serviceId, date } = bookingForm
    if (!staffId || !serviceId || !date) return
    setSlotsLoading(true)
    try {
      const res = await appointmentsApi.getSlots(staffId, serviceId, date)
      setAvailableSlots(res.data.slots || [])
    } catch {
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [bookingForm.staffId, bookingForm.serviceId, bookingForm.date])

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingForm.startTime) {
      alert('لطفاً یک ساعت خالی انتخاب کنید')
      return
    }
    try {
      await appointmentsApi.create(bookingForm)
      setShowBookModal(false)
      setBookingForm({
        clientId: '',
        serviceId: '',
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        notes: ''
      })
      setAvailableSlots([])
      load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطایی در ثبت رزرو رخ داد')
    }
  }

  const updateStatus = async (id: string, status: string) => {
    await appointmentsApi.updateStatus(id, status)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت رزروها</h1>
        <div className="flex gap-3">
          <button
            onClick={openBookModal}
            className="gradient-header text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
          >
            <Plus size={18} /> رزرو جدید
          </button>
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

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">ثبت رزرو جدید سالن</h2>
              <button onClick={() => setShowBookModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">انتخاب مشتری</label>
                <select
                  required
                  value={bookingForm.clientId}
                  onChange={e => setBookingForm({ ...bookingForm, clientId: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                >
                  <option value="">انتخاب مشتری</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} — {c.phone}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">خدمت سالن</label>
                  <select
                    required
                    value={bookingForm.serviceId}
                    onChange={e => setBookingForm({ ...bookingForm, serviceId: e.target.value, startTime: '' })}
                    className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  >
                    <option value="">انتخاب خدمت</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.price.toLocaleString()} تومان)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">متخصص سالن</label>
                  <select
                    required
                    value={bookingForm.staffId}
                    onChange={e => setBookingForm({ ...bookingForm, staffId: e.target.value, startTime: '' })}
                    className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  >
                    <option value="">انتخاب متخصص</option>
                    {staffList.map(st => (
                      <option key={st.id} value={st.id}>{st.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ رزرو</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value, startTime: '' })}
                    className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">انتخاب ساعت رزرو</label>
                {slotsLoading ? (
                  <div className="text-sm text-gray-400 py-2">در حال بارگذاری زمان‌های خالی...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-sm text-red-500 py-2">زمانی برای این تاریخ یا متخصص موجود نیست</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl bg-gray-50">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, startTime: slot })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                          bookingForm.startTime === slot
                            ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-pink-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت (اختیاری)</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="توضیحات تکمیلی..."
                  rows={2}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 gradient-header text-white py-2.5 rounded-xl font-semibold">ثبت رزرو</button>
                <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 border py-2.5 rounded-xl text-gray-600 text-sm">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
