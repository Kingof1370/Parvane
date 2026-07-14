import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { settingsApi } from '../api/client'
import { Save } from 'lucide-react'
import { useEffect } from 'react'

const defaultSettings = {
  salon_name: 'سالن زیبایی پروانه',
  salon_phone: '',
  salon_address: '',
  working_hours_start: '09:00',
  working_hours_end: '21:00',
  booking_advance_days: '30',
  cancellation_hours_limit: '24',
  appointment_buffer_minutes: '15',
  sms_reminder_hours: '24',
}

export default function SettingsPage() {
  const queryClient = useQueryClient()

  // Fetch settings via React Query
  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsApi.getAll()
      return res.data
    }
  })

  // Set up react-hook-form
  const { register, handleSubmit, reset } = useForm({
    defaultValues: defaultSettings
  })

  // Reset form when server settings are loaded
  useEffect(() => {
    if (serverSettings) {
      reset({ ...defaultSettings, ...serverSettings })
    }
  }, [serverSettings, reset])

  // Mutation to save settings via React Query
  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  const onSubmit = (data: any) => {
    saveMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#FFF5F5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F8A4B8]"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">تنظیمات سالن زیبایی</h1>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#F8A4B8] text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-md shadow-[#F8A4B8]/20 hover:bg-[#e08fa3] active:scale-95 hover:scale-[1.05] transition-all duration-300 disabled:opacity-50"
        >
          <Save size={18} />
          {saveMutation.isSuccess ? 'ذخیره شد ✓' : saveMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md shadow-[#F8A4B8]/5 border border-[#F8A4B8]/10 space-y-4">
        <h2 className="font-extrabold text-gray-700 text-lg border-b border-[#FFF5F5] pb-2">اطلاعات کلی سالن</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">نام سالن</label>
          <input
            type="text"
            {...register('salon_name')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">شماره تماس</label>
          <input
            type="text"
            {...register('salon_phone')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-left"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">آدرس سالن</label>
          <input
            type="text"
            {...register('salon_address')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md shadow-[#F8A4B8]/5 border border-[#F8A4B8]/10 space-y-4">
        <h2 className="font-extrabold text-gray-700 text-lg border-b border-[#FFF5F5] pb-2">ساعات کاری سالن</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">شروع کار</label>
            <input
              type="time"
              {...register('working_hours_start')}
              className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">پایان کار</label>
            <input
              type="time"
              {...register('working_hours_end')}
              className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-center"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md shadow-[#F8A4B8]/5 border border-[#F8A4B8]/10 space-y-4">
        <h2 className="font-extrabold text-gray-700 text-lg border-b border-[#FFF5F5] pb-2">تنظیمات نوبت‌دهی و رزرو</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">حداکثر روزهای آینده برای رزرو</label>
          <input
            type="number"
            {...register('booking_advance_days')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">حداقل ساعت قبل برای لغو رزرو</label>
          <input
            type="number"
            {...register('cancellation_hours_limit')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">فاصله بین رزروها (دقیقه)</label>
          <input
            type="number"
            {...register('appointment_buffer_minutes')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">ارسال یادآور قبل از نوبت (ساعت)</label>
          <input
            type="number"
            {...register('sms_reminder_hours')}
            className="w-full border-2 border-[#F8A4B8]/10 focus:border-[#F8A4B8] rounded-xl px-4 py-2.5 focus:outline-none transition-all duration-300 bg-[#FFF5F5]/20 focus:bg-white text-center"
          />
        </div>
      </div>
    </form>
  )
}
