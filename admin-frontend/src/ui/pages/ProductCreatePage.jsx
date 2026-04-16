import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card.jsx'
import { Input } from '../components/Input.jsx'
import { Label } from '../components/Label.jsx'

function parseCsv(value) {
  const s = String(value || '').trim()
  if (!s) return []
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export function ProductCreatePage() {
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    gender: 'men',
    subcategory: '',
    category: '',
    sizes: [{ size: 'M', stock: 10 }],
    material: '',
    brand: '',
    colors: '',
    tags: '',
    isFeatured: false,
  })

  const [images, setImages] = useState([])

  // Fetch categories on mount
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
    setForm((s) => ({ ...s, [k]: v }))
  }

  function addSize() {
    setForm((s) => ({ ...s, sizes: [...s.sizes, { size: '', stock: 0 }] }))
  }

  function updateSize(index, field, value) {
    setForm((s) => {
      const newSizes = [...s.sizes]
      newSizes[index] = { ...newSizes[index], [field]: value }
      return { ...s, sizes: newSizes }
    })
  }

  function removeSize(index) {
    setForm((s) => ({ ...s, sizes: s.sizes.filter((_, i) => i !== index) }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      if (form.originalPrice) fd.append('originalPrice', form.originalPrice)
      fd.append('gender', form.gender)
      fd.append('subcategory', form.subcategory)
      fd.append('category', form.category)
      fd.append('sizes', JSON.stringify(form.sizes))
      fd.append('material', form.material || '')
      fd.append('brand', form.brand || '')
      // Repeat the same field name to send arrays via multipart.
      parseCsv(form.colors).forEach((c) => fd.append('colors', c))
      parseCsv(form.tags).forEach((t) => fd.append('tags', t))
      fd.append('isFeatured', form.isFeatured ? 'true' : 'false')
      images.forEach((file) => fd.append('images', file))

      const res = await api.post('/api/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/products/${res.data?._id}`, { replace: true })
    } catch (err) {
      setError(normalizeApiError(err).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Catalog Management</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Add New Product</h2>
        </div>
        <Button variant="secondary" onClick={() => navigate('/products')} className="h-11">
          ← Back
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Product Name</Label>
                <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Enter product name..." required />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Brand</Label>
                <Input value={form.brand} onChange={(e) => setField('brand', e.target.value)} placeholder="Brand name..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Description</Label>
              <textarea
                className="min-h-32 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-4 py-3 text-sm text-white shadow-md outline-none placeholder:text-[#8a8a8a] focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300 resize-none"
                value={form.description}
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
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Original Price (optional)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.originalPrice}
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
                  value={form.gender}
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
                <Input
                  value={form.subcategory}
                  onChange={(e) => setField('subcategory', e.target.value)}
                  placeholder="e.g. shirts, pants"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Category</Label>
                <select
                  className="h-10 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300 disabled:opacity-50"
                  value={form.category}
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
                <Label className="text-[#D4A574] font-bold">Colors (comma separated)</Label>
                <Input value={form.colors} onChange={(e) => setField('colors', e.target.value)} placeholder="black, white, blue..." />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4A574] font-bold">Tags (comma separated)</Label>
                <Input value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="summer, new, trending..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Sizes & Stock</Label>
              <div className="space-y-3">
                {form.sizes.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-[#D4A574] font-semibold">Size</label>
                      <Input
                        value={item.size}
                        onChange={(e) => updateSize(idx, 'size', e.target.value)}
                        placeholder="e.g. XS, S, M, L, XL"
                        required
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-[#D4A574] font-semibold">Stock</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => updateSize(idx, 'stock', Number(e.target.value))}
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSize(idx)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSize}
                  className="w-full py-2 rounded-lg border-2 border-[#D4A574]/40 text-[#D4A574] font-bold text-sm hover:bg-[#1a1a1a]/60 transition-colors"
                >
                  + Add Size
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Product Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 5))}
                className="file:mr-3"
              />
              <div className="text-xs text-[#D4D4D4]/60 font-semibold">{images.length} image(s) selected (max 5)</div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#D4A574] font-bold">Material</Label>
              <Input value={form.material} onChange={(e) => setField('material', e.target.value)} placeholder="e.g. Cotton, Polyester..." />
            </div>

            <label className="flex items-center gap-3 rounded-xl border-2 border-[#D4A574]/30 bg-[#1a1a1a]/60 px-4 py-3 text-sm font-semibold text-[#D4D4D4] cursor-pointer hover:bg-[#1a1a1a]/80 transition-colors">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setField('isFeatured', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              Mark as Featured Product
            </label>

            <Button className="w-full h-11 font-bold" type="submit" disabled={loading}>
              {loading ? 'Creating Product…' : 'Create Product'}
            </Button>

            <div className="pt-4 border-t border-[#D4A574]/20">
              <p className="text-xs text-[#D4D4D4]/60 text-center">
                Upload field: <code className="text-[#D4A574] font-semibold">images</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

