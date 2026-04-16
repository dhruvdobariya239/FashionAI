import { useEffect, useMemo, useState } from 'react'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { Label } from '../components/Label.jsx'

export function EmailsPage() {
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])

  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    subject: '',
    message: '',
    productName: '',
    productUrl: '',
    allUsers: true,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/api/admin/users')
        if (!cancelled) setUsers(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        if (!cancelled) setError(normalizeApiError(e).message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [api])

  async function sendPromo(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userIds = form.allUsers
        ? []
        : Object.entries(selected).filter(([, v]) => Boolean(v)).map(([id]) => id)
      const res = await api.post('/api/admin/emails/promo', {
        subject: form.subject,
        message: form.message,
        productName: form.productName || undefined,
        productUrl: form.productUrl || undefined,
        userIds,
      })
      window.alert(`Email sent to ${res.data?.recipients || 0} users`)
      setForm({ subject: '', message: '', productName: '', productUrl: '', allUsers: true })
      setSelected({})
    } catch (e) {
      setError(normalizeApiError(e).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Customer Engagement</p>
        <h2 className="mt-2 text-4xl font-bold text-white">Send Promotional Email</h2>
      </div>

      {error ? <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <form onSubmit={sendPromo} className="space-y-5 xl:col-span-2 rounded-2xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-2">
            <Label className="text-[#D4A574] font-bold">Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} placeholder="Email subject line..." required />
          </div>
          <div className="space-y-2">
            <Label className="text-[#D4A574] font-bold">Message</Label>
            <textarea
              className="min-h-32 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-4 py-3 text-sm text-white shadow-md outline-none placeholder:text-[#8a8a8a] focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300 resize-none"
              value={form.message}
              onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
              placeholder="Your promotional message..."
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Product Name (optional)</Label>
              <Input value={form.productName} onChange={(e) => setForm((s) => ({ ...s, productName: e.target.value }))} placeholder="Featured product name..." />
            </div>
            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Product/Shop URL (optional)</Label>
              <Input value={form.productUrl} onChange={(e) => setForm((s) => ({ ...s, productUrl: e.target.value }))} placeholder="https://your-store.com/products/abc" />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border-2 border-[#D4A574]/30 bg-[#1a1a1a]/60 px-4 py-3 text-sm font-semibold text-[#D4D4D4] cursor-pointer hover:bg-[#1a1a1a]/80 transition-colors">
            <input
              type="checkbox"
              checked={form.allUsers}
              onChange={(e) => setForm((s) => ({ ...s, allUsers: e.target.checked }))}
              className="w-4 h-4 cursor-pointer"
            />
            Send to all users
          </label>

          <Button type="submit" disabled={loading} className="w-full h-11 font-bold">
            {loading ? 'Sending…' : 'Send Promotional Email'}
          </Button>
        </form>

        <div className="rounded-2xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 p-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-2 text-sm font-bold text-white tracking-wide uppercase">User Recipients</div>
          <div className="mb-4 text-xs text-[#D4A574]/70 font-semibold">
            {form.allUsers ? '✓ All users selected' : 'Select users manually'}
          </div>
          <div className="max-h-96 space-y-2 overflow-auto pr-2">
            {users.map((u) => (
              <label key={u._id} className="flex items-center gap-3 rounded-xl border-2 border-[#D4A574]/20 hover:border-[#D4A574]/40 bg-[#1a1a1a]/60 px-3 py-2 text-sm cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  disabled={form.allUsers}
                  checked={Boolean(selected[u._id])}
                  onChange={(e) => setSelected((s) => ({ ...s, [u._id]: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="min-w-0">
                  <span className="block truncate font-bold text-white">{u.name}</span>
                  <span className="block truncate text-xs text-[#D4D4D4]/70">{u.email}</span>
                </span>
              </label>
            ))}
            {users.length === 0 ? <div className="text-sm text-[#D4D4D4]/60 font-semibold p-4 text-center">No users found.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

