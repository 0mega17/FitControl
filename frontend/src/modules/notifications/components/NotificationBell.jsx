import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../../../services/api'
import { FiBell } from 'react-icons/fi'

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [recent, setRecent] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const fetchCount = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.getUnreadCount()
      setUnreadCount(data.count || 0)
    } catch { /* ignore */ }
  }, [])

  const fetchRecent = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.getMy()
      setRecent((data || []).slice(0, 5))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  const handleToggle = () => {
    if (!open) fetchRecent()
    setOpen(!open)
  }

  const handleMarkRead = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.markAsRead(id)
      fetchRecent()
      fetchCount()
    } catch { /* ignore */ }
  }

  const handleMarkAllRead = async (e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.markAllAsRead()
      setRecent(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch { /* ignore */ }
  }

  const severidadColor = (s) => {
    if (s === 'urgent') return 'bg-red-500'
    if (s === 'warning') return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-fitness-muted hover:text-white hover:bg-fitness-gray transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-fitness-red text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-fitness-dark border border-fitness-gray rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-fitness-gray flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-fitness-red hover:underline">
                    Marcar leidas
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="text-center text-fitness-muted text-sm py-8">Sin notificaciones</p>
              ) : (
                recent.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleMarkRead(n._id, { stopPropagation: () => {} })}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-fitness-gray/50 cursor-pointer transition-colors hover:bg-fitness-gray/30 ${!n.leida ? 'bg-fitness-gray/20' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severidadColor(n.severidad)}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.leida ? 'text-white font-medium' : 'text-fitness-muted'}`}>{n.asunto}</p>
                      <p className="text-xs text-fitness-muted truncate mt-0.5">{n.mensaje}</p>
                      <p className="text-xs text-fitness-muted/50 mt-0.5">
                        {new Date(n.fechaEnvio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.leida && (
                      <button
                        onClick={(e) => handleMarkRead(n._id, e)}
                        className="text-xs text-fitness-muted hover:text-white shrink-0 mt-1"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-fitness-gray text-center">
              <button
                onClick={() => { setOpen(false); navigate('/notifications') }}
                className="text-xs text-fitness-red hover:underline w-full py-1"
              >
                Ver todas
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
