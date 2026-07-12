import { useEffect, useState } from 'react'
import { staffApi } from '../api/client'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ fullName: '', phone: '', bio: '' })

  const load = async () => { const res = await staffApi.getAll(); setStaff(res.data) }
  useEffect(() => { load() }, [])

  const openForm = (item?: any) => {
    setEditItem(item || null)
    setForm(item ? { fullName: item.fullName, phone: item.phone, bio: item.bio || '' } : { fullName: '', phone: '', bio: '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editItem) await staffApi.update(editItem.id, form)
    else await staffApi.create(form)
    setShowForm(false); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت متخصصان</h1>
        <button onClick={() => openForm()} className="gradient-header text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90">
          <Plus size={18} /> متخصص جدید
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{editItem ? 'ویرایش متخصص' : 'متخصص جدید'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300" placeholder="نام کامل" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              <input className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300" placeholder="شماره موبایل" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              <textarea className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300" placeholder="بیوگرافی" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 gradient-header text-white py-2 rounded-xl">ذخیره</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-xl">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm card-hover">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-header flex items-center justify-center text-white text-lg font-bold">
                  {s.fullName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{s.fullName}</h3>
                  <p className="text-sm text-gray-500">{s.phone}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openForm(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              </div>
            </div>
            {s.bio && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.bio}</p>}
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <Star size={14} fill="currentColor" />
              <span>{s.rating} ({s.totalReviews} نظر)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
