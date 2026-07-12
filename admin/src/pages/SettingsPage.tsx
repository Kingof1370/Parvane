import { useEffect, useState } from 'react'
import { settingsApi } from '../api/client'
import { Save } from 'lucide-react'

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
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    settingsApi.getAll().then(res => setSettings({ ...defaultSettings, ...res.data })).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await settingsApi.update(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {} finally { setLoading(false) }
  }

  const Field = ({ label, settingKey, type = 'text' }: { label: string; settingKey: string; type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={settings[settingKey] || ''}
        onChange={e => setSettings({ ...settings, [settingKey]: e.target.value })}
        className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
      />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">تنظیمات سالن</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="gradient-header text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Save size={18} />
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 text-lg border-b pb-2">اطلاعات سالن</h2>
        <Field label="نام سالن" settingKey="salon_name" />
        <Field label="شماره تماس" settingKey="salon_phone" />
        <Field label="آدرس" settingKey="salon_address" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 text-lg border-b pb-2">ساعات کاری</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="شروع کار" settingKey="working_hours_start" type="time" />
          <Field label="پایان کار" settingKey="working_hours_end" type="time" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 text-lg border-b pb-2">تنظیمات رزرو</h2>
        <Field label="حداکثر روزهای آینده برای رزرو" settingKey="booking_advance_days" type="number" />
        <Field label="حداقل ساعت برای لغو رزرو" settingKey="cancellation_hours_limit" type="number" />
        <Field label="فاصله بین رزروها (دقیقه)" settingKey="appointment_buffer_minutes" type="number" />
        <Field label="ارسال یادآور قبل از نوبت (ساعت)" settingKey="sms_reminder_hours" type="number" />
      </div>
    </div>
  )
}
