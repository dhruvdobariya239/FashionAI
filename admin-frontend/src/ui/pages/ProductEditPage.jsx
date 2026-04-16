import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card.jsx'
import { Input } from '../components/Input.jsx'
import { Label } from '../components/Label.jsx'

export function ProductEditPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/api/products/${id}`)
        if (cancelled) return
        setProduct(res.data)
      } catch (e) {
        if (cancelled) return
        setError(normalizeApiError(e).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [api, id])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories')
        setCategories(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load categories:', err)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [api])

  function setField(k, v) {
    setProduct((p) => ({ ...(p || {}), [k]: v }))
  }

  function addSize() {
    setProduct((p) => ({
      ...(p || {}),
      sizes: [...(p?.sizes || []), { size: '', stock: 0 }],
    }))
  }

  function updateSize(index, field, value) {
    setProduct((p) => {
      const newSizes = [...(p?.sizes || [])]
      newSizes[index] = { ...newSizes[index], [field]: value }
      return { ...(p || {}), sizes: newSizes }
    })
  }

  function removeSize(index) {
    setProduct((p) => ({
      ...(p || {}),
      sizes: (p?.sizes || []).filter((_, i) => i !== index),
    }))
  }

  async function onSave(e) {
    e.preventDefault()
    if (!product) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        gender: product.gender,
        subcategory: product.subcategory,
        category: product.category?._id || product.category,
        sizes: product.sizes || [],
        material: product.material || '',
        brand: product.brand || '',
        colors: product.colors || [],
        tags: product.tags || [],
        isFeatured: Boolean(product.isFeatured),
        isActive: Boolean(product.isActive),
      }
      const res = await api.put(`/api/products/${id}`, payload)
      setProduct(res.data)
    } catch (e) {
      setError(normalizeApiError(e).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-[#D4D4D4]/60 font-semibold">Loading…</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-sm text-[#D4D4D4]/60 font-semibold">Product not found.</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Catalog Management</p>
          <h2 className="mt-2 truncate text-4xl font-bold text-white">Edit Product</h2>
          <div className="mt-2 truncate text-sm text-[#D4D4D4]/70 font-semibold font-mono">{product._id}</div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/products')} className="h-11">
            ← Back
          </Button>
          <Button onClick={onSave} disabled={saving} className="h-11 font-bold">
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Product Name</Label>
                <Input value={product.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Product name..." required />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Brand</Label>
                <Input value={product.brand || ''} onChange={(e) => setField('brand', e.target.value)} placeholder="Brand name..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Description</Label>
              <textarea
                className="min-h-32 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-4 py-3 text-sm text-white shadow-md outline-none placeholder:text-[#8a8a8a] focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300 resize-none"
                value={product.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Product description..."
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={product.price ?? ''}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Original Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={product.originalPrice ?? ''}
                  onChange={(e) => setField('originalPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Gender</Label>
                <select
                  className="h-10 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300"
                  value={product.gender || 'men'}
                  onChange={(e) => setField('gender', e.target.value)}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="children">Children</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Subcategory</Label>
                <Input value={product.subcategory || ''} onChange={(e) => setField('subcategory', e.target.value)} placeholder="e.g. shirts..." required />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Category</Label>
                <select
                  className="h-10 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300 disabled:opacity-50"
                  value={product.category?._id || product.category || ''}
                  onChange={(e) => setField('category', e.target.value)}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Colors (JSON array)</Label>
                <Input
                  value={JSON.stringify(product.colors || [])}
                  onChange={(e) => {
                    try {
                      setField('colors', JSON.parse(e.target.value || '[]'))
                    } catch {
                      // keep last good value
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tags (JSON array)</Label>
                <Input
                  value={JSON.stringify(product.tags || [])}
                  onChange={(e) => {
                    try {
                      setField('tags', JSON.parse(e.target.value || '[]'))
                    } catch {
                      // keep last good value
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Sizes & Stock</Label>
              <div className="space-y-3">
                {(product?.sizes || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-slate-600 font-semibold">Size</label>
                      <Input
                        value={item.size || ''}
                        onChange={(e) => updateSize(idx, 'size', e.target.value)}
                        placeholder="e.g. XS, S, M, L, XL"
                        required
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-slate-600 font-semibold">Stock</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.stock || 0}
                        onChange={(e) => updateSize(idx, 'stock', Number(e.target.value))}
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSize(idx)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 font-bold text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSize}
                  className="w-full py-2 rounded-lg border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  + Add Size
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input type="checkbox" checked={Boolean(product.isActive)} onChange={(e) => setField('isActive', e.target.checked)} />
              Active (visible in store)
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input type="checkbox" checked={Boolean(product.isFeatured)} onChange={(e) => setField('isFeatured', e.target.checked)} />
              Featured
            </label>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#D4A574]">Images</div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {(product.images || []).map((img) => (
                  <div key={img.url} className="aspect-square overflow-hidden rounded-xl border-2 border-[#D4A574]/30 bg-[#2d2d2d] hover:border-[#D4A574]/60 transition-colors">
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#D4D4D4]/60">
                Showing <span className="font-bold text-[#D4A574]">{(product.images || []).length}</span> image{(product.images || []).length !== 1 ? 's' : ''} • Updating images is not implemented yet
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

