import { useEffect, useState } from 'react'
import { authApi } from '../api/client'
import { User, Phone, Mail, Image, Save, Check } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatar: '',
  })

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authApi.getProfile()
      setForm({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        avatar: res.data.avatar || '',
      })
    } catch (err: any) {
      setError('خطا در دریافت اطلاعات پروفایل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await authApi.updateProfile(form)
      // Update local storage user details as well
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        const updatedUser = { ...user, fullName: res.data.fullName, phone: res.data.phone, avatar: res.data.avatar }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      setMessage('پروفایل شما با موفقیت به‌روزرسانی شد.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ذخیره‌سازی اطلاعات')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm"

  if (loading) {
    return <div className="text-center py-12 text-gray-400">در حال بارگذاری اطلاعات پروفایل...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">ویرایش پروفایل</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.avatar && (
            <div className="flex flex-col items-center gap-3 mb-6">
              <img
                src={form.avatar}
                alt={form.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-pink-100 shadow-md"
              />
              <span className="text-xs text-gray-400">پیش‌نمایش آواتار فعلی</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">نام و نام خانوادگی</label>
              <div className="relative">
                <span className="absolute right-3.5 top-3 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className={inputCls}
                  placeholder="نام کامل خود را وارد کنید"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">شماره موبایل</label>
              <div className="relative">
                <span className="absolute right-3.5 top-3 text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                  placeholder="09123456789"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">پست الکترونیکی (ایمیل)</label>
              <div className="relative">
                <span className="absolute right-3.5 top-3 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">آدرس تصویر آواتار (URL)</label>
              <div className="relative">
                <span className="absolute right-3.5 top-3 text-gray-400">
                  <Image size={18} />
                </span>
                <input
                  type="url"
                  value={form.avatar}
                  onChange={e => setForm({ ...form, avatar: e.target.value })}
                  className={inputCls}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <Check size={18} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 gradient-header text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات'}
            </button>
            <button
              type="button"
              onClick={loadProfile}
              className="px-6 border border-gray-300 rounded-xl text-gray-600 text-sm hover:bg-gray-50"
            >
              بازنشانی
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
