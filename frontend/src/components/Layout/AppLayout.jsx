import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { ClipboardList, LayoutDashboard, BarChart3, ChefHat, LogOut, WifiOff, RefreshCw, Loader2 } from 'lucide-react'

const links = [
  { to: '/pedidos', label: 'Pedidos y Platos', icon: ClipboardList },
  { to: '/dashboard', label: 'Dashboard Operativo', icon: LayoutDashboard },
  { to: '/reportes', label: 'Reportes e Insights', icon: BarChart3 },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { loaded, connectionError, refresh } = useData()

  // Primera carga: esperamos a la API antes de renderizar cualquier módulo
  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-400" size={28} />
        <p className="text-slate-400 text-sm">Conectando con el backend...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <ChefHat size={18} className="text-white" />
          </div>
          <span className="font-bold text-white">RestoGestión</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-200">
              {user?.nombre?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.nombre}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} title="Cerrar sesión" className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-around z-20">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] gap-0.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`
            }
          >
            <Icon size={18} />
            {label.split(' ')[0]}
          </NavLink>
        ))}
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 overflow-y-auto max-h-screen">
        {connectionError && (
          <div className="bg-red-500/10 border-b border-red-500/30 text-red-300 text-sm px-4 md:px-8 py-2.5 flex flex-wrap items-center gap-2">
            <WifiOff size={15} className="shrink-0" />
            <span className="flex-1 min-w-0">{connectionError}</span>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-1 text-red-200 hover:text-white font-medium shrink-0"
            >
              <RefreshCw size={13} />
              Reintentar
            </button>
          </div>
        )}
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
