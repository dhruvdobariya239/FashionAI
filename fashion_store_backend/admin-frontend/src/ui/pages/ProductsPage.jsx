import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { cn } from '../lib/cn.js'

function money(v) {
  if (v == null || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

export function ProductsPage() {
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(
    async (p = 1, s = search) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/products', {
        params: {
          page: p,
          limit: 12,
          sort: 'newest',
          search: s || undefined,
        },
      })
      setItems(res.data?.products || [])
      setTotal(res.data?.total || 0)
      setPage(res.data?.page || p)
      setPages(res.data?.pages || 1)
    } catch (e) {
      setError(normalizeApiError(e).message)
    } finally {
      setLoading(false)
    }
    },
    [api, search],
  )

  useEffect(() => {
    load(1, '')
  }, [load])

  async function onDelete(id) {
    const ok = window.confirm('Delete this product? This cannot be undone.')
    if (!ok) return
    try {
      await api.delete(`/api/products/${id}`)
      await load(page, search)
    } catch (e) {
      setError(normalizeApiError(e).message)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Inventory Management</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Products</h2>
          <div className="mt-2 text-sm text-[#D4D4D4]/70 font-semibold">Total: <span className="text-[#D4A574]">{total}</span></div>
        </div>
        <Link to="/products/new">
          <Button className="h-11 gap-2">
            <Plus className="h-5 w-5" /> Add Product
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, tags, description…"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => load(1, search)}
          disabled={loading}
          className="h-10"
        >
          Search
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 shadow-2xl backdrop-blur-sm">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="border-b border-[#D4A574]/30 bg-[#1a1a1a]/80 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase whitespace-nowrap">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase whitespace-nowrap">Gender</th>
              <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase whitespace-nowrap">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase whitespace-nowrap">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase whitespace-nowrap">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4A574]/20">
            {items.map((p) => (
              <tr key={p._id} className="hover:bg-[#2d2d2d]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 border-[#D4A574]/30 bg-[#1a1a1a]">
                      {p?.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-white">{p.name}</div>
                      <div className="truncate text-xs text-[#D4D4D4]/60">{p._id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize text-[#D4D4D4] font-semibold">{p.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-[#D4D4D4] font-semibold">{p.subcategory}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-[#D4A574]">{money(p.price)}</div>
                  {p.originalPrice ? (
                    <div className="text-xs text-[#D4D4D4]/50 line-through">{money(p.originalPrice)}</div>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                      p.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-[#D4A574]/20 text-[#D4A574] border border-[#D4A574]/50',
                    )}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Link to={`/products/${p._id}`}>
                      <Button variant="secondary" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => onDelete(p._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-[#D4D4D4]/60 font-semibold" colSpan={6}>
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-[#D4D4D4]/70 font-semibold">
          Page <span className="text-[#D4A574] font-bold">{page}</span> of <span className="text-[#D4A574] font-bold">{pages}</span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            disabled={loading || page <= 1}
            onClick={() => load(page - 1, search)}
            size="sm"
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={loading || page >= pages}
            onClick={() => load(page + 1, search)}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

