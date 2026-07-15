import { useEffect, useState } from 'react'
import { staffApi, clientsApi } from '../api/client'
import { Plus, Pencil, Trash2, Star, Image, Shield, Link, ChevronDown, ChevronUp, X } from 'lucide-react'

const ALL_PERMISSIONS = [
  { value: 'manage_own_portfolio', label: 'مدیریت پورتفولیو شخصی' },
  { value: 'respond_to_chat', label: 'پاسخ به مشاوره آنلاین' },
  { value: 'view_own_appointments', label: 'مشاهده رزروهای خود' },
  { value: 'manage_own_availability', label: 'مدیریت ساعات کاری' },
]

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({
    fullName: '', phone: '', bio: '', experienceYears: 0,
    instagramUrl: '', certificationsText: '', section: '',
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [portfolioData, setPortfolioData] = useState<Record<string, any[]>>({})
  const [showPortfolioForm, setShowPortfolioForm] = useState<string | null>(null)
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', imageUrl: '', beforeImageUrl: '', serviceCategory: '', type: 'work_sample' })
  const [showPermissions, setShowPermissions] = useState<string | null>(null)
  const [showLinkUser, setShowLinkUser] = useState<string | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [permissionsMap, setPermissionsMap] = useState<Record<string, string[]>>({})
  const [sectionFilter, setSectionFilter] = useState('All')

  const load = async () => {
    const res = await staffApi.getAll()
    setStaff(res.data)
  }

  useEffect(() => { load() }, [])

  const uniqueSections = ['All', ...Array.from(new Set(staff.map((s: any) => s.section).filter(Boolean)))]

  const filteredStaff = staff.filter((s: any) => {
    if (sectionFilter === 'All') return true
    return s.section && s.section.toLowerCase() === sectionFilter.toLowerCase()
  })

  const openForm = (item?: any) => {
    setEditItem(item || null)
    setForm(item ? {
      fullName: item.fullName || '', phone: item.phone || '', bio: item.bio || '',
      experienceYears: item.experienceYears || 0, instagramUrl: item.instagramUrl || '',
      certificationsText: item.certificationsText || '', section: item.section || '',
    } : { fullName: '', phone: '', bio: '', experienceYears: 0, instagramUrl: '', certificationsText: '', section: '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editItem) await staffApi.update(editItem.id, form)
      else await staffApi.create(form)
      setShowForm(false); load()
    } catch (err: any) { alert(err.response?.data?.message || 'خطایی رخ داد') }
  }

  const loadPortfolio = async (staffId: string) => {
    const res = await staffApi.getPortfolioAdmin(staffId)
    setPortfolioData(prev => ({ ...prev, [staffId]: res.data }))
  }

  const toggleExpand = (staffId: string) => {
    if (expandedId === staffId) { setExpandedId(null); return }
    setExpandedId(staffId)
    loadPortfolio(staffId)
  }

  const handleAddPortfolio = async (staffId: string, e: React.FormEvent) => {
    e.preventDefault()
    try {
      await staffApi.addPortfolioItem(staffId, portfolioForm)
      setShowPortfolioForm(null)
      setPortfolioForm({ title: '', description: '', imageUrl: '', beforeImageUrl: '', serviceCategory: '', type: 'work_sample' })
      loadPortfolio(staffId)
    } catch (err: any) { alert(err.response?.data?.message || 'خطایی رخ داد') }
  }

  const handleRemovePortfolio = async (staffId: string, itemId: string) => {
    if (!confirm('حذف این نمونه‌کار؟')) return
    await staffApi.removePortfolioItem(itemId)
    loadPortfolio(staffId)
  }

  const loadClients = async () => {
    const res = await clientsApi.getAll()
    setClients(res.data)
  }

  const handleLinkUser = async (staffId: string) => {
    try {
      await staffApi.linkUserAccount(staffId, selectedUserId)
      setShowLinkUser(null); setSelectedUserId(''); load()
    } catch (err: any) { alert(err.response?.data?.message || 'خطایی رخ داد') }
  }

  const handleSavePermissions = async (staffId: string) => {
    try {
      await staffApi.updatePermissions(staffId, permissionsMap[staffId] || [])
      setShowPermissions(null); load()
    } catch (err: any) { alert(err.response?.data?.message || 'خطایی رخ داد') }
  }

  const togglePermission = (staffId: string, perm: string) => {
    const current = permissionsMap[staffId] || []
    const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm]
    setPermissionsMap(prev => ({ ...prev, [staffId]: updated }))
  }

  const inputCls = 'w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت متخصصان</h1>
        <button onClick={() => openForm()} className="gradient-header text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90">
          <Plus size={18} /> متخصص جدید
        </button>
      </div>

      {/* فرم افزودن/ویرایش متخصص */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-4">
            <h2 className="font-bold text-lg mb-4">{editItem ? 'ویرایش متخصص' : 'متخصص جدید'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="نام کامل" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                <input className={inputCls} placeholder="شماره موبایل" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} type="number" placeholder="سال‌های تجربه" value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: Number(e.target.value) })} />
                <input className={inputCls} placeholder="بخش (مثلاً مو، ناخن)" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
              </div>
              <textarea className={inputCls} placeholder="بیوگرافی" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
              <input className={inputCls} placeholder="لینک اینستاگرام" value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })} />
              <textarea className={inputCls} placeholder="مدارک و گواهینامه‌ها" value={form.certificationsText} onChange={e => setForm({ ...form, certificationsText: e.target.value })} rows={2} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 gradient-header text-white py-2 rounded-xl">ذخیره</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* دکمه‌های فیلتر تخصص */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {uniqueSections.map((sec: any) => (
          <button
            key={sec}
            onClick={() => setSectionFilter(sec)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              sectionFilter === sec
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {sec === 'All' ? 'همه بخش‌ها' : sec}
          </button>
        ))}
      </div>

      {/* لیست متخصصان */}
      <div className="space-y-4">
        {filteredStaff.map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-header flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {s.fullName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{s.fullName}</h3>
                  <p className="text-sm text-gray-500">{s.phone}{s.section ? ` — بخش ${s.section}` : ''}</p>
                  {s.experienceYears > 0 && <p className="text-xs text-gray-400">{s.experienceYears} سال تجربه</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={13} fill="currentColor" className="text-yellow-500" />
                    <span className="text-sm text-yellow-600 font-medium">{s.rating}</span>
                    <span className="text-xs text-gray-400">({s.totalReviews} نظر)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button onClick={() => { openForm(s) }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                <button
                  onClick={() => {
                    setShowPermissions(s.id)
                    setPermissionsMap(prev => ({ ...prev, [s.id]: s.permissions || [] }))
                  }}
                  className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg" title="مدیریت دسترسی"
                >
                  <Shield size={16} />
                </button>
                <button
                  onClick={() => { setShowLinkUser(s.id); loadClients() }}
                  className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg" title="لینک به حساب کاربری"
                >
                  <Link size={16} />
                </button>
                <button
                  onClick={() => toggleExpand(s.id)}
                  className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg" title="پورتفولیو"
                >
                  <Image size={16} />
                </button>
                <button onClick={() => toggleExpand(s.id)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                  {expandedId === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {s.bio && (
              <div className="px-5 pb-3 text-sm text-gray-500 border-t">{s.bio}</div>
            )}

            {/* پورتفولیو */}
            {expandedId === s.id && (
              <div className="border-t p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-700">نمونه‌کارها</h4>
                  <button onClick={() => setShowPortfolioForm(s.id)} className="text-sm gradient-header text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus size={14} /> افزودن نمونه‌کار
                  </button>
                </div>

                {showPortfolioForm === s.id && (
                  <form onSubmit={e => handleAddPortfolio(s.id, e)} className="bg-white p-4 rounded-xl mb-4 space-y-3">
                    <input className={inputCls} placeholder="عنوان" value={portfolioForm.title} onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })} required />
                    <textarea className={inputCls} placeholder="توضیحات" value={portfolioForm.description} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })} rows={2} />
                    <input className={inputCls} placeholder="لینک تصویر (بعد از کار)" value={portfolioForm.imageUrl} onChange={e => setPortfolioForm({ ...portfolioForm, imageUrl: e.target.value })} required />
                    <input className={inputCls} placeholder="لینک تصویر قبل از کار (اختیاری)" value={portfolioForm.beforeImageUrl} onChange={e => setPortfolioForm({ ...portfolioForm, beforeImageUrl: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <select className={inputCls} value={portfolioForm.type} onChange={e => setPortfolioForm({ ...portfolioForm, type: e.target.value })}>
                        <option value="work_sample">نمونه‌کار</option>
                        <option value="before_after">قبل/بعد</option>
                        <option value="certificate">گواهینامه</option>
                        <option value="video">ویدئو</option>
                      </select>
                      <input className={inputCls} placeholder="دسته‌بندی سرویس" value={portfolioForm.serviceCategory} onChange={e => setPortfolioForm({ ...portfolioForm, serviceCategory: e.target.value })} />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="gradient-header text-white px-4 py-2 rounded-xl text-sm">ذخیره</button>
                      <button type="button" onClick={() => setShowPortfolioForm(null)} className="border px-4 py-2 rounded-xl text-sm text-gray-600">انصراف</button>
                    </div>
                  </form>
                )}

                <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(portfolioData[s.id] || []).map((item: any) => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="h-32 bg-gray-100">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-700 truncate">{item.title}</div>
                        <div className="text-xs text-gray-400">{item.type === 'before_after' ? 'قبل/بعد' : item.type === 'certificate' ? 'گواهینامه' : 'نمونه‌کار'}</div>
                        <button onClick={() => handleRemovePortfolio(s.id, item.id)} className="text-xs text-red-500 mt-1 hover:underline">حذف</button>
                      </div>
                    </div>
                  ))}
                  {(portfolioData[s.id] || []).length === 0 && (
                    <div className="col-span-full text-center py-4 text-gray-400 text-sm">نمونه‌کاری ثبت نشده</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">متخصصی در این بخش ثبت نشده است</div>
        )}
      </div>

      {/* مدیریت دسترسی */}
      {showPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">سطح دسترسی متخصص</h2>
              <button onClick={() => setShowPermissions(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">انتخاب کنید متخصص در پنل خود چه کارهایی می‌تواند انجام دهد:</p>
            <div className="space-y-3">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-pink-500 rounded"
                    checked={(permissionsMap[showPermissions] || []).includes(perm.value)}
                    onChange={() => togglePermission(showPermissions, perm.value)}
                  />
                  <span className="text-sm text-gray-700">{perm.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleSavePermissions(showPermissions)} className="flex-1 gradient-header text-white py-2 rounded-xl">ذخیره</button>
              <button onClick={() => setShowPermissions(null)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* لینک کردن حساب کاربری */}
      {showLinkUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">لینک حساب کاربری</h2>
              <button onClick={() => setShowLinkUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">انتخاب کاربر برای لینک شدن به این متخصص (کاربر باید قبلاً ثبت‌نام کرده باشد):</p>
            <select
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 mb-4"
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
            >
              <option value="">انتخاب کاربر</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.fullName} — {c.phone}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => handleLinkUser(showLinkUser)} disabled={!selectedUserId} className="flex-1 gradient-header text-white py-2 rounded-xl disabled:opacity-50">لینک کن</button>
              <button onClick={() => setShowLinkUser(null)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
