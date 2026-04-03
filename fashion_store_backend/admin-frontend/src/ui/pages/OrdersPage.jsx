import { useCallback, useEffect, useMemo, useState } from 'react'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'

function money(v) {
  return `₹${Number(v || 0).toFixed(0)}`
}

export function OrdersPage() {
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])

  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const loadOrders = useCallback(async (nextPage = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/admin/orders', {
        params: { page: nextPage, limit: 15, search: search || undefined, status: status || undefined },
      })
      setOrders(res.data?.orders || [])
      setPage(res.data?.page || nextPage)
      setPages(res.data?.pages || 1)
    } catch (e) {
      setError(normalizeApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [api, page, search, status])

  useEffect(() => {
    loadOrders(1)
  }, [loadOrders])

  async function openOrder(id) {
    try {
      const res = await api.get(`/api/admin/orders/${id}`)
      setSelectedOrder(res.data)
    } catch (e) {
      setError(normalizeApiError(e).message)
    }
  }

  async function updateStatus(field, value) {
    if (!selectedOrder?._id) return
    try {
      const payload = field === 'orderStatus' ? { orderStatus: value } : { paymentStatus: value }
      const res = await api.patch(`/api/admin/orders/${selectedOrder._id}/status`, payload)
      setSelectedOrder(res.data)
      await loadOrders(page)
    } catch (e) {
      setError(normalizeApiError(e).message)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Sales Management</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Orders</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name / phone / order ID" className="w-full sm:w-72" />
          <select
            className="h-10 rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="secondary" onClick={() => loadOrders(1)} disabled={loading} className="h-10">Filter</Button>
        </div>
      </div>

      {error ? <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 overflow-hidden rounded-2xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 shadow-2xl backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-[#D4A574]/30 bg-[#1a1a1a]/80">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A574]/20">
              {orders.map((o) => (
                <tr key={o._id} className="cursor-pointer hover:bg-[#2d2d2d]/50 transition-colors" onClick={() => openOrder(o._id)}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">#{o._id.slice(-8)}</div>
                    <div className="text-xs text-[#D4D4D4]/60">{new Date(o.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{o.shippingAddress?.fullName || o.user?.name || 'N/A'}</div>
                    <div className="text-xs text-[#D4D4D4]/60">{o.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#D4A574]">{money(o.total)}</td>
                  <td className="px-6 py-4 capitalize font-semibold text-[#D4D4D4]">{o.orderStatus}</td>
                  <td className="px-6 py-4 capitalize font-semibold text-[#D4D4D4]">{o.paymentStatus}</td>
                </tr>
              ))}
              {!loading && orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[#D4D4D4]/60 font-semibold">No orders found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 p-6 shadow-2xl backdrop-blur-sm">
          {!selectedOrder ? (
            <div className="text-sm text-[#D4D4D4]/60 font-semibold text-center py-8">Click an order to view details</div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="border-b border-[#D4A574]/20 pb-4">
                <div className="text-xs text-[#D4A574] font-bold tracking-wide uppercase mb-1">Order ID</div>
                <div className="font-bold text-white font-mono">{selectedOrder._id}</div>
              </div>
              <div className="border-b border-[#D4A574]/20 pb-4">
                <div className="text-xs text-[#D4A574] font-bold tracking-wide uppercase mb-1">Customer</div>
                <div className="font-bold text-white">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName}</div>
                <div className="text-[#D4D4D4]/70">{selectedOrder.user?.email || 'No email found'}</div>
              </div>
              <div className="border-b border-[#D4A574]/20 pb-4">
                <div className="text-xs text-[#D4A574] font-bold tracking-wide uppercase mb-1">Shipping Address</div>
                <div className="text-[#D4D4D4]/80">
                  {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                </div>
              </div>
              <div className="border-b border-[#D4A574]/20 pb-4">
                <div className="text-xs text-[#D4A574] font-bold tracking-wide uppercase mb-2">Items</div>
                <ul className="space-y-1">
                  {selectedOrder.items?.map((it, idx) => (
                    <li key={`${it.product}-${idx}`} className="rounded-xl bg-[#1a1a1a]/80 border border-[#D4A574]/20 px-3 py-2 text-[#D4D4D4]">
                      {it.name} <span className="text-[#D4A574]">×{it.quantity}</span> ({it.size || 'N/A'})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#D4A574]/20">
                <select
                  className="h-10 rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300"
                  value={selectedOrder.orderStatus}
                  onChange={(e) => updateStatus('orderStatus', e.target.value)}
                >
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  className="h-10 rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300"
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => updateStatus('paymentStatus', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <Button
                className="w-full h-11 mt-4 font-bold"
                onClick={async () => {
                  try {
                    await api.post('/api/admin/emails/order', { orderId: selectedOrder._id })
                    window.alert('Order email sent successfully')
                  } catch (e) {
                    setError(normalizeApiError(e).message)
                  }
                }}
              >
                Send Order Email
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-[#D4D4D4]/70 font-semibold">
          Page <span className="text-[#D4A574] font-bold">{page}</span> of <span className="text-[#D4A574] font-bold">{pages}</span>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => loadOrders(page - 1)} size="sm">Prev</Button>
          <Button variant="secondary" disabled={page >= pages || loading} onClick={() => loadOrders(page + 1)} size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}

