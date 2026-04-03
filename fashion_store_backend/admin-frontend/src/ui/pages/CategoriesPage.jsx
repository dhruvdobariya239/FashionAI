import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card.jsx'
import { Input } from '../components/Input.jsx'
import { Label } from '../components/Label.jsx'

export function CategoriesPage() {
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [create, setCreate] = useState({
    name: '',
    slug: '',
    gender: 'men',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/categories')
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setError(normalizeApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    load()
  }, [load])

  async function onCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        name: create.name,
        slug: create.slug || String(create.name || '').trim().toLowerCase().replace(/\s+/g, '-'),
        gender: create.gender,
      }
      await api.post('/api/categories', payload)
      setCreate({ name: '', slug: '', gender: create.gender })
      await load()
    } catch (e) {
      setError(normalizeApiError(e).message)
    }
  }

  async function onDelete(id) {
    window.alert('Delete category endpoint is not present in your backend yet.')
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Catalog Management</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Categories</h2>
          <div className="mt-2 text-sm text-[#D4D4D4]/70 font-semibold">Total: <span className="text-[#D4A574]">{items.length}</span></div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border-2 border-[#D4A574]/30 bg-[#1a1a1a]/80">
              <table className="w-full text-sm">
                <thead className="border-b border-[#D4A574]/30 bg-[#1a1a1a]/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Gender</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase">Slug</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#D4A574] tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4A574]/20">
                  {items.map((c) => (
                    <tr key={c._id} className="hover:bg-[#2d2d2d]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                      <td className="px-6 py-4 capitalize text-[#D4D4D4] font-semibold">{c.gender}</td>
                      <td className="px-6 py-4 text-[#D4D4D4]/70 font-mono text-xs">{c.slug}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Button variant="danger" size="sm" onClick={() => onDelete(c._id)} title="Not implemented in backend">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && items.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-[#D4D4D4]/60 font-semibold" colSpan={4}>
                        No categories found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Name</Label>
                <Input value={create.name} onChange={(e) => setCreate((s) => ({ ...s, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Slug (optional)</Label>
                <Input value={create.slug} onChange={(e) => setCreate((s) => ({ ...s, slug: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Gender</Label>
                <select
                  className="h-10 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300"
                  value={create.gender}
                  onChange={(e) => setCreate((s) => ({ ...s, gender: e.target.value }))}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="children">Children</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <Button className="w-full h-11 font-bold" type="submit">
                <Plus className="h-4 w-4" /> Create
              </Button>

              <div className="pt-4 border-t border-[#D4A574]/20 text-center">
                <p className="text-xs text-[#D4D4D4]/60">
                  <code className="rounded bg-[#1a1a1a]/80 px-2 py-1 text-[#D4A574] font-semibold">POST /api/categories</code>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

