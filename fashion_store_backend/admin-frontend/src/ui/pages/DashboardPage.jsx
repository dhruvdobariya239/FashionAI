import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card.jsx'

export function DashboardPage() {
  const { token } = useAuth()
  const api = useMemo(() => createApiClient({ token }), [token])

  const [stats, setStats] = useState({ products: null, categories: null, orders: null })
  const [revenueData, setRevenueData] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      try {
        const [prodRes, catRes, orderRes, analyticsRes, bestSellingRes] = await Promise.all([
          api.get('/api/products?limit=1&page=1'),
          api.get('/api/categories'),
          api.get('/api/admin/orders?limit=1&page=1'),
          api.get('/api/admin/analytics/revenue-orders?days=30'),
          api.get('/api/admin/analytics/best-selling?limit=5'),
        ])
        if (cancelled) return
        setStats({
          products: prodRes.data?.total ?? null,
          categories: Array.isArray(catRes.data) ? catRes.data.length : null,
          orders: orderRes.data?.total ?? null,
        })
        setRevenueData(analyticsRes.data?.revenueData ?? [])
        setBestSellingProducts(bestSellingRes.data?.bestSelling ?? [])
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
  }, [api])

  const colors = ['#D4A574', '#C59868', '#B8934F', '#A37A3A']

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#D4A574] tracking-widest uppercase">Dashboard Overview</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Dashboard</h2>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-[#D4A574] to-[#C59868] px-4 py-2 text-xs font-bold text-[#1a1a1a] shadow-lg">
          Admin Access
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-sm text-red-400 font-semibold backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-[#D4A574]">
              {stats.products ?? '—'}
            </div>
            <div className="mt-2 text-xs text-[#D4D4D4]/60 uppercase font-semibold tracking-wide">Active Products</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-[#D4A574]">
              {stats.categories ?? '—'}
            </div>
            <div className="mt-2 text-xs text-[#D4D4D4]/60 uppercase font-semibold tracking-wide">Categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-[#D4A574]">
              {stats.orders ?? '—'}
            </div>
            <div className="mt-2 text-xs text-[#D4D4D4]/60 uppercase font-semibold tracking-wide">Orders</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Orders Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue & Orders (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-80 items-center justify-center text-[#D4D4D4]/60">Loading chart data...</div>
          ) : revenueData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-[#D4D4D4]/60">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                <XAxis 
                  dataKey="_id" 
                  stroke="#D4D4D4" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#D4D4D4" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2d2d', 
                    border: '2px solid #D4A574',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#D4A574' }}
                  formatter={(value) => value.toFixed(0)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" fill="#D4A574" name="Revenue (₹)" />
                <Bar dataKey="orders" fill="#d2b28f" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Best Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center text-[#D4D4D4]/60">Loading product data...</div>
          ) : bestSellingProducts.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-[#D4D4D4]/60">No sales data available</div>
          ) : (
            <div className="space-y-4">
              {bestSellingProducts.map((product, idx) => (
                <div key={product._id} className="flex items-center gap-4 rounded-lg bg-[#2d2d2d]/50 p-4 border border-[#D4A574]/20 hover:border-[#D4A574]/50 transition-colors">
                  {product.productImage && (
                    <img 
                      src={product.productImage} 
                      alt={product.productName}
                      className="h-16 w-16 rounded object-cover border border-[#D4A574]/30"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white mb-1">#{idx + 1} {product.productName}</div>
                    <div className="flex gap-4 text-xs text-[#D4D4D4]/70">
                      <span>Sold: <span className="text-[#D4A574] font-bold">{product.totalSold}</span> units</span>
                      <span>Revenue: <span className="text-[#D4A574] font-bold">₹{product.totalRevenue?.toFixed(2)}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#D4A574]">{product.totalSold}</div>
                      <div className="text-xs text-[#D4D4D4]/60 uppercase font-semibold">Units</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


