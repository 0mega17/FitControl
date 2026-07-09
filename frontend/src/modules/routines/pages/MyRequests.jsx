import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routineRequestsAPI } from '../../services/api'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const ESTADO_COLORS = {
  'Pendiente': 'warning',
  'En revision': 'info',
  'Rutina asignada': 'success',
  'Rechazada': 'danger'
}

function MyRequests() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await routineRequestsAPI.getMy()
        setSolicitudes(data || [])
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return <PageSpinner />

  const puedeSolicitar = user?.rol?.nombre === 'Cliente'

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Solicitudes</h1>
          <p className="text-fitness-muted text-sm mt-1">
            {solicitudes.length} solicitude{solicitudes.length !== 1 ? 's' : ''} realizada{solicitudes.length !== 1 ? 's' : ''}
          </p>
        </div>
        {puedeSolicitar && (
          <Button onClick={() => navigate('/solicitar-rutina')}>+ Nueva Solicitud</Button>
        )}
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-fitness-gray/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-fitness-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-fitness-muted text-lg">No tienes solicitudes</p>
          {puedeSolicitar && (
            <Button onClick={() => navigate('/solicitar-rutina')} className="mt-4">Solicitar Rutina Personalizada</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((s) => (
            <div key={s._id} className="card-fitness p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge color={ESTADO_COLORS[s.estado] || 'info'}>{s.estado}</Badge>
                    <span className="text-xs text-fitness-muted">
                      {new Date(s.fechaSolicitud).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-fitness-muted text-xs">Edad</span>
                      <p className="text-white">{s.edad} años</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Peso</span>
                      <p className="text-white">{s.peso} kg</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Estatura</span>
                      <p className="text-white">{s.estatura} cm</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Experiencia</span>
                      <p className="text-white capitalize">{s.experiencia}</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Tiempo entrenando</span>
                      <p className="text-white">{s.tiempoEntrenando}</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Dias disponibles</span>
                      <p className="text-white">{s.diasDisponibles} / semana</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Objetivo</span>
                      <p className="text-white">{s.objetivo}{s.otroObjetivo ? `: ${s.otroObjetivo}` : ''}</p>
                    </div>
                    <div>
                      <span className="text-fitness-muted text-xs">Entrenador</span>
                      <p className="text-white">
                        {s.entrenadorId
                          ? `${s.entrenadorId.nombre || ''} ${s.entrenadorId.apellido || ''}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-fitness-gray">
                    <span className="text-fitness-muted text-xs">Meta personal</span>
                    <p className="text-white text-sm mt-1">{s.metaPersonal}</p>
                  </div>

                  {s.estado === 'Rechazada' && s.motivoRechazo && (
                    <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <span className="text-red-400 text-xs font-medium">Motivo del rechazo</span>
                      <p className="text-red-300 text-sm mt-1">{s.motivoRechazo}</p>
                    </div>
                  )}

                  {s.estado === 'Rutina asignada' && s.rutinaAsignada && (
                    <div className="mt-3">
                      <Button size="sm" onClick={() => navigate('/my-routine')}>
                        Ver mi rutina asignada
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyRequests
