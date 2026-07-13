import { useEffect, useState } from 'react'
import { galleryApi, servicesApi } from '../api/client'
import { Plus, Pencil, Trash2, Eye, Heart, Image as ImageIcon } from 'lucide-react'

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    categoryId: '',
    tags: '',
    staffName: '',
    duration: '',
    sortOrder: 0,
    isActive: true,
  })

  const load = async () => {
    setLoading(true)
    try {
      const [g, c] = await Promise.all([galleryApi.getAll(), servicesApi.getCategories()])
      setItems(g.data)
      setCategories(c.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openForm = (item?: any) => {
    setEditItem(item || null)
    if (item) {
      setForm({
        title: item.title || '',
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        thumbnailUrl: item.thumbnailUrl || '',
        categoryId: item.category?.id || '',
        tags: (item.tags || []).join(', '),
        staffName: item.staffName || '',
        duration: item.duration || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== false,
      })
    } else {
      setForm({ title: '', description: '', imageUrl: '', thumbnailUrl: '', categoryId: '', tags: '', staffName: '', duration: '', sortOrder: 0, isActive: true })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      category: form.categoryId ? { id: form.categoryId } : undefined,
    }
    try {
      if (editItem) await galleryApi.update(editItem.id, data)
      else await galleryApi.create(data)
      setShowForm(false)
      load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطایی رخ داد')
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('آیا از حذف این آیتم مطمئن هستید؟')) return
    await galleryApi.remove(id)
    load()
  }

  const inputCls = 'w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">گالری استایل‌ها</h1>
          <p className="text-gray-500 text-sm mt-1">مدل‌های روز برای انتخاب مشتریان</p>
        </div>
        <button
          onClick={() => openForm()}
          className="gradient-header text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} /> افزودن استایل
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-4">
            <h2 className="font-bold text-lg mb-4">{editItem ? 'ویرایش استایل' : 'استایل جدید'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className={inputCls} placeholder="عنوان استایل" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea className={inputCls} placeholder="توضیحات" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              <input className={inputCls} placeholder="لینک تصویر اصلی (URL)" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required />
              <input className={inputCls} placeholder="لینک تصویر کوچک (URL، اختیاری)" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} />
              <select className={inputCls} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">بدون دسته‌بندی</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className={inputCls} placeholder="تگ‌ها (با ویرگول جدا کنید)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="نام متخصص" value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })} />
                <input className={inputCls} placeholder="مدت زمان (مثلاً ۲ ساعت)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <input type="number" className={`${inputCls} w-24`} placeholder="ترتیب" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  فعال
                </label>
              </div>
              {form.imageUrl && (
                <div className="rounded-xl overflow-hidden h-40 bg-gray-100">
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 gradient-header text-white py-2 rounded-xl">ذخیره</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">در حال بارگذاری...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden card-hover ${!item.isActive ? 'opacity-60' : ''}`}>
              <div className="h-48 bg-gray-100 relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={40} />
                  </div>
                )}
                {!item.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">غیرفعال</div>
                )}
                {item.category && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{item.category.name}</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h3>
                {item.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>}
                {item.staffName && <p className="text-xs text-gray-400">متخصص: {item.staffName}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye size={12} />{item.viewsCount}</span>
                  <span className="flex items-center gap-1"><Heart size={12} />{item.likesCount}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openForm(item)} className="flex-1 text-center py-1.5 text-blue-600 bg-blue-50 rounded-lg text-xs hover:bg-blue-100">
                    <Pencil size={12} className="inline ml-1" />ویرایش
                  </button>
                  <button onClick={() => handleRemove(item.id)} className="flex-1 text-center py-1.5 text-red-500 bg-red-50 rounded-lg text-xs hover:bg-red-100">
                    <Trash2 size={12} className="inline ml-1" />حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">هنوز استایلی اضافه نشده</div>
          )}
        </div>
      )}
    </div>
  )
}
