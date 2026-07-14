import { useEffect, useState } from 'react'
import { clientsApi } from '../api/client'
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (q?: string) => {
    setLoading(true)
    try { const res = await clientsApi.getAll(q); setClients(res.data) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggle = async (id: string) => { await clientsApi.toggleActive(id); load(search) }

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await clientsApi.updateRole(id, role)
      load(search)
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر نقش')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return
    try {
      await clientsApi.deleteUser(id)
      load(search)
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در حذف کاربر')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت کاربران و مشتریان</h1>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو با نام یا موبایل..."
            value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value) }}
            className="pr-10 pl-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 w-64 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['نام', 'موبایل', 'ایمیل', 'نقش سیستم', 'وضعیت حساب', 'عملیات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-sm font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-header flex items-center justify-center text-white text-sm font-bold">
                        {c.fullName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={c.role}
                      onChange={e => handleRoleChange(c.id, e.target.value)}
                      className="border rounded-xl px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                    >
                      <option value="client">مشتری</option>
                      <option value="staff">متخصص</option>
                      <option value="admin">مدیر</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${c.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {c.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(c.id)}
                        className={`p-1.5 rounded-lg ${c.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={c.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                      >
                        {c.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        title="حذف کاربر"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">کاربری یافت نشد</div>
        )}
      </div>
    </div>
  )
}
