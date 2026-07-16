import { useEffect, useState } from 'react'
import { clientsApi } from '../api/client'
import { Search, UserX, UserCheck, Shield, Key, ChevronDown, ChevronUp, X } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  client: 'مشتری',
  staff: 'متخصص',
  admin: 'ادمین',
}

const ROLE_COLORS: Record<string, string> = {
  client: 'bg-gray-100 text-gray-700',
  staff: 'bg-blue-100 text-blue-700',
  admin: 'bg-pink-100 text-pink-700',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // مدیریت نقش
  const [showRoleModal, setShowRoleModal] = useState<any>(null)
  const [roleForm, setRoleForm] = useState({ role: '', staffSection: '' })

  // تغییر رمز عبور
  const [showPasswordModal, setShowPasswordModal] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async (q?: string) => {
    setLoading(true)
    try { const res = await clientsApi.getAll(q); setClients(res.data) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggle = async (id: string) => {
    await clientsApi.toggleActive(id)
    load(search)
  }

  const openRoleModal = (c: any) => {
    setRoleForm({ role: c.role || 'client', staffSection: c.staffSection || '' })
    setShowRoleModal(c)
  }

  const handleChangeRole = async () => {
    if (!showRoleModal) return
    setSaving(true)
    try {
      await clientsApi.changeRole(showRoleModal.id, roleForm.role, roleForm.staffSection)
      setShowRoleModal(null)
      load(search)
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطایی رخ داد')
    } finally { setSaving(false) }
  }

  const handleResetPassword = async () => {
    if (!showPasswordModal || !newPassword) return
    setSaving(true)
    try {
      await clientsApi.resetPassword(showPasswordModal.id, newPassword)
      setShowPasswordModal(null)
      setNewPassword('')
      alert('رمز عبور با موفقیت تغییر کرد')
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطایی رخ داد')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h1>
          <p className="text-sm text-gray-500 mt-1">کنترل دسترسی کاربران مثل ادمین تلگرام</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو..."
            value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value) }}
            className="pr-10 pl-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['نام', 'موبایل', 'نقش', 'وضعیت', 'امتیاز', 'عملیات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-sm font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((c: any) => (
                <>
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-header flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(c.fullName || '?')[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{c.fullName}</div>
                          {c.email && <div className="text-xs text-gray-400">{c.email}</div>}
                          {c.staffSection && <div className="text-xs text-blue-500">بخش: {c.staffSection}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${ROLE_COLORS[c.role] || 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_LABELS[c.role] || c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.loyaltyPoints || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* تغییر دسترسی مثل تلگرام */}
                        <button
                          onClick={() => openRoleModal(c)}
                          className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg"
                          title="تغییر سطح دسترسی"
                        >
                          <Shield size={16} />
                        </button>
                        {/* تغییر رمز عبور */}
                        <button
                          onClick={() => setShowPasswordModal(c)}
                          className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg"
                          title="تغییر رمز عبور"
                        >
                          <Key size={16} />
                        </button>
                        {/* فعال/غیرفعال */}
                        <button
                          onClick={() => toggle(c.id)}
                          className={`p-1.5 rounded-lg ${c.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={c.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        >
                          {c.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                          className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg"
                        >
                          {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr key={`${c.id}-detail`} className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">نقش فعلی:</span>
                            <span className="mr-2 font-medium">{ROLE_LABELS[c.role] || c.role}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">امتیاز وفاداری:</span>
                            <span className="mr-2 font-medium">{c.loyaltyPoints || 0}</span>
                          </div>
                          {c.staffSection && (
                            <div>
                              <span className="text-gray-500">بخش:</span>
                              <span className="mr-2 font-medium">{c.staffSection}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">تاریخ عضویت:</span>
                            <span className="mr-2 font-medium">{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">کاربری یافت نشد</div>
        )}
        {loading && (
          <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
        )}
      </div>

      {/* مدال تغییر نقش */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">تغییر سطح دسترسی</h2>
              <button onClick={() => setShowRoleModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-1">کاربر: <strong>{showRoleModal.fullName}</strong></p>
            <p className="text-xs text-gray-400 mb-4">مثل ادمین تلگرام - می‌توانید نقش هر کسی را تغییر دهید</p>

            <div className="space-y-3">
              {[
                { value: 'client', label: 'مشتری', desc: 'دسترسی عادی کاربر' },
                { value: 'staff', label: 'متخصص', desc: 'می‌تواند گالری و رزروهای خود را مدیریت کند' },
                { value: 'admin', label: 'ادمین', desc: 'دسترسی کامل به پنل مدیریت' },
              ].map(r => (
                <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${roleForm.role === r.value ? 'border-pink-400 bg-pink-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={roleForm.role === r.value}
                    onChange={() => setRoleForm({ ...roleForm, role: r.value })}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-sm">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {roleForm.role === 'staff' && (
              <input
                type="text"
                placeholder="بخش تخصصی (مثلاً: مو، ناخن، آرایش)"
                value={roleForm.staffSection}
                onChange={e => setRoleForm({ ...roleForm, staffSection: e.target.value })}
                className="w-full border rounded-xl px-4 py-2.5 mt-3 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleChangeRole}
                disabled={saving}
                className="flex-1 gradient-header text-white py-2 rounded-xl disabled:opacity-50"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
              <button onClick={() => setShowRoleModal(null)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* مدال تغییر رمز عبور */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">تغییر رمز عبور</h2>
              <button onClick={() => setShowPasswordModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">کاربر: <strong>{showPasswordModal.fullName}</strong></p>
            <input
              type="password"
              placeholder="رمز عبور جدید"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleResetPassword}
                disabled={saving || !newPassword}
                className="flex-1 gradient-header text-white py-2 rounded-xl disabled:opacity-50"
              >
                {saving ? 'در حال ذخیره...' : 'تغییر رمز'}
              </button>
              <button onClick={() => setShowPasswordModal(null)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
