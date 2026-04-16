import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { createApiClient, normalizeApiError } from '../../lib/api.js'
import { useAuth } from '../../state/auth.jsx'
import { Button } from '../components/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card.jsx'
import { Input } from '../components/Input.jsx'
import { Label } from '../components/Label.jsx'

export function LoginPage() {
  const { isAuthed, isAdmin, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const api = useMemo(() => createApiClient({ token: '' }), [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthed && isAdmin) return <Navigate to={from} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const payload = res.data
      if (!payload?.token) throw new Error('Missing token in response')
      if (payload?.user?.role !== 'admin') {
        logout()
        throw new Error('This account is not an admin')
      }
      login(payload)
      navigate(from, { replace: true })
    } catch (err) {
      setError(normalizeApiError(err).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-[#D4A574] rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-72 h-72 bg-[#C59868] rounded-full blur-3xl" />
      </div>
      
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-3xl bg-gradient-to-br from-[#D4A574] to-[#C59868] shadow-2xl" />
            <h1 className="text-4xl font-bold text-white tracking-tight">Admin Login</h1>
            <p className="mt-3 text-sm text-[#D4D4D4]">Sign in to manage your fashion store.</p>
          </div>

          <div className="rounded-3xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Welcome Back</h2>
              <p className="mt-1 text-xs text-[#D4A574]/70 font-semibold">Enter your credentials</p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#D4A574] font-bold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fashionstore.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#D4A574] font-bold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-semibold backdrop-blur-sm">
                  {error}
                </div>
              ) : null}

              <Button className="w-full h-11 text-base font-bold" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>

             
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

