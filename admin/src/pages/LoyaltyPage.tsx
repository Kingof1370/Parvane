import { useEffect, useState } from 'react'
import { loyaltyApi } from '../api/client'
import { Star, Plus, Minus, TrendingUp, Award } from 'lucide-react'

export default function LoyaltyPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustForm, setAdjustForm] = useState({ points: 0, description: '' })
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const res = await loyaltyApi.getAllUsers(); setUsers(res.data) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const loadTransactions = async (userId: string) => {
    setTxLoading(true)
    try { const res = await loyaltyApi.getUserTransactions(userId); setTransactions(res.data) }
    catch {} finally { setTxLoading(false) }
  }

  const handleSelectUser = (user: any) => {
    setSelected(user)
    loadTransactions(user.id)
  }

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    try {
      await loyaltyApi.adminAdjust(selected.id, adjustForm.points, adjustForm.description)
      setShowAdjust(false)
      load()
      loadTransactions(selected.id)
      setAdjustForm({ points: 0, description: '' })
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطایی رخ داد')
    }
  }

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      earned_appointment: '🏆 رزرو انجام‌شده',
      earned_review: '⭐ ثبت نظر',
      earned_referral: '👥 معرفی دوست',
      redeemed_discount: '🎁 استفاده از تخفیف',
      redeemed_free_service: '🎀 سرویس رایگان',
      admin_adjustment: '🔧 تعدیل ادمین',
      expired: '⏰ انقضا',
    }
    return map[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سیستم امتیاز وفاداری</h1>
          <p className="text-gray-500 text-sm mt-1">مدیریت امتیازات و جوایز مشتریان وفادار</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* لیست مشتریان */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b gradient-header">
            <h2 className="font-bold text-white">رتبه‌بندی مشتریان</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              {users.map((u: any, i: number) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b hover:bg-pink-50 transition-colors ${selected?.id === u.id ? 'bg-pink-50 border-r-4 border-r-pink-500' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full gradient-header flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">{u.fullName}</div>
                    <div className="text-xs text-gray-500">{u.phone}</div>
                  </div>
                  <div className="flex items-center gap-1 text-pink-600 font-bold text-sm">
                    <Star size={14} fill="currentColor" />
                    {u.loyaltyPoints}
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="p-8 text-center text-gray-400">مشتری‌ای وجود ندارد</div>}
            </div>
          )}
        </div>

        {/* جزئیات مشتری انتخاب‌شده */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{selected.fullName}</h3>
                    <p className="text-gray-500 text-sm">{selected.phone}</p>
                  </div>
                  <button
                    onClick={() => setShowAdjust(true)}
                    className="gradient-header text-white px-4 py-2 rounded-xl text-sm"
                  >
                    تعدیل امتیاز
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-pink-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-pink-600">{selected.loyaltyPoints}</div>
                    <div className="text-xs text-gray-500 mt-1">موجودی</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selected.totalLoyaltyEarned}</div>
                    <div className="text-xs text-gray-500 mt-1">کل کسب‌شده</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selected.totalLoyaltyRedeemed}</div>
                    <div className="text-xs text-gray-500 mt-1">کل استفاده‌شده</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-700 mb-4">تاریخچه تراکنش‌ها</h3>
                {txLoading ? (
                  <div className="text-center py-8 text-gray-400">در حال بارگذاری...</div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-gray-700">{typeLabel(tx.type)}</div>
                          {tx.description && <div className="text-xs text-gray-500">{tx.description}</div>}
                          <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</div>
                        </div>
                        <div className={`font-bold text-sm ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && <div className="text-center py-4 text-gray-400">تراکنشی ثبت نشده</div>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-400">
              <Award size={48} className="mx-auto mb-4 text-gray-300" />
              <p>یک مشتری انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>

      {showAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">تعدیل امتیاز — {selected?.fullName}</h2>
            <form onSubmit={handleAdjust} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">تعداد امتیاز (منفی برای کسر)</label>
                <input
                  type="number"
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300"
                  value={adjustForm.points}
                  onChange={e => setAdjustForm({ ...adjustForm, points: Number(e.target.value) })}
                  required
                />
              </div>
              <textarea
                className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="توضیح (اجباری)"
                value={adjustForm.description}
                onChange={e => setAdjustForm({ ...adjustForm, description: e.target.value })}
                rows={3}
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 gradient-header text-white py-2 rounded-xl">اعمال</button>
                <button type="button" onClick={() => setShowAdjust(false)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
