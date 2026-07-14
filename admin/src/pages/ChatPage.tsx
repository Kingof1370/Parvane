import { useEffect, useState } from 'react'
import { chatApi, staffApi } from '../api/client'
import { MessageCircle, User, Send, X, UserCheck } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = { open: 'باز', closed: 'بسته', pending: 'در انتظار' }
const STATUS_COLOR: Record<string, string> = { open: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500', pending: 'bg-yellow-100 text-yellow-700' }

export default function ChatPage() {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isStaff = user?.role === 'staff'

  const [rooms, setRooms] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [r, s] = await Promise.all([
        isStaff ? chatApi.getStaffRooms() : chatApi.getAllRooms(),
        isStaff ? Promise.resolve({ data: [] }) : staffApi.getAll()
      ])
      setRooms(r.data)
      setStaff(s.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const loadMessages = async (room: any) => {
    setSelected(room)
    setMsgLoading(true)
    try {
      const res = await chatApi.getRoomMessages(room.id)
      setMessages(res.data.messages || [])
    } catch {} finally { setMsgLoading(false) }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMsg.trim() || !selected) return
    try {
      await chatApi.sendMessage(selected.id, newMsg.trim())
      setNewMsg('')
      loadMessages(selected)
    } catch {}
  }

  const handleAssign = async () => {
    if (!selected || !selectedStaffId) return
    try {
      await chatApi.assignStaff(selected.id, selectedStaffId)
      setShowAssign(false)
      load()
      loadMessages(selected)
    } catch {}
  }

  const handleClose = async (roomId: string) => {
    if (!confirm('آیا می‌خواهید این گفتگو را ببندید؟')) return
    await chatApi.closeRoom(roomId)
    load()
    if (selected?.id === roomId) setSelected(null)
  }

  const senderLabel = (senderType: string) => {
    if (senderType === 'client') return 'مشتری'
    if (senderType === 'staff') return 'متخصص'
    return 'سیستم'
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">مشاوره آنلاین</h1>
        <p className="text-gray-500 text-sm mt-1">مدیریت گفتگوهای مشتریان با متخصصان</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[75vh]">
        {/* لیست اتاق‌ها */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b gradient-header">
            <h2 className="font-bold text-white text-sm">گفتگوها ({rooms.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
            ) : (
              rooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => loadMessages(room)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b hover:bg-pink-50 transition-colors ${selected?.id === room.id ? 'bg-pink-50 border-r-4 border-r-pink-500' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full gradient-header flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    {room.client?.fullName?.[0] || '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-sm text-gray-800 truncate">{room.client?.fullName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[room.status] || 'bg-gray-100'}`}>
                        {STATUS_LABEL[room.status] || room.status}
                      </span>
                    </div>
                    {room.subject && <div className="text-xs text-gray-500 truncate">{room.subject}</div>}
                    {room.staff && <div className="text-xs text-pink-500">متخصص: {room.staff.fullName}</div>}
                    {(room.unreadStaffCount > 0) && (
                      <span className="inline-block bg-red-500 text-white text-xs rounded-full px-2 py-0.5 mt-0.5">{room.unreadStaffCount} پیام جدید</span>
                    )}
                  </div>
                </div>
              ))
            )}
            {!loading && rooms.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                <p>گفتگویی وجود ندارد</p>
              </div>
            )}
          </div>
        </div>

        {/* پنجره پیام‌ها */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
                <div>
                  <div className="font-bold text-gray-800">{selected.client?.fullName}</div>
                  <div className="text-xs text-gray-500">
                    {selected.subject && <span>{selected.subject} — </span>}
                    {selected.staff ? <span className="text-pink-500">متخصص: {selected.staff.fullName}</span> : <span className="text-orange-500">در انتظار اختصاص متخصص</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status !== 'closed' && (
                    <>
                      {!isStaff && (
                        <button
                          onClick={() => setShowAssign(true)}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                        >
                          <UserCheck size={13} />اختصاص متخصص
                        </button>
                      )}
                      <button
                        onClick={() => handleClose(selected.id)}
                        className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1"
                      >
                        <X size={13} />بستن
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {msgLoading ? (
                  <div className="text-center py-8 text-gray-400">در حال بارگذاری پیام‌ها...</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'client' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.senderType === 'client' ? 'bg-gray-100 rounded-tl-sm' : 'gradient-header text-white rounded-tr-sm'}`}>
                        <div className="text-xs opacity-60 mb-1">{senderLabel(msg.senderType)}</div>
                        <div className="text-sm">{msg.content}</div>
                        <div className="text-xs opacity-50 mt-1 text-left">{new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))
                )}
                {!msgLoading && messages.length === 0 && (
                  <div className="text-center py-8 text-gray-400">هنوز پیامی نیست</div>
                )}
              </div>

              {selected.status !== 'closed' && (
                <form onSubmit={handleSend} className="px-4 py-3 border-t flex gap-3">
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="پیام بنویسید..."
                    className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  />
                  <button type="submit" disabled={!newMsg.trim()} className="gradient-header text-white px-4 py-2 rounded-xl disabled:opacity-50">
                    <Send size={18} />
                  </button>
                </form>
              )}
              {selected.status === 'closed' && (
                <div className="px-4 py-3 border-t text-center text-sm text-gray-400 bg-gray-50">این گفتگو بسته شده است</div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 text-gray-200" />
                <p>یک گفتگو انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">اختصاص متخصص</h2>
            <select
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-300 mb-4"
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
            >
              <option value="">انتخاب متخصص</option>
              {staff.map((s: any) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssign} disabled={!selectedStaffId} className="flex-1 gradient-header text-white py-2 rounded-xl disabled:opacity-50">اختصاص</button>
              <button onClick={() => setShowAssign(false)} className="flex-1 border py-2 rounded-xl text-gray-600">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
