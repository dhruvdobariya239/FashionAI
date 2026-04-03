import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, LogOut, Mail, Package, Receipt, Shapes } from 'lucide-react'
import { useAuth } from '../../state/auth.jsx'
import { cn } from '../lib/cn.js'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Shapes },
  { to: '/orders', label: 'Orders', icon: Receipt },
  { to: '/emails', label: 'Emails', icon: Mail },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 lg:p-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-8 rounded-3xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 p-6 shadow-2xl backdrop-blur-sm hover:border-[#D4A574]/60 transition-all duration-300">
            <div className="flex items-center justify-between gap-3 px-2 py-2 mb-6">
              <div>
                <img src="../public/1000273660.png" alt="Fashion Store Logo" className="h-16 w-auto opacity-100 group-hover:opacity-100 transition-opacity" />
                <div className="text-lg mt-2font-bold text-white tracking-wide">Admin Panel</div>

                
              </div>
              
                
              
            </div>

            <nav className="mt-6 space-y-2">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] shadow-lg'
                        : 'text-[#D4D4D4] hover:text-white hover:bg-[#D4A574]/10 border-2 border-transparent hover:border-[#D4A574]/30',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border-2 border-[#D4A574]/30 bg-[#1a1a1a]/60 p-4 backdrop-blur-sm">
              <div className="text-xs text-[#D4A574] font-bold tracking-wide uppercase mb-2">Profile</div>
              <div className="text-sm font-bold text-white mb-1">{user?.name}</div>
              <div className="text-xs text-[#D4D4D4]/70 mb-4">{user?.email}</div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <div>
              <div className="text-lg font-bold text-white">Fashion Store</div>
              <div className="text-xs text-[#D4A574]/70 font-semibold">{user?.email}</div>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-bold text-white hover:shadow-lg transition-all duration-300 shadow-md"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <div className="rounded-3xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 shadow-2xl backdrop-blur-sm hover:border-[#D4A574]/60 transition-all duration-300 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

