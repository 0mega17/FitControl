import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routinesAPI } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Input'
import { PageSpinner } from '../../../components/ui/Spinner'

const NIVEL_COLORS = { principiante: 'success', intermedio: 'warning', avanzado: 'danger' }
const OBJETIVO_LABELS = { hipertrofia: 'Hipertrofia', fuerza: 'Fuerza', resistencia: 'Resistencia', definicion: 'Definicion' }
const MUSCLE_LABELS = {
  chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros',
  'upper arms': 'Brazos', 'lower arms': 'Antebrazos',
  'upper legs': 'Piernas', 'lower legs': 'Gemelos',
  waist: 'Abdomen', cardio: 'Cardio', neck: 'Cuello'
}

function Routines() {
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignModal, setAssignModal] = useState(null)
  const [clientes, setClientes] = useState([])
  const [selectedCliente, setSelectedCliente] = useState('')
  const [assigning, setAssigning] = useState(false)
  const { addToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const esAdminOrTrainer = user?.rol?.nombre === 'Administrador' || user?.rol?.nombre === 'Entrenador'

  const fetchRutinas = async () => {
    try {
      const { data } = await routinesAPI.getAll()
      setRutinas(data || [])
    } catch (err) { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRutinas() }, [])

  const openAssign = async (rutina) => {
    setAssignModal(rutina)
    setSelectedCliente('')
    try {
      const { data } = await routinesAPI.listClients()
      setClientes(data || [])
    } catch { setClientes([]) }
  }

  const handleAssign = async () => {
    if (!selectedCliente) { addToast('Selecciona un cliente', 'error'); return }
    setAssigning(true)
    try {
      await routinesAPI.assign(assignModal._id, { clienteId: selectedCliente })
      addToast('Rutina asignada exitosamente', 'success')
      setAssignModal(null)
    } catch (err) {
      addToast(err.response?.data?.mensaje || 'Error al asignar', 'error')
    } finally { setAssigning(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar esta rutina?')) return
    try {
      await routinesAPI.remove(id)
      fetchRutinas()
    } catch (err) { }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion de Rutinas</h1>
          <p className="text-fitness-muted text-sm mt-1">
            {rutinas.length} plantilla{rutinas.length !== 1 ? 's' : ''} disponible{rutinas.length !== 1 ? 's' : ''}
          </p>
        </div>
        {esAdminOrTrainer && (
          <Button onClick={() => navigate('/routines/create')}>+ Nueva Rutina</Button>
        )}
      </div>

      {rutinas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-fitness-muted text-lg">No hay rutinas creadas</p>
          {esAdminOrTrainer && (
            <Button onClick={() => navigate('/routines/create')} className="mt-4">Crear primera rutina</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rutinas.map((r) => (
            <div key={r._id} className="card-fitness p-5 hover:border-fitness-red/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base truncate">{r.nombre}</h3>
                  {r.descripcion && (
                    <p className="text-xs text-fitness-muted mt-1 line-clamp-2">{r.descripcion}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <Badge color={NIVEL_COLORS[r.nivel] || 'info'} size="sm">
                  {r.nivel?.charAt(0).toUpperCase() + r.nivel?.slice(1)}
                </Badge>
                <Badge color="info" size="sm">{OBJETIVO_LABELS[r.objetivo] || r.objetivo}</Badge>
                <Badge color="warning" size="sm">{MUSCLE_LABELS[r.grupoMuscularPrincipal] || r.grupoMuscularPrincipal}</Badge>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-fitness-gray">
                <span className="text-xs text-fitness-muted">{r.ejercicios?.length || 0} ejercicios</span>
                <div className="flex gap-1">
                  {esAdminOrTrainer && (
                    <>
                      <button onClick={() => openAssign(r)}
                        className="text-xs px-2 py-1 rounded bg-fitness-gray/50 text-fitness-muted hover:text-white hover:bg-fitness-gray transition-colors">
                        Asignar
                      </button>
                      <button onClick={() => handleDelete(r._id)}
                        className="text-xs px-2 py-1 rounded bg-fitness-gray/50 text-fitness-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        Eliminar
                      </button>
                    </>
                  )}
                  <button onClick={() => navigate(`/routines/${r._id}`)}
                    className="text-xs px-2 py-1 rounded bg-fitness-red/20 text-fitness-red hover:bg-fitness-red/30 transition-colors">
                    Ver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Asignar Rutina">
        <p className="text-sm text-fitness-muted mb-4">
          Asignando: <span className="text-white font-medium">{assignModal?.nombre}</span>
        </p>
        <Select label="Seleccionar Cliente" value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)}>
          <option value="">Seleccionar...</option>
          {clientes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.usuario?.nombre || c.nombre} {c.usuario?.apellido || ''} ({c.email || c.usuario?.email || ''})
            </option>
          ))}
        </Select>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={assigning}>{assigning ? 'Asignando...' : 'Asignar'}</Button>
        </div>
      </Modal>
    </div>
  )
}

export default Routines
