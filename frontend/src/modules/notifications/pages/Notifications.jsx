import { useState, useEffect } from 'react'
import { notificationsAPI } from '../../../services/api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { PageSpinner } from '../../../components/ui/Spinner'

const SEVERIDAD_LABELS = { info: 'Informacion', warning: 'Advertencia', urgent: 'Urgente' }
const SEVERIDAD_COLORS = { info: 'info', warning: 'warning', urgent: 'danger' }

function Notifications() {
  const [notis, setNotis] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')

  const fetchNotis = async () => {
    try {
      const { data } = await notificationsAPI.getMy()
      setNotis(data)
    } catch (err) { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotis() }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      fetchNotis()
    } catch (err) { }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setSuccess('Todas marcadas como leidas')
      fetchNotis()
    } catch (err) { }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-fitness-muted text-sm mt-1">
            {notis.filter(n => !n.leida).length} no leida{notis.filter(n => !n.leida).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={handleMarkAllRead}>
          Marcar todas como leidas
        </Button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      {notis.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-fitness-muted text-lg">No hay notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notis.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.leida && handleMarkAsRead(n._id)}
              className={`card-fitness p-4 cursor-pointer transition-all duration-200
                ${!n.leida ? 'border-l-4 border-l-fitness-red bg-fitness-gray/10' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                    n.severidad === 'urgent' ? 'bg-red-500' : n.severidad === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${!n.leida ? 'text-white' : 'text-fitness-muted'}`}>
                        {n.asunto}
                      </span>
                      {!n.leida && <Badge color="danger" size="sm">Nueva</Badge>}
                    </div>
                    <p className="text-fitness-muted text-sm">{n.mensaje}</p>
                    <p className="text-fitness-muted text-xs mt-1">
                      {new Date(n.fechaEnvio).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Badge color={SEVERIDAD_COLORS[n.severidad] || 'info'} size="sm">
                  {SEVERIDAD_LABELS[n.severidad] || 'Info'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
