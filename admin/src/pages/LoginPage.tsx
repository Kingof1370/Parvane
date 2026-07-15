import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.adminLogin(form.identifier, form.password)
      localStorage.setItem('token', res.data.accessToken)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      if (res.data.user?.role === 'staff') {
        navigate('/gallery')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('مشخصات ورود اشتباه است')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C2185B, #E91E8C, #FF4081)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✿</div>
          <h1 className="text-2xl font-bold text-gray-800">سالن زیبایی پروانه</h1>
          <p className="text-gray-500 mt-1">ورود به پنل مدیریت</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل یا ایمیل</label>
            <input
              type="text"
              value={form.identifier}
              onChange={e => setForm({ ...form, identifier: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              placeholder="09123456789"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-header text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>
      </div>
    </div>
  )
}
