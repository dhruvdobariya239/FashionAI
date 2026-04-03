import axios from 'axios'

export function getApiBaseUrl() {
  const env = import.meta?.env?.VITE_API_BASE_URL
  return (env && String(env).trim()) || ''
}

export function createApiClient({ token }) {
  const baseURL = getApiBaseUrl() || undefined

  const client = axios.create({
    baseURL,
  })

  client.interceptors.request.use((config) => {
    const t = token && String(token).trim()
    if (t) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${t}`
    }
    return config
  })

  return client
}

export function normalizeApiError(err) {
  const isNetwork =
    !err?.response &&
    (err?.code === 'ERR_NETWORK' ||
      String(err?.message || '').toLowerCase().includes('network') ||
      String(err?.message || '').toLowerCase().includes('econnrefused'))

  const message =
    (isNetwork && 'Backend server is not running on http://localhost:5000 (or VITE_API_BASE_URL). Start backend then try again.') ||
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Request failed'
  const status = err?.response?.status
  return { message, status, raw: err }
}

