import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthCtx = createContext(null)

const LS_KEY = 'fashion_admin_auth_v1'

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      const parsed = raw ? safeJsonParse(raw) : null
      if (parsed?.token) setToken(parsed.token)
      if (parsed?.user) setUser(parsed.user)
    } catch (e) {
      // Storage access blocked by browser tracking prevention - safe to ignore
      console.warn('Storage access blocked (tracking prevention):', e.message)
    }
  }, [])

  const value = useMemo(() => {
    const isAuthed = Boolean(token)
    const isAdmin = user?.role === 'admin'

    const save = (next) => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('Storage save blocked (tracking prevention):', e.message)
      }
    }

    const login = ({ token: nextToken, user: nextUser }) => {
      setToken(nextToken)
      setUser(nextUser)
      save({ token: nextToken, user: nextUser })
    }

    const logout = () => {
      setToken('')
      setUser(null)
      try {
        localStorage.removeItem(LS_KEY)
      } catch (e) {
        console.warn('Storage remove blocked (tracking prevention):', e.message)
      }
    }

    return { token, user, isAuthed, isAdmin, login, logout }
  }, [token, user])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

