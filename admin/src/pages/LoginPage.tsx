import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    }
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      const res = await authApi.adminLogin(data.identifier, data.password)
      await login(res.data.accessToken)
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      setError('مشخصات ورود اشتباه است یا شما دسترسی مدیریت ندارید')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F5] font-sans">
      <div className="flex bg-white rounded-[32px] shadow-xl overflow-hidden max-w-4xl w-full mx-4 min-h-[500px]">
        {/* Right side: Form (Farsi layout: text-right, etc.) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-right" dir="rtl">
          <div className="text-center md:text-right mb-8">
            <div className="text-4xl mb-3 text-[#F8A4B8] animate-pulse">✿</div>
            <h1 className="text-2xl font-extrabold text-gray-800">سالن زیبایی پروانه</h1>
            <p className="text-gray-400 mt-1 text-sm font-light">ورود به پنل مدیریت سالن</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">شماره موبایل یا ایمیل</label>
              <input
                type="text"
                {...register('identifier', { required: true })}
                className="w-full border-2 border-[#F8A4B8]/20 focus:border-[#F8A4B8] rounded-2xl px-4 py-3 focus:outline-none transition-all duration-300 text-right bg-[#FFF5F5]/30 focus:bg-white"
                placeholder="مثلا 09019667604"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">رمز عبور</label>
              <input
                type="password"
                {...register('password', { required: true })}
                className="w-full border-2 border-[#F8A4B8]/20 focus:border-[#F8A4B8] rounded-2xl px-4 py-3 focus:outline-none transition-all duration-300 text-right bg-[#FFF5F5]/30 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F8A4B8] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-[#F8A4B8]/20 hover:bg-[#e08fa3] active:scale-95 hover:scale-[1.05] disabled:opacity-50 transition-all duration-300 border-b-4 border-[#d18496]"
            >
              {loading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
            </button>
          </form>
        </div>

        {/* Left side: Beautiful image (Unsplash beautiful makeup model) */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
            alt="Beautiful Model"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8A4B8]/70 via-transparent to-black/20 flex flex-col justify-end p-10 text-white text-right" dir="rtl">
            <h2 className="text-3xl font-black mb-2" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.4)' }}>پروانه اکبرپور</h2>
            <p className="text-sm font-light opacity-90 leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>ارائه‌دهنده تخصصی‌ترین خدمات آرایشی، کاشت ناخن، و رنگ و لایت با کادر مجرب</p>
          </div>
        </div>
      </div>
    </div>
  )
}
