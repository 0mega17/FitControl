import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routineRequestsAPI } from '../../../services/api'
import { PageSpinner } from '../../../components/ui/Spinner'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../context/ToastContext'

const ESTADO_COLORS = {
  'Pendiente': 'warning',
  'En revision': 'info',
  'Rutina asignada': 'success',
  'Rechazada': 'danger'
}

function TrainerRequests() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [rejectModal, setRejectModal] = useState(false)
  const [motivo, setMotivo] = useState('')
  const { addToast } = useToast()
  const navigate = useNavigate()

  const fetchRequests = async () => {
    try {
      const { data } = await routineRequestsAPI.getAll()
      setSolicitudes(data || [])
    } catch (err) { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async (id) => {
    try {
      await routineRequestsAPI.approve(id)
      addToast('Solicitud en revision', 'success')
      fetchRequests()
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error al aprobar', 'error')
    }
  }

  const handleReject = async () => {
    if (!motivo.trim()) { addToast('Indica el motivo del rechazo', 'error'); return }
    try {
      await routineRequestsAPI.reject(selected._id, motivo)
      addToast('Solicitud rechazada', 'info')
      setRejectModal(false)
      setMotivo('')
      setSelected(null)
      fetchRequests()
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error al rechazar', 'error')
    }
  }

  const handleCreateRoutine = async (sol) => {
    navigate(`/routines/create?modo=personal&clienteNombre=${encodeURIComponent(sol.clienteId?.usuario?.nombre + ' ' + (sol.clienteId?.usuario?.apellido || ''))}&experiencia=${sol.experiencia}&objetivo=${encodeURIComponent(sol.objetivo)}&requestId=${sol._id}&clienteId=${sol.clienteId?._id}`)
  }

  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente' || s.estado === 'En revision')
  const historial = solicitudes.filter(s => s.estado === 'Rutina asignada' || s.estado === 'Rechazada')

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Solicitudes de Rutinas</h1>
        <p className="text-fitness-muted text-sm mt-1">
          {solicitudes.length} solicitude{solicitudes.length !== 1 ? 's' : ''} recibida{solicitudes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {pendientes.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Pendientes ({pendientes.length})
          </h2>
          <div className="space-y-3 mb-8">
            {pendientes.map((s) => (
              <TrainerRequestCard
                key={s._id}
                request={s}
                onApprove={() => handleApprove(s._id)}
                onReject={() => { setSelected(s); setRejectModal(true) }}
                onCreateRoutine={() => handleCreateRoutine(s)}
              />
            ))}
          </div>
        </>
      )}

      {historial.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mb-3">Historial</h2>
          <div className="space-y-3">
            {historial.map((s) => (
              <TrainerRequestCard key={s._id} request={s} />
            ))}
          </div>
        </>
      )}

      {solicitudes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-fitness-muted text-lg">No hay solicitudes de rutinas</p>
        </div>
      )}

      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Rechazar Solicitud">
        <p className="text-sm text-fitness-muted mb-4">
          Rechazando solicitud de <span className="text-white font-medium">
            {selected?.clienteId?.usuario?.nombre} {selected?.clienteId?.usuario?.apellido}
          </span>
        </p>
        <Input
          label="Motivo del rechazo"
          placeholder="Explica por que se rechaza la solicitud..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setRejectModal(false)}>Cancelar</Button>
          <Button onClick={handleReject}>Rechazar Solicitud</Button>
        </div>
      </Modal>
    </div>
  )
}

function TrainerRequestCard({ request: s, onApprove, onReject, onCreateRoutine }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card-fitness p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-white font-medium">
              {s.clienteId?.usuario?.nombre} {s.clienteId?.usuario?.apellido}
            </span>
            <Badge color={ESTADO_COLORS[s.estado] || 'info'} size="sm">{s.estado}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-fitness-muted">
            <span>Edad: <span className="text-white">{s.edad}</span></span>
            <span>Peso: <span className="text-white">{s.peso}kg</span></span>
            <span>Estatura: <span className="text-white">{s.estatura}cm</span></span>
            <span>Exp: <span className="text-white capitalize">{s.experiencia}</span></span>
            <span>Objetivo: <span className="text-white">{s.objetivo}</span></span>
            <span>
              {new Date(s.fechaSolicitud).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {onApprove && s.estado === 'Pendiente' && (
            <Button size="sm" onClick={onApprove}>Aprobar</Button>
          )}
          {onCreateRoutine && (s.estado === 'En revision' || s.estado === 'Pendiente') && (
            <Button size="sm" variant="secondary" onClick={onCreateRoutine}>Crear Rutina</Button>
          )}
          {onReject && s.estado === 'Pendiente' && (
            <Button size="sm" variant="secondary" onClick={onReject}>Rechazar</Button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-fitness-muted hover:text-white px-2"
          >
            {expanded ? 'Menos' : 'Detalle'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-fitness-gray space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-fitness-muted text-xs">Tiempo entrenando</span><p className="text-white">{s.tiempoEntrenando}</p></div>
            <div><span className="text-fitness-muted text-xs">Dias disponibles</span><p className="text-white">{s.diasDisponibles}/semana</p></div>
            <div className="col-span-2">
              <span className="text-fitness-muted text-xs">Objetivo detallado</span>
              <p className="text-white">{s.objetivo}{s.otroObjetivo ? `: ${s.otroObjetivo}` : ''}</p>
            </div>
          </div>
          <div>
            <span className="text-fitness-muted text-xs">Meta personal</span>
            <p className="text-white text-sm mt-1">{s.metaPersonal}</p>
          </div>
          {s.estado === 'Rechazada' && s.motivoRechazo && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <span className="text-red-400 text-xs font-medium">Motivo del rechazo</span>
              <p className="text-red-300 text-sm mt-1">{s.motivoRechazo}</p>
            </div>
          )}
          {s.rutinaAsignada && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
              <span className="text-green-400 text-xs font-medium">Rutina asignada: {s.rutinaAsignada.nombre}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainerRequests
