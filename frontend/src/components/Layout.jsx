import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../modules/notifications/components/NotificationBell'
import {
  FiMenu, FiX, FiGrid, FiUsers, FiDollarSign, FiClipboard,
  FiCalendar, FiActivity, FiFileText, FiUser, FiLogOut,
  FiCamera, FiCheckSquare, FiTrendingUp, FiBell
} from 'react-icons/fi'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: FiGrid, roles: ['Administrador'] },
  { label: 'Usuarios', path: '/admin/users', icon: FiUsers, roles: ['Administrador'] },
  { label: 'Reportes', path: '/reports', icon: FiFileText, roles: ['Administrador'] },
  { label: 'Membresias', path: '/memberships', icon: FiDollarSign, roles: ['Administrador', 'Entrenador'] },
  { label: 'Mi Membresia', path: '/my-membership', icon: FiDollarSign, roles: ['Cliente'] },
  { label: 'Rutinas', path: '/routines', icon: FiClipboard, roles: ['Administrador', 'Entrenador'] },
  { label: 'Crear Rutina', path: '/routines/create', icon: FiClipboard, roles: ['Administrador', 'Entrenador'] },
  { label: 'Mi Rutina', path: '/my-routine', icon: FiClipboard, roles: ['Cliente'] },
  { label: 'Solicitar Rutina', path: '/solicitar-rutina', icon: FiFileText, roles: ['Cliente'] },
  { label: 'Mis Solicitudes', path: '/my-requests', icon: FiFileText, roles: ['Cliente'] },
  { label: 'Solicitudes', path: '/trainer-requests', icon: FiFileText, roles: ['Administrador', 'Entrenador'] },
  { label: 'Progreso', path: '/progress', icon: FiTrendingUp, roles: ['Administrador', 'Entrenador', 'Cliente'] },
  { label: 'Asistencia', path: '/attendance', icon: FiCheckSquare, roles: ['Administrador', 'Entrenador'] },
  { label: 'Mi QR', path: '/my-qr', icon: FiCamera, roles: ['Cliente'] },
  { label: 'Notificaciones', path: '/notifications', icon: FiBell, roles: ['Administrador', 'Entrenador', 'Cliente'] },
  { label: 'Calendario', path: '/calendar', icon: FiCalendar, roles: ['Administrador', 'Entrenador'] },
  { label: 'Ejercicios', path: '/exercises', icon: FiActivity, roles: ['Administrador', 'Entrenador', 'Cliente'] },
  { label: 'Perfil', path: '/profile', icon: FiUser, roles: ['Administrador', 'Entrenador', 'Cliente'] },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNav = navItems.filter(
    item => !item.roles || item.roles.includes(user?.rol?.nombre)
  )

  return (
    <div className="min-h-screen bg-fitness-black flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-fitness-dark border-r border-fitness-gray
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="p-4 border-b border-fitness-gray">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fitness-red to-fitness-orange rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">FitControl</h2>
              <p className="text-fitness-muted text-xs capitalize">{user?.rol?.nombre || ''}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-fitness-red/10 text-fitness-red font-medium'
                    : 'text-fitness-muted hover:text-white hover:bg-fitness-gray/50'
                }`}
              >
                <Icon className="text-lg shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-fitness-gray">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-fitness-muted hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <FiLogOut className="text-lg shrink-0" />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-fitness-black/80 backdrop-blur-sm border-b border-fitness-gray">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-fitness-muted hover:text-white p-1"
            >
              <FiMenu className="text-xl" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link to="/profile" className="flex items-center gap-2 text-sm text-fitness-muted hover:text-white">
                <div className="w-8 h-8 rounded-full bg-fitness-red/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-fitness-red">
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline">{user?.nombre || 'Usuario'}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
