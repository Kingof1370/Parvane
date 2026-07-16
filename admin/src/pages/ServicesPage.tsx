import { useEffect, useState } from 'react'
import { servicesApi } from '../api/client'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', durationMinutes: '', categoryId: '' })

  const load = async () => {
    const [sRes, cRes] = await Promise.all([servicesApi.getAll(), servicesApi.getCategories()])
    setServices(sRes.data)
    setCategories(cRes.data)
  }

  useEffect(() => { load() }, [])

  const openForm = (item?: any) => {
    setEditItem(item || null)
    setForm(item ? { name: item.name, description: item.description || '', price: item.price, durationMinutes: item.durationMinutes, categoryId: item.category?.id || '' } : { name: '', description: '', price: '', durationMinutes: '', categoryId: '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editItem) await servicesApi.update(editItem.id, form)
    else await servicesApi.create(form)
    setShowForm(false)
    load()
  }

  const remove = async (id: string) => {
    if (confirm('حذف این خدمت؟')) { await servicesApi.remove(id); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت خدمات</h1>
        <button onClick={() => openForm()} className="gradient-header text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90">
          <Plus size={18} /> خدمت جدید
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">{editItem ? 'ویرایش خدمت' : 'خدمت جدید'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="input" placeholder="نام خدمت" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <textarea className="input" placeholder="توضیحات" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              <input className="input" type="number" placeholder="قیمت (تومان)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              <input className="input" type="number" placeholder="مدت (دقیقه)" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} required />
              <select className="input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 gradient-header text-white py-2 rounded-xl">ذخیره</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-xl">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm card-hover">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800">{s.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openForm(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => remove(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            {s.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>}
            <div className="flex gap-3 text-sm">
              <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-lg">{Number(s.price).toLocaleString()} تومان</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{s.durationMinutes} دقیقه</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`.input { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 14px; outline: none; } .input:focus { ring: 2px solid #f9a8d4; }`}</style>
    </div>
  )
}
